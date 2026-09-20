# Configuração: Prompt /sync-gmail

## Objetivo
Sincronizar automaticamente PDFs e documentos dos emails SESI Gmail para a pasta local:
```
D:\segundo-cerebro\vault\_knowledge\sesi\email
```

## Estrutura esperada

### Pasta de destino
```
D:\segundo-cerebro\vault\_knowledge\sesi\email/
├── [PDFs sincronizados do Gmail]
├── [Documentos SESI]
└── [Attachment do email com padrão de nomes]
```

### Padrão de nomenclatura dos arquivos
- **Documentos do SESI:** `[SESI]_[Departamento]_[Tipo]_YYYYMMDD.pdf`
  - Exemplo: `[SESI]_SMS_NR-Compliance_20260920.pdf`

- **Comunicações importantes:** `[EMAIL]_[Remetente]_[Assunto]_YYYYMMDD.pdf`
  - Exemplo: `[EMAIL]_Milena_Superintendencia_Orientações_20260920.pdf`

- **Documentos técnicos:** `[TECNICO]_[Disciplina]_[Descrição]_YYYYMMDD.pdf`
  - Exemplo: `[TECNICO]_SMS_Auditorias_20260920.pdf`

## Fluxo de sincronização

### Etapa 1: Extrair do Gmail (20260920 05:19:51)
- Acessar caixa de entrada SESI (fabio.nascimento@fies.org.br)
- Filtrar emails com anexos PDF/DOCX
- Classificar por departamento/importância
- Download dos anexos

### Etapa 2: Indexar PDFs Locais (20260920 05:19:54)
- Verificar pasta `vault\_knowledge\sesi\email`
- Contar PDFs/DOCX disponíveis
- Atualizar índice local

### Etapa 3: Sincronizar Git (20260920 05:20:03)
- Adicionar arquivos à staging area: `git add -A`
- Commit com timestamp: `git commit -m "FabIA Gmail Sync - 2026-09-20 05:19:51"`
- Push para repositório remoto: `git push origin`

## Configuração de emails prioritários

### Remetentes SESI (prioridade alta)
- ✅ milena@sesi.org.br (Superintendência)
- ✅ arlanda@sesi.org.br (Técnica SMS)
- ✅ hugo@sesi.org.br (Campo)
- ✅ maria@sesi.org.br (Engenharia)

### Assuntos com prioridade
- 📌 "Auditoria"
- 📌 "Inspeção"
- 📌 "NR-" (Normas Regulamentadoras)
- 📌 "SMS"
- 📌 "Segurança"
- 📌 "Relatório"
- 📌 "Conformidade"

## Ciclo de sincronização
- **Intervalo:** 60 minutos
- **Horário início:** Conforme agendado em tarefa do Windows
- **Tentativas de reconexão:** Automático em caso de falha de rede

## Verificação de status

Para verificar sincronizações anteriores:
```bash
cd D:\segundo-cerebro
git log --grep="Gmail Sync" --oneline | head -10
```

Para listar PDFs sincronizados:
```bash
dir vault\_knowledge\sesi\email\*.pdf /b
```

## Troubleshooting

| Problema | Solução |
|----------|---------|
| PDFs não sincronizam | Verificar credenciais Gmail; executar `FabIA-Sync-Gmail.bat` manualmente |
| Git push falha | Verificar conexão de internet; verificar credenciais do repositório |
| Pasta não existe | Script cria automaticamente; caso contrário, criar: `mkdir vault\_knowledge\sesi\email` |
| Duplicação de arquivos | Implementar hash MD5 para evitar downloads duplicados |

## Próximas etapas

1. ✅ Ativar sincronização Gmail com credenciais OAuth2
2. ⏳ Implementar filtros de IA para categorização automática
3. ⏳ Criar dashboard de índice de documentos SESI
4. ⏳ Integrar com NotebookLM para análise de PDFs
