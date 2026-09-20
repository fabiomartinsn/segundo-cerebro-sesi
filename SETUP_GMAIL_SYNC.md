# 🚀 SETUP: FabIA Gmail Sync (60 minutos)

## Arquivos Criados

| Arquivo | Localização | Função |
|---------|------------|--------|
| `FabIA-Sync-Gmail.bat` | `D:\segundo-cerebro\` | Script principal - inicia ciclo de 60 min |
| `fabia-sync.ps1` | `D:\segundo-cerebro\` | Sincronização Git automática |
| `SYNC_GMAIL_CONFIG.md` | `D:\segundo-cerebro\` | Configuração do prompt /sync-gmail |
| `SETUP_GMAIL_SYNC.md` | `D:\segundo-cerebro\` | Este arquivo |

## Pasta de Destino Criada
```
D:\segundo-cerebro\vault\_knowledge\sesi\email\
```
Esta pasta será preenchida automaticamente com PDFs sincronizados.

---

## ⚙️ CONFIGURAÇÃO NECESSÁRIA

### 1️⃣ Verificar Prompt /sync-gmail

**Você já tem um prompt `/sync-gmail` configurado?**

Se SIM → Confirme que ele:
- ✅ Acessa Gmail via credenciais SESI (fabio.nascimento@fies.org.br)
- ✅ Extrai PDFs/DOCX de anexos
- ✅ Salva em: `D:\segundo-cerebro\vault\_knowledge\sesi\email`
- ✅ Segue padrão de nomes definido em `SYNC_GMAIL_CONFIG.md`

Se NÃO → Precisamos criar. Você quer criar agora ou apenas testar a estrutura?

### 2️⃣ Verificar Credenciais Git

```bash
cd D:\segundo-cerebro
git config user.name
git config user.email
git remote -v
```

**Resultado esperado:**
```
user.name: Fábio Martins
user.email: fabio.nascimento@fies.org.br
origin   https://github.com/[seu-repo]/segundo-cerebro.git
```

Se não estiver configurado:
```bash
git config user.name "Fábio Martins"
git config user.email "fabio.nascimento@fies.org.br"
```

### 3️⃣ Verificar Pasta de Logs (Opcional)

Criar pasta para logs detalhados:
```bash
mkdir D:\segundo-cerebro\logs\gmail-sync
```

---

## ▶️ COMO USAR

### Iniciar sincronização manual
```bash
D:\segundo-cerebro\FabIA-Sync-Gmail.bat
```

O script:
1. ✅ Cria pasta se não existir
2. ✅ Executa prompt `/sync-gmail` via Claude
3. ✅ Indexa PDFs locais
4. ✅ Sincroniza com Git
5. ✅ Aguarda 60 minutos
6. ✅ Retorna ao passo 2

### Agendar execução automática (Windows Task Scheduler)

**Opção A: Agendador de Tarefas (GUI)**
1. Abrir: `taskschd.msc`
2. Criar Tarefa Básica
3. Nome: `FabIA-Gmail-Sync`
4. Ação: Executar `D:\segundo-cerebro\FabIA-Sync-Gmail.bat`
5. Defina gatilho: Ao iniciar ou diariamente às 08:00

**Opção B: PowerShell (Admin)**
```powershell
$action = New-ScheduledTaskAction -Execute "D:\segundo-cerebro\FabIA-Sync-Gmail.bat"
$trigger = New-ScheduledTaskTrigger -AtStartup
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "FabIA-Gmail-Sync" -Description "Sincronização automática Gmail SESI a cada 60 min"
```

---

## 📊 MONITORAMENTO

### Ver histórico de sincronizações
```bash
cd D:\segundo-cerebro
git log --grep="Gmail Sync" --oneline
```

### Contar PDFs sincronizados
```bash
dir vault\_knowledge\sesi\email\*.pdf | Measure-Object | Select-Object Count
```

### Ver tamanho da pasta
```bash
du -sh vault\_knowledge\sesi\email\
```

### Últimos commits
```bash
git log --oneline -10
```

---

## 🔧 TROUBLESHOOTING

### Problema: Pasta não está sendo preenchida
**Causa:** Prompt `/sync-gmail` não está configurado corretamente.  
**Solução:** Verificar se Claude consegue acessar Gmail e confirmar credenciais OAuth2.

### Problema: Git push falha
**Causa:** Sem conexão de internet ou credenciais Git inválidas.  
**Solução:**
```bash
git push origin -u main
# ou
git push origin -u master
```

### Problema: Script trava na espera de 60 minutos
**Solução:** Executar em segundo plano:
```bash
start /b D:\segundo-cerebro\FabIA-Sync-Gmail.bat
```

### Problema: Muitos PDFs duplicados
**Causa:** Mesma sincronização rodando múltiplas vezes.  
**Solução:** Verificar Task Scheduler; cancelar tarefas duplicadas.

---

## ✅ CHECKLIST PRÉ-EXECUÇÃO

- [ ] Pasta `D:\segundo-cerebro\vault\_knowledge\sesi\email` foi criada
- [ ] Prompt `/sync-gmail` está configurado e funcional
- [ ] Git está configurado com credenciais corretas
- [ ] Conexão de internet está estável
- [ ] Arquivo `FabIA-Sync-Gmail.bat` está em `D:\segundo-cerebro\`
- [ ] Arquivo `fabia-sync.ps1` está em `D:\segundo-cerebro\`

---

## 📅 PRÓXIMAS ETAPAS

1. **AGORA:** Executar manualmente `FabIA-Sync-Gmail.bat` para testar
2. **Verificar:** Se PDFs aparecem em `vault\_knowledge\sesi\email`
3. **Agendar:** Se funcionar, agendar no Task Scheduler
4. **Monitorar:** Verificar logs de sincronização regularmente
5. **Otimizar:** Adicionar filtros de IA conforme necessário

---

## 💡 DICAS

- 🔄 Executar teste manual antes de agendar
- 📝 Documentar padrões de nomenclatura de PDFs
- 🔐 Proteger credenciais do Gmail com segurança adicional
- 📊 Criar dashboard com índice de PDFs sincronizados
- 🚀 Integrar com NotebookLM para análise de documentos

**Dúvidas? Execute um teste manual primeiro e me mostre o resultado.**
