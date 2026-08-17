import sys
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
import win32com.client
import os

path = r"C:\Users\fabio\Documents\segundo-cerebro\vault\_knowledge\JFX\PEX\PR-019_1 FACHADA.DOC"

word = win32com.client.Dispatch("Word.Application")
word.Visible = False

try:
    doc = word.Documents.Open(path, ReadOnly=True)
    print(f"=== PR-019_1 FACHADA.DOC ===")
    print(f"Paragrafos: {doc.Paragraphs.Count}")
    print(f"Tabelas: {doc.Tables.Count}")
    print()

    for i, para in enumerate(doc.Paragraphs):
        text = para.Range.Text.strip()
        if text and text != "\r":
            style = para.Style.NameLocal
            print(f"[P{i}] [{style}] {text[:300]}")

    print("\n--- TABELAS ---")
    for ti in range(1, doc.Tables.Count + 1):
        tbl = doc.Tables(ti)
        print(f"\nTabela {ti}: {tbl.Rows.Count} linhas x {tbl.Columns.Count} colunas")
        for ri in range(1, min(tbl.Rows.Count + 1, 50)):
            row_data = []
            for ci in range(1, tbl.Columns.Count + 1):
                try:
                    cell_text = tbl.Cell(ri, ci).Range.Text.strip().rstrip('\r\x07')
                    row_data.append(cell_text[:80])
                except:
                    row_data.append("[MERGED]")
            print(f"  R{ri}: {row_data}")

    doc.Close(False)
finally:
    word.Quit()
