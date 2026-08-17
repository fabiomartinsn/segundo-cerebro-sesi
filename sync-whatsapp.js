const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');

const WEBHOOK_URL  = 'https://fabia-webhook2-production.up.railway.app/messages?limit=500';
const DELETE_URL   = 'https://fabia-webhook2-production.up.railway.app/messages/batch';
const VAULT        = 'D:\\segundo-cerebro\\vault\\WhatsApp';
const GRUPOS_FILE  = path.join(VAULT, '_GRUPOS.md');

// Base44 — app Fábia
const B44_URL = 'https://app.base44.com/api/apps/69b1d93deb1522c6e94d1afd/entities/AtividadeSMS';
const B44_KEY = '877ba859cb474de4967f421a336165c9';

// ─── Contatos VIP — sempre SESI + Urgente independente do conteúdo ──────────
const JIDS_VIP_SESI = new Set([
    '5579999217120@s.whatsapp.net', // Ivonete Almeida — Gerente RH FIES
    '5579999292756@s.whatsapp.net', // Luis Paulo — Secretário da Presidência FIES
]);

// ─── Classificação por ASSUNTO (SESI / Senai / Particular / Diversos) ─────────
const TERMOS_SESI = [
    'sesi', 'federação das indústrias', 'federacao das industrias',
    'engenheiro de segurança do trabalho', 'engenheiro de seguranca do trabalho',
    'milene', 'milena', 'superintendente', 'presidente', 'sti', 'gestor'
];
const TERMOS_SENAI = ['senai'];

// ─── Classificação por PRIORIDADE (Urgente / Prioridade / Normal) ────────────
const TERMOS_URGENCIA = [
    'urgente', 'urgência', 'urgencia', 'emergência', 'emergencia',
    'socorro', 'imediato', 'imediatamente', 'agora mesmo', 'pra ontem'
];

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function contemAlgumTermo(texto, termos) {
    if (!texto) return false;
    const t = texto.toLowerCase();
    return termos.some(termo => {
        const re = new RegExp(`\\b${escapeRegex(termo)}\\b`, 'i');
        return re.test(t);
    });
}

// jid de grupo termina em @g.us; individual (@s.whatsapp.net ou @lid) é chat direto
function isGrupo(jid) {
    return !!jid && jid.includes('@g.us');
}

function classificarAssunto(texto, jid) {
    if (JIDS_VIP_SESI.has(jid))                return 'SESI';
    if (contemAlgumTermo(texto, TERMOS_SESI))  return 'SESI';
    if (contemAlgumTermo(texto, TERMOS_SENAI)) return 'Senai';
    if (!isGrupo(jid)) return 'Particular';
    return 'Diversos';
}

function classificarPrioridade(texto, pushName, assunto, altaSet, jid) {
    if (JIDS_VIP_SESI.has(jid))                       return 'Urgente';
    if (contemAlgumTermo(texto, TERMOS_URGENCIA))      return 'Urgente';
    if (isAlta(pushName, altaSet))                     return 'Urgente';
    if (assunto === 'SESI' || assunto === 'Senai')     return 'Prioridade';
    return 'Normal';
}

// ─── Log apenas para stdout (PowerShell escreve no arquivo) ──────────────────
function log(msg) {
    const ts = new Date().toISOString().slice(0, 19).replace('T', ' ');
    process.stdout.write(`[${ts}] ${msg}\n`);
}

// ─── Sanitiza nome para usar em caminho de arquivo ───────────────────────────
function sanitizeName(name) {
    if (!name) return 'desconhecido';
    return name
        .replace(/[^\w\s\-áàãâéêíóôõúçÁÀÃÂÉÊÍÓÔÕÚÇ]/gu, '_')
        .replace(/_{2,}/g, '_')
        .replace(/^_+|_+$/g, '')
        || 'desconhecido';
}

// ─── Carrega config de grupos ─────────────────────────────────────────────────
function loadConfig() {
    const grupos = {}, diretos = {}, altaSet = new Set(), propioSet = new Set();
    if (!fs.existsSync(GRUPOS_FILE)) return { grupos, diretos, altaSet, propioSet };

    const lines = fs.readFileSync(GRUPOS_FILE, 'utf8').split('\n');
    let secao = null;

    for (const line of lines) {
        const t = line.trim();

        if (t.startsWith('## Grupos'))           { secao = 'grupos';  continue; }
        if (t.startsWith('## Chats Diretos'))    { secao = 'diretos'; continue; }
        if (t.startsWith('## Contatos ALTA'))    { secao = 'alta';    continue; }
        if (t.startsWith('## Identidade'))       { secao = 'proprio'; continue; }
        if (t.startsWith('##'))                  { secao = null;      continue; }

        if ((secao === 'grupos' || secao === 'diretos') && t.startsWith('|')) {
            const parts = t.split('|').map(p => p.trim()).filter(Boolean);
            if (parts.length >= 2 && parts[0].includes('@')) {
                const jid  = parts[0];
                const nome = parts[1];
                if (secao === 'grupos')  grupos[jid]  = nome;
                else                     diretos[jid] = nome;
            }
        }

        if (secao === 'alta') {
            const m = t.match(/^-\s+(.+)/);
            if (m) altaSet.add(m[1].trim().toLowerCase());
        }
        if (secao === 'proprio') {
            const m = t.match(/^-\s+(.+)/);
            if (m) propioSet.add(m[1].trim().toLowerCase());
        }
    }
    return { grupos, diretos, altaSet, propioSet };
}

// ─── Detecta se contato é ALTA ────────────────────────────────────────────────
function isAlta(pushName, altaSet) {
    if (!pushName) return false;
    const lc = pushName.toLowerCase();
    for (const a of altaSet) {
        if (lc.includes(a) || a.includes(lc.split(' ')[0])) return true;
    }
    return false;
}

// ─── Mapeia push_name → responsavel Base44 ────────────────────────────────────
// Detecta mensagens de membros da equipe SMS para atualizar check-in
const EQUIPE_SMS = {
    'sheila':   'Sheila (Campo)',
    'adriana':  'Adriana (Ambiental)',
    'roberta':  'Roberta (ADM)',
};

function getResponsavelEquipe(pushName) {
    if (!pushName) return null;
    const lc = pushName.toLowerCase();
    for (const [key, val] of Object.entries(EQUIPE_SMS)) {
        if (lc.includes(key)) return val;
    }
    return null;
}

// ─── Helpers HTTP ─────────────────────────────────────────────────────────────
function httpGet(url) {
    return new Promise((resolve, reject) => {
        const lib = url.startsWith('https') ? https : http;
        lib.get(url, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(new Error('JSON invalido: ' + data.substring(0, 200))); }
            });
        }).on('error', reject);
    });
}

function httpDelete(url, body) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(body);
        const parsed  = new URL(url);
        const options = {
            hostname : parsed.hostname,
            path     : parsed.pathname,
            method   : 'DELETE',
            headers  : {
                'Content-Type'   : 'application/json',
                'Content-Length' : Buffer.byteLength(payload)
            }
        };
        const lib = url.startsWith('https') ? https : http;
        const req = lib.request(options, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { resolve({ raw: data }); }
            });
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

function httpPut(url, body) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(body);
        const parsed  = new URL(url);
        const options = {
            hostname : parsed.hostname,
            path     : parsed.pathname + parsed.search,
            method   : 'PUT',
            headers  : {
                'Content-Type'   : 'application/json',
                'Content-Length' : Buffer.byteLength(payload)
            }
        };
        const req = https.request(options, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { resolve({ raw: data }); }
            });
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

function httpGetMedia(url) {
    return new Promise((resolve) => {
        const lib = url.startsWith('https') ? https : http;
        lib.get(url, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { resolve(null); }
            });
        }).on('error', () => resolve(null));
    });
}

// ─── Atualiza check-in da equipe no Base44 ───────────────────────────────────
async function atualizarCheckIn(responsavel) {
    const today = new Date().toISOString().slice(0, 10);
    const hora  = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });

    try {
        // Busca atividades pendentes para esta pessoa hoje
        const qs  = `?api_key=${B44_KEY}&filter=${encodeURIComponent(JSON.stringify({ responsavel, data_referencia: today, status_hoje: 'pendente' }))}`;
        const res = await httpGet(B44_URL + qs);
        const registros = Array.isArray(res) ? res : (res.entities || []);

        if (registros.length === 0) return;

        // Marca cada uma como realizada
        for (const rec of registros) {
            await httpPut(`${B44_URL}/${rec.id}?api_key=${B44_KEY}`, {
                status_hoje: 'realizada',
                hora_confirmacao: hora
            });
        }
        log(`CHECK-IN: ${responsavel} — ${registros.length} atividade(s) realizadas (${hora})`);
    } catch (err) {
        log(`AVISO Base44: ${err.message}`);
    }
}

// ─── Salva mídia no vault ─────────────────────────────────────────────────────
function saveMedia(base64, mimetype, filename, dir) {
    const ext      = (mimetype || '').split('/')[1]?.split(';')[0] || 'bin';
    const origName = filename || `midia_${Date.now()}.${ext}`;
    const mediaDir = path.join(dir, 'media');
    if (!fs.existsSync(mediaDir)) fs.mkdirSync(mediaDir, { recursive: true });
    const mediaPath = path.join(mediaDir, origName);
    fs.writeFileSync(mediaPath, Buffer.from(base64, 'base64'));
    return { mediaPath, origName };
}

function resolveMediaLabel(messageType) {
    if (!messageType) return 'Arquivo';
    if (messageType.includes('image'))    return 'Imagem';
    if (messageType.includes('video'))    return 'Video';
    if (messageType.includes('audio'))    return 'Audio';
    if (messageType.includes('document')) return 'Documento';
    if (messageType.includes('sticker'))  return 'Sticker';
    return 'Arquivo';
}

// ─── Processa um lote de mensagens ───────────────────────────────────────────
async function processLote(messages, config) {
    const { grupos, diretos, altaSet, propioSet } = config;
    let criados = 0, pulados = 0, midias = 0;
    const idsProcessados = [];
    const checkinFeito = new Set();  // evita múltiplas chamadas Base44 por pessoa por lote

    for (const msg of messages) {
        try {
            const jid       = msg.remote_jid || '';
            const groupName = grupos[jid] || diretos[jid] || null;
            const assunto    = classificarAssunto(msg.content, jid);
            const prioridade = classificarPrioridade(msg.content, msg.push_name, assunto, altaSet, jid);
            const urgente    = prioridade === 'Urgente';

            const dirName  = groupName
                ? sanitizeName(groupName)
                : sanitizeName(msg.push_name || 'desconhecido');
            const subpasta = groupName ? 'grupos' : 'diretos';
            const dir      = path.join(VAULT, subpasta, dirName);

            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

            const date    = new Date(msg.received_at);
            const dateStr = date.toISOString().slice(0, 10);
            const timeStr = date.toISOString().slice(11, 16).replace(':', 'h');
            const safeName = sanitizeName(msg.push_name || 'desconhecido');
            const file     = path.join(dir, `${dateStr}_${timeStr}_${safeName}.md`);

            if (fs.existsSync(file)) { pulados++; idsProcessados.push(msg.id); continue; }

            // Mídia
            let content  = msg.content || '';
            let mediaRef = '';

            if (msg.has_media) {
                const mediaData = await httpGetMedia(
                    `${WEBHOOK_URL.split('/messages')[0]}/messages/${msg.id}/media`
                );
                if (mediaData && mediaData.base64) {
                    const { mediaPath, origName } = saveMedia(
                        mediaData.base64,
                        mediaData.mimetype || msg.media_mimetype,
                        mediaData.filename || msg.media_filename,
                        dir
                    );
                    const relPath = path.relative(dir, mediaPath).replace(/\\/g, '/');
                    const label   = resolveMediaLabel(msg.message_type);
                    mediaRef = `\n\n## Arquivo\n[[${relPath}]] -- ${origName}`;
                    if (!content) content = `${label} -- ${origName}`;
                    midias++;
                } else {
                    content = content || `[${resolveMediaLabel(msg.message_type)}]`;
                }
            }

            // Frontmatter Obsidian
            const lines = [
                '---',
                `tags: [whatsapp, ${assunto}, ${prioridade}]`,
                `assunto: ${assunto}`,
                `prioridade: ${prioridade}`,
                `data: ${msg.received_at}`,
                `contato: ${msg.push_name || 'desconhecido'}`,
            ];
            if (groupName) lines.push(`grupo: ${groupName}`);
            if (msg.media_filename) lines.push(`arquivo: ${msg.media_filename}`);
            lines.push('---', '## Mensagem', content);
            if (mediaRef) lines.push(mediaRef);

            fs.writeFileSync(file, lines.join('\n'), 'utf8');

            const flag = urgente ? '[URGENTE] ' : (assunto === 'SESI' || assunto === 'Senai' ? `[${assunto}] ` : '[MSG] ');
            log(`${flag}${dateStr} ${timeStr} [${groupName || dirName}] ${msg.push_name || '?'} (${assunto}/${prioridade}): ${String(content).substring(0, 80)}`);
            criados++;
            idsProcessados.push(msg.id);

            // ── Atualiza check-in Base44 se for membro da equipe SMS ──────────
            const responsavel = getResponsavelEquipe(msg.push_name);
            if (responsavel && !checkinFeito.has(responsavel)) {
                checkinFeito.add(responsavel);
                // Roda em background — não bloqueia o loop principal
                atualizarCheckIn(responsavel).catch(() => {});
            }

        } catch (err) {
            log(`ERRO ao processar msg ${msg.id}: ${err.message}`);
        }
    }

    return { criados, pulados, midias, idsProcessados };
}

// ─── Loop principal ───────────────────────────────────────────────────────────
(async () => {
    const config = loadConfig();
    const gruposCount  = Object.keys(config.grupos).length;
    const diretosCount = Object.keys(config.diretos).length;

    log(`=== FabIA Sync iniciado ===`);
    log(`Config: ${gruposCount} grupos | ${diretosCount} diretos | ${config.altaSet.size} ALTA | ${config.propioSet.size} propios`);

    let totalCriados = 0, totalPulados = 0, totalMidias = 0, totalDeletados = 0;
    let ciclo = 0;

    while (true) {
        ciclo++;

        let resultado;
        try {
            resultado = await httpGet(WEBHOOK_URL);
        } catch (err) {
            log(`ERRO ao buscar mensagens: ${err.message}`);
            break;
        }

        const messages = resultado.messages || [];
        if (messages.length === 0) {
            log(`Nenhuma mensagem pendente. Sync concluido.`);
            break;
        }

        log(`Ciclo ${ciclo}: ${messages.length} mensagens recebidas.`);

        const { criados, pulados, midias, idsProcessados } = await processLote(messages, config);
        totalCriados += criados;
        totalPulados += pulados;
        totalMidias  += midias;

        if (idsProcessados.length > 0) {
            try {
                const del = await httpDelete(DELETE_URL, { ids: idsProcessados });
                totalDeletados += del.deleted || 0;
                log(`Ciclo ${ciclo}: ${criados} criadas | ${pulados} ja existiam | ${midias} midias | ${del.deleted || 0} removidas do banco`);
            } catch (err) {
                log(`AVISO: Erro ao deletar do banco: ${err.message}`);
            }
        }

        if (messages.length < 500) break;
    }

    log(`=== Fim: ${totalCriados} criadas | ${totalPulados} ja existiam | ${totalMidias} midias | ${totalDeletados} removidas | ${ciclo} ciclos ===`);

})().catch(err => {
    log(`ERRO FATAL: ${err.message}\n${err.stack}`);
    process.exit(1);
});
