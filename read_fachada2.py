import sys
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
import win32com.client

path = r"C:\Users\fabio\Documents\segundo-cerebro\vault\_knowledge\JFX\PEX\PR-019_1 FACHADA.DOC"

word = win32com.client.Dispatch("Word.Application")
word.Visible = False

try:
    doc = word.Documents.Open(path, ReadOnly=True)

    # Print paragraphs from 182 onwards (skip header pages)
    for i, para in enumerate(doc.Paragraphs):
        if i < 160:
            continue
        text = para.Range.Text.strip()
        if text and text != "\r":
            style = para.Style.NameLocal
            print(f"[P{i}] [{style}] {text[:500]}")

    print("\n--- TABELAS ---")
    for ti in range(1, doc.Tables.Count + 1):
        tbl = doc.Tables(ti)
        print(f"\nTabela {ti}: {tbl.Rows.Count} linhas x {tbl.Columns.Count} colunas")
        for ri in range(1, tbl.Rows.Count + 1):
            row_data = []
            for ci in range(1, tbl.Columns.Count + 1):
                try:
                    cell_text = tbl.Cell(ri, ci).Range.Text.strip().rstrip('\r\x07')
                    row_data.append(cell_text[:100])
                except:
                    row_data.append("[MERGED]")
            print(f"  R{ri}: {row_data}")

    doc.Close(False)
finally:
    word.Quit()
