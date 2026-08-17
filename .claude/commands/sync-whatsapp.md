Busque as últimas mensagens do WhatsApp da FabIA e organize no Obsidian.

1. Execute o script Node.js que faz todo o trabalho:
   node "C:\Users\fabio\Documents\segundo-cerebro\sync-whatsapp.js"

   O script já cuida de:
   - Buscar até 200 mensagens em https://fabia-webhook-production.up.railway.app/messages?limit=200
   - Salvar cada mensagem com nome único {YYYY-MM-DD}_{HHMM}_{contato}.md (sem sobrescritas)
   - Detectar mídia ([foto], [áudio], [vídeo], [documento], [localização]) em vez de [sem texto]
   - Ser idempotente: se o arquivo já existe, pula sem duplicar

2. Arquivos salvos em:
   - Urgência ALTA: vault\WhatsApp\ALTA\
   - Outras: vault\WhatsApp\{context_tag}\

3. Após o sync, atualize o índice em:
   vault\WhatsApp\_INDEX.md
   Listando mensagens ALTA e um resumo das demais por contexto (OBRAS, SMS, GERAL, ADMIN).