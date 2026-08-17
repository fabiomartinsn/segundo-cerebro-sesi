// gerar-rem.js — Planilha REM SMS JFX/EDISER 2026
const ExcelJS = require('exceljs');
const path    = require('path');

const OUTPUT = path.join(__dirname,
  'vault', '_knowledge', 'JFX', 'REM-Indicadores-2026.xlsx');

const MONTHS  = ['Mai/26','Jun/26','Jul/26','Ago/26','Set/26','Out/26','Nov/26','Dez/26'];
const N       = MONTHS.length;

// ── Paleta JFX ─────────────────────────────────────────────
const NAVY   = { argb: 'FF0F2D52' };
const ORANGE = { argb: 'FFE07B2A' };
const WHITE  = { argb: 'FFFFFFFF' };
const YELLOW = { argb: 'FFFFF2CC' };
const BLUE_C = { argb: 'FFDAE8FC' };
const GREEN  = { argb: 'FFC6EFCE' };
const RED_C  = { argb: 'FFFFC7CE' };
const AMBER  = { argb: 'FFFFE699' };
const GRAY_L = { argb: 'FFF2F2F2' };

// ── Helpers ─────────────────────────────────────────────────
function fill(color) {
  return { type: 'pattern', pattern: 'solid', fgColor: color };
}
function ft(bold = false, sz = 10, color = { argb: 'FF000000' }) {
  return { name: 'Calibri', bold, size: sz, color };
}
function border() {
  const s = { style: 'thin', color: { argb: 'FFAAAAAA' } };
  return { top: s, left: s, bottom: s, right: s };
}
function al(h = 'center', v = 'middle', wrap = false) {
  return { horizontal: h, vertical: v, wrapText: wrap };
}

// Col letter from index (1-based): 1→A, 2→B, ...
function col(idx) {
  let s = '';
  while (idx > 0) {
    idx--;
    s = String.fromCharCode(65 + (idx % 26)) + s;
    idx = Math.floor(idx / 26);
  }
  return s;
}
// Sheet1 month column: months start at col index 3 (C)
function s1c(monthIdx) { return col(3 + monthIdx); }
// Sheet2 month column: months start at col index 4 (D)
function s2c(monthIdx) { return col(4 + monthIdx); }

// Build formula for all 8 months
function mk(fn) { return MONTHS.map((_, i) => fn(s1c(i))); }

const wb = new ExcelJS.Workbook();
wb.creator  = 'FabIA — Segundo Cérebro';
wb.subject  = 'REM SMS EDISER 2026';
wb.keywords = 'JFX EDISER Petrobras SMS REM indicadores';

// ════════════════════════════════════════════════════════════
// SHEET 1 — Dados Base
// ════════════════════════════════════════════════════════════
const ws1 = wb.addWorksheet('Dados Base', {
  views: [{ state: 'frozen', xSplit: 2, ySplit: 2 }]
});

ws1.getColumn(1).width = 50;
ws1.getColumn(2).width = 9;
for (let i = 0; i < N; i++) ws1.getColumn(3 + i).width = 11;

// Row 1 — Título
{
  const r = ws1.addRow([
    'DADOS BASE — REM SMS  ·  JFX ENGENHARIA  ·  Contrato EDISER/Petrobras  ·  Blocos B, D e Q'
  ]);
  r.height = 28;
  ws1.mergeCells(`A1:${col(2 + N)}1`);
  const c = r.getCell(1);
  c.font       = ft(true, 11, WHITE);
  c.fill       = fill(NAVY);
  c.alignment  = al('center');
}

// Row 2 — Cabeçalho de colunas
{
  const r = ws1.addRow(['Campo', 'Un.', ...MONTHS]);
  r.height = 20;
  r.getCell(1).font = ft(true, 10, WHITE); r.getCell(1).fill = fill(NAVY); r.getCell(1).alignment = al('left');
  r.getCell(2).font = ft(true, 10, WHITE); r.getCell(2).fill = fill(NAVY); r.getCell(2).alignment = al();
  for (let i = 0; i < N; i++) {
    const c = r.getCell(3 + i);
    c.font = ft(true, 10, WHITE); c.fill = fill(ORANGE); c.alignment = al();
    c.border = border();
  }
}

// ── Helpers de linha ─────────────────────────────────────────
function secRow1(label) {
  const r = ws1.addRow([label]);
  r.height = 16;
  ws1.mergeCells(`A${r.number}:${col(2 + N)}${r.number}`);
  r.getCell(1).font      = ft(true, 10, WHITE);
  r.getCell(1).fill      = fill(ORANGE);
  r.getCell(1).alignment = al('center');
  return r.number;
}

function dataRow1(label, unit, kind = 'input') {
  const r = ws1.addRow([label, unit]);
  r.height = 18;
  r.getCell(1).font = ft(false, 10); r.getCell(1).alignment = al('left', 'middle', true); r.getCell(1).border = border();
  r.getCell(2).font = ft(false, 10); r.getCell(2).alignment = al();                       r.getCell(2).border = border();
  for (let i = 0; i < N; i++) {
    const c = r.getCell(3 + i);
    c.font      = ft(false, 10);
    c.alignment = al();
    c.border    = border();
    if (kind === 'input') c.fill = fill(YELLOW);
    if (kind === 'calc')  c.fill = fill(BLUE_C);
  }
  return r.number;
}

// ── Linhas de dados ──────────────────────────────────────────
secRow1('PESSOAL');
const ROW_COLAB = dataRow1('Nº de Colaboradores', 'un');
const ROW_DIAS  = dataRow1('Dias Úteis no Mês', 'dias');
const ROW_HHER  = dataRow1('HHER  (Nº Colaboradores × 144 h/mês)', 'h', 'calc');
// Fórmulas HHER
for (let i = 0; i < N; i++) {
  const c = ws1.getRow(ROW_HHER).getCell(3 + i);
  c.value = { formula: `${s1c(i)}${ROW_COLAB}*144` };
  c.numFmt = '#,##0';
}

secRow1('ACIDENTES');
const ROW_NCA   = dataRow1('NCA — Acidentados COM Afastamento', 'casos');
const ROW_NSA   = dataRow1('NSA — Acidentados SEM Afastamento', 'casos');
const ROW_TCA   = dataRow1('TCA — Total de Dias Perdidos por Afastamento', 'dias');
const ROW_NAR   = dataRow1('NAR — Acidentados Registráveis (excl. 1º Socorros)', 'casos');
const ROW_MORTE = dataRow1('Acidentes com Morte', 'casos');
const ROW_IAP   = dataRow1('Incidentes de Alto Potencial', 'casos');
const ROW_DESV  = dataRow1('Desvios Críticos / Sistêmicos', 'casos');
const ROW_OA    = dataRow1('Ocorrências Ambientais', 'casos');

secRow1('PROGRAMAS PROATIVOS');
const ROW_DDS_R   = dataRow1('DDS Realizados', 'DDS');
const ROW_VCP_R   = dataRow1('VCP Realizadas', 'VCP');
const ROW_VCP_P   = dataRow1('VCP Programadas', 'VCP');
const ROW_TREIN_R = dataRow1('Treinamentos Realizados', 'trein.');
const ROW_TREIN_P = dataRow1('Treinamentos Programados', 'trein.');
const ROW_AUTUA   = dataRow1('Autuações de Órgãos Fiscalizadores', 'casos');
const ROW_EPI     = dataRow1('Colaboradores c/ EPI Inspecionado (trimestral)', 'un');

// Legenda
{
  const r = ws1.addRow([
    'Legenda:  Célula amarela = entrada manual (preencher mensalmente)  |  Célula azul = calculada  |  HHER = Nº colaboradores × 144 h/mês (regime campo)'
  ]);
  ws1.mergeCells(`A${r.number}:${col(2 + N)}${r.number}`);
  r.getCell(1).font = ft(false, 9, { argb: 'FF595959' });
  r.getCell(1).alignment = al('left');
}

// ════════════════════════════════════════════════════════════
// SHEET 2 — Indicadores REM
// ════════════════════════════════════════════════════════════
const ws2 = wb.addWorksheet('Indicadores REM', {
  views: [{ state: 'frozen', xSplit: 3, ySplit: 2 }]
});

ws2.getColumn(1).width = 50;
ws2.getColumn(2).width = 10;
ws2.getColumn(3).width = 14;
for (let i = 0; i < N; i++) ws2.getColumn(4 + i).width = 11;

// Row 1 — Título
{
  const r = ws2.addRow([
    'INDICADORES REM — SMS  ·  JFX ENGENHARIA  ·  Contrato EDISER/Petrobras  ·  Blocos B, D e Q'
  ]);
  r.height = 28;
  ws2.mergeCells(`A1:${col(3 + N)}1`);
  const c = r.getCell(1);
  c.font = ft(true, 11, WHITE); c.fill = fill(NAVY); c.alignment = al('center');
}

// Row 2 — Cabeçalho
{
  const r = ws2.addRow(['Indicador', 'Sigla', 'Meta', ...MONTHS]);
  r.height = 20;
  for (let i = 1; i <= 3; i++) {
    r.getCell(i).font = ft(true, 10, WHITE); r.getCell(i).fill = fill(NAVY); r.getCell(i).alignment = al(); r.getCell(i).border = border();
  }
  for (let i = 0; i < N; i++) {
    const c = r.getCell(4 + i);
    c.font = ft(true, 10, WHITE); c.fill = fill(ORANGE); c.alignment = al(); c.border = border();
  }
}

// ── Helpers Sheet 2 ──────────────────────────────────────────
function secRow2(label) {
  const r = ws2.addRow([label]);
  r.height = 16;
  ws2.mergeCells(`A${r.number}:${col(3 + N)}${r.number}`);
  r.getCell(1).font = ft(true, 10, WHITE); r.getCell(1).fill = fill(ORANGE); r.getCell(1).alignment = al('center');
  return r.number;
}

const IND_ROWS = {};

function indRow(key, name, sigla, meta, formulas, nfmt = '0.00') {
  const r = ws2.addRow([name, sigla, meta]);
  r.height = 18;
  r.getCell(1).font = ft(false, 10); r.getCell(1).alignment = al('left', 'middle', true); r.getCell(1).border = border();
  r.getCell(2).font = ft(false, 10); r.getCell(2).alignment = al(); r.getCell(2).border = border();
  r.getCell(3).font = ft(false, 10); r.getCell(3).alignment = al(); r.getCell(3).border = border();
  for (let i = 0; i < N; i++) {
    const c = r.getCell(4 + i);
    c.value     = { formula: formulas[i] };
    c.numFmt    = nfmt;
    c.font      = ft(false, 10);
    c.alignment = al();
    c.border    = border();
    c.fill      = fill(GRAY_L);
  }
  IND_ROWS[key] = r.number;
  return r.number;
}

// ── Indicadores ──────────────────────────────────────────────
const E = '""'; // string vazia para Excel

secRow2('INDICADORES REATIVOS — Base de cálculo: HHER  (fator × 10⁶ para todos os índices de taxa)');

indRow('HHER', 'HHER — Homens-Horas de Exposição ao Risco', 'HHER', '100% registrado',
  mk(c => `'Dados Base'!${c}${ROW_HHER}`), '#,##0');

indRow('TFCA', 'Taxa de Frequência — Acidentados COM Afastamento  (NCA × 10⁶ ÷ HHER)', 'TFCA', '= 0',
  mk(c => `IF('Dados Base'!${c}${ROW_HHER}=0,${E},'Dados Base'!${c}${ROW_NCA}*1000000/'Dados Base'!${c}${ROW_HHER})`));

indRow('TFSA', 'Taxa de Frequência — Acidentados SEM Afastamento  (NSA × 10⁶ ÷ HHER)', 'TFSA', '= 0',
  mk(c => `IF('Dados Base'!${c}${ROW_HHER}=0,${E},'Dados Base'!${c}${ROW_NSA}*1000000/'Dados Base'!${c}${ROW_HHER})`));

indRow('TG', 'Taxa de Gravidade  (TCA × 10⁶ ÷ HHER)', 'TG', '= 0',
  mk(c => `IF('Dados Base'!${c}${ROW_HHER}=0,${E},'Dados Base'!${c}${ROW_TCA}*1000000/'Dados Base'!${c}${ROW_HHER})`));

indRow('TOR', 'Taxa de Ocorrências Registráveis  (NAR × 10⁶ ÷ HHER)', 'TOR', '= 0',
  mk(c => `IF('Dados Base'!${c}${ROW_HHER}=0,${E},'Dados Base'!${c}${ROW_NAR}*1000000/'Dados Base'!${c}${ROW_HHER})`));

indRow('TAR', 'Taxa de Acidentados Registráveis — excl. 1º Socorros  (NAR × 10⁶ ÷ HHER)', 'TAR', '= 0',
  mk(c => `IF('Dados Base'!${c}${ROW_HHER}=0,${E},'Dados Base'!${c}${ROW_NAR}*1000000/'Dados Base'!${c}${ROW_HHER})`));

indRow('MORTE', 'Acidentes com Morte', '—', '= 0',
  mk(c => `'Dados Base'!${c}${ROW_MORTE}`), '#,##0');

indRow('IAP', 'Incidentes de Alto Potencial', 'IAP', '= 0',
  mk(c => `'Dados Base'!${c}${ROW_IAP}`), '#,##0');

indRow('DESV', 'Desvios Críticos / Sistêmicos', '—', '< 2/mês',
  mk(c => `'Dados Base'!${c}${ROW_DESV}`), '#,##0');

indRow('OA', 'Ocorrências Ambientais', 'OA', '= 0',
  mk(c => `'Dados Base'!${c}${ROW_OA}`), '#,##0');

secRow2('INDICADORES PROATIVOS — Programas e Conformidade');

indRow('DDS', 'DDS Realizados / Dias Úteis do Mês  (%)', 'DDS %', '≥ 95%',
  mk(c => `IF('Dados Base'!${c}${ROW_DIAS}=0,${E},'Dados Base'!${c}${ROW_DDS_R}/'Dados Base'!${c}${ROW_DIAS}*100)`), '0.0"%"');

indRow('VCP', 'VCP Realizadas / Programadas  (%)', 'VCP %', '= 100%',
  mk(c => `IF('Dados Base'!${c}${ROW_VCP_P}=0,${E},'Dados Base'!${c}${ROW_VCP_R}/'Dados Base'!${c}${ROW_VCP_P}*100)`), '0.0"%"');

indRow('TREIN', 'Treinamentos Realizados / Programados  (%)', 'Trein. %', '≥ 95%',
  mk(c => `IF('Dados Base'!${c}${ROW_TREIN_P}=0,${E},'Dados Base'!${c}${ROW_TREIN_R}/'Dados Base'!${c}${ROW_TREIN_P}*100)`), '0.0"%"');

indRow('EPI', 'Inspeção de EPI — Colaboradores Cobertos  (%)', 'EPI %', '100% (trim.)',
  mk(c => `IF('Dados Base'!${c}${ROW_COLAB}=0,${E},'Dados Base'!${c}${ROW_EPI}/'Dados Base'!${c}${ROW_COLAB}*100)`), '0.0"%"');

indRow('AUTUA', 'Autuações de Órgãos Fiscalizadores', '—', '= 0',
  mk(c => `'Dados Base'!${c}${ROW_AUTUA}`), '#,##0');

// ── Formatação condicional ────────────────────────────────────
// ExcelJS usa a API nativa do xlsx — injetamos via XML workaround
// Marcamos células com CF via addConditionalFormatting
const D = col(4); const K = col(3 + N);

// Reativos — meta = 0: verde se =0, vermelho se >0
['TFCA','TFSA','TG','TOR','TAR','MORTE','IAP','OA','AUTUA'].forEach(key => {
  const row = IND_ROWS[key];
  const range = `${D}${row}:${K}${row}`;
  ws2.addConditionalFormatting({
    ref: range,
    rules: [
      { type: 'cellIs', operator: 'equal',       formulae: ['0'],  style: { fill: { type:'pattern', pattern:'solid', bgColor: GREEN } } },
      { type: 'cellIs', operator: 'greaterThan', formulae: ['0'],  style: { fill: { type:'pattern', pattern:'solid', bgColor: RED_C  } } },
    ]
  });
});

// Desvios — meta <2
{
  const row = IND_ROWS['DESV']; const range = `${D}${row}:${K}${row}`;
  ws2.addConditionalFormatting({ ref: range, rules: [
    { type: 'cellIs', operator: 'lessThan',           formulae: ['2'], style: { fill: { type:'pattern', pattern:'solid', bgColor: GREEN } } },
    { type: 'cellIs', operator: 'equal',              formulae: ['2'], style: { fill: { type:'pattern', pattern:'solid', bgColor: AMBER } } },
    { type: 'cellIs', operator: 'greaterThanOrEqual', formulae: ['2'], style: { fill: { type:'pattern', pattern:'solid', bgColor: RED_C } } },
  ]});
}

// DDS — meta ≥95%
{
  const row = IND_ROWS['DDS']; const range = `${D}${row}:${K}${row}`;
  ws2.addConditionalFormatting({ ref: range, rules: [
    { type: 'cellIs', operator: 'greaterThanOrEqual', formulae: ['95'], style: { fill: { type:'pattern', pattern:'solid', bgColor: GREEN } } },
    { type: 'cellIs', operator: 'lessThan',           formulae: ['95'], style: { fill: { type:'pattern', pattern:'solid', bgColor: RED_C } } },
  ]});
}

// VCP — meta =100%
{
  const row = IND_ROWS['VCP']; const range = `${D}${row}:${K}${row}`;
  ws2.addConditionalFormatting({ ref: range, rules: [
    { type: 'cellIs', operator: 'greaterThanOrEqual', formulae: ['100'], style: { fill: { type:'pattern', pattern:'solid', bgColor: GREEN } } },
    { type: 'cellIs', operator: 'lessThan',           formulae: ['100'], style: { fill: { type:'pattern', pattern:'solid', bgColor: RED_C } } },
  ]});
}

// Treinamentos — meta ≥95%
{
  const row = IND_ROWS['TREIN']; const range = `${D}${row}:${K}${row}`;
  ws2.addConditionalFormatting({ ref: range, rules: [
    { type: 'cellIs', operator: 'greaterThanOrEqual', formulae: ['95'], style: { fill: { type:'pattern', pattern:'solid', bgColor: GREEN } } },
    { type: 'cellIs', operator: 'lessThan',           formulae: ['95'], style: { fill: { type:'pattern', pattern:'solid', bgColor: RED_C } } },
  ]});
}

// EPI — meta =100%
{
  const row = IND_ROWS['EPI']; const range = `${D}${row}:${K}${row}`;
  ws2.addConditionalFormatting({ ref: range, rules: [
    { type: 'cellIs', operator: 'greaterThanOrEqual', formulae: ['100'], style: { fill: { type:'pattern', pattern:'solid', bgColor: GREEN } } },
    { type: 'cellIs', operator: 'lessThan',           formulae: ['100'], style: { fill: { type:'pattern', pattern:'solid', bgColor: RED_C } } },
  ]});
}

// ── Rodapé Sheet 2 ───────────────────────────────────────────
{
  const r = ws2.addRow([
    'Prazo REM: até o 5º dia do mês seguinte  |  Responsável consolidação: Roberta Muniz (TST Adm)  |  Validação: Fábio Martins Nascimento (Coordenador SMS)  |  Referência: ISO 45001 §9.1 + N-Petrobras'
  ]);
  ws2.mergeCells(`A${r.number}:${col(3 + N)}${r.number}`);
  r.getCell(1).font = ft(false, 9, { argb: 'FF595959' }); r.getCell(1).alignment = al('left');
}

// ════════════════════════════════════════════════════════════
// SHEET 3 — Instruções
// ════════════════════════════════════════════════════════════
const ws3 = wb.addWorksheet('Instruções');
ws3.getColumn(1).width = 70;

const instrTitle = ws3.addRow(['INSTRUÇÕES DE USO — REM SMS JFX/EDISER 2026']);
ws3.mergeCells(`A1:A1`);
instrTitle.getCell(1).font = ft(true, 13, WHITE); instrTitle.getCell(1).fill = fill(NAVY); instrTitle.getCell(1).alignment = al('left'); instrTitle.height = 28;

const instrLines = [
  [''],
  ['COMO PREENCHER'],
  ['1. Acesse a aba "Dados Base" todo mês.'],
  ['2. Preencha APENAS as células amarelas com os dados reais do mês.'],
  ['3. O HHER é calculado automaticamente: Nº Colaboradores × 144 h/mês.'],
  ['4. Acesse a aba "Indicadores REM" para ver os índices calculados automaticamente.'],
  ['5. Células verdes = dentro da meta.  Células vermelhas = fora da meta.'],
  [''],
  ['CAMPOS DE ENTRADA (aba Dados Base)'],
  ['• Nº de Colaboradores: total de trabalhadores ativos no mês (JFX + subcontratados)'],
  ['• Dias Úteis no Mês: dias de trabalho efetivo no mês'],
  ['• NCA: número de pessoas que sofreram acidente com afastamento do trabalho'],
  ['• NSA: número de pessoas que sofreram acidente SEM afastamento (lesão tratada no local)'],
  ['• TCA: soma total de dias de afastamento do trabalho por todos os acidentes do mês'],
  ['• NAR: acidentados registráveis = NCA + NSA − primeiros socorros (classes 2, 3, 4, 5)'],
  ['• Acidentes com Morte: número absoluto de óbitos no mês'],
  ['• Incidentes de Alto Potencial: eventos sem lesão mas com potencial de causar acidente grave'],
  ['• Desvios Críticos/Sistêmicos: desvios identificados em inspeções com risco significativo'],
  ['• Ocorrências Ambientais: derramamentos, vazamentos, destinação irregular de resíduos'],
  ['• DDS Realizados: número de Diálogos Diários de Segurança realizados e documentados no mês'],
  ['• VCP Realizadas/Programadas: Verificações Comportamentais realizadas vs. programadas'],
  ['• Treinamentos Realizados/Programados: treinamentos executados vs. planejados na matriz'],
  ['• Colaboradores c/ EPI Inspecionado: número de trabalhadores com EPI inspecionado (trimestral)'],
  ['• Autuações: número de autuações por órgãos fiscalizadores (MTE, IBAMA, etc.)'],
  [''],
  ['CLASSES DE ACIDENTE (NBR 14280 + Petrobras)'],
  ['  Classe 1 — Primeiros socorros: NÃO entra no NAR'],
  ['  Classe 2 — Lesão sem afastamento: entra no TFSA, TOR, TAR'],
  ['  Classe 3 — Lesão com afastamento temporário: entra no TFCA, TG, TOR, TAR'],
  ['  Classe 4 — Incapacidade permanente parcial / doença ocupacional: entra em todos'],
  ['  Classe 5 — Morte / incapacidade permanente total: entra em todos'],
  ['  NÃO computar: acidentes de trajeto e ocorrências não apropriáveis (Anexo E — PP-1PB-00150)'],
  [''],
  ['METAS'],
  ['  TFCA, TFSA, TG, TOR, TAR, Mortes, IAP, OA, Autuações → meta = 0'],
  ['  Desvios Críticos/Sistêmicos → meta < 2 por mês'],
  ['  DDS e Treinamentos → meta ≥ 95%'],
  ['  VCP e EPI → meta = 100%'],
  [''],
  ['PRAZOS E RESPONSÁVEIS'],
  ['  Preenchimento (Dados Base): Roberta Muniz — TST Administrativo'],
  ['  Validação (Indicadores REM): Fábio Martins Nascimento — Coordenador SMS'],
  ['  Entrega REM à Petrobras: até o 5º dia do mês seguinte'],
  [''],
  ['REFERÊNCIAS'],
  ['  PGS-JFX-EDISER-001 Rev 00 abr/2026 — Plano de Gestão SMS'],
  ['  VCP-JFX-EDISER-001 Rev 01 — Verificação Comportamental'],
  ['  Indicadores de Gestão SMS — Petrobras (N-Petrobras)'],
  ['  ISO 45001:2018 §9.1 — Monitoramento, medição, análise e avaliação de desempenho'],
  ['  NBR 14280 — Cadastro de acidente do trabalho'],
];

instrLines.forEach(([text], idx) => {
  const r = ws3.addRow([text]);
  r.height = 16;
  const isBold = ['', 'COMO PREENCHER', 'CAMPOS DE ENTRADA (aba Dados Base)',
    'CLASSES DE ACIDENTE (NBR 14280 + Petrobras)', 'METAS', 'PRAZOS E RESPONSÁVEIS', 'REFERÊNCIAS'
  ].includes(text);
  r.getCell(1).font = isBold ? ft(true, 10) : ft(false, 10);
  r.getCell(1).alignment = al('left', 'middle', true);
  if (isBold && text) { r.getCell(1).fill = fill({ argb: 'FFBDD7EE' }); }
});

// ════════════════════════════════════════════════════════════
// Salvar
// ════════════════════════════════════════════════════════════
const fs = require('fs');
fs.mkdirSync(require('path').dirname(OUTPUT), { recursive: true });

wb.xlsx.writeFile(OUTPUT).then(() => {
  console.log('Arquivo salvo:', OUTPUT);
  console.log('Abas: Dados Base | Indicadores REM | Instruções');
  console.log('Meses: Mai/26 a Dez/26');
  console.log('Linhas-chave Sheet1:');
  console.log(`  ROW_COLAB=${ROW_COLAB} ROW_DIAS=${ROW_DIAS} ROW_HHER=${ROW_HHER}`);
  console.log(`  ROW_NCA=${ROW_NCA} ROW_NSA=${ROW_NSA} ROW_TCA=${ROW_TCA} ROW_NAR=${ROW_NAR}`);
  console.log(`  ROW_DDS_R=${ROW_DDS_R} ROW_VCP_R=${ROW_VCP_R} ROW_VCP_P=${ROW_VCP_P}`);
}).catch(err => {
  console.error('Erro ao salvar:', err);
  process.exit(1);
});
