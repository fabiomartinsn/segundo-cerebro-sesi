# /notebooklm — Processador de Output NotebookLM

## Propósito
Recebe qualquer output do NotebookLM (resumo, extração, síntese)
e transforma em entregável acionável para o contexto EDISER/JFX,
Perícia Judicial ou Desenvolvimento.

## Como usar
```
/notebooklm [TIPO] [OUTPUT_DO_NOTEBOOKLM]
```

---

## TIPOS DISPONÍVEIS

### `norma`
**Trigger:** Output de norma NBR, NR ou padrão Petrobras

**Claude deve:**
1. Identificar todos os requisitos mandatórios (verbos: deve, shall, é obrigatório)
2. Cruzar com o contexto ativo (Bloco B, D ou Q — perguntar se não informado)
3. Gerar checklist de conformidade em tabela: | Requisito | Referência | Status | Prazo |
4. Listar documentos SMS que precisam ser criados ou revisados
5. Sinalizar com 🔴 itens críticos e 🟡 itens de atenção

---

### `acidente`
**Trigger:** Output sobre acidente, incidente ou quase-acidente

**Claude deve:**
1. Extrair: O quê, Quem, Quando, Onde, Como, Por quê (5W1H)
2. Gerar estrutura de PACR (Plano de Ação Corretiva e Reativa)
3. Redigir DDS de 10 minutos baseado na lição aprendida
4. Listar documentos afetados: APR, PEX, PT — indicar número de revisão necessária
5. Verificar se exige notificação Petrobras (CAT, RIA, etc.)

---

### `projeto`
**Trigger:** Output de memorial descritivo, projeto elétrico, SPDA, aterramento ou SDAI

**Claude deve:**
1. Mapear disciplinas envolvidas (elétrica, civil, HVAC, telecom, incêndio)
2. Gerar lista de verificação técnica por disciplina
3. Identificar interfaces críticas entre disciplinas
4. Listar normas aplicáveis: NBR, NR, padrões Petrobras (N-série, PBS)
5. Sugerir sequência de análise e pontos de atenção para parecer técnico

---

### `reuniao`
**Trigger:** Output de transcrição, notas ou resumo de reunião

**Claude deve:**
1. Extrair decisões tomadas (formato: DECISÃO | RESPONSÁVEL | PRAZO)
2. Extrair pendências e ações (formato 5W2H simplificado)
3. Redigir ata formal em padrão JFX/Petrobras
4. Identificar itens que requerem comunicação formal à fiscalização
5. Gerar lista de follow-up para próxima reunião

---

### `auditoria`
**Trigger:** Output de relatório de auditoria, inspeção ou fiscalização Petrobras

**Claude deve:**
1. Classificar não-conformidades: 🔴 Crítica | 🟡 Maior | 🟢 Menor | 📋 Observação
2. Gerar Plano de Ação em formato 5W2H para cada NC
3. Estimar prazo de resposta adequado por criticidade
4. Redigir comunicado formal de resposta à fiscalização
5. Identificar se NC afeta outros documentos do sistema SMS

---

### `aprendizado`
**Trigger:** Output de estudo, norma técnica ou material de capacitação

**Claude deve:**
1. Extrair os 5 conceitos mais críticos do tema
2. Formular 5 perguntas difíceis no nível de auditor Petrobras ou banca de concurso
3. Aguardar respostas de Fábio e avaliar com justificativa técnica
4. Conectar o conhecimento teórico com casos reais do contexto EDISER
5. Sugerir como aplicar o aprendizado em documentação ativa

---

### `pericia`
**Trigger:** Output de laudo, processo judicial, NR ou literatura técnica para caso pericial

**Claude deve:**
1. Identificar fundamentos técnicos e normativos aplicáveis ao caso
2. Mapear argumentos da parte contrária que podem surgir
3. Sugerir estrutura de quesitos ou respostas periciais
4. Redigir trecho de parecer técnico em linguagem pericial (TJ/SE)
5. Listar evidências e documentos que reforçam a tese técnica

---

### `apr`
**Trigger:** Output de procedimento executivo, método construtivo ou descrição de atividade

**Claude deve:**
1. Decompor a atividade em etapas sequenciais
2. Para cada etapa: mapear Perigos → Riscos → Medidas de Controle (hierarquia)
3. Gerar APR completa no padrão EDISER/Petrobras
4. Indicar EPIs por etapa com referência CA
5. Sinalizar etapas que exigem Permissão de Trabalho (PT)

---

## PROTOCOLO DE EXECUÇÃO

Ao receber `/notebooklm [TIPO]`:

```
1. Confirmar o TIPO identificado
2. Perguntar contexto se não informado:
   - Qual bloco? (B / D / Q / Geral)
   - Qual disciplina? (Elétrica / HVAC / Civil / Telecom / SPDA)
3. Processar o output do NotebookLM
4. Entregar o resultado estruturado
5. Perguntar: "Deseja exportar como .docx, registrar no vault ou enviar à fiscalização?"
```

---

## EXEMPLO DE USO REAL

```
/notebooklm norma

[Output do NotebookLM sobre NR-10 / NBR 5410]

Contexto: Bloco D — Projeto Elétrico de Reforma
```

**Resultado esperado:**
- Checklist de conformidade NR-10 + NBR 5410
- Lista de documentos a revisar (APR elétrica, PT LOTO, etc.)
- Itens críticos sinalizados para o parecer técnico

---

## INTEGRAÇÃO COM VAULT

Após processar, Claude deve perguntar se deseja salvar em:
- `vault/_knowledge/normas/` — para referências normativas
- `vault/_knowledge/JFX/` — para entregáveis EDISER
- `vault/_sessions/` — como log da sessão de trabalho
