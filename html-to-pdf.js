const puppeteer = require('puppeteer');
const path = require('path');

async function htmlToPdf(inputHtml, outputPdf) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  const fileUrl = 'file:///' + inputHtml.replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: outputPdf,
    format: 'A4',
    printBackground: true,
    margin: { top: '12mm', bottom: '12mm', left: '10mm', right: '10mm' },
    preferCSSPageSize: false,
  });

  await browser.close();
  console.log('PDF gerado:', outputPdf);
}

const input = path.resolve(__dirname, 'vault/_knowledge/SESI/Coordenação/ssi-day-roteiro.html');
const output = path.resolve(__dirname, 'vault/_knowledge/SESI/Coordenação/SSI-Day-Roteiro.pdf');

htmlToPdf(input, output).catch(console.error);
