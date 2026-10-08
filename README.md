# Almas Viajeras — MVP

Plataforma que conecta viajantes, Enviajadores, equipe comercial e administradores:
descoberta → recomendação → lead → atendimento → venda → atribuição → comissão.

Fonte de verdade do produto: [docs/product-scope.md](docs/product-scope.md).

## Estado atual (Fase B, em andamento)

| Parte | Estado |
|---|---|
| Domínio puro (câmbio, ranking Alma Nawi, atribuição, funil, comissões) | escrito, com testes em `tests/unit` |
| Migrations (`0001_schema`, `0002_rls`) | escritas, **ainda não aplicadas a nenhum Supabase** |
| App Next.js, auth, UI, Docker, CI | pendente (exige Node.js instalado) |
| Identidade visual | aguardando `docs/visual-identity.md` |

## Comandos

```bash
npm install
npm run typecheck
npm test
```

## Estrutura

- `domain/` regras de negócio puras, sem I/O.
- `supabase/migrations/` esquema, RLS, triggers de auditoria.
- `docs/` escopo, arquitetura, decisões.
- `.env.example` variáveis necessárias (sem valores reais).

Decisões e padrões adotados: [docs/decisions.md](docs/decisions.md).
