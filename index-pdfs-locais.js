/**
 * index-pdfs-locais.js
 * Monitora a pasta PDFs-Inbox, move para PDFs/ e cria notas no Obsidian
 * Uso: node index-pdfs-locais.js
 */

const fs   = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

// ─── Configuração ──────────────────────────────────────────────────────────────
const VAULT_PATH  = 'D:\\segundo-cerebro\\vault';
const INBOX_DIR   = path.join(VAULT_PATH, 'WhatsApp', 'PDFs-Inbox');
const PDF_DIR     = path.join(VAULT_PATH, 'WhatsApp', 'PDFs');
const NOTES_DIR   = path.join(VAULT_PATH, 'WhatsApp', 'Notas-PDF');
const INDEX_FILE  = path.join(VAULT_PATH, 'WhatsApp', 'INDICE-PDFs.md');

// ─── Helpers ───────────────────────────────────────────────────────────────────
function log(msg) {
    const ts = new Date().toLocaleString('pt-BR');
    console.log(`[${ts}] ${msg}`);
}

function safeName(name) {
    return name
        .replace(/[<>:"/\\|?*]/g, '_')
        .replace(/\s+/g, '_')
        .substring(0, 150);
}

function formatDateBR(date) {
    return date.toLocaleDateString('pt-BR') + ' ' +
           date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatDatePrefix(date) {
    return date.toISOString().substring(0, 16).replace('T', '_').replace(':', '-');
}

function detectContext(filename) {
    if (!filename) return 'GERAL';
    const f = filename.toUpperCase();
    if (f.includes('PEX') || f.includes('APR') || f.includes('PT-'))     return 'SMS';
    if (f.includes('PGR') || f.includes('PCMSO') || f.includes('PPRA'))  return 'SMS';
    if (f.includes('PIL') || f.includes('PLV') || f.includes('PACR'))    return 'SMS';
    if (f.includes('NR-') || f.includes('NBR') || f.includes('ABNT'))    return 'NORMAS';
    if (f.includes('PETROBRAS') || f.includes('EDISER'))                  return 'PETROBRAS';
    if (f.includes('PROJETO') || f.includes('MEMORIAL'))                  return 'PROJETOS';
    if (f.includes('CONTRATO') || f.includes('PROPOSTA'))                 return 'CONTRATOS';
    if (f.includes('LAUDO') || f.includes('PERICIA') || f.includes('TRT')) return 'PERICIA';
    if (f.includes('UNIF') || f.includes('EPI') || f.includes('CA-'))    return 'SMS';
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

// ─── Extrai texto do DOCX ──────────────────────────────────────────────────────
async function extractDocxText(docxPath, maxChars = 3000) {
    try {
        const result = await mammoth.extractRawText({ path: docxPath });
        let text = (result.value || '').replace(/\n{3,}/g, '\n\n').trim();
        if (!text) return '_(DOCX sem texto extraível)_';
        if (text.length > maxChars) {
            text = text.substring(0, maxChars) + '\n\n_[...texto truncado — arquivo completo tem mais conteúdo...]_';
        }
        return text;
    } catch (e) {
        return `_(Erro ao extrair texto: ${e.message})_`;
    }
}

// ─── Extrai texto de qualquer documento suportado ─────────────────────────────
async function extractDocText(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.pdf')  return extractPdfText(filePath);
    if (ext === '.docx') return extractDocxText(filePath);
    return '_(Formato não suportado para extração de texto)_';
}

function createNote(filename, pdfPath, dateStr, context, origem, extractedText) {
    const relPdfPath = path.relative(NOTES_DIR, pdfPath).replace(/\\/g, '/');
    return `---
tipo: pdf-local
contexto: ${context}
origem: "${origem}"
data_indexacao: "${dateStr}"
arquivo_original: "${filename}"
---

# 📄 ${filename.replace('.pdf','').replace(/_/g,' ')}

**Indexado:** ${dateStr}  
**Origem:** ${origem}  
**Contexto:** ${context}  

## Arquivo

[[${path.basename(pdfPath)}]]

> PDF salvo em: \`${pdfPath}\`

## Conteúdo Extraído (automático)

${extractedText}

## Notas

_Adicione suas anotações sobre este documento aqui._

---
*Indexado automaticamente via index-pdfs-locais.js*
`;
}

// ─── Atualiza índice ───────────────────────────────────────────────────────────
function updateIndex() {
    // Coleta todos os PDFs e DOCX da pasta PDFs/
    const pdfs = fs.readdirSync(PDF_DIR)
        .filter(f => /\.(pdf|docx)$/i.test(f))
        .sort()
        .reverse(); // mais recentes primeiro

    const linhas = pdfs.map(f => {
        const ext = path.extname(f);
        const noteName = f.replace(new RegExp(`${ext}$`, 'i'), '.md');
        const hasNote  = fs.existsSync(path.join(NOTES_DIR, noteName));
        const status   = hasNote ? '✅' : '⚠️';
        const context  = detectContext(f);
        // Extrai data do prefixo se existir
        const dateMatch = f.match(/^(\d{4}-\d{2}-\d{2})/);
        const date = dateMatch ? dateMatch[1] : '-';
        const cleanName = f.replace(/^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}_/, '').replace(new RegExp(`${ext}$`, 'i'), '');
        return `| ${status} | ${date} | ${cleanName} | ${context} |`;
    });

    const content = `# 📋 Índice de PDFs — WhatsApp + Local

*Atualizado: ${new Date().toLocaleString('pt-BR')}*  
*Total: ${pdfs.length} documentos*

| Status | Data | Arquivo | Contexto |
|--------|------|---------|----------|
${linhas.join('\n')}

---
*✅ Com nota | ⚠️ Sem nota*

## Pastas
- 📥 **Inbox:** \`vault/WhatsApp/PDFs-Inbox/\` — cole aqui PDFs para indexar
- 📂 **PDFs:** \`vault/WhatsApp/PDFs/\` — arquivo permanente
- 📝 **Notas:** \`vault/WhatsApp/Notas-PDF/\` — notas geradas automaticamente
`;

    fs.writeFileSync(INDEX_FILE, content, 'utf8');
    log(`📊 Índice atualizado: ${pdfs.length} PDFs`);
}

// ─── Principal ─────────────────────────────────────────────────────────────────
async function main() {
    console.log('\n' + '='.repeat(60));
    console.log('📥 Indexador de PDFs Locais — ' + new Date().toLocaleString('pt-BR'));
    console.log('='.repeat(60));

    // Cria pastas necessárias
    [INBOX_DIR, PDF_DIR, NOTES_DIR].forEach(d => {
        if (!fs.existsSync(d)) {
            fs.mkdirSync(d, { recursive: true });
            log(`📁 Criado: ${d}`);
        }
    });

    // Lê PDFs e DOCX da inbox
    const arquivos = fs.readdirSync(INBOX_DIR)
        .filter(f => /\.(pdf|docx)$/i.test(f));

    if (arquivos.length === 0) {
        log('ℹ️  Nenhum PDF/DOCX na inbox.');
        updateIndex();
        return;
    }

    log(`📋 ${arquivos.length} documento(s) encontrado(s) na inbox`);

    let processados = 0;
    let erros = 0;

    for (const arquivo of arquivos) {
        const inboxPath = path.join(INBOX_DIR, arquivo);
        const now       = new Date();
        const prefix    = formatDatePrefix(now);
        const ext       = path.extname(arquivo).toLowerCase(); // .pdf ou .docx
        const safeFile  = safeName(arquivo);
        const destName  = safeFile.startsWith('20') ? safeFile : `${prefix}_${safeFile}`;
        const destPath  = path.join(PDF_DIR, destName);
        const noteName  = destName.replace(new RegExp(`${ext}$`, 'i'), '.md');
        const notePath  = path.join(NOTES_DIR, noteName);

        log(`\n⬇️  Processando: ${arquivo}`);

        try {
            // Move documento da inbox para PDFs/
            fs.copyFileSync(inboxPath, destPath);
            fs.unlinkSync(inboxPath);
            log(`   ✅ Movido para: ${destPath}`);

            // Cria nota se não existir
            if (!fs.existsSync(notePath)) {
                const context = detectContext(arquivo);
                const dateStr = formatDateBR(now);
                log(`   📖 Extraindo texto do documento...`);
                const extractedText = await extractDocText(destPath);
                const nota    = createNote(arquivo, destPath, dateStr, context, 'Manual/Local', extractedText);
                fs.writeFileSync(notePath, nota, 'utf8');
                log(`   📝 Nota criada com conteúdo extraído: ${notePath}`);
            } else {
                log(`   ⏭️  Nota já existe — pulando`);
            }

            processados++;
        } catch(e) {
            log(`   ❌ Erro: ${e.message}`);
            erros++;
        }
    }

    updateIndex();

    console.log('\n' + '-'.repeat(60));
    log(`✅ Concluído: ${processados} processados, ${erros} erros`);
    log(`📥 Inbox: ${INBOX_DIR}`);
    log(`📂 PDFs:  ${PDF_DIR}`);
    log(`📝 Notas: ${NOTES_DIR}`);
}

main().catch(err => {
    console.error('❌ Erro fatal:', err.message);
    process.exit(1);
});
