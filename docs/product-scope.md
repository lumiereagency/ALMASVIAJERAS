# Almas Viajeras — Escopo Fechado do MVP

**Versão:** 1.0 · **Data:** 08 de outubro de 2026 · **Status:** pronto para estimativa, design e desenvolvimento
**Estratégia:** reconstrução independente, baseada na experiência observada, sem dependência do código ou do Supabase anterior

---

## 1. Resumo executivo

Plataforma web premium que conecta: (1) viajantes procurando experiências adequadas ao seu perfil; (2) Enviajadores que recomendam viagens e recebem comissão; (3) equipe da Almas Viajeras (atendimento e vendas); (4) administrador (catálogo, usuários, leads, vendas e comissões).

Fluxo: **Descobrir → receber recomendações → demonstrar interesse → ser atendido → comprar → atribuir a venda → pagar comissão.**

Hipóteses a validar:
- viajantes convertem melhor com experiências compatíveis com perfil, tempo e orçamento;
- criadores e clientes satisfeitos geram novos leads por links rastreáveis;
- a equipe acompanha esses leads sem controles paralelos.

### Referências existentes obrigatórias
- Site institucional: `https://almasviajeras.com.mx/`
- Landing do programa: `https://almasviajeras.com.mx/enviajadores/`
- Cadastro do programa: `https://enviajadores.almasviajeras.com.mx/registro`
- Instagram: `https://instagram.com/almasviajerasmx`

Usar para inventariar conteúdo, fotos, ofertas, provas de confiança, equipe e fluxos. Não clonar a qualidade visual; reconstruir arquitetura de informação, tipografia, hierarquia e experiência.

## 2. Decisões já fechadas

### 2.1 Marca
- **Almas Viajeras:** marca principal para viajantes e compradores.
- **Alma Nawi:** experiência de recomendação e descoberta.
- **Enviajadores:** programa de recomendadores, afiliados e criadores.
- **Parceiros Almas:** fase posterior.

### 2.2 Tecnologia
- Projeto novo, sem dependência do ambiente anterior; novo repositório GitHub do contratante.
- Execução em VPS por contêineres; novo projeto Supabase do contratante.
- Banco, autenticação, armazenamento e políticas documentados em código e migrações.
- Ambientes separados: desenvolvimento, homologação, produção.
- Nenhum segredo no repositório. Backups e procedimento de restauração antes do lançamento.

### 2.3 Produto
- Multiusuário com papéis; não é SaaS multi-tenant nesta fase (estrutura aceita `organization_id` futuro, sem painel multi-agência).
- WhatsApp é canal de atendimento, não o CRM. Todo contato é registrado antes ou durante o encaminhamento.
- Toda comissão tem origem, cálculo e histórico auditáveis.

## 3. Objetivos do MVP

**Negócio:** gerar leads qualificados; identificar perfil e intenção; atribuir leads e vendas ao Enviajador correto; aumentar conversão por recomendação personalizada; reduzir operação manual; criar base própria para campanhas.

**Viajante:** entender a proposta; descobrir experiências compatíveis; comparar com moeda, duração e preço claros; pedir atendimento sem repetir informações; experiência visual premium e confiável.

**Enviajador:** criar e personalizar vitrine; escolher viagens; receber textos adaptados ao estilo; compartilhar links rastreáveis; acompanhar leads sem dados sensíveis; entender origem e status de cada comissão.

**Equipe:** visualizar, qualificar e atualizar leads; consultar respostas do Alma Nawi; registrar interações e próximos passos; converter lead em reserva/venda; confirmar valores e comissões; segmentar contatos.

## 4. Perfis e permissões

- **Visitante:** navegar na landing e catálogo; usar o Alma Nawi; ver recomendações; iniciar contato e consentir.
- **Cliente/viajante:** acesso opcional após virar lead; consulta perfil, interesses e solicitações. Sem pagamento online nem gestão completa de reservas.
- **Enviajador:** perfil público; vitrine e links; ofertas autorizadas; estilo de comunicação; indicadores, leads atribuídos e comissões. Não acessa telefone, e-mail completo ou conversas do cliente.
- **Funcionário/consultor:** leads designados/permitidos; funil, notas, tarefas, próximos contatos; proposta ou valor estimado. Não aprova pagamento de comissão.
- **Administrador:** usuários e permissões; catálogo, preços, moedas, datas, disponibilidade; leads, vendas, regras e comissões; exportações; logs.

## 5. Escopo funcional fechado

### Módulo 1 — Landing institucional
Proposta de valor; diferenciais; experiências em destaque; explicação do Alma Nawi; prova social; credenciais, registro e confiança; CTA descobrir experiência; CTA falar com a equipe; acesso a Enviajadores; termos e privacidade.
**Aceite:** em até dez segundos o visitante entende o que a empresa oferece, por que confiar e o próximo passo.

### Módulo 2 — Alma Nawi
Quiz de seis etapas: 1) companhia; 2) intenção emocional; 3) região ou abertura de destino; 4) duração; 5) adultos e menores; 6) orçamento total e moeda.
Regras: moeda sempre explícita; preços em moedas diferentes convertidos por taxa registrada com data; duração incompatível exclui ou penaliza fortemente; orçamento considera nº de pessoas e preço por pessoa; resultados explicam o porquê; respostas persistidas quando virar lead; usuário pode voltar e editar; recomendações determinísticas e testáveis, sem IA generativa.
**Aceite:** nenhuma recomendação principal contraria duração, orçamento ou composição do grupo sem aviso explícito.

### Módulo 3 — Catálogo de experiências
Cards visuais; busca e filtros; categorias emocionais; destino, duração, tipo, preço e moeda; datas/períodos; estado publicado/rascunho/indisponível; página detalhada; imagens otimizadas; FAQ por experiência; CTA de interesse; indicação do Enviajador preservada na navegação.
**Regra:** uma única fonte de dados para catálogo público, recomendações e painel do Enviajador.

### Módulo 4 — Captação de lead e atendimento
Antes do WhatsApp registrar: nome; telefone/WhatsApp; e-mail opcional; país e cidade opcionais; experiência de interesse; respostas do Alma Nawi; origem da campanha; Enviajador responsável; consentimento e versão da política. Depois abrir o WhatsApp com mensagem predefinida e identificador do lead.
**Aceite:** todo clique de contato gera evento; todo lead enviado aparece no CRM com origem e contexto.

### Módulo 5 — CRM operacional
Pipeline: novo; tentativa de contato; em atendimento; proposta enviada; apartado/reserva; venda confirmada; perdido; cancelado.
Inclui: lista e filtros; página do lead; histórico; notas internas; responsável; próxima tarefa e data; valor estimado; motivo de perda; tags; respostas do quiz; origem e Enviajador; exportação CSV (admin).
Não inclui: inbox omnichannel, e-mail em massa, automação avançada, API oficial do WhatsApp.

### Módulo 6 — Programa Enviajadores
Cadastro e ativação por e-mail; perfil público; slug exclusivo; vitrine; link geral e por viagem; estilos de texto; painel de métricas; visão limitada dos leads; guia e central de ajuda; termos.
Indicadores: visitas válidas; cliques em contato; leads; leads em atendimento; reservas; vendas confirmadas; receita atribuída; comissão gerada, aprovada, paga e cancelada.

### Módulo 7 — Comissões
Registrar: Enviajador; lead e venda; experiência; valor elegível; regra aplicada; percentual ou valor fixo; comissão calculada; moeda; status; motivo de ajuste; datas de geração, aprovação e pagamento; administrador responsável.
Status: estimada; aguardando confirmação; aprovada; programada para pagamento; paga; cancelada; contestada.
Nada é apagado; correções geram ajustes auditáveis.

### Módulo 8 — Administração do catálogo
CRUD de experiências; preços e moedas; duração; categorias; intenção emocional; imagens; datas e disponibilidade; conteúdos; critérios do Alma Nawi; publicação/despublicação.

### Módulo 9 — Usuários e segurança
Autenticação e-mail/senha; recuperação; RBAC; RLS no Supabase; sessões seguras; limitação de tentativas; validação no servidor; logs administrativos; exclusão/anonimização sob solicitação; proteção contra enumeração de contas; cabeçalhos de segurança e HTTPS.

### Módulo 10 — Métricas e consentimento
Eventos mínimos: `landing_viewed`, `quiz_started`, `quiz_step_completed`, `quiz_completed`, `recommendation_viewed`, `experience_viewed`, `contact_clicked`, `lead_created`, `referral_attributed`, `sale_confirmed`, `commission_created`, `commission_paid`.
Consentimentos armazenados separadamente de preferências de marketing.

## 6. Jornadas obrigatórias
- **A — Viajante orgânico:** landing → Alma Nawi → recomendações → experiência → identificação → CRM → WhatsApp → atendimento.
- **B — Viajante indicado:** link do Enviajador → vitrine atribuída → experiência ou Alma Nawi → identificação → CRM com atribuição → atendimento → venda → comissão.
- **C — Enviajador:** cadastro → ativação → tour → perfil → vitrine → escolha de viagem → texto → compartilhamento → acompanhamento → comissão.
- **D — Funcionário:** login → fila → detalhe → contato → estágio → tarefa → proposta → reserva ou perda.
- **E — Administrador:** login → visão operacional → catálogo → usuários → leads → venda confirmada → comissão → pagamento.

## 7. Modelo de dados mínimo
`profiles`; `roles` e `user_roles`; `traveler_profiles`; `enviajador_profiles`; `experiences`; `experience_departures`; `experience_prices`; `experience_media`; `experience_tags`; `quiz_sessions`; `quiz_answers`; `recommendation_results`; `referral_links`; `attribution_events`; `leads`; `lead_status_history`; `lead_notes`; `lead_tasks`; `sales`; `commission_rules`; `commissions`; `commission_adjustments`; `consents`; `analytics_events`; `audit_logs`.
Todas as tabelas de negócio: identificador, datas de criação e atualização e, quando aplicável, autor.

## 8. Regras de atribuição
- Link pessoal gera identificador de referência assinado.
- Primeira e última referência registradas para análise.
- Uma única atribuição vencedora, definida antes do lançamento. Sugestão: último Enviajador válido antes da criação do lead, janela de 30 dias.
- Não depende apenas de parâmetros visíveis na URL.
- O lead guarda cópia imutável da atribuição aplicada.
- Autovisitas e tráfego administrativo excluídos quando identificáveis.
- Alterações manuais exigem motivo e log.

## 9. Requisitos visuais aprovados
Direção **Opção 2 — Movimento Contemporâneo**. `identidade-visual-almas-viajeras.md` é a fonte de verdade visual e deve ser copiado para `docs/visual-identity.md`.

Decidido: preservar logo e cores primárias; eliminar a sensação de páginas independentes; sistema visual único para landing, quiz, catálogo, CRM e painel; direção aesthetic, editorial e premium; nova tipografia; reduzir emojis como elementos de interface; fotografia como ativo de conversão; tokens de cor, tipografia, espaçamento, raio, sombra e movimento; contraste, foco visível, teclado e responsividade.

### Diagnóstico do site atual
**Preservar:** logo e gradiente; mensagem de transformação pela viagem; fotografia e acervo; prova de agência mexicana, RNT e atendimento humano; histórico de 600+ viajantes e sete anos (após validação documental); catálogo de tours, viagens grupais e propostas personalizadas; perfis reais da equipe; versões ES e EN.
**Reconstruir:** escala e combinação tipográfica; primeira dobra vazia; navegação e arquitetura das ofertas; CTAs diretos ao WhatsApp repetidos; catálogo longo sem priorização; confusão "Travel Partners" × "Enviajadores"; emojis funcionais; consistência de cards, botões, rótulos, espaçamentos e estados; captação estruturada antes do WhatsApp; integração landing/Alma Nawi/catálogo/plataforma privada.
"Enviajadores" é o nome único do programa; "Travel Partners" só como classificação interna.

## 10. Fora do escopo
App nativo; multi-tenant comercial; marketplace aberto; portal financeiro de parceiros; cupons presenciais complexos; pagamentos online; motor de reservas; pontos; grupo VIP automatizado; e-mail marketing completo; notificações comportamentais avançadas; IA generativa em decisões comerciais; chat autônomo; pacotes audiovisuais automatizados; integrações profundas com companhias aéreas e hotéis.

## 11. Arquitetura recomendada
**Aplicação:** Next.js + TypeScript, SEO; componentes acessíveis e tokens centralizados; camadas separadas (domínio, dados, interface); validação compartilhada; páginas públicas rápidas e indexáveis.
**Dados/auth:** novo Supabase do contratante; PostgreSQL como fonte única; Supabase Auth e Storage; RLS em todas as tabelas expostas; migrações SQL no repositório; seed de homologação sem dados pessoais reais.
**VPS:** Docker e Compose; proxy Caddy ou Nginx; HTTPS automático; app sem privilégios elevados; variáveis fora da imagem; healthcheck; logs com rotação; deploy reproduzível; rollback documentado.
**Repositório:** `main` protegida; branches e PRs; lint, tipos, testes e build no CI; migrations versionadas; documentação de instalação e operação; `.env.example`; sem chaves em commits.

## 12. Estrutura sugerida
```
app/ (public, auth, viajante, enviajador, equipe, admin) · components/ (ui, marketing, catalog, quiz, crm, dashboard)
domain/ (attribution, recommendations, leads, commissions) · lib/ · supabase/ (migrations, seed.sql, policies)
tests/ (unit, integration, e2e) · public/brand · docs/ · Dockerfile · docker-compose.yml · .env.example · README.md
```

## 13. Qualidade e aceite gerais
Fluxos principais em desktop e celular; nenhum segredo no cliente/log/repositório; isolamento de dados por perfil; catálogo com fonte única; moedas explícitas; quiz respeita orçamento, duração e grupo; lead mantém origem e atribuição; alterações de venda e comissão registradas; SEO básico e compartilhamento social; imagens responsivas; formulários acessíveis; estados de carregamento, vazio, erro e sucesso; testes de recomendação, atribuição, permissões e comissão; deploy repetível; backup e restauração testados em homologação.

## 14. Testes obrigatórios
**Unidade:** orçamento; conversão de moeda; ranking; atribuição; comissão; transições de status.
**Integração:** cadastro e ativação; criação do lead; associação ao Enviajador; atualização do CRM; confirmação da venda; criação e pagamento da comissão; RLS por papel.
**Ponta a ponta:** viajante orgânico; viajante indicado; Enviajador compartilhando; funcionário convertendo lead; administrador confirmando comissão.

## 15. Fases
0 Controle e identidade · 1 Fundação (projeto, auth, papéis, banco, RLS, CI, Docker, design system, catálogo/admin) · 2 Viajante (landing, vitrine, Alma Nawi, recomendações, experiência, lead) · 3 Enviajadores (cadastro, perfil, links, textos, painel, atribuição) · 4 Operação (CRM, venda, comissões, relatórios, auditoria) · 5 Homologação e VPS.

## 16. Definição de pronto
Um visitante indicado conclui o Alma Nawi, vê recomendações coerentes, escolhe uma experiência, vira lead com consentimento, aparece no CRM com atribuição correta, avança até venda confirmada e gera comissão rastreável para o Enviajador. Interface bonita sozinha não caracteriza o MVP pronto.

## 17. Informações necessárias no momento certo
Logo oficial (SVG); valores oficiais das cores; domínio e DNS; organização/conta GitHub; projeto Supabase; acesso à VPS por chave SSH; regras definitivas de atribuição e comissão; política de privacidade e termos; catálogo inicial revisado; direção visual aprovada.
