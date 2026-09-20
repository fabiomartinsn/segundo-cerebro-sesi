# ✅ CHECKLIST IMPLEMENTAÇÃO: FabIA-Gmail-Sync

**Salvar em:** `D:\segundo-cerebro\CHECKLIST_IMPLEMENTACAO.md`

---

## 🚀 ETAPA 0: PREPARAÇÃO (AGORA)

### Arquivos para Copiar

Você recebeu 5 arquivos. Copie para `D:\segundo-cerebro\`:

- [x] `FabIA-Sync-Gmail.bat` → `D:\segundo-cerebro\FabIA-Sync-Gmail.bat`
- [x] `fabia-sync.ps1` → `D:\segundo-cerebro\fabia-sync.ps1`
- [x] `PROMPT_SYNC_GMAIL_INSTRUCOES.md` → Documentação (referência)
- [x] `SYNC_GMAIL_CONFIG.md` → Documentação (referência)
- [x] `SETUP_GMAIL_SYNC.md` → Documentação (referência)

**Verificar:**
```bash
dir D:\segundo-cerebro\FabIA-Sync-Gmail.bat
dir D:\segundo-cerebro\fabia-sync.ps1
```

Ambos devem existir. Se não: **PAUSE aqui e copie os arquivos.**

---

## 🔐 ETAPA 1: CONFIGURAR ACESSO AO GMAIL

### 1.1 Validar Email Gmail
- ✅ Gmail: **fabiomartinsn@gmail.com**
- ✅ Outlook SESI: **fabio.nascimento@fies.org.br**
- ✅ Regra Outlook: Encaminha todos os emails para Gmail

**Verificar:**
1. Abra Gmail: https://mail.google.com
2. Login em: fabiomartinsn@gmail.com
3. Procure por emails de fabio.nascimento@fies.org.br
4. Confirme que há anexos PDF/DOCX

Se não houver emails: **Verifique a regra de encaminhamento do Outlook**

### 1.2 Criar Aplicação OAuth2 (se necessário)

Se o prompt `/sync-gmail` precisar de autenticação, siga:

1. Acesse: https://console.developers.google.com
2. Crie projeto: "FabIA-Gmail-Sync"
3. Ative API: Gmail API
4. Crie credenciais OAuth2 (Desktop Application)
5. Baixe arquivo JSON de credenciais

**Salve em:** `D:\segundo-cerebro\credentials\gmail_oauth.json`

---

## 📋 ETAPA 2: CRIAR/VALIDAR PROMPT `/sync-gmail`

### 2.1 Configurar Prompt

Dependendo de seu ambiente Claude:

#### **Opção A: Claude Desktop**
1. Abra Claude Desktop
2. Vá para: Settings → Custom Prompts
3. Crie novo prompt: `/sync-gmail`
4. Cole o conteúdo de: `PROMPT_SYNC_GMAIL_INSTRUCOES.md`
5. Salve

#### **Opção B: Claude API**
1. Use o prompt como `system_prompt` em chamadas API
2. Inclua autenticação Gmail nas configurações

#### **Opção C: claude.ai (web)**
1. Crie conversa: "Gmail Sync Setup"
2. Cole o prompt como primeira mensagem
3. Referencie o prompt name: `/sync-gmail`

### 2.2 Testar Prompt Manualmente

```bash
claude -p "/sync-gmail"
```

**Resultado esperado:**
```
[2026-09-20 05:19:51] Iniciando sincronização de PDFs...
[2026-09-20 05:19:54] Conectando a fabiomartinsn@gmail.com...
[2026-09-20 05:20:03] Sincronização concluída!
```

**Se der erro:**
- ❌ "Acesso negado" → Verificar credenciais OAuth2
- ❌ "Pasta não existe" → Script cria automaticamente
- ❌ "Nenhum PDF encontrado" → Normal se não há emails com anexos

---

## 🔧 ETAPA 3: VERIFICAR ESTRUTURA GIT

### 3.1 Validar Configuração Git

```bash
cd D:\segundo-cerebro
git config user.name
git config user.email
git remote -v
```

**Resultado esperado:**
```
Fábio Martins
fabio.nascimento@fies.org.br
origin  https://github.com/...
```

Se não estiver configurado:
```bash
git config --global user.name "Fábio Martins"
git config --global user.email "fabio.nascimento@fies.org.br"
```

### 3.2 Validar Repositório Remoto

```bash
git branch -a
git status
```

Deve mostrar seu branch principal (main ou master).

---

## ▶️ ETAPA 4: TESTE MANUAL

### 4.1 Executar Script Manualmente

```bash
D:\segundo-cerebro\FabIA-Sync-Gmail.bat
```

**O que deve acontecer:**

```
============================================================
  FabIA - Sync Gmail SESI v2.0
============================================================
  Ciclo: 1
  Gmail: fabiomartinsn@gmail.com
  Destino: vault\_knowledge\sesi\email
  Padrão: [SESI]_[Depto]_[Tipo]_YYYYMMDD.pdf
============================================================

[2026-09-20 05:19:51] [1/4] Sincronizando PDFs do Gmail...
[2026-09-20 05:19:54] [2/4] Indexando PDFs locais...
📋 Índice: X arquivos encontrados
[2026-09-20 05:20:03] [3/4] Sincronizando repositório Git...

============================================================
  CICLO 1 CONCLUÍDO
============================================================
```

### 4.2 Verificar Pasta de Destino

Após execução:
```bash
dir D:\segundo-cerebro\vault\_knowledge\sesi\email\
```

Deve listar PDFs com padrão:
```
[SESI]_SMS_Auditoria_20260920.pdf
[SESI]_Superintendencia_Orientacoes_20260920.pdf
```

### 4.3 Verificar Log de Sincronização

```bash
type D:\segundo-cerebro\logs\FabIA-Gmail-Sync.log
```

Deve conter:
```
[2026-09-20 05:19:51] ========== INICIANDO FabIA-Gmail-Sync ==========
[2026-09-20 05:19:51] Gmail origem: fabiomartinsn@gmail.com
[2026-09-20 05:19:54] [1/4] CONCLUÍDO - Sincronização Gmail
...
```

### 4.4 Verificar Commit Git

```bash
git log --oneline -5 | grep "Gmail Sync"
```

Deve listar commits recentes com padrão:
```
a1b2c3d FabIA Gmail Sync - 2026-09-20 05:19:51
```

---

## 📅 ETAPA 5: AGENDAR NO WINDOWS TASK SCHEDULER

### 5.1 Criar Tarefa (GUI - Mais Fácil)

1. Abra: `taskschd.msc`
2. Clique: "Criar Tarefa Básica"
3. Preencha:
   - **Nome:** FabIA-Gmail-Sync
   - **Descrição:** Sincronização automática de PDFs do Gmail SESI a cada 60 minutos
4. **Gatilho:** Selecione um dos:
   - ✅ "Ao iniciar do computador" (sempre ativo)
   - ✅ "Diariamente às 08:00" (uma vez por dia)
5. **Ação:**
   - Programa: `D:\segundo-cerebro\FabIA-Sync-Gmail.bat`
   - Iniciar em: `D:\segundo-cerebro`
6. Clique: **OK**

### 5.2 Verificar Tarefa Criada

```bash
tasklist | find "FabIA"
```

Deve conter: `FabIA-Sync-Gmail.bat`

---

## 🔄 ETAPA 6: VALIDAÇÃO CONTÍNUA

### 6.1 Monitorar Ciclos Automáticos

**Primeira sincronização:**
- Aguarde ~5-10 minutos após agendamento
- Verifique pasta: `D:\segundo-cerebro\vault\_knowledge\sesi\email\`
- Verifique log: `D:\segundo-cerebro\logs\FabIA-Gmail-Sync.log`
- Verifique Git: `git log --oneline | grep Gmail`

### 6.2 Dashboard de Monitoramento

Criar arquivo: `D:\segundo-cerebro\MONITOR_GMAIL_SYNC.txt`

```
MONITORAMENTO: FabIA-Gmail-Sync
Última sincronização: [hora atual]
PDFs na pasta: [contador]
Tamanho da pasta: [tamanho]
Último commit: [git log --oneline -1 | grep Gmail]
Status: [OK / ERRO]
```

Atualizar manualmente ou via agendamento adicional.

---

## 🆘 TROUBLESHOOTING

| Problema | Causa | Solução |
|----------|-------|---------|
| PDFs não aparecem em 60 min | Prompt `/sync-gmail` não executa | Testar manualmente: `claude -p "/sync-gmail"` |
| Arquivo de log não é criado | Pasta `logs` não existe | Criar: `mkdir D:\segundo-cerebro\logs` |
| Git push falha | Sem conexão ou credenciais inválidas | Verificar: `git push origin -u main` |
| Task Scheduler não inicia | Tarefa desabilitada ou permissões | Verificar: `taskschd.msc` → Propriedades |
| Duplicação de arquivos | Mesma sincronização rodando 2x | Cancelar duplicatas em Task Scheduler |
| PDFs corrompidos | Gmail download falhou | Testar novamente, ou verificar anexo original no Gmail |

---

## ✅ CHECKLIST FINAL

- [ ] Arquivos `.bat` e `.ps1` copiados para `D:\segundo-cerebro\`
- [ ] Gmail fabiomartinsn@gmail.com funcional
- [ ] Outlook encaminhando para Gmail
- [ ] Prompt `/sync-gmail` configurado e testado
- [ ] Git configurado (user.name, user.email, remoto)
- [ ] Teste manual executado com sucesso
- [ ] PDFs aparecem em `vault\_knowledge\sesi\email\`
- [ ] Log criado em `logs\FabIA-Gmail-Sync.log`
- [ ] Commit Git com "Gmail Sync" visível
- [ ] Tarefa agendada no Windows Task Scheduler
- [ ] Primeira sincronização automática concluída (aguardar 60 min)
- [ ] Log e Git monitorados sem erros

---

## 📞 PRÓXIMAS ETAPAS

1. **Hoje:** Copiar arquivos + Teste manual
2. **Amanhã:** Agendar Task Scheduler + Aguardar primeira execução
3. **Semana 1:** Monitorar ciclos e corrigir erros
4. **Semana 2:** Otimizar padrão de nomes se necessário
5. **Futuro:** Integrar com NotebookLM para análise de PDFs

---

**Data de implementação:** 20/09/2026
**Versão:** 2.0
**Status:** Pronto para produção
