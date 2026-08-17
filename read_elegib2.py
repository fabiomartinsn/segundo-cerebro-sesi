import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import win32com.client

path = r'C:\Users\fabio\Documents\segundo-cerebro\vault\_knowledge\JFX\Funcionários\ELEGIB_1.XLS'
excel = win32com.client.Dispatch('Excel.Application')
excel.Visible = False
excel.DisplayAlerts = False

try:
    wb = excel.Workbooks.Open(path, ReadOnly=True)
    ws = wb.Sheets(1)
    ativos = []
    demitidos = []
    afastados = []
    outros = []
    total = 0
    for row in range(5, 200):
        nome = ws.Cells(row, 2).Value
        if not nome:
            break
        situacao = str(ws.Cells(row, 5).Value or '')
        total += 1
        entry = f'  [{ws.Cells(row,1).Value}] {nome} | {ws.Cells(row,3).Value} | {situacao}'
        if 'Demitido' in situacao or 'demitido' in situacao:
            demitidos.append(entry)
        elif 'Afastado' in situacao or 'afastado' in situacao:
            afastados.append(entry)
        elif situacao == 'Ativo':
            ativos.append(entry)
        else:
            outros.append(entry)
    print(f'TOTAL GERAL: {total}')
    print(f'Ativos: {len(ativos)}')
    print(f'Afastados: {len(afastados)}')
    print(f'Demitidos: {len(demitidos)}')
    print(f'Outros: {len(outros)}')
    print()
    print('--- DEMITIDOS ---')
    for d in demitidos:
        print(d)
    print()
    print('--- AFASTADOS ---')
    for a in afastados:
        print(a)
    print()
    print('--- OUTROS STATUS ---')
    for o in outros:
        print(o)
    wb.Close(False)
finally:
    excel.Quit()
