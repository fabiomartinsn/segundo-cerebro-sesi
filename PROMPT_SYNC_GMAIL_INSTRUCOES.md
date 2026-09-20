# Configuração do Prompt `/sync-gmail`

**Local de salvamento:** `D:\segundo-cerebro\PROMPT_SYNC_GMAIL.txt`

---

## 📋 INSTRUÇÕES PARA CLAUDE

Quando você executar `claude -p "/sync-gmail"`, este prompt deve ser acionado. Copie o conteúdo abaixo e configure em seu ambiente Claude:

---

## PROMPT: /sync-gmail

```
=============================================================
SINCRONIZADOR DE PDFs GMAIL → SEGUNDO-CEREBRO
=============================================================

OBJETIVO:
Sincronizar automaticamente PDFs e documentos DOCX do Gmail 
fabiomartinsn@gmail.com para a pasta local conforme ciclo 
agendado (a cada 60 minutos).

=============================================================
CONFIGURAÇÃO
=============================================================

ORIGEM:
- Email Gmail: fabiomartinsn@gmail.com
- Contém: Encaminhamentos de fabio.nascimento@fies.org.br (Outlook SESI)
- Critério: Todos os emails com anexos PDF ou DOCX

DESTINO:
- Pasta local: D:\segundo-cerebro\vault\_knowledge\sesi\email\
- Sistema de arquivos: Windows (path separador: \)

PADRÃO DE NOMENCLATURA:
- Formato: [SESI]_[Departamento]_[Tipo]_YYYYMMDD.pdf
- Departamento: SMS, Superintendencia, Financeiro, etc.
- Tipo: Auditoria, NR-Compliance, Orientacoes, Relatorio, etc.
- Exemplo: [SESI]_SMS_Auditoria_20260920.pdf

=============================================================
FLUXO DE EXECUÇÃO
=============================================================

ETAPA 1: VERIFICAÇÃO DE CONEXÃO
[ ] Conectar a Gmail via OAuth2 ou credenciais
[ ] Validar acesso a fabiomartinsn@gmail.com
[ ] Confirmar pasta de destino existe ou criar

ETAPA 2: BUSCA E EXTRAÇÃO
[ ] Filtrar emails dos últimos 7 dias (ou não sincronizados)
[ ] Identificar anexos PDF e DOCX
[ ] Extrair metadata: remetente, assunto, data
[ ] Download temporário dos anexos

ETAPA 3: CATEGORIZAÇÃO E RENOMEAÇÃO
REGRAS DE CATEGORIZAÇÃO:

  Remetente: milena@sesi.org.br → Departamento: "Superintendencia"
  Remetente: arlanda@sesi.org.br → Departamento: "SMS"
  Remetente: hugo@sesi.org.br → Departamento: "SMS"
  Remetente: maria@sesi.org.br → Departamento: "Engenharia"
  Padrão: Usar primeiro segmento após @ se não identificado

  Assunto contém "Auditoria" → Tipo: "Auditoria"
  Assunto contém "NR-" → Tipo: "NR-Compliance"
  Assunto contém "Inspeção" → Tipo: "Inspecao"
  Assunto contém "Relatório" → Tipo: "Relatorio"
  Assunto contém "Orientação" → Tipo: "Orientacoes"
  Padrão: Usar 3 primeiras palavras do assunto se não identificado

RENOMEAR ARQUIVO:
  [SESI]_[Departamento]_[Tipo]_[Data em YYYYMMDD].pdf
  
ETAPA 4: SALVAMENTO E VERIFICAÇÃO
[ ] Salvar arquivo renomeado em D:\segundo-cerebro\vault\_knowledge\sesi\email\
[ ] Verificar se arquivo já existe (evitar duplicação)
  - Se existe: ignorar ou atualizar com hash comparison
  - Se novo: salvar normalmente
[ ] Criar log de sincronização com:
  - Arquivo original
  - Arquivo renomeado
  - Timestamp
  - Status (sucesso/erro)

ETAPA 5: RELATÓRIO
Exibir resumo:
  ✓ Total de emails processados
  ✓ Total de anexos extraídos
  ✓ Total de arquivos salvos
  ✓ Erros encontrados (se houver)
  ✓ Próxima sincronização em: 60 minutos

=============================================================
TRATAMENTO DE ERROS
=============================================================

ERRO: "Acesso negado ao Gmail"
→ Verificar credenciais OAuth2
→ Renovar token de autenticação
→ Verificar permissões de acesso

ERRO: "Pasta não existe"
→ Criar automaticamente: mkdir D:\segundo-cerebro\vault\_knowledge\sesi\email\

ERRO: "Arquivo já existe"
→ Comparar hash MD5 dos arquivos
→ Se idêntico: ignorar (já sincronizado)
→ Se diferente: renomear com sufixo _v2, _v3, etc.

ERRO: "Arquivo corrompido"
→ Registrar no log
→ Tentar download novamente
→ Se falhar 3x: pular arquivo e reportar

=============================================================
EXEMPLOS DE PROCESSAMENTO
=============================================================

EMAIL 1:
  De: milena@sesi.org.br
  Assunto: "Auditoria SMS - Setembro 2026"
  Anexo: auditoria_setembro.pdf
  Data: 2026-09-20
  
  RESULTADO:
  [SESI]_Superintendencia_Auditoria_20260920.pdf

EMAIL 2:
  De: arlanda@sesi.org.br
  Assunto: "NR-01 Competências - Documento Técnico"
  Anexo: competencias.pdf
  Data: 2026-09-20
  
  RESULTADO:
  [SESI]_SMS_NR-Compliance_20260920.pdf

EMAIL 3:
  De: hugo.unique@sesi.org.br
  Assunto: "Inspeção de segurança - Bloco A"
  Anexo: inspecao_bloco_a.pdf
  Data: 2026-09-19
  
  RESULTADO:
  [SESI]_SMS_Inspecao_20260919.pdf

=============================================================
LOGGING
=============================================================

Criar arquivo de log:
D:\segundo-cerebro\vault\_knowledge\sesi\email\SYNC_LOG.txt

Formato de entrada:
[YYYY-MM-DD HH:MM:SS] [STATUS] Arquivo original → Arquivo renomeado

Exemplo:
[2026-09-20 05:19:51] [OK] auditoria_setembro.pdf → [SESI]_Superintendencia_Auditoria_20260920.pdf
[2026-09-20 05:20:03] [OK] competencias.pdf → [SESI]_SMS_NR-Compliance_20260920.pdf
[2026-09-20 05:20:15] [ERROR] corrupted_file.pdf → [FALHA] Arquivo corrompido - pulado

=============================================================
AGENDAMENTO
=============================================================

Este prompt será executado a cada 60 minutos via:
  FabIA-Sync-Gmail.bat

Ciclo automático:
  1. Executar /sync-gmail
  2. Indexar pasta local
  3. Sincronizar com Git
  4. Aguardar 60 minutos
  5. Repetir

=============================================================
FIM DO PROMPT
=============================================================
```

---

## ✅ PRÓXIMOS PASSOS

### 1. **Copie este prompt para seu ambiente Claude**
   - Se usando Claude Desktop: Configurar prompt customizado
   - Se usando Claude API: Implementar como system prompt
   - Se usando claude.ai: Usar estrutura de prompts salvos

### 2. **Teste manual:**
   ```bash
   D:\segundo-cerebro\FabIA-Sync-Gmail.bat
   ```

### 3. **Verifique resultado:**
   - PDFs aparecem em: `D:\segundo-cerebro\vault\_knowledge\sesi\email\`?
   - Arquivo de log foi criado?
   - Git commitou corretamente?

### 4. **Se tudo OK: Agende no Task Scheduler**
   ```bash
   taskschd.msc
   ```

---

## 📝 NOTA IMPORTANTE

O prompt `/sync-gmail` precisa de:
- ✅ Acesso autenticado ao Gmail (OAuth2)
- ✅ Permissão para ler e baixar anexos
- ✅ Acesso à pasta local `D:\segundo-cerebro\vault\_knowledge\sesi\email\`
- ✅ Acesso ao arquivo de log

**Você tem essas credenciais/permissões configuradas?**
