import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import win32com.client
import os

path = r'C:\Users\fabio\Documents\segundo-cerebro\vault\_knowledge\JFX\Funcionários\ELEGIB_1.XLS'
excel = win32com.client.Dispatch('Excel.Application')
excel.Visible = False
excel.DisplayAlerts = False

try:
    wb = excel.Workbooks.Open(path, ReadOnly=True)
    print(f'Planilhas: {wb.Sheets.Count}')
    for i in range(1, wb.Sheets.Count + 1):
        ws = wb.Sheets(i)
        print(f'\n--- Aba {i}: {ws.Name} ---')
        # Print first 60 rows
        for row in range(1, 61):
            row_data = []
            for col in range(1, 10):
                try:
                    val = ws.Cells(row, col).Value
                    if val is not None:
                        row_data.append(str(val)[:40])
                    else:
                        row_data.append('')
                except:
                    row_data.append('')
            line = ' | '.join(row_data).rstrip(' | ')
            if line.strip():
                print(f'  R{row}: {line}')
    wb.Close(False)
finally:
    excel.Quit()
