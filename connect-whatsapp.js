const https = require('https');
const http = require('http');

// Configuração
const API_URL = 'https://evolution-api-production-b5sf.up.railway.app';
const SESSION_NAME = 'FabIA';
const NEW_PHONE = '5579991992245';

function httpPost(url, body) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(body);
        const parsed = new URL(url);
        const options = {
            hostname: parsed.hostname,
            path: parsed.pathname + parsed.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        };
        const lib = url.startsWith('https') ? https : http;
        const req = lib.request(options, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { resolve({ raw: data, status: res.statusCode }); }
            });
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

function httpGet(url) {
    return new Promise((resolve, reject) => {
        const lib = url.startsWith('https') ? https : http;
        lib.get(url, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { resolve({ raw: data, status: res.statusCode }); }
            });
        }).on('error', reject);
    });
}

async function main() {
    console.log('\n=== Conectando Novo Número WhatsApp ===\n');
    console.log(`Session: ${SESSION_NAME}`);
    console.log(`Novo número: ${NEW_PHONE}`);
    console.log(`API: ${API_URL}\n`);

    try {
        // Teste 1: Verificar se API está online
        console.log('[1/3] Verificando se API está online...');
        const health = await httpGet(API_URL);
        console.log('✓ API respondeu\n');

        // Teste 2: Criar nova instância/conexão
        console.log('[2/3] Iniciando nova conexão WhatsApp...');
        const connect = await httpPost(`${API_URL}/api/instance/create`, {
            sessionName: SESSION_NAME,
            number: NEW_PHONE,
            qrcode: true
        });
        console.log('Resposta:', JSON.stringify(connect, null, 2));
        console.log('\n');

        // Teste 3: Obter status da conexão
        console.log('[3/3] Obtendo QR Code...');
        const qrcode = await httpGet(`${API_URL}/api/instance/qrcode/${SESSION_NAME}`);
        console.log('QR Code:', JSON.stringify(qrcode, null, 2));
        console.log('\n');

        console.log('=== Aguardando escanear o QR Code com o WhatsApp ===');
        console.log('Número: ' + NEW_PHONE);
        console.log('\nDesde que escanear, o sistema estará pronto!');

    } catch (err) {
        console.error('❌ Erro:', err.message);
        process.exit(1);
    }
}

main();