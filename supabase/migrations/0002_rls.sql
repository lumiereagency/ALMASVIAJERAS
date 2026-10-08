-- RLS em TODAS as tabelas. Princípio: sem política = sem acesso.
-- Escritas públicas (lead, consentimento, quiz, eventos) passam pelo servidor com service role;
-- anon não escreve direto em nenhuma tabela.

do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname='public' loop
    execute format('alter table %I enable row level security', t);
  end loop;
end $$;

-- Funções auxiliares
create function my_enviajador_id() returns uuid language sql stable security definer set search_path = public as $$
  select id from enviajador_profiles where user_id = auth.uid() $$;

-- ───────── Perfis e papéis ─────────
create policy profiles_self on profiles for select using (id = auth.uid() or is_staff());
create policy profiles_self_update on profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy user_roles_self on user_roles for select using (user_id = auth.uid() or is_admin());
create policy user_roles_admin_write on user_roles for all using (is_admin()) with check (is_admin());
create policy traveler_self on traveler_profiles for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy traveler_staff on traveler_profiles for select using (is_staff());

-- Enviajador: tabela só para dono/equipe; vitrine pública via view (sem user_id). Dono edita sem alterar status.
create function my_enviajador_status() returns enviajador_status language sql stable security definer set search_path = public as $
  select status from enviajador_profiles where user_id = auth.uid() $;
create policy env_owner_read on enviajador_profiles for select using (user_id = auth.uid() or is_staff());
create policy env_owner_update on enviajador_profiles for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and status = my_enviajador_status());
create view public_enviajadores with (security_invoker = false) as
  select slug, display_name, bio, avatar_path from enviajador_profiles where status = 'active';
grant select on public_enviajadores to anon, authenticated;
create policy env_admin_all on enviajador_profiles for all using (is_admin()) with check (is_admin());

-- ───────── Catálogo ─────────
create policy exp_public_read on experiences for select using (status = 'published' or is_staff());
create policy exp_admin_write on experiences for all using (is_admin()) with check (is_admin());

create policy price_read on experience_prices for select
  using (exists (select 1 from experiences e where e.id = experience_id and (e.status='published' or is_staff())));
create policy dep_read on experience_departures for select
  using (exists (select 1 from experiences e where e.id = experience_id and (e.status='published' or is_staff())));
create policy media_read on experience_media for select
  using (exists (select 1 from experiences e where e.id = experience_id and (e.status='published' or is_staff())));
create policy tags_read on experience_tags for select
  using (exists (select 1 from experiences e where e.id = experience_id and (e.status='published' or is_staff())));
create policy price_admin on experience_prices for all using (is_admin()) with check (is_admin());
create policy dep_admin on experience_departures for all using (is_admin()) with check (is_admin());
create policy media_admin on experience_media for all using (is_admin()) with check (is_admin());
create policy tags_admin on experience_tags for all using (is_admin()) with check (is_admin());

create policy fx_read on fx_rates for select using (true);
create policy fx_admin on fx_rates for all using (is_admin()) with check (is_admin());

-- ───────── Quiz (escrita só via servidor) ─────────
create policy quiz_staff_read on quiz_sessions for select using (is_staff());
create policy qa_staff_read on quiz_answers for select using (is_staff());
create policy rr_staff_read on recommendation_results for select using (is_staff());

-- ───────── Atribuição ─────────
create policy rl_owner on referral_links for all
  using (enviajador_id = my_enviajador_id() or is_staff())
  with check (enviajador_id = my_enviajador_id() or is_admin());
create policy attr_read on attribution_events for select using (enviajador_id = my_enviajador_id() or is_staff());

-- ───────── Leads / CRM (somente staff e admin) ─────────
create policy leads_staff on leads for select using (is_staff() or traveler_user_id = auth.uid());
create policy leads_staff_update on leads for update using (is_staff()) with check (is_staff());
create policy lsh_staff on lead_status_history for select using (is_staff());
create policy ln_staff on lead_notes for all using (is_staff()) with check (is_staff());
create policy lt_staff on lead_tasks for all using (is_staff()) with check (is_staff());
create policy consents_staff on consents for select using (is_staff());

-- Visão limitada para o Enviajador: sem telefone, e-mail, notas ou conversas.
create view enviajador_leads
with (security_invoker = false) as
select l.id,
       split_part(l.full_name, ' ', 1) as first_name,
       l.experience_id, l.status, l.created_at
from leads l
where l.attributed_enviajador_id = my_enviajador_id();
revoke all on enviajador_leads from anon;
grant select on enviajador_leads to authenticated;

-- ───────── Vendas e comissões ─────────
-- Staff vê vendas; confirmar venda/gerar comissão ocorre no servidor.
create policy sales_staff on sales for select using (is_staff());
create policy cr_admin on commission_rules for all using (is_admin()) with check (is_admin());
create policy cr_staff_read on commission_rules for select using (is_staff());
create policy comm_owner_read on commissions for select using (enviajador_id = my_enviajador_id() or is_staff());
-- Mudanças de status/aprovação: somente admin (staff não aprova pagamento).
create policy comm_admin_update on commissions for update using (is_admin()) with check (is_admin());
create policy cadj_read on commission_adjustments for select
  using (is_staff() or exists (select 1 from commissions c where c.id = commission_id and c.enviajador_id = my_enviajador_id()));
create policy cadj_admin_insert on commission_adjustments for insert with check (is_admin());

-- ───────── Métricas e auditoria ─────────
create policy ae_staff on analytics_events for select using (is_staff());
create policy ae_owner on analytics_events for select using (enviajador_id = my_enviajador_id());
create policy audit_admin on audit_logs for select using (is_admin());
-- rate_limits: sem política (apenas service role)
