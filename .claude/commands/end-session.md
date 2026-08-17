# /end-session — Encerramento de Sessão com Dump para Obsidian

Ao executar este comando, o FabIA deve:

1. Revisar toda a conversa da sessão atual
2. Gerar automaticamente um arquivo de sessão estruturado
3. Salvar no vault com data e hora
4. Apresentar resumo compacto do que foi registrado

---

## TEMPLATE DE OUTPUT (gerar e salvar via Bash)

O FabIA deve usar a ferramenta Bash para criar o arquivo diretamente:

```bash
$FILE = "C:\Users\fabio\Documents\segundo-cerebro\vault\_sessions\$(Get-Date -Format 'yyyy-MM-dd-HHmm')-session.md"
```

### Estrutura do arquivo a ser gerado:

```markdown
# Sessão FabIA — [DATA] [HORA]
> Gerado automaticamente por /end-session

## Contexto carregado
[listar quais contextos foram utilizados na sessão]

## Atividades realizadas
[lista objetiva do que foi produzido ou discutido]

## Decisões tomadas
[decisões relevantes, escolhas técnicas, aprovações]

## Documentos gerados
[listar com nome, tipo e status]

## Pendências identificadas
[ações que ficaram em aberto, com responsável e prazo quando disponível]

## Próximos passos
[o que deve ser feito na próxima sessão ou nos próximos dias]

## Tags Obsidian
#sessao #fabia #[contexto-principal] #[data-ano-mes]
```

---

## INSTRUÇÃO DE EXECUÇÃO PARA O FABIA

Ao receber /end-session:

1. Analise todo o histórico da sessão atual
2. Preencha o template acima com conteúdo real (não genérico)
3. Use a ferramenta Bash para salvar o arquivo:

```powershell
$date = Get-Date -Format "yyyy-MM-dd-HHmm"
$dest = "C:\Users\fabio\Documents\segundo-cerebro\vault\_sessions\$date-session.md"
$content = @'
[CONTEÚDO GERADO PELO FABIA AQUI]
'@
$content | Out-File -FilePath $dest -Encoding UTF8 -Force
Write-Host "Sessão salva em: $dest"
```

4. Confirme com: `✅ Sessão registrada em vault/_sessions/[nome-do-arquivo].md`
5. Mostre o resumo de 3–5 linhas do que foi registrado

---

## COMPORTAMENTO ESPERADO

- Sempre gerar o arquivo mesmo que a sessão tenha sido curta
- Ser específico: não escrever "discutimos SMS" mas sim "revisamos PLV-SMS-B-019 Rev.01 e identificamos pendência da ART CREA-SE"
- Prioridades e pendências devem ser acionáveis (com verbo + objeto + prazo)
- Se nenhum documento foi gerado na sessão, registrar "Nenhum documento gerado nesta sessão"
- Tags sempre incluem o mês atual no formato #YYYY-MM

---

## EXEMPLO DE OUTPUT REAL

```markdown
# Sessão FabIA — 2026-06-14 09:35

## Contexto carregado
- _INDEX.md (inicialização)
- GESTAO-SMS-STATUS.md (via /sms)
- PLV-SMS-B-019 Rev.01 (documento carregado manualmente)

## Atividades realizadas
- Revisão do PLV-SMS-B-019 Rev.01 com verificação de parâmetros técnicos
- Elaboração do checklist pré-demolição Bloco B
- Atualização dos arquivos de contexto vault/_contextos/

## Decisões tomadas
- Confirmar emissão da ART antes de 17/06 para garantir aprovação Petrobras até 19/06
- Briefing com ROS agendado para 19/06 às 08h00

## Documentos gerados
- GESTAO-SMS-STATUS.md — atualizado — salvo em vault/_contextos/
- DEV-IA.md — atualizado — salvo em vault/_contextos/
- demolição.md — novo comando — salvo em .claude/commands/
- end-session.md — novo comando — salvo em .claude/commands/

## Pendências identificadas
- [ ] Emitir ART CREA-SE para PLV-SMS-B-019 — Fábio — até 17/06/2026
- [ ] Submeter documentação à Petrobras — Fábio — até 18/06/2026
- [ ] Briefing pré-atividade com ROS — Sheila + Fábio — 19/06/2026

## Próximos passos
- Abrir sessão focada em elaborar PT para demolição Bloco B
- Verificar se APR-demolição está alinhada com PLV-SMS-B-019 Rev.01

## Tags Obsidian
#sessao #fabia #sms #demolição #2026-06
```
