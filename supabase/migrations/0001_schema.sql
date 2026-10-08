-- Almas Viajeras MVP — esquema base.
-- organization_id (nullable) preparado para futura expansão; não há multi-tenant no MVP.

create extension if not exists pgcrypto;

-- ───────── Tipos ─────────
create type app_role as enum ('traveler', 'enviajador', 'staff', 'admin');
create type currency_code as enum ('MXN', 'USD', 'EUR');
create type publish_status as enum ('draft', 'published', 'unavailable');
create type enviajador_status as enum ('pending', 'active', 'suspended');
create type lead_status as enum
  ('new','contact_attempt','in_service','proposal_sent','reserved','sale_confirmed','lost','cancelled');
create type commission_status as enum
  ('estimated','awaiting_confirmation','approved','scheduled','paid','cancelled','disputed');
create type consent_kind as enum ('operational', 'marketing');

-- ───────── Utilitários ─────────
create function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ───────── Identidade e papéis ─────────
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid,
  full_name text,
  phone text,
  locale text not null default 'es',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  granted_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create function has_role(r app_role) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from user_roles where user_id = auth.uid() and role = r)
$$;
create function is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select has_role('admin') $$;
create function is_staff() returns boolean language sql stable security definer set search_path = public as $$
  select has_role('staff') or has_role('admin') $$;

create table traveler_profiles (
  user_id uuid primary key references profiles(id) on delete cascade,
  country text, city text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table enviajador_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references profiles(id) on delete cascade,
  organization_id uuid,
  slug text not null unique check (slug ~ '^[a-z0-9](?:[a-z0-9-]{1,38})[a-z0-9]$'),
  display_name text not null,
  bio text,
  avatar_path text,
  tone text not null default 'inspirador',
  status enviajador_status not null default 'pending',
  approved_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ───────── Catálogo (fonte única) ─────────
create table experiences (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid,
  slug text not null unique,
  title text not null,
  summary text,
  description text,
  category text not null,
  regions text[] not null default '{}',
  intents text[] not null default '{}',
  companions text[] not null default '{}',
  duration_days int not null check (duration_days > 0),
  status publish_status not null default 'draft',
  faq jsonb not null default '[]',
  promotable boolean not null default true, -- autorizada para divulgação por Enviajadores
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on experiences (status);

create table experience_prices (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references experiences(id) on delete cascade,
  amount numeric(12,2) not null check (amount >= 0),
  currency currency_code not null,
  valid_from date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on experience_prices (experience_id, valid_from desc);

create table experience_departures (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references experiences(id) on delete cascade,
  starts_on date not null,
  ends_on date,
  seats_available int,
  available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table experience_media (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references experiences(id) on delete cascade,
  storage_path text not null,
  alt text not null,
  position int not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table experience_tags (
  experience_id uuid not null references experiences(id) on delete cascade,
  tag text not null,
  primary key (experience_id, tag)
);

create table fx_rates (
  id uuid primary key default gen_random_uuid(),
  from_currency currency_code not null,
  to_currency currency_code not null,
  rate numeric(18,8) not null check (rate > 0),
  effective_on date not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (from_currency, to_currency, effective_on)
);

-- ───────── Alma Nawi ─────────
create table quiz_sessions (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null,
  lead_id uuid, -- preenchido ao virar lead
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table quiz_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references quiz_sessions(id) on delete cascade,
  step smallint not null check (step between 1 and 6),
  answer jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, step)
);

create table recommendation_results (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references quiz_sessions(id) on delete cascade,
  experience_id uuid not null references experiences(id),
  tier text not null check (tier in ('primary','alternative','excluded')),
  score numeric(6,2) not null,
  total_cost numeric(12,2),
  currency currency_code,
  fx_rate numeric(18,8),
  fx_rate_date date,
  reasons jsonb not null default '[]',
  warnings jsonb not null default '[]',
  created_at timestamptz not null default now()
);

-- ───────── Atribuição ─────────
create table referral_links (
  id uuid primary key default gen_random_uuid(),
  enviajador_id uuid not null references enviajador_profiles(id) on delete cascade,
  experience_id uuid references experiences(id), -- null = link geral
  tone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table attribution_events (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null,
  enviajador_id uuid not null references enviajador_profiles(id),
  referral_link_id uuid references referral_links(id),
  touched_at timestamptz not null default now(),
  is_self_visit boolean not null default false,
  created_at timestamptz not null default now()
);
create index on attribution_events (visitor_id, touched_at desc);

-- ───────── Leads e CRM ─────────
create table consents (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid,
  kind consent_kind not null,
  granted boolean not null,
  policy_version text not null,
  ip_hash text,
  created_at timestamptz not null default now()
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid,
  full_name text not null,
  phone text not null,
  email text,
  country text, city text,
  experience_id uuid references experiences(id),
  quiz_session_id uuid references quiz_sessions(id),
  traveler_user_id uuid references auth.users(id),
  source text, utm jsonb not null default '{}',
  status lead_status not null default 'new',
  assigned_to uuid references auth.users(id),
  estimated_value numeric(12,2),
  estimated_currency currency_code,
  loss_reason text,
  tags text[] not null default '{}',
  -- Cópia imutável da atribuição aplicada (ver trigger lead_snapshot_immutable)
  attributed_enviajador_id uuid references enviajador_profiles(id),
  attribution_snapshot jsonb,
  operational_consent_id uuid references consents(id),
  anonymized_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status <> 'lost' or loss_reason is not null)
);
create index on leads (status);
create index on leads (assigned_to);
create index on leads (attributed_enviajador_id);

alter table consents add constraint consents_lead_fk foreign key (lead_id) references leads(id);
alter table quiz_sessions add constraint quiz_sessions_lead_fk foreign key (lead_id) references leads(id);

create table lead_status_history (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  from_status lead_status,
  to_status lead_status not null,
  changed_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  body text not null,
  author_id uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table lead_tasks (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  title text not null,
  due_at timestamptz,
  done_at timestamptz,
  assigned_to uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ───────── Vendas e comissões ─────────
create table sales (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid,
  lead_id uuid not null references leads(id),
  experience_id uuid references experiences(id),
  amount numeric(12,2) not null check (amount >= 0),
  currency currency_code not null,
  confirmed_at timestamptz not null default now(),
  confirmed_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table commission_rules (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('experience','category','global')),
  experience_id uuid references experiences(id),
  category text,
  kind text not null check (kind in ('percent','fixed')),
  value numeric(12,2) not null check (value >= 0),
  currency currency_code not null,
  active boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (kind <> 'percent' or value <= 100)
);

create table commissions (
  id uuid primary key default gen_random_uuid(),
  enviajador_id uuid not null references enviajador_profiles(id),
  lead_id uuid not null references leads(id),
  sale_id uuid not null unique references sales(id),
  experience_id uuid references experiences(id),
  rule_id uuid not null references commission_rules(id),
  rule_snapshot jsonb not null,
  eligible_amount numeric(12,2) not null,
  commission_amount numeric(12,2) not null,
  currency currency_code not null,
  status commission_status not null default 'estimated',
  approved_at timestamptz, paid_at timestamptz,
  handled_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on commissions (enviajador_id, status);

create table commission_adjustments (
  id uuid primary key default gen_random_uuid(),
  commission_id uuid not null references commissions(id),
  delta numeric(12,2) not null,
  reason text not null check (length(trim(reason)) > 0),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

-- ───────── Métricas, auditoria, rate limit ─────────
create table analytics_events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  visitor_id text,
  enviajador_id uuid references enviajador_profiles(id),
  experience_id uuid references experiences(id),
  props jsonb not null default '{}', -- sem dados pessoais
  created_at timestamptz not null default now()
);
create index on analytics_events (name, created_at desc);

create table audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid,
  action text not null,
  table_name text not null,
  row_id text,
  old_data jsonb, new_data jsonb,
  reason text,
  created_at timestamptz not null default now()
);

create table rate_limits (
  key text not null,
  window_start timestamptz not null,
  hits int not null default 1,
  primary key (key, window_start)
);

-- ───────── Triggers ─────────
do $$
declare t text;
begin
  for t in select table_name from information_schema.columns
           where table_schema='public' and column_name='updated_at' loop
    execute format('create trigger trg_%1$s_updated before update on %1$I
                    for each row execute function set_updated_at()', t);
  end loop;
end $$;

-- Auditoria genérica
create function audit_row() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into audit_logs(actor_id, action, table_name, row_id, old_data, new_data)
  values (auth.uid(), tg_op, tg_table_name,
          coalesce((case when tg_op='DELETE' then old.id else new.id end)::text, null),
          case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,
          case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end);
  return coalesce(new, old);
end $$;

create trigger audit_sales after insert or update on sales for each row execute function audit_row();
create trigger audit_commissions after insert or update on commissions for each row execute function audit_row();
create trigger audit_commission_adj after insert on commission_adjustments for each row execute function audit_row();
create trigger audit_commission_rules after insert or update on commission_rules for each row execute function audit_row();
create trigger audit_leads after update on leads for each row execute function audit_row();
create trigger audit_enviajadores after update on enviajador_profiles for each row execute function audit_row();

-- Registros financeiros e logs nunca são apagados nem reescritos
create function forbid_delete() returns trigger language plpgsql as $$
begin raise exception 'Exclusão proibida em %: use ajuste/cancelamento', tg_table_name; end $$;
create trigger no_delete_sales before delete on sales for each row execute function forbid_delete();
create trigger no_delete_commissions before delete on commissions for each row execute function forbid_delete();
create trigger no_delete_commission_adj before delete on commission_adjustments for each row execute function forbid_delete();
create trigger no_delete_audit before delete on audit_logs for each row execute function forbid_delete();
create trigger no_update_audit before update on audit_logs for each row execute function forbid_delete();

-- Snapshot de atribuição é imutável; alteração exige RPC administrativa (a criar) que
-- define app.attribution_override = 'on' após registrar motivo em audit_logs.
create function lead_snapshot_immutable() returns trigger language plpgsql as $$
begin
  if (old.attribution_snapshot is distinct from new.attribution_snapshot
      or old.attributed_enviajador_id is distinct from new.attributed_enviajador_id)
     and coalesce(current_setting('app.attribution_override', true), 'off') <> 'on' then
    raise exception 'Atribuição imutável: use a função administrativa com motivo';
  end if;
  return new;
end $$;
create trigger lead_attribution_immutable before update on leads
  for each row execute function lead_snapshot_immutable();
