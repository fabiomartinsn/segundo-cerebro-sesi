Busque as últimas mensagens do WhatsApp da FabIA e organize no Obsidian.

1. Execute o script Node.js que faz todo o trabalho:
   node "D:\segundo-cerebro\sync-whatsapp.js"

   O script já cuida de:
   - Buscar até 500 mensagens em https://fabia-webhook2-production.up.railway.app/messages?limit=500
   - Salvar cada mensagem com nome único {YYYY-MM-DD}_{HHMM}_{contato}.md (sem sobrescritas)
   - Detectar mídia ([foto], [áudio], [vídeo], [documento], [localização]) em vez de [sem texto]
   - Ser idempotente: se o arquivo já existe, pula sem duplicar

2. Arquivos salvos em:
   - Grupos: vault\WhatsApp\grupos\{nome_grupo}\
   - Diretos: vault\WhatsApp\diretos\{nome_contato}\

3. Após o sync, atualize o índice em:
   vault\WhatsApp\_INDEX.md
   Listando mensagens Urgente/SESI primeiro, depois resumo por assunto (SESI, Senai, Particular, Diversos, FabIA).