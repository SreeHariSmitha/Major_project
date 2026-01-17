from abc import ABC, abstractmethod
from typing import List, Dict, Any

class BaseAgent(ABC):
    """
    Abstract base class for all agents, mimicking Google ADK's pattern.
    """
    def __init__(self, name: str, client):
        self.name = name
        self.client = client

    @abstractmethod
    def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the agent's logic.
        Args:
            context: The cumulative context from previous agents.
        Returns:
            The output of this agent, to be merged into the context.
        """
        pass

class SequentialAgent(BaseAgent):
    """
    Orchestrates a list of agents sequentially.
    """
    def __init__(self, name: str, agents: List[BaseAgent]):
        super().__init__(name, None) # Orchestrator doesn't necessarily need a client itself
        self.agents = agents

    def run(self, initial_input: Any, on_progress_callback=None) -> Dict[str, Any]:
        """
        Runs the agents in sequence.
        Args:
            initial_input: The initial input (e.g., the user's startup idea).
            on_progress_callback: Optional callable(agent_name, output) to report progress.
        Returns:
            The final cumulative context.
        """
        context = {"original_idea": initial_input}
        print(f"\n--- Starting Pipeline: {self.name} ---")
        
        for agent in self.agents:
            print(f"\n[Orchestrator] Running {agent.name}...")
            if on_progress_callback:
                on_progress_callback(f"Running {agent.name}...", None)
                
            try:
                # Run the agent
                output = agent.run(context)
                
                # Update context with the agent's output
                if output:
                    context.update(output)
                    print(f"[Orchestrator] {agent.name} completed.")
                    if on_progress_callback:
                        on_progress_callback(f"Completed {agent.name}", output)
                else:
                    print(f"[Orchestrator] {agent.name} returned no output.")
            except Exception as e:
                print(f"[Orchestrator] Error in {agent.name}: {e}")
                if on_progress_callback:
                    on_progress_callback(f"Error in {agent.name}", {"error": str(e)})
                raise

        print(f"\n--- Pipeline Completed ---")
        return context
