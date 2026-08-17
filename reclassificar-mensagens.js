/**
 * reclassificar-mensagens.js
 * Aplica a classificação por assunto (SESI/Senai/Particular/Diversos) e
 * prioridade (Urgente/Prioridade/Normal) em notas de WhatsApp já existentes
 * que foram criadas ANTES dessa lógica existir (sem frontmatter assunto/prioridade).
 *
 * Não baixa nada de novo — só relê o texto já salvo em vault/WhatsApp/grupos/
 * e vault/WhatsApp/diretos/ e reescreve o frontmatter.
 *
 * Uso: node reclassificar-mensagens.js
 */

const fs   = require('fs');
const path = require('path');

const VAULT       = 'D:\\segundo-cerebro\\vault\\WhatsApp';
const GRUPOS_FILE = path.join(VAULT, '_GRUPOS.md');

// ─── Mesma classificação usada em sync-whatsapp.js ────────────────────────────
const TERMOS_SESI = [
    'sesi', 'federação das indústrias', 'federacao das industrias',
    'engenheiro de segurança do trabalho', 'engenheiro de seguranca do trabalho',
    'milene', 'milena', 'superintendente', 'presidente', 'sti', 'gestor'
];
const TERMOS_SENAI = ['senai'];
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

function classificarAssunto(texto, isGrupo) {
    if (contemAlgumTermo(texto, TERMOS_SESI))  return 'SESI';
    if (contemAlgumTermo(texto, TERMOS_SENAI)) return 'Senai';
    if (!isGrupo) return 'Particular';
    return 'Diversos';
}

function isAlta(pushName, altaSet) {
    if (!pushName) return false;
    const lc = pushName.toLowerCase();
    for (const a of altaSet) {
        if (lc.includes(a) || a.includes(lc.split(' ')[0])) return true;
    }
    return false;
}

function classificarPrioridade(texto, pushName, assunto, altaSet) {
    if (contemAlgumTermo(texto, TERMOS_URGENCIA)) return 'Urgente';
    if (isAlta(pushName, altaSet)) return 'Urgente';
    if (assunto === 'SESI' || assunto === 'Senai') return 'Prioridade';
    return 'Normal';
}

// ─── Carrega _GRUPOS.md (mesmo parser do sync-whatsapp.js) ───────────────────
function loadAltaSet() {
    const altaSet = new Set();
    if (!fs.existsSync(GRUPOS_FILE)) return altaSet;
    const lines = fs.readFileSync(GRUPOS_FILE, 'utf8').split('\n');
    let secao = null;
    for (const line of lines) {
        const t = line.trim();
        if (t.startsWith('## Contatos ALTA')) { secao = 'alta'; continue; }
        if (t.startsWith('##'))                { secao = null;  continue; }
        if (secao === 'alta') {
            const m = t.match(/^-\s+(.+)/);
            if (m) altaSet.add(m[1].trim().toLowerCase());
        }
    }
    return altaSet;
}

// ─── Lista recursiva de .md ────────────────────────────────────────────────────
function listarMarkdown(dir) {
    let resultado = [];
    if (!fs.existsSync(dir)) return resultado;
    for (const item of fs.readdirSync(dir)) {
        const full = path.join(dir, item);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) resultado = resultado.concat(listarMarkdown(full));
        else if (item.endsWith('.md')) resultado.push(full);
    }
    return resultado;
}

// ─── Extrai contato e mensagem do arquivo ──────────────────────────────────────
function parseNota(raw) {
    const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (!fmMatch) return null;
    const frontmatter = fmMatch[1];
    const body         = fmMatch[2];

    if (/^assunto:/m.test(frontmatter)) return null; // já classificado — pula

    const contatoMatch = frontmatter.match(/^contato:\s*(.+)$/m);
    const tagsMatch     = frontmatter.match(/^tags:\s*\[(.*)\]$/m);
    const contato = contatoMatch ? contatoMatch[1].trim() : null;

    const msgMatch = body.match(/## Mensagem\s*\n([\s\S]*?)(\n## |\n?$)/);
    const mensagem = msgMatch ? msgMatch[1].trim() : '';

    return { frontmatter, body, contato, mensagem, tagsMatch };
}

function reescreverFrontmatter(frontmatter, assunto, prioridade) {
    let novo = frontmatter;

    // Atualiza (ou insere) a linha de tags
    if (/^tags:\s*\[.*\]$/m.test(novo)) {
        novo = novo.replace(/^tags:\s*\[.*\]$/m, `tags: [whatsapp, ${assunto}, ${prioridade}]`);
    } else {
        novo = `tags: [whatsapp, ${assunto}, ${prioridade}]\n` + novo;
    }

    // Insere assunto/prioridade logo após a linha de tags
    novo = novo.replace(
        /^(tags:.*)$/m,
        `$1\nassunto: ${assunto}\nprioridade: ${prioridade}`
    );

    return novo;
}

// ─── Principal ─────────────────────────────────────────────────────────────────
function main() {
    console.log('\n' + '='.repeat(60));
    console.log('🏷️  Reclassificação retroativa de mensagens — ' + new Date().toLocaleString('pt-BR'));
    console.log('='.repeat(60));

    const altaSet = loadAltaSet();
    console.log(`Contatos ALTA carregados: ${altaSet.size}`);

    const arquivos = [
        ...listarMarkdown(path.join(VAULT, 'grupos')),
        ...listarMarkdown(path.join(VAULT, 'diretos')),
    ];

    console.log(`Total de notas encontradas: ${arquivos.length}\n`);

    let reclassificadas = 0, jaClassificadas = 0, ignoradas = 0;
    const contagem = { SESI: 0, Senai: 0, Particular: 0, Diversos: 0 };

    for (const file of arquivos) {
        const raw = fs.readFileSync(file, 'utf8');
        const parsed = parseNota(raw);

        if (!parsed) { jaClassificadas++; continue; }
        if (!parsed.contato) { ignoradas++; continue; }

        const isGrupo = file.includes(`${path.sep}grupos${path.sep}`);
        const assunto    = classificarAssunto(parsed.mensagem, isGrupo);
        const prioridade = classificarPrioridade(parsed.mensagem, parsed.contato, assunto, altaSet);

        const novoFrontmatter = reescreverFrontmatter(parsed.frontmatter, assunto, prioridade);
        const novoConteudo = `---\n${novoFrontmatter}\n---\n${parsed.body}`;

        fs.writeFileSync(file, novoConteudo, 'utf8');

        contagem[assunto]++;
        reclassificadas++;

        if (reclassificadas <= 20 || prioridade === 'Urgente') {
            console.log(`  [${assunto}/${prioridade}] ${path.basename(file)}`);
        }
    }

    console.log('\n' + '-'.repeat(60));
    console.log(`✅ Reclassificadas agora: ${reclassificadas}`);
    console.log(`⏭️  Já estavam classificadas: ${jaClassificadas}`);
    if (ignoradas) console.log(`⚠️  Ignoradas (sem contato no frontmatter): ${ignoradas}`);
    console.log(`\nDistribuição por assunto:`);
    for (const [k, v] of Object.entries(contagem)) console.log(`  ${k}: ${v}`);
}

main();
