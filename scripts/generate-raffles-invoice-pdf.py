from pathlib import Path


OUTPUT = Path("public/invoices/raffles-malaysian-restaurant-social-media-setup.pdf")


def escape(value: str) -> str:
    return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


class PdfPage:
    def __init__(self) -> None:
        self.parts: list[str] = []

    def color(self, gray: float) -> None:
        self.parts.append(f"{gray} g {gray} G\n")

    def fill_rect(self, x: int, y: int, width: int, height: int, gray: float) -> None:
        self.parts.append(f"{gray} g {x} {y} {width} {height} re f\n0 G\n")

    def stroke_rect(self, x: int, y: int, width: int, height: int, gray: float = 0.82) -> None:
        self.parts.append(f"{gray} G {x} {y} {width} {height} re S\n0 G\n")

    def line(self, x1: int, y1: int, x2: int, y2: int, gray: float = 0.82) -> None:
        self.parts.append(f"{gray} G {x1} {y1} m {x2} {y2} l S\n0 G\n")

    def text(self, x: int, y: int, size: int, value: str, font: str = "F1", gray: float = 0) -> None:
        self.parts.append(
            f"BT {gray} g /{font} {size} Tf 1 0 0 1 {x} {y} Tm ({escape(value)}) Tj ET\n"
        )

    def right_text(self, x: int, y: int, size: int, value: str, font: str = "F1", gray: float = 0) -> None:
        # Helvetica average glyph width is close enough for these fixed labels.
        estimated_width = int(len(value) * size * 0.52)
        self.text(x - estimated_width, y, size, value, font, gray)

    def wrap_text(self, x: int, y: int, size: int, value: str, width: int, line_height: int) -> int:
        words = value.split()
        lines: list[str] = []
        current = ""
        max_chars = max(18, int(width / (size * 0.52)))
        for word in words:
            candidate = f"{current} {word}".strip()
            if len(candidate) > max_chars and current:
                lines.append(current)
                current = word
            else:
                current = candidate
        if current:
            lines.append(current)

        for line in lines:
            self.text(x, y, size, line)
            y -= line_height
        return y

    def bytes(self) -> bytes:
        return "".join(self.parts).encode("latin-1")


page = PdfPage()

# A4 canvas, 595 x 842 pt.
page.fill_rect(0, 0, 595, 842, 0.985)

page.text(54, 780, 18, "Sorted.", "F2")
page.text(54, 720, 34, "Quote + Invoice", "F2")
page.text(54, 692, 16, "Raffles Malaysian Restaurant", "F1", 0.25)

page.text(380, 780, 10, "INVOICE", "F2", 0.35)
page.text(380, 758, 11, "SORTED-RAFFLES-004")
page.text(380, 730, 10, "Issued", "F2", 0.35)
page.text(455, 730, 10, "12 June 2026")
page.text(380, 710, 10, "Due", "F2", 0.35)
page.text(455, 710, 10, "On receipt")

page.fill_rect(54, 600, 487, 42, 0.94)
page.stroke_rect(54, 510, 487, 132)
page.text(74, 616, 10, "Line item", "F2", 0.35)
page.text(454, 616, 10, "Amount", "F2", 0.35)
page.text(74, 565, 15, "Social media setup", "F2")
page.text(74, 542, 11, "One-off setup service for Raffles Malaysian Restaurant.", "F1", 0.3)
page.right_text(520, 565, 15, "\243150.00", "F2")
page.line(54, 510, 541, 510)
page.text(350, 472, 15, "Total due", "F2")
page.right_text(520, 470, 24, "\243150.00", "F2")

page.text(54, 410, 18, "Payment details", "F2")
page.text(54, 386, 11, "Please use these details for UK bank transfer payments.", "F1", 0.3)

rows = [
    ("Name", "Renaldo Lee Edmondson"),
    ("Account number", "17897633"),
    ("Sort code", "23-14-70"),
    ("Bank", "Wise Payments Limited"),
    ("Bank address", "1st Floor, Worship Square, 65 Clifton Street, London, EC2A 4JE, United Kingdom"),
]

y = 344
for label, value in rows:
    page.line(54, y + 22, 541, y + 22, 0.9)
    page.text(54, y, 11, label, "F2", 0.35)
    if label == "Bank address":
        page.wrap_text(190, y, 11, value, 330, 16)
    else:
        page.text(190, y, 12, value)
    y -= 36 if label != "Bank address" else 54

page.line(54, 128, 541, 128, 0.86)
page.text(54, 100, 10, "Prepared by Sorted for Raffles Malaysian Restaurant.", "F1", 0.35)

content = page.bytes()

objects = [
    b"<< /Type /Catalog /Pages 2 0 R >>",
    b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
    b"<< /Length " + str(len(content)).encode("ascii") + b" >>\nstream\n" + content + b"\nendstream",
]

pdf = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
offsets: list[int] = []
for index, obj in enumerate(objects, start=1):
    offsets.append(len(pdf))
    pdf.extend(f"{index} 0 obj\n".encode("ascii"))
    pdf.extend(obj)
    pdf.extend(b"\nendobj\n")

xref_start = len(pdf)
pdf.extend(f"xref\n0 {len(objects) + 1}\n".encode("ascii"))
pdf.extend(b"0000000000 65535 f \n")
for offset in offsets:
    pdf.extend(f"{offset:010d} 00000 n \n".encode("ascii"))
pdf.extend(
    f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref_start}\n%%EOF\n".encode("ascii")
)

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
OUTPUT.write_bytes(pdf)
print(OUTPUT)
