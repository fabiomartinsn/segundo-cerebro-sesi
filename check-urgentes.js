/**
 * check-urgentes.js
 * Varre o vault por mensagens com prioridade: Urgente modificadas nos
 * últimos N minutos e imprime um JSON no stdout — feito para ser chamado
 * pelo n8n (Execute Command node) em um workflow agendado.
 *
 * Uso: node check-urgentes.js [minutos]
 *   node check-urgentes.js        -> últimos 30 minutos (padrão)
 *   node check-urgentes.js 60     -> última 1 hora
 */

const fs   = require('fs');
const path = require('path');

const VAULT = 'D:\\segundo-cerebro\\vault\\WhatsApp';
const minutos = parseInt(process.argv[2], 10) || 30;
const cutoff = Date.now() - (minutos * 60 * 1000);

function listarMarkdown(dir) {
    let resultado = [];
    if (!fs.existsSync(dir)) return resultado;
    for (const item of fs.readdirSync(dir)) {
        const full = path.join(dir, item);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) resultado = resultado.concat(listarMarkdown(full));
        else if (item.endsWith('.md')) resultado.push({ full, mtime: stat.mtimeMs });
    }
    return resultado;
}

function parseNota(raw) {
    const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (!fmMatch) return null;
    const frontmatter = fmMatch[1];
    const body = fmMatch[2];

    const prioridadeMatch = frontmatter.match(/^prioridade:\s*(.+)$/m);
    const assuntoMatch    = frontmatter.match(/^assunto:\s*(.+)$/m);
    const contatoMatch    = frontmatter.match(/^contato:\s*(.+)$/m);
    const dataMatch       = frontmatter.match(/^data:\s*(.+)$/m);

    const msgMatch = body.match(/## Mensagem\s*\n([\s\S]*?)(\n## |\n?$)/);
    const mensagem = msgMatch ? msgMatch[1].trim().substring(0, 200) : '';

    return {
        prioridade: prioridadeMatch ? prioridadeMatch[1].trim() : null,
        assunto:    assuntoMatch ? assuntoMatch[1].trim() : null,
        contato:    contatoMatch ? contatoMatch[1].trim() : null,
        data:       dataMatch ? dataMatch[1].trim() : null,
        mensagem
    };
}

function main() {
    const arquivos = [
        ...listarMarkdown(path.join(VAULT, 'grupos')),
        ...listarMarkdown(path.join(VAULT, 'diretos')),
    ].filter(f => f.mtime >= cutoff);

    const urgentes = [];

    for (const { full } of arquivos) {
        try {
            const raw = fs.readFileSync(full, 'utf8');
            const parsed = parseNota(raw);
            if (parsed && parsed.prioridade === 'Urgente') {
                urgentes.push({
                    arquivo: path.basename(full),
                    contato: parsed.contato,
                    assunto: parsed.assunto,
                    data: parsed.data,
                    mensagem: parsed.mensagem
                });
            }
        } catch (e) { /* ignora arquivo com erro de leitura */ }
    }

    const resultado = {
        checado_em: new Date().toISOString(),
        janela_minutos: minutos,
        total_urgentes: urgentes.length,
        urgentes
    };

    console.log(JSON.stringify(resultado, null, 2));
}

main();
