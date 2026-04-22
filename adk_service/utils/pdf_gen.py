"""PDF report generation — ported verbatim from legacy googleADK/utils/pdf_gen.py.

Kept for future use by the pitch-deck-as-PDF export feature. Not called from
the core agent pipeline.
"""

from fpdf import FPDF
import os


class PDFReport(FPDF):
    def header(self):
        self.set_font("Arial", "B", 15)
        self.cell(0, 10, "Startup Validation Report", 0, 1, "C")
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font("Arial", "I", 8)
        self.cell(0, 10, f"Page {self.page_no()}", 0, 0, "C")

    def chapter_title(self, title):
        self.set_font("Arial", "B", 12)
        self.set_fill_color(200, 220, 255)
        self.cell(0, 10, title, 0, 1, "L", 1)
        self.ln(4)

    def chapter_body(self, body):
        self.set_font("Arial", "", 11)
        self.multi_cell(0, 6, body)
        self.ln()

    def add_plot(self, image_path, title):
        if image_path and os.path.exists(image_path):
            self.add_page()
            self.chapter_title(title)
            self.image(image_path, x=10, w=190)
            self.ln()


def _safe_text(text):
    if not isinstance(text, str):
        text = str(text)
    return text.encode("latin-1", "replace").decode("latin-1")


def generate_pdf_report(context, filename="validation_report.pdf", trend_chart=None, competitor_chart=None):
    pdf = PDFReport()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    original_idea = context.get("original_idea", "Startup Idea")
    score = context.get("overall_score", "N/A")
    verdict = context.get("verdict", "N/A")

    pdf.set_font("Arial", "B", 20)
    pdf.ln(20)
    pdf.multi_cell(0, 10, f"Idea: {_safe_text(original_idea)[:100]}...", 0, "C")
    pdf.ln(20)

    pdf.set_font("Arial", "B", 14)
    pdf.cell(0, 10, f"Verdict: {_safe_text(verdict)}", 0, 1, "C")
    pdf.cell(0, 10, f"Feasibility Score: {score}/10", 0, 1, "C")
    pdf.ln(20)

    report_content = context.get("report_content", {})
    if not report_content:
        report_content = {
            "executive_summary": context.get("validation_summary", "No summary available."),
            "business_model": str(context.get("business_model", {})),
        }

    sections = [
        ("Executive Summary", "executive_summary"),
        ("Problem Statement", "problem_statement"),
        ("Solution Overview", "solution_overview"),
        ("Market Analysis", "market_analysis"),
        ("Competitor Analysis", "competitor_analysis"),
        ("Business Model", "business_model"),
        ("Strategy & Risks", "strategy_and_risks"),
        ("Conclusion", "conclusion"),
    ]

    for title, key in sections:
        content = report_content.get(key)
        if content:
            if pdf.get_y() > 250:
                pdf.add_page()
            pdf.ln(5)
            pdf.chapter_title(_safe_text(title))
            pdf.chapter_body(_safe_text(content))

            if key == "market_analysis" and trend_chart:
                if pdf.get_y() > 200:
                    pdf.add_page()
                pdf.ln(5)
                pdf.image(trend_chart, x=20, w=170)
                pdf.ln(5)

            if key == "competitor_analysis" and competitor_chart:
                if pdf.get_y() > 200:
                    pdf.add_page()
                pdf.ln(5)
                pdf.image(competitor_chart, x=20, w=170)
                pdf.ln(5)

    pdf.output(filename)
    return filename
