Sincronize emails SESI do Gmail e salve no vault.

## Passo 1 — Carregar ferramentas Gmail

Use ToolSearch com query "select:mcp__claude_ai_Gmail__search_threads,mcp__claude_ai_Gmail__get_thread,mcp__claude_ai_Gmail__get_message" para carregar os schemas antes de chamar.

## Passo 2 — Buscar emails SESI não processados

Execute `mcp__claude_ai_Gmail__search_threads` com esta query:

```
(from:sesi.org.br OR from:fies.org.br OR from:senai.org.br OR from:sesisenai.org.br OR subject:SESI OR subject:SST OR subject:"NR-12" OR subject:ASSTI OR subject:fomento OR subject:SMS OR subject:PCMSO OR subject:PGR OR subject:SMD OR subject:portfólio) newer_than:3d
```

Limite: 50 resultados. Se retornar 0, encerrar com "Nenhum email SESI encontrado nos últimos 3 dias."

## Passo 3 — Para cada thread, ler conteúdo

Use `mcp__claude_ai_Gmail__get_thread` para cada thread_id retornado.
Extraia da resposta:
- `id` do thread
- Primeira mensagem: `id`, `date`, `from`, `subject`, `snippet`, `body` (plain text, primeiros 1.500 chars)

## Passo 4 — Verificar duplicatas

Antes de salvar, busque em `vault/Email/SESI/` por arquivos que contenham `thread_id: {id}` no frontmatter.
Se já existir → pular essa thread.

## Passo 5 — Classificar prioridade

| Critério | Prioridade |
|---|---|
| Remetente: Milene · Luis Paulo · Ivonete · Superintendente · Presidente | Urgente |
| Subject/body contém: urgente · urgência · emergência · prazo · hoje · imediato | Urgente |
| Remetente domínio @sesi.org.br · @fies.org.br · @senai.org.br | Prioridade |
| Remetente: Arlanda · Ramon · Silvia · Milena · Luciana · Leandro Brandalis | Prioridade |
| Demais | Normal |

## Passo 6 — Salvar arquivo

Crie `vault/Email/SESI/{AAAA-MM-DD}_{HHmm}_{nome-remetente-sanitizado}.md` com:

```markdown
---
tags: [email, SESI, {prioridade}]
assunto: SESI
prioridade: {Urgente|Prioridade|Normal}
data: {ISO datetime}
remetente: {nome do From}
email_remetente: {endereço}
subject: {assunto do email}
thread_id: {id da thread}
message_id: {id da mensagem}
lido: false
---

## Assunto
{subject}

## Remetente
{nome} <{email}> — {data formatada}

## Conteúdo
{body plain text, máx 1.500 chars — se maior, truncar com "[... continua no Gmail]"}

## Ação Sugerida
{1-2 linhas: o que este email pede ou implica como próxima ação — inferir do conteúdo}
```

Sanitização do nome do remetente para filename: remover caracteres especiais, substituir espaços por `-`, lowercase, máx 30 chars.

## Passo 7 — Atualizar _INDEX.md

Leia `vault/Email/_INDEX.md` e adicione ao topo da seção "## Emails Recentes" cada email novo:

```
| {data} | {prioridade emoji} | {remetente} | {subject truncado 50 chars} | {ação sugerida 1 linha} |
```

Emojis: Urgente = 🔴 · Prioridade = 🟡 · Normal = ⬜

Atualize o cabeçalho: `> Atualizado: {data} | Último sync: {hora}`

## Passo 8 — Relatório final

Exiba no terminal:

```
=== Gmail Sync SESI ===
Threads encontradas: N
Novas salvas: N | Já existiam: N
Urgentes: N | Prioridade: N | Normal: N
[lista das novas: 🔴/🟡/⬜ remetente — subject]
```

## Notas

- NÃO marcar emails como lidos no Gmail — só leitura, sem side-effects
- NÃO processar emails de JFX/EDISER/Petrobras (contexto encerrado 19/07/2026)
- Se Gmail MCP retornar erro de autenticação, exibir: "Gmail MCP não autenticado — verifique conexão em Configurações → MCP"
- Pasta `vault/Email/SESI/` deve ser criada se não existir
