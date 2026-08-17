const express = require('express');
const { Pool }  = require('pg');
const cors      = require('cors');

const app  = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

app.use(cors());
app.use(express.json({ limit: '100mb' })); // base64 de PDFs pode ser grande

// ─── Init banco ────────────────────────────────────────────────────────────────
async function initDB() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS messages (
            id              SERIAL PRIMARY KEY,
            received_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            instance        VARCHAR(100),
            remote_jid      VARCHAR(100),
            push_name       TEXT,
            message_type    VARCHAR(60),
            content         TEXT,
            urgency         VARCHAR(20)  DEFAULT 'MEDIA',
            context_tag     VARCHAR(50)  DEFAULT 'GERAL',
            media_base64    TEXT,
            media_mimetype  VARCHAR(120),
            media_filename  VARCHAR(255),
            media_synced    BOOLEAN      DEFAULT FALSE
        )
    `);
    console.log('Banco inicializado.');
}

// ─── Helpers ────────────────────────────────────────────────────────────────────
function extractContent(data) {
    const m = data.message || {};
    const text =
        m.conversation ||
        m.extendedTextMessage?.text ||
        m.imageMessage?.caption ||
        m.videoMessage?.caption ||
        m.documentMessage?.caption ||
        '';
    return text.trim() || null;
}

function extractFilename(data) {
    const m = data.message || {};
    return (
        m.documentMessage?.fileName ||
        m.documentMessage?.title    ||
        null
    );
}

function extractMimetype(data) {
    const m = data.message || {};
    const sub =
        m.documentMessage ||
        m.imageMessage    ||
        m.audioMessage    ||
        m.videoMessage    ||
        m.stickerMessage  ||
        {};
    return sub.mimetype || null;
}

function extractMessageType(data) {
    return data.messageType || Object.keys(data.message || {})[0] || 'unknown';
}

// ─── Webhook ────────────────────────────────────────────────────────────────────
app.post('/webhook', async (req, res) => {
    try {
        const body  = req.body;
        const event = body.event;

        if (!event || !event.includes('messages')) return res.json({ ok: true });

        const messages = Array.isArray(body.data) ? body.data : [body.data];
        const instance  = body.instance || body.data?.instance || null;

        for (const data of messages) {
            if (!data || !data.key) continue;
            if (data.key.remoteJid === 'status@broadcast') continue;

            const messageType  = extractMessageType(data);
            const content      = extractContent(data);
            const mediaBase64  = data.base64    || null;
            const mediaMime    = extractMimetype(data);
            const mediaFile    = extractFilename(data);

            let receivedAt;
            if (data.messageTimestamp) {
                receivedAt = new Date(Number(data.messageTimestamp) * 1000).toISOString();
            } else {
                receivedAt = new Date().toISOString();
            }

            await pool.query(
                `INSERT INTO messages
                    (received_at, instance, remote_jid, push_name, message_type,
                     content, media_base64, media_mimetype, media_filename)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
                [
                    receivedAt,
                    instance,
                    data.key.remoteJid,
                    data.pushName || null,
                    messageType,
                    content,
                    mediaBase64,
                    mediaMime,
                    mediaFile
                ]
            );
        }

        res.json({ ok: true });
    } catch (err) {
        console.error('Webhook error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /messages — com suporte a limit e offset para paginação ─────────────
app.get('/messages', async (req, res) => {
    try {
        const limit  = Math.min(parseInt(req.query.limit)  || 50,  500);
        const offset = Math.max(parseInt(req.query.offset) || 0,   0);
        const result = await pool.query(
            `SELECT id, received_at, instance, remote_jid, push_name,
                    message_type, content, urgency, context_tag,
                    media_filename, media_mimetype,
                    (media_base64 IS NOT NULL) AS has_media,
                    media_synced
             FROM messages
             ORDER BY id ASC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );
        res.json({ total: result.rows.length, offset, messages: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /messages/:id/media — download do arquivo em base64 ─────────────────
app.get('/messages/:id/media', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT media_base64, media_mimetype, media_filename
             FROM messages WHERE id = $1`,
            [req.params.id]
        );
        const row = result.rows[0];
        if (!row || !row.media_base64) {
            return res.status(404).json({ error: 'Sem mídia para esta mensagem.' });
        }
        res.json({
            base64:   row.media_base64,
            mimetype: row.media_mimetype,
            filename: row.media_filename
        });
        await pool.query('UPDATE messages SET media_synced = TRUE WHERE id = $1', [req.params.id]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── DELETE /messages/batch — apaga lote por IDs após sincronização ──────────
app.delete('/messages/batch', async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'Informe um array de ids.' });
        }
        const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
        const result = await pool.query(
            `DELETE FROM messages WHERE id IN (${placeholders})`,
            ids
        );
        res.json({ deleted: result.rowCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /messages/count — total de mensagens no banco ───────────────────────
app.get('/messages/count', async (req, res) => {
    try {
        const result = await pool.query('SELECT COUNT(*) AS total FROM messages');
        res.json({ total: parseInt(result.rows[0].total) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Health ────────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ─── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
initDB()
    .then(() => app.listen(PORT, () => console.log(`FabIA Webhook v2 rodando na porta ${PORT}`)))
    .catch(err => { console.error('Falha ao iniciar:', err); process.exit(1); });
