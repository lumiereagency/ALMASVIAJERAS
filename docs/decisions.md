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
