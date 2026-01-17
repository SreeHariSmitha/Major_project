import requests
import json
from config import GROK_API_KEY, GROK_BASE_URL, GROK_MODEL

def test():
    print(f"Testing Grok API with model: {GROK_MODEL}")
    url = f"{GROK_BASE_URL}/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROK_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": GROK_MODEL,
        "messages": [{"role": "user", "content": "Hello"}],
        "max_tokens": 10
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print(f"Success! Response: {response.json()['choices'][0]['message']['content']}")
        else:
            print(f"Error Response: {response.text}")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test()
