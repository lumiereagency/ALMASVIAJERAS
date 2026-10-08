# Decisões e padrões adotados (Fase A)

Padrões aplicados na ausência de resposta do proprietário. Alterar aqui e no código quando houver decisão diferente.

| # | Tema | Padrão | Pendente de confirmação |
|---|---|---|---|
| 1 | Idiomas | ES padrão, estrutura i18n para EN | Sim |
| 2 | Comissão | `commission_rules` configurável (percentual ou fixo; experiência > categoria > global). Seed com valores fictícios | **Sim, bloqueia produção** |
| 3 | Moedas | MXN, USD, EUR; taxa manual do admin, sempre com data (`fx_rates`) | Sim |
| 4 | Enviajador | Confirmação por e-mail + aprovação manual do admin (`status = pending → active`) | Sim |
| 5 | Dados do lead ao Enviajador | Só primeiro nome, experiência, estágio (view `enviajador_leads`) | Não |
| 6 | Conta do viajante | Link mágico por e-mail; somente consulta | Não |
| 7 | Domínio | Domínio único; vitrine em `/e/[slug]` | Sim |
| 8 | Comissão e moeda | Mesma moeda da venda; fixa só se a moeda da regra coincide | Sim |
| 9 | Supabase | Nuvem, projeto do contratante; VPS roda só app + proxy | Não |

## Regras do Alma Nawi (MVP)

- Menores pagam preço integral (`MINOR_PRICE_FACTOR = 1`).
- Orçamento: até 15% acima = alternativa com aviso; acima disso = excluída.
- Duração: até 1 dia fora do intervalo = alternativa com aviso; mais = excluída.
- Só experiências sem avisos graves são `primary`.
- Pesos: intenções 40, região 20, companhia 15, orçamento 15, duração 10.

## Atribuição

Último toque válido em 30 dias (configurável), autovisitas excluídas, primeira e última referência guardadas.
Snapshot em `leads.attribution_snapshot`, protegido por trigger; alteração só por função administrativa com motivo
(**função ainda a implementar**).

## Pendências conhecidas do esquema

- Função administrativa de troca de atribuição com motivo.
- Rotina de anonimização de lead (`anonymized_at` existe; procedimento não).
- Políticas de Storage (buckets) ainda não definidas.
- Testes de RLS por papel (pgTAP ou integração) ainda não escritos.

## Estado de autenticação e catálogo (branch feat/auth-catalog)

- Login, recuperação de senha, logout e guarda por papel (`proxy.ts` + `requireRole`) implementados e verificados **apenas sem Supabase** (rotas privadas redirecionam; públicas respondem). Fluxo real com sessão e RLS **não foi testado**: depende de um projeto Supabase.
- Catálogo público lê `experiences` publicadas via cliente com sessão (RLS). Seed de homologação em `supabase/seed.sql`.
- **Pendente:** rate limit no login (tabela `rate_limits` existe, falta o uso), cadastro de Enviajador, CRUD de catálogo no admin, upload de mídia, testes de RLS.

## Landing (revisão 2) — aderência à identidade visual

Auditada contra `docs/visual-identity.md`: labels ≥ 12 px, botões ≥ 44 px (48 px padrão), gradiente só no CTA do hero e no CTA final (demais botões em Noite Profunda), ícones de uma única biblioteca (24 px, traço 1.75), sem emojis, Sora + Inter, foco violeta, movimento 200 ms/700 ms com `prefers-reduced-motion`.

**Pendente (bloqueia o visual premium):** fotografia real. `content/landing.ts` aponta `photo: null` → fundo de reserva. Colocar arquivos em `public/photos/` e preencher os caminhos. Textos e preços marcados SAMPLE (mockup) e o depoimento de "Mariana López" **não são reais**; o botão de vídeo só aparece com `VIP.videoUrl`.
Menu: o mockup traz Viajes/Experiencias/Destinos/Enviajadores/Nosotros; o documento pede Experiencias/Alma Nawi/Enviajadores. Usei a união sem "Viajes" (redundante com Experiencias).
