Leia vault/_contextos/ e vault/_pipeline/.

Leia também os arquivos `.md` modificados hoje em vault/WhatsApp/grupos/ e vault/WhatsApp/diretos/ (recursivamente, todas as subpastas de contato/grupo), e em vault/WhatsApp/Notas-PDF/. Cada nota de mensagem tem no frontmatter os campos `assunto` (SESI, Senai, Particular, Diversos) e `prioridade` (Urgente, Prioridade, Normal). Agrupe as contagens por `assunto`.

IMPORTANTE: JFX/EDISER/Petrobras é contexto encerrado (19/07/2026). NÃO gerar linha de status para JFX/EDISER — apenas consulta histórica, sem ação.

Retorne:
---
# Status Geral — [data]

[Perícia] → [casos ativos e próximas ações]
[Dev-IA] → [projetos e próximas ações]
[Diversos] → [ativo ou "—"]

[WhatsApp — Hoje]
→ SESI: [N mensagens, M Urgente] | próxima ação: [se houver, senão "—"]
→ Senai: [N mensagens] | próxima ação: [se houver, senão "—"]
→ Particular: [N mensagens] | [—]
→ Diversos: [N mensagens] | [—]
→ PDFs: [N recebidos] | [nomes, se houver]

⚠ Alertas: [prazo próximo, bloqueio, ou mensagem com prioridade Urgente sem resposta — ou "Nenhum"]
---
Seja específico. "Em andamento" sem detalhe não é aceito. Se uma categoria não tiver arquivo de hoje, escreva "0 mensagens" — não invente conteúdo.
