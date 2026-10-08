-- Funções de gatilho não devem ser chamáveis por RPC; auxiliares com search_path fixo.
revoke all on function audit_row() from public, anon, authenticated;
revoke all on function handle_new_user() from public, anon, authenticated;
alter function _lead_transition_ok(lead_status, lead_status) set search_path = '';
alter function _comm_transition_ok(commission_status, commission_status) set search_path = '';
alter function set_updated_at() set search_path = '';
alter function forbid_delete() set search_path = '';
alter function lead_snapshot_immutable() set search_path = '';

-- Achados do linter aceitos por desenho:
--  * views public_enviajadores / enviajador_leads são SECURITY DEFINER para expor só colunas seguras;
--  * app_secrets e rate_limits têm RLS sem política (acesso só por funções definer);
--  * has_role/is_admin/is_staff/my_enviajador_* precisam ser executáveis por anon (usadas nas políticas).
