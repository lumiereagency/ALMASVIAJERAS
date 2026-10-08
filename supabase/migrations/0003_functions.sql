-- Regras de negócio no banco (SECURITY DEFINER). O segredo de assinatura vive só aqui.
-- Funções privilegiadas: EXECUTE revogado de public/anon/authenticated e concedido caso a caso.

create table app_secrets (key text primary key, value text not null);
alter table app_secrets enable row level security;
revoke all on app_secrets from anon, authenticated;
insert into app_secrets values ('referral_hmac', encode(gen_random_bytes(32), 'hex'));

create function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles(id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)))
  on conflict do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

-- ───────── Atribuição ─────────
create function _ref_mac(p_slug text) returns text language sql stable security definer set search_path = public, extensions as $$
  select substr(encode(hmac(convert_to(p_slug, 'utf8'), convert_to((select value from app_secrets where key = 'referral_hmac'), 'utf8'), 'sha256'), 'hex'), 1, 20) $$;
revoke all on function _ref_mac(text) from public, anon, authenticated;

create function _verify_ref(p_token text) returns uuid language plpgsql stable security definer set search_path = public, extensions as $$
declare v_slug text; v_mac text; v_id uuid;
begin
  if p_token is null or position('.' in p_token) = 0 then return null; end if;
  v_slug := substring(p_token from '^(.*)\.[^.]*$');
  v_mac := substring(p_token from '\.([^.]*)$');
  if v_slug is null or v_mac is distinct from _ref_mac(v_slug) then return null; end if;
  select id into v_id from enviajador_profiles where slug = v_slug and status = 'active';
  return v_id;
end $$;
revoke all on function _verify_ref(text) from public, anon, authenticated;

create function sign_ref(p_slug text) returns text language plpgsql stable security definer set search_path = public, extensions as $$
begin
  if not (is_admin() or exists (select 1 from enviajador_profiles where slug = p_slug and user_id = auth.uid())) then
    raise exception 'forbidden';
  end if;
  return p_slug || '.' || _ref_mac(p_slug);
end $$;
revoke all on function sign_ref(text) from public, anon, authenticated;
grant execute on function sign_ref(text) to authenticated;

create function record_touch(p_token text, p_visitor text) returns text language plpgsql security definer set search_path = public, extensions as $$
declare v_id uuid; v_name text; v_self boolean;
begin
  if length(coalesce(p_visitor, '')) not between 1 and 64 then return null; end if;
  v_id := _verify_ref(p_token);
  if v_id is null then return null; end if;
  select display_name into v_name from enviajador_profiles where id = v_id;
  v_self := exists (select 1 from enviajador_profiles where id = v_id and user_id = auth.uid());
  if not exists (select 1 from attribution_events where visitor_id = p_visitor and enviajador_id = v_id and touched_at > now() - interval '1 hour') then
    insert into attribution_events(visitor_id, enviajador_id, is_self_visit) values (p_visitor, v_id, v_self);
    insert into analytics_events(name, visitor_id, enviajador_id, props) values ('referral_attributed', p_visitor, v_id, '{}');
  end if;
  return v_name;
end $$;
revoke all on function record_touch(text, text) from public, anon, authenticated;
grant execute on function record_touch(text, text) to anon, authenticated;

-- ───────── Eventos ─────────
create function track_event(p_name text, p_visitor text, p_props jsonb default '{}') returns void language plpgsql security definer set search_path = public as $$
begin
  if p_name not in ('landing_viewed','quiz_started','quiz_step_completed','quiz_completed','recommendation_viewed','experience_viewed','contact_clicked') then return; end if;
  if length(coalesce(p_visitor, '')) not between 1 and 64 then return; end if;
  if pg_column_size(coalesce(p_props, '{}'::jsonb)) > 2048 then return; end if;
  insert into analytics_events(name, visitor_id, props) values (p_name, p_visitor, coalesce(p_props, '{}'));
end $$;
revoke all on function track_event(text, text, jsonb) from public, anon, authenticated;
grant execute on function track_event(text, text, jsonb) to anon, authenticated;

-- ───────── Captação de lead ─────────
create function create_lead(
  p_name text, p_phone text, p_email text, p_country text, p_city text, p_experience_slug text,
  p_quiz jsonb, p_source text, p_visitor text, p_ref text, p_policy_version text, p_marketing boolean
) returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare
  v_phone text := regexp_replace(coalesce(p_phone, ''), '[^0-9+]', '', 'g');
  v_name text := btrim(coalesce(p_name, ''));
  v_email text := nullif(btrim(coalesce(p_email, '')), '');
  v_exp uuid; v_consent uuid; v_mkt uuid; v_lead uuid; v_session uuid;
  v_touches jsonb; v_first jsonb; v_last jsonb; v_enviajador uuid; v_snapshot jsonb;
begin
  if length(v_name) not between 2 and 120 then raise exception 'invalid_name'; end if;
  if v_phone !~ '^\+?[0-9]{8,15}$' then raise exception 'invalid_phone'; end if;
  if v_email is not null and v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'invalid_email'; end if;
  if coalesce(p_policy_version, '') = '' then raise exception 'consent_required'; end if;
  if (select count(*) from leads where phone = v_phone and created_at > now() - interval '1 hour') >= 3 then raise exception 'rate_limited'; end if;
  if p_visitor is not null and (select count(*) from analytics_events where visitor_id = p_visitor and name = 'lead_created' and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'rate_limited';
  end if;

  select id into v_exp from experiences where slug = p_experience_slug and status = 'published';
  if p_ref is not null then perform record_touch(p_ref, p_visitor); end if;

  if p_visitor is not null then
    select jsonb_agg(jsonb_build_object('enviajadorId', enviajador_id, 'at', touched_at) order by touched_at)
      into v_touches from attribution_events
     where visitor_id = p_visitor and not is_self_visit and touched_at >= now() - interval '30 days';
  end if;
  if v_touches is not null then
    v_first := v_touches -> 0;
    v_last := v_touches -> (jsonb_array_length(v_touches) - 1);
    v_enviajador := (v_last ->> 'enviajadorId')::uuid;
    v_snapshot := jsonb_build_object('first', v_first, 'last', v_last, 'winner', v_last, 'rule', 'last_valid_touch', 'windowDays', 30, 'computedAt', now());
  end if;

  if p_quiz is not null and jsonb_typeof(p_quiz) = 'object' then
    insert into quiz_sessions(visitor_id, completed_at) values (coalesce(p_visitor, 'anon'), now()) returning id into v_session;
    insert into quiz_answers(session_id, step, answer) values
      (v_session, 1, jsonb_build_object('companion', p_quiz -> 'c')),
      (v_session, 2, jsonb_build_object('intents', p_quiz -> 'i')),
      (v_session, 3, jsonb_build_object('region', p_quiz -> 'r')),
      (v_session, 4, jsonb_build_object('duration', p_quiz -> 'd')),
      (v_session, 5, jsonb_build_object('adults', p_quiz -> 'a', 'minors', p_quiz -> 'm')),
      (v_session, 6, jsonb_build_object('budget', p_quiz -> 'b', 'currency', p_quiz -> 'cur'));
  end if;

  insert into consents(kind, granted, policy_version) values ('operational', true, p_policy_version) returning id into v_consent;
  insert into consents(kind, granted, policy_version) values ('marketing', coalesce(p_marketing, false), p_policy_version) returning id into v_mkt;

  insert into leads(full_name, phone, email, country, city, experience_id, quiz_session_id, source, status,
                    attributed_enviajador_id, attribution_snapshot, operational_consent_id)
  values (v_name, v_phone, v_email, nullif(btrim(coalesce(p_country, '')), ''), nullif(btrim(coalesce(p_city, '')), ''),
          v_exp, v_session, left(p_source, 60), 'new', v_enviajador, v_snapshot, v_consent)
  returning id into v_lead;

  update consents set lead_id = v_lead where id in (v_consent, v_mkt);
  if v_session is not null then update quiz_sessions set lead_id = v_lead where id = v_session; end if;
  insert into lead_status_history(lead_id, from_status, to_status) values (v_lead, null, 'new');
  insert into analytics_events(name, visitor_id, enviajador_id, experience_id, props)
  values ('lead_created', p_visitor, v_enviajador, v_exp, jsonb_build_object('referred', v_enviajador is not null, 'quiz', v_session is not null));

  return jsonb_build_object('id', v_lead, 'code', upper(substr(v_lead::text, 1, 8)));
end $$;
revoke all on function create_lead(text, text, text, text, text, text, jsonb, text, text, text, text, boolean) from public, anon, authenticated;
grant execute on function create_lead(text, text, text, text, text, text, jsonb, text, text, text, text, boolean) to anon, authenticated;

-- ───────── CRM ─────────
create function _lead_transition_ok(a lead_status, b lead_status) returns boolean language sql immutable as $$
  select case a
    when 'new' then b in ('contact_attempt','in_service','lost')
    when 'contact_attempt' then b in ('in_service','contact_attempt','lost')
    when 'in_service' then b in ('proposal_sent','reserved','lost')
    when 'proposal_sent' then b in ('in_service','reserved','lost')
    when 'reserved' then b in ('sale_confirmed','cancelled','lost')
    when 'sale_confirmed' then b in ('cancelled')
    when 'lost' then b in ('in_service')
    else false end $$;

create function set_lead_status(p_lead uuid, p_to lead_status, p_reason text default null) returns void language plpgsql security definer set search_path = public as $$
declare v_from lead_status;
begin
  if not is_staff() then raise exception 'forbidden'; end if;
  if p_to = 'sale_confirmed' then raise exception 'use_confirm_sale'; end if;
  select status into v_from from leads where id = p_lead for update;
  if v_from is null then raise exception 'not_found'; end if;
  if not _lead_transition_ok(v_from, p_to) then raise exception 'invalid_transition'; end if;
  if p_to = 'lost' and btrim(coalesce(p_reason, '')) = '' then raise exception 'loss_reason_required'; end if;
  update leads set status = p_to, loss_reason = case when p_to = 'lost' then p_reason else loss_reason end where id = p_lead;
  insert into lead_status_history(lead_id, from_status, to_status, changed_by) values (p_lead, v_from, p_to, auth.uid());
  if p_to = 'cancelled' then
    update commissions set status = 'cancelled' where lead_id = p_lead and status not in ('paid', 'cancelled');
  end if;
end $$;
revoke all on function set_lead_status(uuid, lead_status, text) from public, anon, authenticated;
grant execute on function set_lead_status(uuid, lead_status, text) to authenticated;

create function confirm_sale(p_lead uuid, p_amount numeric, p_currency currency_code) returns uuid language plpgsql security definer set search_path = public as $$
declare l leads%rowtype; v_sale uuid; v_rule commission_rules%rowtype; v_amount numeric; v_comm uuid;
begin
  if not is_staff() then raise exception 'forbidden'; end if;
  if p_amount is null or p_amount < 0 then raise exception 'invalid_amount'; end if;
  select * into l from leads where id = p_lead for update;
  if l.id is null then raise exception 'not_found'; end if;
  if l.status <> 'reserved' then raise exception 'invalid_transition'; end if;

  insert into sales(lead_id, experience_id, amount, currency, confirmed_by) values (l.id, l.experience_id, p_amount, p_currency, auth.uid()) returning id into v_sale;
  update leads set status = 'sale_confirmed' where id = l.id;
  insert into lead_status_history(lead_id, from_status, to_status, changed_by) values (l.id, 'reserved', 'sale_confirmed', auth.uid());
  insert into analytics_events(name, enviajador_id, experience_id, props) values ('sale_confirmed', l.attributed_enviajador_id, l.experience_id, '{}');

  if l.attributed_enviajador_id is not null then
    select * into v_rule from commission_rules r
     where r.active and (
       (r.scope = 'experience' and r.experience_id = l.experience_id)
       or (r.scope = 'category' and r.category = (select category from experiences where id = l.experience_id))
       or r.scope = 'global')
     order by case r.scope when 'experience' then 1 when 'category' then 2 else 3 end limit 1;
    if v_rule.id is not null then
      if v_rule.kind = 'percent' then v_amount := round(p_amount * v_rule.value / 100, 2);
      else
        if v_rule.currency <> p_currency then raise exception 'currency_mismatch'; end if;
        v_amount := round(v_rule.value, 2);
      end if;
      insert into commissions(enviajador_id, lead_id, sale_id, experience_id, rule_id, rule_snapshot, eligible_amount, commission_amount, currency, status)
      values (l.attributed_enviajador_id, l.id, v_sale, l.experience_id, v_rule.id, to_jsonb(v_rule), p_amount, v_amount, p_currency, 'awaiting_confirmation')
      returning id into v_comm;
      insert into analytics_events(name, enviajador_id, props) values ('commission_created', l.attributed_enviajador_id, '{}');
    end if;
  end if;
  return v_comm;
end $$;
revoke all on function confirm_sale(uuid, numeric, currency_code) from public, anon, authenticated;
grant execute on function confirm_sale(uuid, numeric, currency_code) to authenticated;

-- ───────── Comissões (somente admin) ─────────
create function _comm_transition_ok(a commission_status, b commission_status) returns boolean language sql immutable as $$
  select case a
    when 'estimated' then b in ('awaiting_confirmation','cancelled')
    when 'awaiting_confirmation' then b in ('approved','cancelled','disputed')
    when 'approved' then b in ('scheduled','cancelled','disputed')
    when 'scheduled' then b in ('paid','cancelled','disputed')
    when 'paid' then b in ('disputed')
    when 'disputed' then b in ('approved','cancelled')
    else false end $$;

create function set_commission_status(p_id uuid, p_to commission_status, p_reason text default null) returns void language plpgsql security definer set search_path = public as $$
declare v_from commission_status; v_enviajador uuid;
begin
  if not is_admin() then raise exception 'forbidden'; end if;
  select status, enviajador_id into v_from, v_enviajador from commissions where id = p_id for update;
  if v_from is null then raise exception 'not_found'; end if;
  if not _comm_transition_ok(v_from, p_to) then raise exception 'invalid_transition'; end if;
  if p_to in ('cancelled', 'disputed') then
    if btrim(coalesce(p_reason, '')) = '' then raise exception 'reason_required'; end if;
    insert into commission_adjustments(commission_id, delta, reason, created_by) values (p_id, 0, p_reason, auth.uid());
  end if;
  update commissions set status = p_to, handled_by = auth.uid(),
    approved_at = case when p_to = 'approved' then now() else approved_at end,
    paid_at = case when p_to = 'paid' then now() else paid_at end
  where id = p_id;
  if p_to = 'paid' then insert into analytics_events(name, enviajador_id, props) values ('commission_paid', v_enviajador, '{}'); end if;
end $$;
revoke all on function set_commission_status(uuid, commission_status, text) from public, anon, authenticated;
grant execute on function set_commission_status(uuid, commission_status, text) to authenticated;

create function adjust_commission(p_id uuid, p_delta numeric, p_reason text) returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'forbidden'; end if;
  if btrim(coalesce(p_reason, '')) = '' then raise exception 'reason_required'; end if;
  update commissions set commission_amount = commission_amount + p_delta where id = p_id and commission_amount + p_delta >= 0;
  if not found then raise exception 'invalid_adjustment'; end if;
  insert into commission_adjustments(commission_id, delta, reason, created_by) values (p_id, p_delta, p_reason, auth.uid());
end $$;
revoke all on function adjust_commission(uuid, numeric, text) from public, anon, authenticated;
grant execute on function adjust_commission(uuid, numeric, text) to authenticated;

-- ───────── Enviajadores ─────────
create function register_enviajador(p_slug text, p_name text, p_bio text default null) returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'forbidden'; end if;
  if p_slug !~ '^[a-z0-9](?:[a-z0-9-]{1,38})[a-z0-9]$' then raise exception 'invalid_slug'; end if;
  if length(btrim(coalesce(p_name, ''))) not between 2 and 80 then raise exception 'invalid_name'; end if;
  insert into profiles(id, full_name) values (auth.uid(), btrim(p_name)) on conflict do nothing;
  insert into enviajador_profiles(user_id, slug, display_name, bio) values (auth.uid(), p_slug, btrim(p_name), left(p_bio, 500)) returning id into v_id;
  insert into user_roles(user_id, role) values (auth.uid(), 'enviajador') on conflict do nothing;
  return v_id;
exception when unique_violation then raise exception 'slug_taken';
end $$;
revoke all on function register_enviajador(text, text, text) from public, anon, authenticated;
grant execute on function register_enviajador(text, text, text) to authenticated;

create function set_enviajador_status(p_id uuid, p_status enviajador_status) returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'forbidden'; end if;
  update enviajador_profiles set status = p_status, approved_by = auth.uid() where id = p_id;
end $$;
revoke all on function set_enviajador_status(uuid, enviajador_status) from public, anon, authenticated;
grant execute on function set_enviajador_status(uuid, enviajador_status) to authenticated;

create function grant_role_by_email(p_email text, p_role app_role) returns void language plpgsql security definer set search_path = public as $$
declare v_user uuid;
begin
  if not is_admin() then raise exception 'forbidden'; end if;
  select id into v_user from auth.users where lower(email) = lower(p_email);
  if v_user is null then raise exception 'user_not_found'; end if;
  insert into user_roles(user_id, role, granted_by) values (v_user, p_role, auth.uid()) on conflict do nothing;
end $$;
revoke all on function grant_role_by_email(text, app_role) from public, anon, authenticated;
grant execute on function grant_role_by_email(text, app_role) to authenticated;

create function enviajador_stats() returns jsonb language plpgsql stable security definer set search_path = public as $$
declare e uuid := my_enviajador_id();
begin
  if e is null then return null; end if;
  return jsonb_build_object(
    'visits', (select count(*) from attribution_events where enviajador_id = e and not is_self_visit),
    'leads', (select count(*) from leads where attributed_enviajador_id = e),
    'in_service', (select count(*) from leads where attributed_enviajador_id = e and status in ('contact_attempt','in_service','proposal_sent')),
    'reserved', (select count(*) from leads where attributed_enviajador_id = e and status = 'reserved'),
    'sales', (select count(*) from leads where attributed_enviajador_id = e and status = 'sale_confirmed'),
    'commissions', (select coalesce(jsonb_agg(jsonb_build_object('status', status, 'currency', currency, 'count', c, 'total', t)), '[]')
                      from (select status, currency, count(*) c, sum(commission_amount) t from commissions where enviajador_id = e group by status, currency) x)
  );
end $$;
revoke all on function enviajador_stats() from public, anon, authenticated;
grant execute on function enviajador_stats() to authenticated;
