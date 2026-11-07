#!/usr/bin/env python3
"""Generate ACADEMY-COMPLETE-SPEC.pdf from markdown and copy to Google Drive."""
from pathlib import Path
import re
import shutil

try:
    from fpdf import FPDF
except ImportError:
    raise SystemExit("pip install fpdf2")

ROOT = Path(__file__).resolve().parent
MD = ROOT / "ACADEMY-COMPLETE-SPEC.md"
PDF = ROOT / "ACADEMY-COMPLETE-SPEC.pdf"
GDRIVE_DIR = Path(r"C:/Users/alan/Google Drive/Claude shared resources")
GDRIVE_LATEST = GDRIVE_DIR / "ACADEMY-COMPLETE-SPEC-LATEST.pdf"
GDRIVE_MD = GDRIVE_DIR / "ACADEMY-COMPLETE-SPEC-LATEST.md"


class Pdf(FPDF):
    def footer(self):
        self.set_y(-12)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(100, 100, 100)
        self.cell(
            0,
            8,
            f"Alan Ranger Academy Complete Spec v1.1  |  Page {self.page_no()}",
            align="C",
        )


def clean(text: str) -> str:
    text = text.replace("\u2014", "-").replace("\u2013", "-")
    text = text.replace("\u2018", "'").replace("\u2019", "'")
    text = text.replace("\u201c", '"').replace("\u201d", '"')
    text = re.sub(r"\*\*([^*]+)\*\*", r"\1", text)
    text = text.replace("`", "")
    out = text.encode("latin-1", "replace").decode("latin-1")
    return out if out.strip() else " "


def render_md(pdf: Pdf, md: str) -> None:
    lines = md.splitlines()
    in_table = False
    table: list[list[str]] = []

    def flush_table():
        nonlocal in_table, table
        if not table:
            return
        pdf.set_font("Helvetica", "", 8)
        for row in table:
            if all(re.match(r"^[-:]+$", c.strip()) for c in row):
                continue
            line = " | ".join(clean(c) for c in row)
            write_para(line, 4)
        table = []
        in_table = False
        pdf.ln(2)

    def write_para(text: str, h: float = 5) -> None:
        pdf.set_x(pdf.l_margin)
        pdf.multi_cell(pdf.w - pdf.l_margin - pdf.r_margin, h, text)

    for line in lines:
        if line.startswith("|") and line.endswith("|"):
            in_table = True
            table.append([c.strip() for c in line[1:-1].split("|")])
            continue
        if in_table:
            flush_table()

        if line.startswith("# "):
            pdf.ln(4)
            pdf.set_font("Helvetica", "B", 16)
            pdf.set_text_color(15, 61, 92)
            write_para(clean(line[2:]), 9)
            pdf.set_text_color(0, 0, 0)
        elif line.startswith("## "):
            pdf.ln(3)
            pdf.set_font("Helvetica", "B", 13)
            pdf.set_text_color(21, 101, 168)
            write_para(clean(line[3:]), 8)
            pdf.set_text_color(0, 0, 0)
        elif line.startswith("### "):
            pdf.ln(2)
            pdf.set_font("Helvetica", "B", 11)
            write_para(clean(line[4:]), 7)
        elif line.strip() == "---":
            pdf.ln(2)
            pdf.set_draw_color(200, 200, 200)
            pdf.line(pdf.l_margin, pdf.get_y(), pdf.w - pdf.r_margin, pdf.get_y())
            pdf.ln(4)
        elif line.startswith("- "):
            pdf.set_font("Helvetica", "", 9)
            write_para(clean("  * " + line[2:]))
        elif line.startswith("```"):
            continue
        elif line.strip() == "":
            pdf.ln(2)
        elif line.strip().startswith("=") or line.strip().startswith("["):
            pdf.set_font("Courier", "", 7)
            write_para(clean(line), 3.5)
            pdf.set_font("Helvetica", "", 9)
        else:
            pdf.set_font("Helvetica", "", 9)
            write_para(clean(line))


def main():
    md = MD.read_text(encoding="utf-8")
    pdf = Pdf()
    pdf.set_auto_page_break(auto=True, margin=14)
    pdf.add_page()
    pdf.set_margins(12, 12, 12)
    render_md(pdf, md)
    pdf.output(str(PDF))
    print("PDF written:", PDF)
    try:
        GDRIVE_DIR.mkdir(parents=True, exist_ok=True)
        shutil.copy2(PDF, GDRIVE_LATEST)
        shutil.copy2(MD, GDRIVE_MD)
        print("Copied PDF to:", GDRIVE_LATEST)
        print("Copied MD to:", GDRIVE_MD)
    except OSError as e:
        print("Google Drive copy skipped:", e)


if __name__ == "__main__":
    main()
