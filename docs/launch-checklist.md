# Checklist de lançamento

## Bloqueantes (decisão ou dado do proprietário)
- [ ] **Moeda e valores dos preços** (USD vs MXN): em USD um tour de 1 dia sai por US$649–2.849 por pessoa.
- [ ] **Regra de comissão real** (hoje 5% provisório, `commission_rules`).
- [ ] **Aviso de privacidade e termos** oficiais (hoje borrador; `POLICY_VERSION` em `lib/legal.ts`).
- [ ] **Número de WhatsApp** (`WHATSAPP_NUMBER`).
- [ ] **Domínio** e DNS; **acesso SSH** ao VPS.
- [ ] **Taxas de câmbio** reais em `fx_rates` (hoje o quiz usa taxa referencial e avisa).
- [ ] **SMTP próprio** no Supabase (e-mails de confirmação/recuperação).
- [ ] Excluir o projeto Supabase vazio `almas-viajeras` criado por engano (cobra US$10/mês).

## Técnicos
- [x] Lint, tipos, 37 testes, build.
- [x] Regras de negócio e RLS testadas por papel no banco.
- [x] Lead ponta a ponta em navegador contra o banco real.
- [ ] Fluxo Enviajador → link → lead atribuído → venda → comissão **pela interface** com contas reais.
- [ ] Teste de carga (k6) no VPS com o pico esperado.
- [ ] Deploy de homologação e restauração de backup testada.
- [ ] Cloudflare + regras de rate limit.
- [ ] Monitoramento/alerta de queda (UptimeRobot ou similar).

## Conteúdo
- [ ] Fotos: Xcaret (480 px) e banner da filosofia (1122 px) em versões maiores.
- [ ] Revisar critérios do Alma Nawi (regiões/intenções/companhia) com a equipe.
- [ ] Catálogo: pacotes de 2+ dias e viagens grupais (hoje só tours de 1 dia).
