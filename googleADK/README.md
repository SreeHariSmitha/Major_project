# Startup Idea Validator

A multi-agent AI system that validates startup ideas using a "Google ADK" style orchestration pattern and Grok (Llama 3) LLM.

## Setup

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configuration**
   - The API key is pre-configured in `config.py`.
   - You can also set it via environment variable `GROK_API_KEY`.

## Usage

Run the main script with your startup idea enclosed in quotes:

```bash
python main.py "Your startup idea description here"
```

### Example
```bash
python main.py "A subscription service for eco-friendly baby toys"
```

## Output
- The script prints progress to the console.
- **Detailed JSON Report**: Saved to `validation_output.json`.
- **Pitch Deck**: The final pitch deck content is printed to the console at the end.
