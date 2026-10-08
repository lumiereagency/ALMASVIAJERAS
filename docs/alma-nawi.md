# Alma Nawi — Escopo e estado de implementação

Versão 1.0 · 08/10/2026 · Fonte: `docs/product-scope.md` §5 Módulo 2. Ranking determinístico, sem IA generativa.

## 1. Propósito

Ajudar o viajante a descobrir experiências que combinam com seu momento, tempo e orçamento, explicando **por que** cada uma foi recomendada e **onde** ela se afasta do pedido.

## 2. Jornada

`/alma-nawi` (6 etapas) → `/alma-nawi/resultado?...` (recomendações) → `/experiencias/[slug]` → (próxima etapa) captação de lead.

| # | Pergunta | Tipo | Valores |
|---|---|---|---|
| 1 | ¿Con quién viajas? | única | solo, pareja, amigos, familia |
| 2 | ¿Qué quieres vivir? | até 2 | descanso, descubrir, conexión, aventura |
| 3 | ¿A dónde te imaginas? | única | Caribe Mexicano, Yucatán, otro destino, abierto |
| 4 | ¿Cuánto tiempo tienes? | única | 1 día, 2–4, 5–8, 9+ |
| 5 | ¿Cuántas personas viajan? | contadores | adultos 1–12, menores 0–12 |
| 6 | ¿Cuál es tu presupuesto total? | moeda + valor | USD / MXN / EUR, mínimo 50 |

Regras de UX: uma pergunta por tela, progresso visível, voltar e editar sempre possível, escolha única avança sozinha (com botão Continuar), validação antes de avançar, foco movido ao título a cada etapa, `prefers-reduced-motion` respeitado.

## 3. Regras do ranking (`domain/recommendations/rank.ts`)

- **Custo do grupo** = preço por pessoa × (adultos + menores). Menores pagam integral no MVP (`MINOR_PRICE_FACTOR = 1`).
- **Moeda:** conversão com taxa e data registradas (`fx_rates`); sem taxa válida, erro, nunca 1:1. Mostrado ao usuário.
- **Orçamento:** cabe → ok; até 15 % acima → *alternativa* com aviso; acima disso → *excluída*.
- **Duração:** dentro do intervalo → ok; 1 dia fora → *alternativa*; mais → *excluída*.
- **Intenção:** sem nenhuma em comum → *alternativa* com aviso. **Região:** fora da escolhida → *alternativa*.
- **Principal** = sem aviso algum. Pontuação (0–100): intenções 40, região 20, companhia 15, orçamento 15, duração 10.
- Ordenação: principais, alternativas, excluídas; desempate por pontuação e id (determinístico).
- **Excluídas não aparecem.** Nenhuma principal contraria duração, orçamento ou grupo (testado).

## 4. Resultado

Melhor coincidência em destaque, demais principais, depois "otras opciones con un pequeño ajuste" com avisos em destaque. Cada cartão: foto, motivos (✓), avisos (⚠), total do grupo com moeda, preço por pessoa, nota de câmbio. Estado vazio honesto quando nada serve ("podemos desenhá-la contigo"). Respostas editáveis por link; o resultado é uma URL reproduzível (sem dados pessoais).

## 5. Dados e eventos

- Catálogo: `lib/catalog/queries.ts` (tabela `experiences`; sem banco, usa `content/catalog-seed.ts`, mesmo formato). Critérios editoriais (regiões, intenções, companhia) vivem nas colunas `regions`, `intents`, `companions`.
- Eventos (sem PII, `/api/track` → `analytics_events`): `quiz_started`, `quiz_step_completed`, `quiz_completed`, `recommendation_viewed`. Sem service role configurado o endpoint responde 204 e descarta.

## 6. Verificado

Lint, tipos e build ok; 37 testes (11 do Alma Nawi: ida e volta das respostas, validação, orçamento por nº de pessoas, duração, intenção, conversão MXN, determinismo, textos em espanhol). Fluxo das 6 etapas percorrido no navegador (desktop e 375 px), sem rolagem horizontal; estado vazio e alternativas conferidos.

## 7. Não feito / pendente

1. **Captação de lead** (nome, WhatsApp, consentimento versionado, CRM, WhatsApp só depois de registrar): próxima etapa, depende do Supabase.
2. **Persistir `quiz_sessions` / `quiz_answers` / `recommendation_results`** quando virar lead (tabelas prontas).
3. **Moeda dos preços:** em USD os tours de 1 dia custam US$649–2.849 por pessoa; ver "Decisões abertas".
4. **Taxas de câmbio reais** (`fx_rates`) e **critérios editoriais** revisados pela equipe.
5. Rate limit no `/api/track`; eventos `contact_clicked` e `lead_created`.
6. Cobertura do catálogo: só tours de 1 dia (Caribe e Yucatán). Quem escolhe 2+ dias ou outro destino cai no estado vazio até existirem pacotes e viagens grupais cadastrados.

## 8. Decisões abertas

- Confirmar moeda e valores dos preços (US$ vs MXN).
- Menores pagam integral? Faixas de idade e desconto.
- Tolerâncias (15 % de orçamento, 1 dia) e pesos são do MVP e ajustáveis em `rank.ts`.
