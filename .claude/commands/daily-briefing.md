# Daily Briefing — FabIA

Gere o briefing completo do dia seguindo rigorosamente a estrutura abaixo.

**Antes de gerar:** leia em silêncio os seguintes arquivos do vault:
- `vault/_identity/about-me.md`
- `vault/_identity/metodo-trabalho.md`
- `vault/_contextos/_INDEX.md`
- Os 3 arquivos mais recentes de `vault/_sessions/`
- Os 3 arquivos mais recentes de `vault/_decisions/`

Use apenas dados reais dos arquivos. Se uma pasta estiver vazia, escreva "Nenhum registro ainda".

**IMPORTANTE:** JFX/EDISER/Petrobras é contexto encerrado (19/07/2026). NÃO incluir no briefing seções de JFX, EDISER, Gestão SMS, equipe EDISER (Sheila/Roberta/Fernando/Lucimara), cobertura PEX/APR, ou qualquer ação relacionada. Essas informações existem no vault para consulta histórica/decisória, mas não geram ações no briefing diário.

---

## Leitura das mensagens de WhatsApp

As mensagens de WhatsApp ficam organizadas por **contato**, não por assunto:
- `vault/WhatsApp/grupos/<nome do grupo>/*.md`
- `vault/WhatsApp/diretos/<nome do contato>/*.md`
- `vault/WhatsApp/Notas-PDF/*.md` (PDFs recebidos)

Cada nota `.md` de mensagem tem no frontmatter os campos `assunto` (SESI, Senai, Particular, Diversos) e `prioridade` (Urgente, Prioridade, Normal). Cada nota de PDF tem o campo `contexto`.

**Passo a passo:**
1. Liste recursivamente todos os arquivos `.md` modificados **hoje** (data de hoje) dentro de `vault/WhatsApp/grupos/`, `vault/WhatsApp/diretos/` e `vault/WhatsApp/Notas-PDF/`.
2. Leia o frontmatter de cada um para saber `assunto`/`prioridade` (mensagens) ou `contexto` (PDFs).
3. Agrupe os resultados por `assunto`: SESI, Senai, Particular, Diversos, PDFs.
4. Dentro de cada grupo, mensagens com `prioridade: Urgente` vão destacadas com 🔴 no topo, antes das demais. `prioridade: Prioridade` leva 🟡.
5. Se nenhum arquivo de hoje for encontrado em uma pasta, escreva "Nenhuma mensagem nova hoje" — não invente conteúdo.

Para cada mensagem: extraia contato (frontmatter `contato`) e horário (frontmatter `data`), e resuma o conteúdo (seção `## Mensagem`) em 1 linha própria — não copie o texto literal.

Para cada PDF: leia a seção `## Conteúdo Extraído (automático)` da nota e escreva um resumo real de 2-3 linhas do que o documento trata — não invente, baseie-se apenas no texto extraído. Se a seção disser que não foi possível extrair texto, informe isso.

Ignore mensagens administrativas/sociais óbvias (figurinhas, "bom dia", "ok", confirmações de presença) — foque no que tem conteúdo decisório ou informativo relevante.

**Contatos VIP SESI — ler sempre, independente de assunto classificado:**
- `vault/WhatsApp/diretos/Ivonete Almeida/` — Gerente RH FIES (+5579999217120)
- `vault/WhatsApp/diretos/Luis Paulo/` — Secretário da Presidência FIES (+5579999292756)
- `vault/WhatsApp/diretos/Luiz Carlos/` — alias antigo de Luis Paulo (histórico anterior ao mapeamento JID)

Qualquer mensagem desses contatos hoje deve aparecer em destaque 🔴 na seção SESI, mesmo que o frontmatter `assunto` diga outra coisa (mensagens anteriores ao fix de classificação).

---

Gere o briefing com exatamente este formato:

```
# Daily Briefing — [dia da semana], [dd/mm/aaaa]
> FabIA · Fábio Martins Nascimento

## Panorama
[2 linhas: como está a semana e o que domina a agenda hoje]

---

## SESI / Sistema Indústria
**Status:** [resumo em 1 linha]
**Próxima ação:** [específica e acionável]
**Alerta:** [prazo, bloqueio ou risco — ou "—"]

## Perícia Judicial
**Status:** [resumo]
**Próxima ação:** [específica]
**Alerta:** [ou "—"]

## Dev-IA
**Status:** [resumo]
**Próxima ação:** [específica]

## Diversos
[ativo relevante ou "Nada ativo no momento"]

---

## 📱 WhatsApp — Hoje

### SESI
[🔴 hh:mm Contato: resumo — se Urgente]
[🟡 hh:mm Contato: resumo — se Prioridade]
[ou "Nenhuma mensagem nova hoje"]

### Senai
[mesmo formato, ou "Nenhuma mensagem nova hoje"]

### Particular
[mesmo formato, ou "Nenhuma mensagem nova hoje"]

### Diversos
[mesmo formato, ou "Nenhuma mensagem nova hoje"]

### 📄 PDFs recebidos hoje
- [nome do arquivo] ([contexto]) — [resumo real de 2-3 linhas do conteúdo extraído]
[ou "Nenhum PDF recebido hoje"]

### Decisões Pendentes (WhatsApp)
[itens com prioridade Urgente ou Prioridade que claramente pedem resposta/decisão sua, com contato e assunto — ou "Nenhuma pendência"]

---

## Sessão Anterior
[resumo em 2 linhas do arquivo mais recente de vault/_sessions/]
[se não houver: "Primeira sessão — nenhum histórico ainda"]

---

## 🎯 Foco de Hoje
1. [prioridade absoluta — seja específico e acionável]
2. [prioridade 2]
3. [prioridade 3]

## ⚠️ Alertas Gerais
[prazo iminente, bloqueio, conexão crítica entre contextos, ou pendência Urgente do WhatsApp sem resposta — ou "Nenhum alerta"]
```

---

Ao finalizar o briefing no terminal, gere também o arquivo HTML em
`vault/_sessions/briefing-AAAA-MM-DD.html` com o mesmo conteúdo
formatado para impressão A4, com:
- Cabeçalho: "Daily Briefing — [data]" + logo textual FabIA
- Seções SESI / Perícia / Dev-IA / Diversos / WhatsApp com bordas visuais por contexto
- Alertas em vermelho / urgentes em laranja / OK em verde
- CSS print-friendly (sem backgrounds escuros, fonte 11pt, margens 1.5cm)
- Rodapé: "Fábio Martins Nascimento · CREA-SE 2718664207"
