from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate, Frame, PageBreak, PageTemplate, Paragraph, Spacer, Table, TableStyle,
    KeepTogether, Flowable,
)

OUT = "output/pdf/panduan-alur-kerja-sistem-klaim.pdf"
PAGE_W, PAGE_H = A4
MARGIN = 18 * mm
BLUE = colors.HexColor("#155EEF")
NAVY = colors.HexColor("#0B1F4D")
INK = colors.HexColor("#172B4D")
MUTED = colors.HexColor("#52606D")
PALE_BLUE = colors.HexColor("#EAF2FF")
PALE_ORANGE = colors.HexColor("#FFF4E5")
PALE_GREEN = colors.HexColor("#EAF8EF")
PALE_RED = colors.HexColor("#FFF0F0")
BORDER = colors.HexColor("#D8E2F0")


class FlowDiagram(Flowable):
    def __init__(self, width):
        super().__init__()
        self.width = width
        self.height = 165 * mm

    def draw_box(self, canvas, y, title, detail, fill):
        x, w, h = 16 * mm, self.width - 32 * mm, 20 * mm
        canvas.setFillColor(fill)
        canvas.setStrokeColor(BORDER)
        canvas.roundRect(x, y, w, h, 4 * mm, fill=1, stroke=1)
        canvas.setFillColor(NAVY)
        canvas.setFont("Helvetica-Bold", 10)
        canvas.drawCentredString(self.width / 2, y + 12 * mm, title)
        canvas.setFillColor(MUTED)
        canvas.setFont("Helvetica", 8.2)
        canvas.drawCentredString(self.width / 2, y + 6 * mm, detail)

    def arrow(self, canvas, y1, y2):
        x = self.width / 2
        canvas.setStrokeColor(BLUE)
        canvas.setFillColor(BLUE)
        canvas.setLineWidth(1.5)
        canvas.line(x, y1, x, y2)
        canvas.line(x, y2, x - 2.2 * mm, y2 + 3 * mm)
        canvas.line(x, y2, x + 2.2 * mm, y2 + 3 * mm)

    def draw(self):
        c = self.canv
        rows = [
            (142 * mm, "1. Data Klaim Masuk", "Klaim disimpan ke database Firebase", PALE_BLUE),
            (109 * mm, "2. Analisis Risiko", "Skor risiko dan indikator anomali dihitung", PALE_ORANGE),
            (76 * mm, "3. Deteksi Kandidat", "Tagihan ganda dan anomali ditinjau petugas", PALE_ORANGE),
            (43 * mm, "4. Pusat Verifikasi", "Klaim diajukan untuk keputusan final", PALE_BLUE),
            (10 * mm, "5. Keputusan dan Log Audit", "Disetujui atau ditolak dengan alasan", PALE_GREEN),
        ]
        for i, (y, title, detail, fill) in enumerate(rows):
            self.draw_box(c, y, title, detail, fill)
            if i < len(rows) - 1:
                self.arrow(c, y - 2 * mm, y - 11 * mm)


def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(BORDER)
    canvas.line(MARGIN, 13 * mm, PAGE_W - MARGIN, 13 * mm)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(MARGIN, 8.5 * mm, "Panduan Umum Sistem Deteksi Fraud Klaim")
    canvas.drawRightString(PAGE_W - MARGIN, 8.5 * mm, f"Halaman {doc.page}")
    canvas.restoreState()


def bullet(text, style):
    return Paragraph(f'<font color="#155EEF">&#8226;</font>&nbsp;&nbsp;{text}', style)


def section_title(number, title, styles):
    return Paragraph(f'<font color="#155EEF"><b>{number}.</b></font>&nbsp;&nbsp;<b>{title}</b>', styles["section"])


def make_pdf():
    doc = BaseDocTemplate(
        OUT,
        pagesize=A4,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=17 * mm,
        bottomMargin=20 * mm,
    )
    doc.addPageTemplates([PageTemplate(id="main", frames=[Frame(MARGIN, 20 * mm, PAGE_W - 2 * MARGIN, PAGE_H - 37 * mm, id="normal")], onPage=footer)])
    base = getSampleStyleSheet()
    styles = {
        "cover": ParagraphStyle("cover", parent=base["Title"], fontName="Helvetica-Bold", fontSize=25, leading=30, textColor=NAVY, spaceAfter=6 * mm),
        "subtitle": ParagraphStyle("subtitle", parent=base["Normal"], fontSize=11, leading=16, textColor=MUTED, spaceAfter=7 * mm),
        "section": ParagraphStyle("section", parent=base["Heading2"], fontName="Helvetica-Bold", fontSize=14, leading=18, textColor=INK, spaceBefore=4 * mm, spaceAfter=3 * mm),
        "body": ParagraphStyle("body", parent=base["BodyText"], fontSize=9.6, leading=14, textColor=INK, spaceAfter=2.5 * mm),
        "bullet": ParagraphStyle("bullet", parent=base["BodyText"], fontSize=9.5, leading=14, textColor=INK, leftIndent=4 * mm, spaceAfter=1.8 * mm),
        "small": ParagraphStyle("small", parent=base["BodyText"], fontSize=8.5, leading=12, textColor=MUTED),
        "callout": ParagraphStyle("callout", parent=base["BodyText"], fontSize=9.5, leading=14, textColor=INK),
    }
    story = []
    story.append(Spacer(1, 13 * mm))
    story.append(Paragraph("PANDUAN UMUM", ParagraphStyle("kicker", parent=base["Normal"], fontName="Helvetica-Bold", fontSize=10, textColor=BLUE, tracking=1.2)))
    story.append(Spacer(1, 3 * mm))
    story.append(Paragraph("Alur Kerja Sistem Deteksi Fraud Klaim", styles["cover"]))
    story.append(Paragraph("Panduan singkat untuk memahami perjalanan klaim, mulai dari data masuk hingga keputusan akhir di Pusat Verifikasi.", styles["subtitle"]))
    intro = Table([[Paragraph("<b>Tujuan sistem</b><br/>Membantu petugas menemukan dan memprioritaskan klaim yang perlu ditinjau.", styles["callout"]), Paragraph("<b>Prinsip utama</b><br/>Sistem memberi rekomendasi; keputusan akhir tetap dibuat oleh petugas berwenang.", styles["callout"]) ]], colWidths=[(PAGE_W - 2*MARGIN)/2]*2)
    intro.setStyle(TableStyle([("BACKGROUND", (0,0), (0,0), PALE_BLUE), ("BACKGROUND", (1,0), (1,0), PALE_GREEN), ("BOX", (0,0), (-1,-1), .5, BORDER), ("INNERGRID", (0,0), (-1,-1), .5, BORDER), ("VALIGN", (0,0), (-1,-1), "TOP"), ("LEFTPADDING", (0,0), (-1,-1), 5*mm), ("RIGHTPADDING", (0,0), (-1,-1), 5*mm), ("TOPPADDING", (0,0), (-1,-1), 5*mm), ("BOTTOMPADDING", (0,0), (-1,-1), 5*mm)]))
    story += [intro, PageBreak(), Paragraph("Gambaran alur", styles["cover"]), FlowDiagram(PAGE_W - 2 * MARGIN), PageBreak()]

    story.append(Paragraph("Tahapan kerja", styles["cover"]))
    stages = [
        ("1", "Data klaim masuk ke database", "Data dari faskes atau sumber resmi diimpor ke Firebase. Setiap klaim memuat ID klaim, tanggal pengajuan, pasien, faskes, diagnosis, tindakan, dan nilai klaim."),
        ("2", "Monitoring klaim dan perhitungan risiko", "Sistem menampilkan seluruh klaim pada Monitoring Klaim dan menghitung skor risiko sebagai dasar penentuan prioritas peninjauan."),
        ("3", "Deteksi Tagihan Ganda", "Sistem mencari klaim yang memiliki kemiripan tinggi berdasarkan pasien, diagnosis, tindakan, serta jarak waktu pengajuan. Petugas memilih kandidat yang perlu diperiksa lalu menekan Tindak Lanjuti."),
        ("4", "Deteksi Anomali", "Sistem menandai pola tidak biasa, misalnya biaya tidak wajar, dugaan upcoding, tagihan berulang, atau prosedur yang tidak sesuai pola. Petugas dapat menekan Tindak Lanjuti untuk mengajukan klaim."),
        ("5", "Pusat Verifikasi", "Setiap klaim yang ditindaklanjuti dari kedua menu deteksi masuk ke antrean Pusat Verifikasi. Verifikator memeriksa detail dan memberikan alasan keputusan."),
        ("6", "Keputusan final dan audit", "Verifikator memilih Disetujui atau Ditolak. Keputusan serta alasannya dicatat dalam Log Audit sebagai riwayat yang dapat ditelusuri."),
    ]
    for n, title, desc in stages:
        story += [section_title(n, title, styles), Paragraph(desc, styles["body"])]
    story.append(Spacer(1, 4 * mm))
    note = Table([[Paragraph("<b>Catatan penting</b><br/>Skor risiko, tagihan ganda, dan anomali adalah indikator untuk membantu prioritas kerja. Indikator tersebut bukan keputusan penolakan otomatis.", styles["callout"]) ]], colWidths=[PAGE_W - 2*MARGIN])
    note.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,-1), PALE_ORANGE), ("BOX", (0,0), (-1,-1), .6, colors.HexColor("#F5C36D")), ("LEFTPADDING", (0,0), (-1,-1), 5*mm), ("RIGHTPADDING", (0,0), (-1,-1), 5*mm), ("TOPPADDING", (0,0), (-1,-1), 4*mm), ("BOTTOMPADDING", (0,0), (-1,-1), 4*mm)]))
    story += [note, PageBreak()]

    story.append(Paragraph("Pusat Verifikasi dan peran pengguna", styles["cover"]))
    story.append(Paragraph("Antrean dan status", styles["section"]))
    data = [
        [Paragraph("<b>Status</b>", styles["body"]), Paragraph("<b>Arti</b>", styles["body"]), Paragraph("<b>Tindakan</b>", styles["body"])],
        ["Menunggu Verifikasi", "Klaim telah diajukan dari menu deteksi dan belum diputuskan.", "Periksa bukti dan detail klaim."],
        ["Disetujui", "Klaim dinilai wajar berdasarkan verifikasi.", "Keputusan tersimpan di Log Audit."],
        ["Ditolak", "Klaim memiliki alasan yang cukup untuk tidak disetujui.", "Alasan penolakan tersimpan di Log Audit."],
    ]
    table = Table([[Paragraph(cell, styles["small"]) if isinstance(cell, str) else cell for cell in row] for row in data], colWidths=[35*mm, 72*mm, 52*mm], repeatRows=1)
    table.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,0), NAVY), ("TEXTCOLOR", (0,0), (-1,0), colors.white), ("BACKGROUND", (0,1), (-1,-1), colors.white), ("GRID", (0,0), (-1,-1), .45, BORDER), ("VALIGN", (0,0), (-1,-1), "TOP"), ("LEFTPADDING", (0,0), (-1,-1), 4*mm), ("RIGHTPADDING", (0,0), (-1,-1), 4*mm), ("TOPPADDING", (0,0), (-1,-1), 3.5*mm), ("BOTTOMPADDING", (0,0), (-1,-1), 3.5*mm)]))
    story += [table, Spacer(1, 7*mm), Paragraph("Pembagian peran", styles["section"])]
    roles = [
        ("Petugas pemantau", "Memantau klaim dan melihat indikator risiko."),
        ("Verifikator", "Menindaklanjuti kandidat, memeriksa antrean, dan membuat keputusan final."),
        ("Auditor", "Menelaah pola risiko serta menggunakan hasil verifikasi untuk audit lanjutan."),
        ("Supervisor / Super Admin", "Memantau proses, laporan, log audit, dan pengaturan sistem sesuai kewenangan."),
    ]
    for role, desc in roles:
        story.append(bullet(f"<b>{role}</b> - {desc}", styles["bullet"]))
    story += [Spacer(1, 5*mm), Paragraph("Ringkasan SOP", styles["section"])]
    for text in [
        "Pastikan data klaim lengkap sebelum diproses.",
        "Gunakan hasil deteksi sebagai prioritas, bukan keputusan otomatis.",
        "Ajukan hanya kandidat yang perlu diperiksa melalui tombol Tindak Lanjuti.",
        "Sertakan alasan ketika menyetujui atau menolak klaim.",
        "Gunakan Log Audit untuk penelusuran dan pertanggungjawaban keputusan.",
    ]:
        story.append(bullet(text, styles["bullet"]))
    doc.build(story)


if __name__ == "__main__":
    make_pdf()
