from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
import os


def export_pdf(report, filename="reports/report.pdf"):
    """
    Export the research report to a PDF file.
    """

    os.makedirs("reports", exist_ok=True)

    styles = getSampleStyleSheet()
    doc = SimpleDocTemplate(filename)

    story = []

    for line in report.split("\n"):
        if line.strip():
            story.append(Paragraph(line, styles["BodyText"]))

    doc.build(story)

    print(f"✅ PDF saved to {filename}")