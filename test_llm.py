from core.llm import GrokClient

try:
    client = GrokClient()
    print("Testing Grok API...")
    response = client.generate("Say hello", json_mode=False)
    print(f"Response: {response}")
except Exception as e:
    print(f"Error: {e}")
