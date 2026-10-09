import os

def save_markdown(report, filename="reports/report.md"):
    os.makedirs("reports", exist_ok=True)

    with open(filename, "w", encoding="utf-8") as f:
        f.write(report)

    print(f"✅ Markdown saved as {filename}")