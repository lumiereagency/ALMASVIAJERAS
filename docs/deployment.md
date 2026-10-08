# Implantação (VPS + Supabase) e operação

## Arquitetura

```
Visitante ─► Cloudflare (DNS, cache, proteção) ─► VPS: Caddy (HTTPS) ─► Next.js (contêiner, sem root)
                                                                   └─► Supabase (Postgres + Auth + RLS)
```

- O site só usa a chave **pública** do Supabase. A segurança está em RLS e em funções `SECURITY DEFINER` (migrations 0002–0004).
- O segredo de assinatura dos links de Enviajador vive **no banco** (`app_secrets`), nunca no site nem no Git.
- Páginas públicas (landing, catálogo) são estáticas ou em cache de 5 min; o banco não é consultado a cada visita.

## Banco (Supabase)

Projeto: `aclfkxtrygcwkakfpkmv` (organização LUMIGROUP, região us-east-1). Migrations em `supabase/migrations/` (0001–0004) já aplicadas; seed em `supabase/seed.sql` já carregado.

Para recriar em outro projeto: aplicar as migrations na ordem e depois o seed. Após qualquer mudança de DDL, rodar o verificador de segurança do Supabase.

**Configurar no painel do Supabase (Authentication):**
1. *URL Configuration*: Site URL = `https://<domínio>`; Redirect URLs = `https://<domínio>/**`.
2. *Email*: decidir se exige confirmação de e-mail (recomendado em produção) e configurar **SMTP próprio** (o SMTP padrão limita poucos e-mails por hora, insuficiente para um lançamento).
3. *Attack protection*: ativar CAPTCHA (Turnstile/hCaptcha) no cadastro se houver abuso.
4. *Backups*: o plano pago inclui backups diários; testar a restauração em homologação antes do lançamento.

**Primeiro administrador:** a pessoa se cadastra em `/registro-enviajador` e depois, no SQL Editor:

```sql
insert into user_roles (user_id, role) select id, 'admin' from auth.users where email = '<email>';
```

Demais papéis: `/admin/usuarios`.

## VPS

Requisitos: Ubuntu 22.04+, 2 vCPU / 4 GB, Docker + Compose, portas 80/443 abertas, acesso por **chave SSH**.

```bash
git clone https://github.com/lumiereagency/ALMASVIAJERAS.git && cd ALMASVIAJERAS
cp .env.example .env        # preencher: SUPABASE url/anon, DOMAIN, WHATSAPP_NUMBER
docker compose up -d --build
docker compose ps           # app deve ficar "healthy"
```

- Deploy de nova versão: `git pull && docker compose up -d --build`.
- **Rollback:** `git checkout <commit-anterior> && docker compose up -d --build` (as imagens anteriores também ficam com tag local; `docker image ls almasviajeras-app`).
- Logs: `docker compose logs -f app` (rotação 10 MB × 5 arquivos).
- Healthcheck: `GET /api/health`.

## Cloudflare (recomendado para volume)

Proxy laranja ligado, SSL "Full (strict)", cache de `/photos/*`, `/brand/*`, `/_next/static/*` (já enviam `Cache-Control` imutável), regras de rate limit para `/contacto` e `/api/track`.

## Backup e restauração

- Banco: backups do Supabase + `pg_dump` semanal opcional (string de conexão fica só com você).
- Aplicação: nada a salvar (stateless); código e migrations estão no Git.
- Teste de restauração: criar projeto de homologação, aplicar migrations e restaurar um dump; validar login e leads.

## Anonimização / exclusão de dados (LFPDPPP)

Sob solicitação do titular: anonimizar o lead (nome, telefone, e-mail, cidade) e marcar `anonymized_at`; vendas e comissões permanecem (registro financeiro) sem dados pessoais. Procedimento manual documentado; rotina automática fica para a próxima fase.
