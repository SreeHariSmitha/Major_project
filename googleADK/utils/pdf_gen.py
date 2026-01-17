from fpdf import FPDF
import os

class PDFReport(FPDF):
    def header(self):
        # Logo or Title can go here
        self.set_font('Arial', 'B', 15)
        self.cell(0, 10, 'Startup Validation Report', 0, 1, 'C')
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

    def chapter_title(self, title):
        self.set_font('Arial', 'B', 12)
        self.set_fill_color(200, 220, 255)
        self.cell(0, 10, title, 0, 1, 'L', 1)
        self.ln(4)

    def chapter_body(self, body):
        self.set_font('Arial', '', 11)
        self.multi_cell(0, 6, body)
        self.ln()

    def add_plot(self, image_path, title):
        if image_path and os.path.exists(image_path):
            self.add_page()
            self.chapter_title(title)
            self.image(image_path, x=10, w=190)
            self.ln()

def generate_pdf_report(context, filename="validation_report.pdf", trend_chart=None, competitor_chart=None):
    pdf = PDFReport()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    
    # 1. Cover Page Info
    original_idea = context.get("original_idea", "Startup Idea")
    score = context.get("overall_score", "N/A")
    verdict = context.get("verdict", "N/A")
    
    # Helper definitions re-validation (since scope is tricky with previous replacement, let's just do inline fix or define helper at top)
    # Actually, previous chunk defined safe_text inside generate_pdf_report, so we can use it if we are conceptually below it,
    # but I am editing lines ABOVE it. So I should probably move the helper definition to be global or top of function.
    # To be safe, I'll use the .encode('latin-1', 'replace') logic inline here for the cover page.
    
    safe_idea = original_idea.encode('latin-1', 'replace').decode('latin-1')
    safe_verdict = str(verdict).encode('latin-1', 'replace').decode('latin-1')
    
    pdf.set_font('Arial', 'B', 20)
    pdf.ln(20)
    pdf.multi_cell(0, 10, f"Idea: {safe_idea[:100]}...", 0, 'C')
    pdf.ln(20)
    
    pdf.set_font('Arial', 'B', 14)
    pdf.cell(0, 10, f"Verdict: {safe_verdict}", 0, 1, 'C')
    pdf.cell(0, 10, f"Feasibility Score: {score}/10", 0, 1, 'C')
    pdf.ln(20)

    # Helper to encode text safe for latin-1 fpdf
    def safe_text(text):
        if not isinstance(text, str):
            text = str(text)
        return text.encode('latin-1', 'replace').decode('latin-1')

    # 2. Main Content Sections (From Agent 6's Report Content)
    report_content = context.get("report_content", {})
    if not report_content:
        # Fallback if Agent 6 didn't output the right key
        # Try to use pitch deck content or raw summary
        report_content = {
            "Executive Summary": context.get("validation_summary", "No summary available."),
            "Business Model": str(context.get("business_model", {})),
            "Pitch Content (Fallback)": str(context.get("pitch_deck_content", {}))
        }

    # Iterate through known logical sections for specific ordering
    sections = [
        ("Executive Summary", "executive_summary"),
        ("Problem Statement", "problem_statement"),
        ("Solution Overview", "solution_overview"),
        ("Market Analysis", "market_analysis"),
        ("Competitor Analysis", "competitor_analysis"), 
        ("Business Model", "business_model"),
        ("Strategy & Risks", "strategy_and_risks"),
        ("Conclusion", "conclusion")
    ]
    
    for title, key in sections:
        content = report_content.get(key)
        if content:
           # Check if there is enough space (approx 40mm) for title + some text
           # If not, add page.
           if pdf.get_y() > 250: 
               pdf.add_page()
               
           pdf.ln(5)
           pdf.chapter_title(safe_text(title))
           pdf.chapter_body(safe_text(content))
           
           # Insert relevant charts
           if key == "market_analysis" and trend_chart:
               if pdf.get_y() > 200: pdf.add_page()
               pdf.ln(5)
               pdf.image(trend_chart, x=20, w=170)
               pdf.ln(5)
           
           if key == "competitor_analysis" and competitor_chart:
               if pdf.get_y() > 200: pdf.add_page()
               pdf.ln(5)
               pdf.image(competitor_chart, x=20, w=170)
               pdf.ln(5)

    pdf.output(filename)
    return filename
