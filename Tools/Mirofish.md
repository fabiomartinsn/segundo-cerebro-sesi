# MiroFish: Avaliação para Aplicações SMS
**Data**: 24.06.2026 | **Autor**: Fábio Martins | **Contexto**: EDISER-Petrobras

---

## 📌 SUMÁRIO EXECUTIVO

**MiroFish** é um motor de predição baseado em simulação multi-agente (open-source, recente, financiado com $4M) que mapeia dinâmicas emergentes de comportamento humano e sistemas sociais complexos.

**Recomendação para SMS**: 🟡 **PROTOTIPAR** em Q4 2026 como módulo especializado de análise de cenários comportamentais.

---

## 🎯 APLICAÇÕES VIÁVEIS EM SMS

### 1. **Análise de Propagação de Riscos Comportamentais**
**Status**: 🟢 **Alta Viabilidade**

**Descrição**:
- Input: Resultados de auditorias comportamentais (AUDICOMP), histórico de incidentes, relacionamentos entre equipes
- Processo: Simular como comportamentos inseguros se propagam entre equipes nos Blocos B, D, Q
- Output: Identificação de focos de risco emergentes, recomendações de intervenção prioritária

**Implementação prática**:
```
1. Estruturar dados de relacionamentos em campo (equipes, supervisores, pares)
2. Mapear comportamentos observados (conformidade com NRs, uso de EPI, etc.)
3. Rodar simulação MiroFish com 500-1000 agentes
4. Analisar dinâmicas emergentes: propagação vs. contenção de riscos
5. Documentar no Obsidian com cenários e recomendações
```

**Benefício**: Transição de análise reativa para **predição de riscos emergentes**.

---

### 2. **Teste de Impacto de Novas Políticas/Procedimentos**
**Status**: 🟡 **Viabilidade Moderada**

**Descrição**:
- Simular reação de agentes (trabalhadores em campo) a mudanças em PEXs/APRs
- Prever padrões de adoção vs. resistência
- Identificar pontos de fricção antes de implementação em produção

**Exemplo**: Nova política de isolamento de linha (NR-10) → Simular aceitação por perfil de eletricista

**Limitação**: Exige modelagem comportamental prévia (trabalho inicial ~20h).

---

### 3. **Análise de Dinâmica Psicossocial pós-Incidente**
**Status**: 🟢 **Alta Viabilidade**

**Descrição**:
- Input: Acidente documentado (ex: vidro penetrante em luva, 22.04.2026) + rede social/relacionamentos
- Processo: Simular propagação de informação, impacto psicossocial em equipes adjacentes
- Output: Previsão de escalação emocional, necessidade de comunicação corporativa, ações de contenção

**Alinhamento**: Direto com **NR-01 (Risco Psicossocial)** — tópico em auditoria recente (22.06.2026).

---

### 4. **Simulação de Campanhas de Comportamento (DDS, Treinamentos)**
**Status**: 🟡 **Moderada**

**Descrição**:
- Modelar efetividade de campanhas SMS antes de roll-out
- Simular resistência, adoção progressiva, inflection points
- Otimizar messaging, timing, público-alvo

**Exemplo**: Campanha NR-35 (trabalho em altura) → Simular propagação de conhecimento + mudança atitudinal.

---

## ⚙️ ARQUITETURA TÉCNICA (Self-Hosting)

### Stack Recomendado
```
Frontend: MiroFish UI (Web-based)
Backend: Node.js 18+ + Python 3.11+
LLM: Claude API (OpenAI-compatible) ou local (Ollama + Llama)
Storage: Zep Cloud (agent memory) ou self-hosted
Deploy: Docker + VPS (Hostinger ~$11.99-$49.99/mês)
Integração FabIA: `mirofish-analyzer.js` (módulo custom)
```

### Fluxo de Integração com Segundo Cérebro
```
1. Obsidian (dados estruturados: APRs, relacionamentos, incidentes)
   ↓
2. Claude Code (extração de entidades, preparação de input)
   ↓
3. MiroFish API (simulação multi-agente)
   ↓
4. Report Agent (síntese de achados)
   ↓
5. FabIA briefing diário (resumo de cenários críticos)
```

---

## 📊 CASOS NÃO-VIÁVEIS

### ❌ **Predição de Eventos Aleatórios Puros**
Loteria, meteorologia de curto prazo, flutuações de bolsa → MiroFish não funciona.

**Razão**: Exige padrões em dinâmica social/comportamental. Eventos aleatórios puros não têm.

---

## 💰 ANÁLISE ECONÔMICA

| Item | Custo | Frequência |
|------|-------|-----------|
| VPS Self-hosting | $12-50/mês | Mensal |
| API LLM (Claude) | ~$0.50-2/simulação | Por uso |
| Zep Cloud (memory) | ~$29/mês | Mensal |
| Tempo dev (protótipo) | ~60h | One-time |
| Manutenção/updates | ~5h/mês | Mensal |
| **Total primeiro ano** | ~$1.500-2.500 | - |

**ROI**: Viável se decisões SMS se beneficiarem de análise de cenários (estimado: sim, dado contexto EDISER + auditoria recente).

---

## 🎬 ROADMAP RECOMENDADO

### **Q3 2026 (Julho-Setembro)**
- [ ] Clone e estude repositório MiroFish
- [ ] Rode exemplos públicos (casos de predição social)
- [ ] Documente compreensão técnica no Obsidian

### **Q4 2026 (Outubro-Dezembro)**
- [ ] Design de caso de uso piloto (ex: AUDICOMP → cenários comportamentais)
- [ ] Estruturação de dados SMS para MiroFish (relacionamentos, comportamentos)
- [ ] Prototipagem `mirofish-analyzer.js` integrado com FabIA
- [ ] Teste com dados históricos EDISER (3-6 meses)
- [ ] Documentação de ROI vs. investimento

### **2027 Q1+**
- [ ] Deploy em produção (se prototipo validar)
- [ ] Integração com SST Metaverse (fase 2) — agentes simulados como NPCs

---

## 🔗 REFERÊNCIAS

- **Repository**: https://github.com/666ghj/MiroFish
- **Documentação**: https://mirofish.homes/
- **Engine OASIS**: CAMEL-AI (Open Agent Social Interaction Simulations)
- **Licença**: Open-source

---

## 📝 NOTAS FINAIS

1. **MiroFish não é "magia de IA"** — é ferramenta sofisticada que exige:
   - Modelagem cuidadosa de agentes e comportamentos
   - Dados estruturados de entrada (qualidade = viabilidade)
   - Expertise em interpretação de dinâmicas emergentes

2. **Melhor usar quando**:
   - Decisão é estratégica (não operacional real-time)
   - Cenários são complexos, multi-stakeholder
   - Histórico de dados comportamentais existe

3. **Não usar quando**:
   - Predição de eventos aleatórios puros
   - Necessidade de resposta milissegundo
   - Faltam dados estruturados de entrada

---

**Próximo passo**: Confirme se deseja prototipar em Q4 2026. Se sim, aloque ~60h de estudo + implementação.
