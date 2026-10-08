-- Financeiro (pagamentos e provedores), notificações no app e assinaturas push.
-- Segredos de gateway NUNCA ficam no banco: só flags e configuração pública. Chaves vão em variáveis de ambiente do servidor.

create type payment_status as enum ('pending', 'paid', 'failed', 'refunded', 'cancelled');
create type payment_provider as enum ('manual', 'stripe', 'mercadopago', 'paypal');

create table payment_providers (
  provider payment_provider primary key,
  display_name text not null,
  enabled boolean not null default false,
  mode text not null default 'test' check (mode in ('test', 'live')),
  public_config jsonb not null default '{}',
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);
insert into payment_providers (provider, display_name, enabled) values
  ('manual', 'Cobro manual (transferencia, efectivo)', true),
  ('stripe', 'Stripe (tarjetas)', false),
  ('mercadopago', 'Mercado Pago', false),
  ('paypal', 'PayPal', false);

create table payments (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references sales(id),
  lead_id uuid not null references leads(id),
  provider payment_provider not null default 'manual',
  provider_ref text,
  amount numeric(12,2) not null check (amount > 0),
  currency currency_code not null,
  status payment_status not null default 'pending',
  method text,
  paid_at timestamptz,
  checkout_url text,
  metadata jsonb not null default '{}',
  created_by uuid default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index payments_provider_ref on payments (provider, provider_ref) where provider_ref is not null;
create index payments_sale on payments (sale_id);

create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  title text not null,
  body text,
  url text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user on notifications (user_id, created_at desc);

alter table payment_providers enable row level security;
alter table payments enable row level security;
alter table push_subscriptions enable row level security;
alter table notifications enable row level security;

create policy pp_admin_read on payment_providers for select using (is_admin());
create policy pay_staff_read on payments for select using (is_staff());
create policy push_owner on push_subscriptions for select using (user_id = auth.uid());
create policy notif_owner on notifications for select using (user_id = auth.uid());

create trigger trg_payments_updated before update on payments for each row execute function set_updated_at();
create trigger audit_payments after insert or update on payments for each row execute function audit_row();
create trigger no_delete_payments before delete on payments for each row execute function forbid_delete();

-- ───────── Funções ─────────
create function create_payment(p_sale uuid, p_amount numeric, p_provider payment_provider default 'manual', p_method text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare s sales%rowtype; v_paid numeric; v_id uuid;
begin
  if not is_staff() then raise exception 'forbidden'; end if;
  select * into s from sales where id = p_sale;
  if s.id is null then raise exception 'not_found'; end if;
  if not exists (select 1 from payment_providers where provider = p_provider and enabled) then raise exception 'provider_disabled'; end if;
  select coalesce(sum(amount), 0) into v_paid from payments where sale_id = p_sale and status in ('paid', 'pending');
  if p_amount is null or p_amount <= 0 or p_amount + v_paid > s.amount then raise exception 'exceeds_balance'; end if;
  insert into payments (sale_id, lead_id, provider, amount, currency, method)
  values (s.id, s.lead_id, p_provider, p_amount, s.currency, left(p_method, 40)) returning id into v_id;
  return v_id;
end $$;
revoke all on function create_payment(uuid, numeric, payment_provider, text) from public, anon, authenticated;
grant execute on function create_payment(uuid, numeric, payment_provider, text) to authenticated;

create function set_payment_status(p_id uuid, p_to payment_status, p_ref text default null)
returns void language plpgsql security definer set search_path = public as $$
declare v_from payment_status;
begin
  if not is_staff() then raise exception 'forbidden'; end if;
  select status into v_from from payments where id = p_id for update;
  if v_from is null then raise exception 'not_found'; end if;
  if not (
    (v_from = 'pending' and p_to in ('paid', 'failed', 'cancelled'))
    or (v_from = 'paid' and p_to = 'refunded' and is_admin())
  ) then raise exception 'invalid_transition'; end if;
  update payments set status = p_to, provider_ref = coalesce(nullif(btrim(p_ref), ''), provider_ref),
    paid_at = case when p_to = 'paid' then now() else paid_at end where id = p_id;
end $$;
revoke all on function set_payment_status(uuid, payment_status, text) from public, anon, authenticated;
grant execute on function set_payment_status(uuid, payment_status, text) to authenticated;

create function set_payment_provider(p_provider payment_provider, p_enabled boolean, p_mode text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'forbidden'; end if;
  if p_mode not in ('test', 'live') then raise exception 'invalid_mode'; end if;
  update payment_providers set enabled = p_enabled, mode = p_mode, updated_by = auth.uid(), updated_at = now() where provider = p_provider;
end $$;
revoke all on function set_payment_provider(payment_provider, boolean, text) from public, anon, authenticated;
grant execute on function set_payment_provider(payment_provider, boolean, text) to authenticated;

create function save_push_subscription(p_endpoint text, p_p256dh text, p_auth text, p_ua text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'forbidden'; end if;
  insert into push_subscriptions (user_id, endpoint, p256dh, auth, user_agent) values (auth.uid(), p_endpoint, p_p256dh, p_auth, left(p_ua, 200))
  on conflict (endpoint) do update set user_id = auth.uid(), p256dh = excluded.p256dh, auth = excluded.auth;
end $$;
revoke all on function save_push_subscription(text, text, text, text) from public, anon, authenticated;
grant execute on function save_push_subscription(text, text, text, text) to authenticated;

create function remove_push_subscription(p_endpoint text) returns void language sql security definer set search_path = public as $$
  delete from push_subscriptions where endpoint = p_endpoint and user_id = auth.uid() $$;
revoke all on function remove_push_subscription(text) from public, anon, authenticated;
grant execute on function remove_push_subscription(text) to authenticated;

create function mark_notifications_read() returns void language sql security definer set search_path = public as $$
  update notifications set read_at = now() where user_id = auth.uid() and read_at is null $$;
revoke all on function mark_notifications_read() from public, anon, authenticated;
grant execute on function mark_notifications_read() to authenticated;

-- ───────── Notificações automáticas ─────────
create function notify_new_lead() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into notifications (user_id, kind, title, body, url)
  select distinct r.user_id, 'lead_new', 'Nuevo lead', new.full_name, '/equipe/leads/' || new.id
  from user_roles r where r.role in ('staff', 'admin');
  if new.attributed_enviajador_id is not null then
    insert into notifications (user_id, kind, title, body, url)
    select e.user_id, 'lead_referred', 'Nueva solicitud con tu enlace', split_part(new.full_name, ' ', 1), '/enviajador'
    from enviajador_profiles e where e.id = new.attributed_enviajador_id;
  end if;
  return new;
end $$;
revoke all on function notify_new_lead() from public, anon, authenticated;
create trigger trg_notify_new_lead after insert on leads for each row execute function notify_new_lead();

create function notify_commission() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    insert into notifications (user_id, kind, title, body, url)
    select e.user_id, 'commission', case new.status
        when 'approved' then 'Comisión aprobada' when 'scheduled' then 'Comisión programada para pago'
        when 'paid' then 'Comisión pagada' when 'cancelled' then 'Comisión cancelada' when 'disputed' then 'Comisión en disputa'
        else 'Comisión actualizada' end,
      new.commission_amount::text || ' ' || new.currency::text, '/enviajador'
    from enviajador_profiles e where e.id = new.enviajador_id;
  end if;
  return new;
end $$;
revoke all on function notify_commission() from public, anon, authenticated;
create trigger trg_notify_commission after update on commissions for each row execute function notify_commission();

create function notify_commission_created() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into notifications (user_id, kind, title, body, url)
  select e.user_id, 'commission', 'Nueva comisión generada', new.commission_amount::text || ' ' || new.currency::text, '/enviajador'
  from enviajador_profiles e where e.id = new.enviajador_id;
  return new;
end $$;
revoke all on function notify_commission_created() from public, anon, authenticated;
create trigger trg_notify_commission_created after insert on commissions for each row execute function notify_commission_created();
