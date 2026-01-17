import json
from core.adk import BaseAgent
from agents.definitions import (
    AGENT_1_SYSTEM, AGENT_2_SYSTEM, AGENT_3_SYSTEM, 
    AGENT_4_SYSTEM, AGENT_5_SYSTEM, AGENT_6_SYSTEM
)

class AgentImpl(BaseAgent):
    def __init__(self, name, client, system_instruction, input_keys):
        super().__init__(name, client)
        self.system_instruction = system_instruction
        self.input_keys = input_keys

    def _format_context(self, context):
        """Helper to format relevant context for the LLM."""
        formatted = ""
        for key in self.input_keys:
            if key in context:
                formatted += f"[{key.upper()}]:\n{json.dumps(context[key], indent=2)}\n\n"
            elif key == "original_idea": # Special case for raw input
                formatted += f"[STARTUP IDEA]:\n{context['original_idea']}\n\n"
        return formatted

    def run(self, context):
        prompt = self._format_context(context)
        prompt += "\nBased on the information above, generate the required JSON output."
        
        response_content = self.client.generate(prompt, system_instruction=self.system_instruction)
        
        # Robust JSON parsing
        try:
            # Cleanup markdown code blocks if present
            cleaned_response = response_content.replace("```json", "").replace("```", "").strip()
            return json.loads(cleaned_response)
        except json.JSONDecodeError:
            print(f"[{self.name}] Failed to parse JSON. Raw output: {response_content[:100]}...")
            return {"raw_output": response_content}

# Concrete Agent Classes

class IdeaUnderstandingAgent(AgentImpl):
    def __init__(self, client):
        super().__init__("Agent 1 - Idea Understanding", client, AGENT_1_SYSTEM, ["original_idea"])

class MarketFeasibilityAgent(AgentImpl):
    def __init__(self, client):
        super().__init__("Agent 2 - Market Feasibility", client, AGENT_2_SYSTEM, ["problem", "solution", "target_users"])
        # Note: Depending on what Agent 1 outputs, we might need to adjust input keys. 
        # But since Agent 1 merges its output into context, we can access the keys it produced.
        # Actually, best to pass the 'whole' previous agent output if possible, 
        # but here we'll grab specific keys Agent 1 is expected to produce.
        # Agent 1 produces: problem, solution, target_users, domain, assumptions.
        # I'll just pass 'problem', 'solution', 'target_users' as primary inputs.
        
    def run(self, context):
        # Overriding run slightly to ensure we catch all fields from Agent 1
        # or we just pass them all. 
        # Let's make it smarter: Just dump the relevant parts of context.
        return super().run(context)

class CompetitorAnalysisAgent(AgentImpl):
    def __init__(self, client):
        super().__init__("Agent 3 - Competitor Analysis", client, AGENT_3_SYSTEM, ["problem", "solution", "market_need", "market_size_estimate"])

class ValidationReportAgent(AgentImpl):
    def __init__(self, client):
        super().__init__("Agent 4 - Validation Report", client, AGENT_4_SYSTEM, 
                         ["problem", "solution", "market_need", "feasibility_score", "competitors", "differentiation"])

class BusinessModelAgent(AgentImpl):
    def __init__(self, client):
        super().__init__("Agent 5 - Business Model", client, AGENT_5_SYSTEM, 
                         ["validation_summary", "solution", "target_users"])

class PitchContentAgent(AgentImpl):
    def __init__(self, client):
        super().__init__("Agent 6 - Pitch Content", client, AGENT_6_SYSTEM, 
                         ["problem", "solution", "market_need", "competitors", "business_model", "validation_summary"])

