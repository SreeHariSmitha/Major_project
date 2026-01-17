import streamlit as st
import json
import time
from core.llm import GrokClient
from core.adk import SequentialAgent
from agents.impl import (
    IdeaUnderstandingAgent,
    MarketFeasibilityAgent,
    CompetitorAnalysisAgent,
    ValidationReportAgent,
    BusinessModelAgent,
    PitchContentAgent
)

# Page Configuration
st.set_page_config(
    page_title="DeepSeek/Grok Startup Validator",
    page_icon="🚀",
    layout="wide"
)

# Title and Intro
st.title("🚀 AI Startup Validator")
st.markdown("""
This agentic system uses **Grok (Llama 3)** to validate your startup idea through a pipeline of 6 specialized autonomous agents.
""")

# Initialize Session State
if "messages" not in st.session_state:
    st.session_state.messages = []
if "validation_result" not in st.session_state:
    st.session_state.validation_result = None

# Display Chat History
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# Callback for Agent Progress
def progress_callback(status, output):
    with st.chat_message("assistant"):
        with st.status(status, expanded=False) as s:
            if output:
                st.json(output)
            s.update(label=status, state="complete")

# Main Execution Logic
def run_validation(idea):
    client = GrokClient()
    agents = [
        IdeaUnderstandingAgent(client),
        MarketFeasibilityAgent(client),
        CompetitorAnalysisAgent(client),
        ValidationReportAgent(client),
        BusinessModelAgent(client),
        PitchContentAgent(client)
    ]
    orchestrator = SequentialAgent("Startup Validator Pipeline", agents)
    
    # Run Pipeline with UI Feedback
    return orchestrator.run(idea, on_progress_callback=progress_callback)

# Chat Input
if prompt := st.chat_input("Describe your startup idea..."):
    # Add user message to state and display
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # Run Agents
    with st.chat_message("assistant"):
        st.write("🤖 **Initializing Agent Pipeline...**")
        
        try:
            # We use a container to hold the progress updates so they don't clutter main chat permanently
            # But specific agent outputs are nice to see.
            # Let's just run it. The callback handles the sub-messages.
            
            final_context = run_validation(prompt)
            st.session_state.validation_result = final_context
            
            # Format Final Report
            report = final_context.get("validation_summary", "No summary generated.")
            score = final_context.get("overall_score", "N/A")
            verdict = final_context.get("verdict", "N/A")
            
            response_text = f"""
### ✅ Validation Complete
**Verdict**: {verdict}  
**Overall Score**: {score}/10

**Summary**:  
{report}
            """
            st.markdown(response_text)
            st.session_state.messages.append({"role": "assistant", "content": response_text})

        except Exception as e:
            st.error(f"An error occurred: {e}")

from utils.viz import Visualizer
from utils.pdf_gen import generate_pdf_report

# Display Results & Downloads if available
if st.session_state.validation_result:
    result = st.session_state.validation_result
    
    # 1. Generate Visualizations (Happens silently)
    viz = Visualizer()
    market_trend = result.get("market_trend_data", {})
    competitor_scores = result.get("competitor_scores", {})
    
    trend_chart_path = viz.generate_trend_chart(market_trend) if market_trend else None
    comp_chart_path = viz.generate_competitor_chart(competitor_scores) if competitor_scores else None
    
    st.divider()
    st.subheader("📊 Detailed Results")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.write("### Market Stats")
        st.write(f"**Market Size**: {result.get('market_size_estimate', 'N/A')}")
        st.write(f"**Growth**: {result.get('growth_potential', 'N/A')}")
        if trend_chart_path:
            st.image(trend_chart_path, caption="Market Trend (Simulated)")
        
    with col2:
        st.write("### Competitors")
        st.write(f"**Risk**: {result.get('competition_risk', 'N/A')}")
        if comp_chart_path:
            st.image(comp_chart_path, caption="Competitor Comparison")

    # 2. Generate PDF
    with st.spinner("Generating Professional PDF Report..."):
        pdf_filename = generate_pdf_report(result, trend_chart=trend_chart_path, competitor_chart=comp_chart_path)
    
    # Download Buttons
    st.divider()
    c1, c2 = st.columns(2)
    
    with c1:
        with open(pdf_filename, "rb") as pdf_file:
            st.download_button(
                label="📄 Download Professional Report (PDF)",
                data=pdf_file,
                file_name="Startup_Validation_Report.pdf",
                mime="application/pdf"
            )
        
    with c2:
        # JSON fallback
        json_str = json.dumps(result, indent=2)
        st.download_button(
            label="📥 Download Raw Data (JSON)",
            data=json_str,
            file_name="validation_report.json",
            mime="application/json"
        )
