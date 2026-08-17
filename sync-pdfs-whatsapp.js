/**
 * sync-pdfs-whatsapp.js
 * Sincroniza PDFs recebidos via WhatsApp para o vault do Obsidian
 * Uso: node sync-pdfs-whatsapp.js
 *      node sync-pdfs-whatsapp.js --watch   (modo contínuo a cada 5 min)
 */

const https  = require('https');
const http   = require('http');
const fs     = require('fs');
const path   = require('path');
const pdfParse = require('pdf-parse');

// ─── Configuração ──────────────────────────────────────────────────────────────
const WEBHOOK_URL  = 'https://fabia-webhook2-production.up.railway.app';
const VAULT_PATH   = 'D:\\segundo-cerebro\\vault';
const PDF_DIR      = path.join(VAULT_PATH, 'WhatsApp', 'PDFs');
const NOTES_DIR    = path.join(VAULT_PATH, 'WhatsApp', 'Notas-PDF');
const CONTROL_FILE = path.join(VAULT_PATH, 'WhatsApp', '.sync-control.json');
const WATCH_MODE   = process.argv.includes('--watch');
const INTERVAL_MS  = 5 * 60 * 1000; // 5 minutos

// ─── Helpers HTTP ──────────────────────────────────────────────────────────────
function httpGet(url) {
    return new Promise((resolve, reject) => {
        const lib = url.startsWith('https') ? https : http;
        lib.get(url, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch(e) { reject(new Error('JSON inválido: ' + data.substring(0, 100))); }
            });
        }).on('error', reject);
    });
}

function httpGetBinary(url) {
    return new Promise((resolve, reject) => {
        const lib = url.startsWith('https') ? https : http;
        lib.get(url, res => {
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks)));
        }).on('error', reject);
    });
}

// ─── Controle de sincronização ─────────────────────────────────────────────────
function loadControl() {
    try {
        if (fs.existsSync(CONTROL_FILE)) {
            return JSON.parse(fs.readFileSync(CONTROL_FILE, 'utf8'));
        }
    } catch(e) {}
    return { last_sync: null, synced_ids: [] };
}

function saveControl(control) {
    fs.writeFileSync(CONTROL_FILE, JSON.stringify(control, null, 2), 'utf8');
}

// ─── Formata data para nome de arquivo ────────────────────────────────────────
function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toISOString().replace('T', '_').substring(0, 16).replace(':', '-');
}

function formatDateBR(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// ─── Limpa nome de arquivo ────────────────────────────────────────────────────
function safeName(name) {
    return (name || 'documento')
        .replace(/[<>:"/\\|?*]/g, '_')
        .replace(/\s+/g, '_')
        .substring(0, 100);
}

// ─── Detecta contexto pelo nome do arquivo ────────────────────────────────────
function detectContext(filename) {
    if (!filename) return 'GERAL';
    const f = filename.toUpperCase();
    if (f.includes('PEX') || f.includes('APR') || f.includes('PT-'))    return 'SMS';
    if (f.includes('PGR') || f.includes('PCMSO') || f.includes('PPRA')) return 'SMS';
    if (f.includes('NR-') || f.includes('NBR') || f.includes('ABNT'))   return 'NORMAS';
    if (f.includes('PETROBRAS') || f.includes('EDISER'))                  return 'PETROBRAS';
    if (f.includes('PROJETO') || f.includes('MEMORIAL'))                  return 'PROJETOS';
    if (f.includes('CONTRATO') || f.includes('PROPOSTA'))                 return 'CONTRATOS';
    if (f.includes('LAUDO') || f.includes('PERICIA') || f.includes('TRT')) return 'PERICIA';
    return 'GERAL';
}

// ─── Extrai texto do PDF ────────────────────────────────────────────────────────
async function extractPdfText(pdfPath, maxChars = 3000) {
    try {
        const buffer = fs.readFileSync(pdfPath);
        const data = await pdfParse(buffer);
        let text = (data.text || '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
        if (!text) return '_(PDF sem texto extraível — provavelmente digitalizado/imagem, sem OCR)_';
        if (text.length > maxChars) {
            text = text.substring(0, maxChars) + '\n\n_[...texto truncado — arquivo completo tem mais conteúdo...]_';
        }
        return text;
    } catch (e) {
        return `_(Erro ao extrair texto: ${e.message})_`;
    }
}

// ─── Cria nota Markdown para o PDF ────────────────────────────────────────────
function createNote(pdf, pdfLocalPath, extractedText) {
    const context  = detectContext(pdf.media_filename);
    const dateStr  = formatDateBR(pdf.received_at);
    const filename = pdf.media_filename || 'documento.pdf';
    const relPath  = path.relative(NOTES_DIR, pdfLocalPath).replace(/\\/g, '/');

    return `---
tipo: pdf-whatsapp
contexto: ${context}
remetente: "${pdf.push_name || 'Desconhecido'}"
data_recebimento: "${dateStr}"
arquivo_original: "${filename}"
id_banco: ${pdf.id}
jid: "${pdf.remote_jid || ''}"
---

# 📄 ${filename}

**Recebido:** ${dateStr}  
**De:** ${pdf.push_name || 'Desconhecido'}  
**Contexto:** ${context}  

## Arquivo

[[${path.basename(pdfLocalPath)}]]

> PDF salvo em: \`${pdfLocalPath}\`

## Conteúdo Extraído (automático)

${extractedText}

## Notas

_Adicione suas anotações sobre este documento aqui._

---
*Sincronizado automaticamente via sync-pdfs-whatsapp.js*
`;
}

// ─── Sincronização principal ───────────────────────────────────────────────────
async function sync() {
    console.log('\n' + '='.repeat(60));
    console.log('📥 Iniciando sincronização de PDFs — ' + new Date().toLocaleString('pt-BR'));
    console.log('='.repeat(60));

    // Cria diretórios se não existirem
    [PDF_DIR, NOTES_DIR].forEach(d => {
        if (!fs.existsSync(d)) {
            fs.mkdirSync(d, { recursive: true });
            console.log('📁 Criado:', d);
        }
    });

    const control = loadControl();
    const syncedIds = new Set(control.synced_ids || []);

    // Busca lista de PDFs
    let result;
    try {
        result = await httpGet(`${WEBHOOK_URL}/pdfs`);
    } catch(e) {
        console.error('❌ Erro ao buscar PDFs:', e.message);
        return;
    }

    if (!result.pdfs || result.pdfs.length === 0) {
        console.log('ℹ️  Nenhum PDF disponível no momento.');
        return;
    }

    console.log(`📋 Total de PDFs no servidor: ${result.total}`);

    let novos = 0;
    let erros  = 0;

    for (const pdf of result.pdfs) {
        if (syncedIds.has(pdf.id)) {
            console.log(`⏭️  Já sincronizado: [${pdf.id}] ${pdf.media_filename}`);
            continue;
        }

        console.log(`\n⬇️  Baixando: [${pdf.id}] ${pdf.media_filename}`);

        try {
            // Baixa o PDF
            const pdfBuffer = await httpGetBinary(
                `${WEBHOOK_URL}/pdfs/${pdf.id}/download`
            );

            if (!pdfBuffer || pdfBuffer.length < 100) {
                console.error(`   ❌ Buffer vazio ou inválido`);
                erros++;
                continue;
            }

            // Define nome e caminho local
            const datePrefix  = formatDate(pdf.received_at);
            const safefile    = safeName(pdf.media_filename || `documento_${pdf.id}.pdf`);
            const pdfFilename = `${datePrefix}_${safefile}`;
            const pdfPath     = path.join(PDF_DIR, pdfFilename);
            const noteName    = pdfFilename.replace('.pdf', '.md');
            const notePath    = path.join(NOTES_DIR, noteName);

            // Salva PDF
            fs.writeFileSync(pdfPath, pdfBuffer);
            console.log(`   ✅ PDF salvo: ${pdfPath} (${Math.round(pdfBuffer.length/1024)}KB)`);

            // Cria nota Markdown (com texto extraído do PDF)
            console.log(`   📖 Extraindo texto do PDF...`);
            const extractedText = await extractPdfText(pdfPath);
            const noteContent = createNote(pdf, pdfPath, extractedText);
            fs.writeFileSync(notePath, noteContent, 'utf8');
            console.log(`   📝 Nota criada com conteúdo extraído: ${notePath}`);

            // Registra como sincronizado
            syncedIds.add(pdf.id);
            novos++;

        } catch(e) {
            console.error(`   ❌ Erro ao processar [${pdf.id}]:`, e.message);
            erros++;
        }
    }

    // Salva controle
    control.last_sync  = new Date().toISOString();
    control.synced_ids = [...syncedIds];
    saveControl(control);

    // Atualiza índice no vault
    await updateIndex(result.pdfs);

    console.log('\n' + '-'.repeat(60));
    console.log(`✅ Sincronização concluída: ${novos} novos, ${erros} erros`);
    console.log(`📂 PDFs em: ${PDF_DIR}`);
    console.log(`📝 Notas em: ${NOTES_DIR}`);
}

// ─── Atualiza índice de PDFs no vault ─────────────────────────────────────────
async function updateIndex(pdfs) {
    const indexPath = path.join(VAULT_PATH, 'WhatsApp', 'INDICE-PDFs.md');
    const control   = loadControl();
    const syncedIds = new Set(control.synced_ids || []);

    const linhas = pdfs.map(pdf => {
        const status  = syncedIds.has(pdf.id) ? '✅' : '⏳';
        const date    = formatDateBR(pdf.received_at);
        const context = detectContext(pdf.media_filename);
        return `| ${status} | ${pdf.id} | ${date} | ${pdf.push_name || '-'} | ${pdf.media_filename || '-'} | ${context} |`;
    });

    const content = `# 📋 Índice de PDFs — WhatsApp

*Atualizado: ${new Date().toLocaleString('pt-BR')}*

| Status | ID | Data | Remetente | Arquivo | Contexto |
|--------|-----|------|-----------|---------|----------|
${linhas.join('\n')}

---
*✅ Sincronizado | ⏳ Pendente*
`;

    fs.writeFileSync(indexPath, content, 'utf8');
    console.log(`\n📊 Índice atualizado: ${indexPath}`);
}

// ─── Execução ──────────────────────────────────────────────────────────────────
if (WATCH_MODE) {
    console.log(`🔄 Modo watch ativo — sincronizando a cada ${INTERVAL_MS/60000} minutos`);
    sync();
    setInterval(sync, INTERVAL_MS);
} else {
    sync().catch(err => {
        console.error('❌ Erro fatal:', err.message);
        process.exit(1);
    });
}
