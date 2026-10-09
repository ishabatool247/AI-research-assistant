from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet


def save_pdf(report, filename="reports/report.pdf"):
    doc = SimpleDocTemplate(filename)

    styles = getSampleStyleSheet()

    story = []

    for line in report.split("\n"):
        story.append(Paragraph(line.replace("\t", "    "), styles["BodyText"]))

    doc.build(story)

    print(f"\n✅ PDF saved as {filename}")