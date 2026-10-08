# Matriz de permissões

Garantida no banco (RLS + funções), não só na interface. Validada por teste transacional em 08/10/2026.

| Ação | Visitante | Enviajador | Equipe | Admin |
|---|---|---|---|---|
| Ver experiências publicadas e vitrines ativas | ✅ | ✅ | ✅ | ✅ |
| Criar lead (com consentimento) / evento | ✅ (por função, com limite por telefone e visitante) | ✅ | ✅ | ✅ |
| Ler leads | ❌ | só 1º nome, experiência e estado dos **seus** leads | ✅ | ✅ |
| Ver telefone/e-mail/notas do lead | ❌ | ❌ | ✅ | ✅ |
| Mudar estado do lead / notas | ❌ | ❌ | ✅ (transições válidas; perda exige motivo) | ✅ |
| Confirmar venda | ❌ | ❌ | ✅ | ✅ |
| Ler suas comissões | ❌ | ✅ | ✅ | ✅ |
| Aprovar/pagar/cancelar/ajustar comissão | ❌ | ❌ | ❌ | ✅ (com motivo; nada é apagado) |
| Aprovar Enviajador, atribuir papéis | ❌ | ❌ | ❌ | ✅ |
| Ler segredos (`app_secrets`), auditoria | ❌ | ❌ | ❌ | auditoria ✅ |
| Alterar atribuição de um lead | ❌ | ❌ | ❌ | só por função administrativa com motivo (**pendente**) |

Proteções adicionais: venda, comissão e auditoria sem `DELETE`; atribuição do lead imutável por gatilho; token de link inválido ou forjado não atribui; mensagens de login idênticas (sem enumeração de contas).
