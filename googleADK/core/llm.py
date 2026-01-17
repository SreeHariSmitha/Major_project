import requests
import json
from config import GROK_API_KEY, GROK_BASE_URL, GROK_MODEL

class GrokClient:
    def __init__(self, api_key=GROK_API_KEY, base_url=GROK_BASE_URL, model=GROK_MODEL):
        self.api_key = api_key
        self.base_url = base_url
        self.model = model
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    def generate(self, prompt, system_instruction=None, json_mode=True):
        """
        Generates a response from the Grok (Groq) API.
        Args:
            prompt (str): The user prompt.
            system_instruction (str): Optional system instruction.
            json_mode (bool): Whether to enforce JSON output.
        Returns:
            str: The content of the response.
        """
        url = f"{self.base_url}/chat/completions"
        
        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": self.model,
            "messages": messages,
            "stream": False
        }
        
        if json_mode:
            payload["response_format"] = {"type": "json_object"}

        try:
            response = requests.post(url, headers=self.headers, json=payload)
            response.raise_for_status()
            data = response.json()
            return data['choices'][0]['message']['content']
        except requests.exceptions.RequestException as e:
            error_msg = f"Error calling Grok API: {e}"
            if 'response' in locals():
                error_msg += f"\nResponse Content: {response.text}"
            print(error_msg)
            raise Exception(error_msg)
