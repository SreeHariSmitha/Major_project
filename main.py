import sys
import json
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

def main():
    # 1. Get User Input
    if len(sys.argv) > 1:
        idea = " ".join(sys.argv[1:])
    else:
        print("Please provide a startup idea.")
        idea = input("Startup Idea: ")

    if not idea:
        print("No idea provided. Exiting.")
        return

    # 2. Initialize Client
    client = GrokClient()

    # 3. Initialize Agents
    agents = [
        IdeaUnderstandingAgent(client),
        MarketFeasibilityAgent(client),
        CompetitorAnalysisAgent(client),
        ValidationReportAgent(client),
        BusinessModelAgent(client),
        PitchContentAgent(client)
    ]

    # 4. Initialize Orchestrator
    orchestrator = SequentialAgent("Startup Validator Pipeline", agents)

    # 5. Run Pipeline
    try:
        final_context = orchestrator.run(idea)
        
        # 6. Output Results
        # We'll save the full output to a file and print the key pitch content
        with open("validation_output.json", "w") as f:
            json.dump(final_context, f, indent=2)
        
        print("\n" + "="*50)
        print("VALIDATION COMPLETE")
        print("="*50)
        
        if "pitch_deck_content" in final_context:
            print("\n--- PITCH DECK CONTENT ---\n")
            print(json.dumps(final_context["pitch_deck_content"], indent=2))
        else:
            print("Pitch deck content not found in final output.")
            
    except Exception as e:
        print(f"Pipeline execution failed: {e}")

if __name__ == "__main__":
    main()
