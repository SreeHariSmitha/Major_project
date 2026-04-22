# adk_service — Startup Validator ADK agents

FastAPI sidecar that runs the three-phase Startup Validator agent pipeline
using **Google ADK** (`google-adk`) with **Groq / Llama 3.3-70b-versatile**
routed through `LiteLlm`.

This service replaces the legacy custom-orchestration prototype in
`../googleADK/` (kept frozen as a fallback). The Express backend at
`../server/` calls this sidecar over HTTP when `USE_AI_AGENTS=true`.

---

## Architecture

```
React :5173  ──►  Express :5000  ──HTTP──►  FastAPI :8000  ──►  Groq API
                                                   │
                                                   └──►  SQLite sessions.db
```

Three pipelines are exposed over HTTP:

| Endpoint              | Pipeline        | Sub-agents                                                              | Output shape       |
|-----------------------|-----------------|-------------------------------------------------------------------------|--------------------|
| `POST /agents/phase1` | Phase1Pipeline  | IdeaUnderstanding → MarketFeasibility → CompetitorAnalysis → Synthesizer | `IPhase1Data`      |
| `POST /agents/phase2` | Phase2Pipeline  | BusinessModel+Strategy+Risks (single agent)                             | `IPhase2Data`      |
| `POST /agents/phase3` | Phase3Pipeline  | PitchDeckGenerator (single agent, 10 slides)                            | `IPhase3Data`      |

Output shapes map 1:1 to the Mongo schemas in `server/src/models/Idea.ts` so
the Express controller can write the response straight into the database.

---

## Setup

### 1. Python 3.9+ recommended

```bash
cd adk_service
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate    # macOS / Linux
pip install -r requirements.txt
```

### 2. Environment

```bash
copy .env.example .env        # Windows
# cp .env.example .env         # macOS / Linux
```

Edit `.env` and set your Groq API key:

```
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxx
```

Get one at https://console.groq.com/keys.

### 3. Run

```bash
python api.py
```

Service runs on `http://localhost:8000`. The ADK developer UI is at
`http://localhost:8000/dev-ui` — useful for iterating on prompts without the
Express layer.

---

## Smoke tests

Health check:

```bash
curl http://localhost:8000/health
# {"status":"ok","service":"startup_validator"}
```

Phase 1 generation:

```bash
curl -X POST http://localhost:8000/agents/phase1 \
  -H "Content-Type: application/json" \
  -d "{\"ideaTitle\":\"EcoTots\",\"ideaDescription\":\"A subscription service for eco-friendly baby toys aimed at environmentally conscious parents.\"}"
```

Expected: JSON matching `IPhase1Data` (cleanSummary, marketFeasibility,
competitiveAnalysis, killAssumption, killAssumptionTestGuidance).

Phase 2 generation (requires the Phase 1 output from above):

```bash
curl -X POST http://localhost:8000/agents/phase2 \
  -H "Content-Type: application/json" \
  -d @phase2-request.json
```

Where `phase2-request.json` is:

```json
{
  "ideaTitle": "EcoTots",
  "ideaDescription": "...",
  "phase1Data": { "... the full phase 1 response ..." }
}
```

Phase 3 generation takes `phase1Data` + `phase2Data`.

---

## Configuration

All settings live in `.env`:

| Var                         | Default                                | Purpose                                          |
|-----------------------------|----------------------------------------|--------------------------------------------------|
| `GROQ_API_KEY`              | *(required)*                           | Groq API key for LiteLlm.                        |
| `ADK_MODEL`                 | `groq/llama-3.3-70b-versatile`         | Any LiteLlm-compatible model string.             |
| `HOST`                      | `0.0.0.0`                              | Bind address.                                    |
| `PORT`                      | `8000`                                 | Port.                                            |
| `ALLOWED_ORIGINS`           | `http://localhost:5000,localhost:5173` | CORS origins (comma-separated).                  |
| `SESSION_DB_URL`            | `sqlite:///./sessions.db`              | ADK session persistence (SQLite by default).     |
| `GOOGLE_GENAI_USE_VERTEXAI` | `FALSE`                                | Keep `FALSE` when using Groq / non-Vertex.       |

### Switching model providers

`LiteLlm` supports OpenAI, Anthropic, Vertex AI, Ollama, and many more. To
switch, change `ADK_MODEL` and add the provider's API key. Example: to use
Gemini instead of Groq, set `ADK_MODEL=gemini/gemini-2.0-flash` and add
`GOOGLE_API_KEY=...`.

---

## File map

```
adk_service/
├── api.py                      FastAPI entry (3 phase endpoints + /health + ADK built-ins)
├── requirements.txt
├── .env.example
├── startup_validator/
│   ├── __init__.py             exports root_agent for ADK discovery
│   ├── agent.py                LlmAgents + SequentialAgent pipelines
│   ├── prompts.py              system prompts (ported + new synthesizer/deck)
│   └── schemas.py              Pydantic output schemas matching Mongo shapes
└── utils/
    ├── pdf_gen.py              legacy PDF export (unused by the hot path)
    └── viz.py                  legacy matplotlib charts (unused by the hot path)
```

---

## Integration with Express

The Express controller at `server/src/controllers/ideaController.ts` checks
`process.env.USE_AI_AGENTS`. When `true`, `generatePhase1/2/3` handlers call
`callAgent(...)` from `server/src/utils/agentClient.ts`, which POSTs to this
service. When `false` (default), the original template generators run — so
flipping the flag is the only switch needed.

To enable the AI path end-to-end:

1. `python api.py` (this service) on port 8000
2. Set `USE_AI_AGENTS=true` in `server/.env`
3. `npm run dev` in `server/`
4. `npm run dev` in `client/`
5. Generate an idea from the dashboard — data will be AI-produced.

---

## Troubleshooting

| Symptom                                                    | Fix                                                                                          |
|------------------------------------------------------------|----------------------------------------------------------------------------------------------|
| `AuthenticationError: No API key provided`                 | `GROQ_API_KEY` missing from `.env` or env not loaded. Verify with `echo %GROQ_API_KEY%`.     |
| `502 Agent pipeline error: ... Rate limit`                 | Groq free-tier rate limit hit; wait a minute or upgrade plan.                                |
| `Pipeline produced non-JSON output for 'phase1_output'`    | Model returned prose instead of structured output. Lower temperature or switch model.        |
| Express gets `AGENT_SERVICE_ERROR` every time               | Service not running, or `AGENT_SERVICE_URL` mismatch. Hit `curl localhost:8000/health` first.|
| Phase 2/3 returns with empty fields                         | Agent couldn't parse `phase1_context` / `phase2_context`. Inspect via `/dev-ui`.             |

---

## Relationship to legacy `../googleADK/`

`../googleADK/` is the original proof-of-concept that used a handwritten
orchestration loop and called Groq directly over REST. It is kept intact as a
reference implementation and as a fallback. Once the ADK service has been
verified in production, `../googleADK/` can be deleted.
