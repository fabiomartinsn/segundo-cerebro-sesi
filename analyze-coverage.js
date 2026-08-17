const fs = require('fs');
const path = require('path');
const https = require('https');

const VAULT = path.join('D:\\segundo-cerebro\\vault');
const WHATSAPP_DIR = path.join(VAULT, 'WhatsApp');
const ALERTS_DIR = path.join(VAULT, '_alerts');
const PEX_APR_INDEX = path.join(VAULT, '_memory', 'pex-apr-index.md');
const API_KEY = process.env.ANTHROPIC_API_KEY;

fs.mkdirSync(ALERTS_DIR, { recursive: true });

function readPexAprIndex() {
  if (!fs.existsSync(PEX_APR_INDEX)) {
    console.log('pex-apr-index.md nao encontrado');
    return '';
  }
  return fs.readFileSync(PEX_APR_INDEX, 'utf8');
}

function readRecentMessages() {
  const messages = [];
  const cutoff = Date.now() - (24 * 60 * 60 * 1000);

  function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    for (const item of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else if (item.endsWith('.md') && stat.mtimeMs > cutoff) {
        const raw = fs.readFileSync(fullPath, 'utf8');
        // Pega apenas a secao de mensagem, truncada em 300 chars
        const match = raw.match(/## Mensagem\s+([\s\S]+)/);
        const texto = match ? match[1].trim().substring(0, 300) : raw.substring(0, 300);
        messages.push(texto);
      }
    }
  }

  scanDir(WHATSAPP_DIR);
  return messages;
}

function analyzeCoverage(messages, pexAprIndex) {
  return new Promise((resolve, reject) => {
    // Limita a 50 mensagens para nao estourar o contexto
    const sample = messages.slice(0, 50).join('\n---\n');

    const prompt = `Voce e um analisador de cobertura documental para obras industriais Petrobras.

INVENTARIO PEX/APR:
${pexAprIndex}

MENSAGENS WHATSAPP (ultimas 24h):
${sample}

Identifique atividades fisicas de obra mencionadas e verifique cobertura no inventario.
Ignore mensagens administrativas, sociais ou nao-tecnicas.

Responda APENAS em JSON valido:
{
  "atividades_identificadas": [
    {
      "descricao": "descricao da atividade",
      "fonte": "trecho curto da mensagem",
      "pex_associado": "codigo ou null",
      "apr_associada": "codigo ou null",
      "gap": true,
      "tipo_gap": "SEM_PEX ou SEM_APR ou SEM_AMBOS ou COBERTO",
      "urgencia": "ALTA ou MEDIA ou BAIXA",
      "justificativa": "motivo resumido"
    }
  ],
  "resumo": {
    "total_atividades": 0,
    "gaps_encontrados": 0,
    "gaps_alta_urgencia": 0
  }
}`;

    const body = JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (!response.content || !response.content[0]) {
            console.error('Resposta inesperada da API:', JSON.stringify(response).substring(0, 200));
            reject(new Error('Resposta invalida da API'));
            return;
          }
          const text = response.content[0].text;
          const clean = text.replace(/```json\n?|\n?```/g, '').trim();
          resolve(JSON.parse(clean));
        } catch (e) {
          reject(new Error('Erro ao parsear: ' + e.message));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function writeAlertFile(analysis) {
  const date = new Date().toISOString().substring(0, 10);
  const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const alertPath = path.join(ALERTS_DIR, `${date}-gaps-cobertura.md`);

  const gaps = analysis.atividades_identificadas.filter(a => a.gap);
  const covered = analysis.atividades_identificadas.filter(a => !a.gap);

  let content = `---\ntags: [alerta, cobertura, pex, apr]\ndata: ${date}\nhora: ${time}\ngaps: ${analysis.resumo.gaps_encontrados}\n---\n\n# Analise de Cobertura PEX/APR — ${date}\n\n`;
  content += `| Total atividades | Gaps | Alta urgencia | Cobertas |\n|---|---|---|---|\n`;
  content += `| ${analysis.resumo.total_atividades} | **${analysis.resumo.gaps_encontrados}** | ${analysis.resumo.gaps_alta_urgencia} | ${covered.length} |\n\n`;

  if (gaps.length === 0) {
    content += `## Cobertura Completa\nTodas as atividades possuem PEX e APR associados.\n`;
  } else {
    content += `## Atividades SEM Cobertura\n\n`;
    gaps.forEach((gap, i) => {
      const icon = gap.urgencia === 'ALTA' ? '🔴' : gap.urgencia === 'MEDIA' ? '🟡' : '🟢';
      content += `### ${icon} ${i+1}. ${gap.descricao}\n- Falta: ${gap.tipo_gap}\n- PEX: ${gap.pex_associado || 'NAO ENCONTRADO'}\n- APR: ${gap.apr_associada || 'NAO ENCONTRADO'}\n- Origem: "${gap.fonte}"\n\n`;
    });
  }

  fs.writeFileSync(alertPath, content, 'utf8');
  return { alertPath, gaps: gaps.length };
}

async function main() {
  console.log('\nFabIA — Analise de Cobertura PEX/APR');
  console.log('─'.repeat(40));

  if (!API_KEY) { console.error('ANTHROPIC_API_KEY nao definida'); process.exit(1); }

  const pexAprIndex = readPexAprIndex();
  const messages = readRecentMessages();

  if (messages.length === 0) { console.log('Nenhuma mensagem nova nas ultimas 24h'); return; }

  console.log(`${messages.length} mensagem(ns) para analisar (usando ate 50)...`);

  try {
    const analysis = await analyzeCoverage(messages, pexAprIndex);
    const result = writeAlertFile(analysis);
    console.log(`\nAtividades identificadas: ${analysis.resumo.total_atividades}`);
    console.log(`Gaps encontrados: ${result.gaps}`);
    if (result.gaps > 0) console.log(`ATENCAO: ${result.gaps} atividade(s) sem PEX/APR!`);
    else console.log(`Cobertura completa`);
    console.log(`Relatorio: ${result.alertPath}`);
  } catch (err) {
    console.error('Erro:', err.message);
  }
}

main();
