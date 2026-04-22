import axios, { AxiosError } from 'axios';

/**
 * HTTP client for the adk_service FastAPI sidecar.
 *
 * The sidecar runs Google ADK agents (Groq + LiteLlm backed) and returns JSON
 * pre-shaped to match our Mongo schemas (IPhase1Data, IPhase2Data, IPhase3Data).
 *
 * Configuration:
 *   AGENT_SERVICE_URL       — base URL, default http://localhost:8000
 *   AGENT_REQUEST_TIMEOUT_MS — override the 3-minute default if needed.
 */

const AGENT_URL = process.env.AGENT_SERVICE_URL || 'http://localhost:8000';
const DEFAULT_TIMEOUT_MS = Number(process.env.AGENT_REQUEST_TIMEOUT_MS) || 180_000;

type Phase = 'phase1' | 'phase2' | 'phase3';

export class AgentServiceError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly detail?: unknown,
  ) {
    super(message);
    this.name = 'AgentServiceError';
  }
}

export async function callAgent<TResponse>(
  phase: Phase,
  payload: Record<string, unknown>,
): Promise<TResponse> {
  try {
    const { data } = await axios.post<TResponse>(
      `${AGENT_URL}/agents/${phase}`,
      payload,
      {
        timeout: DEFAULT_TIMEOUT_MS,
        headers: { 'Content-Type': 'application/json' },
      },
    );
    return data;
  } catch (err) {
    const ax = err as AxiosError;
    if (ax.response) {
      throw new AgentServiceError(
        `Agent service returned ${ax.response.status} for ${phase}`,
        ax.response.status,
        ax.response.data,
      );
    }
    if (ax.code === 'ECONNABORTED') {
      throw new AgentServiceError(
        `Agent service timed out after ${DEFAULT_TIMEOUT_MS}ms for ${phase}`,
      );
    }
    throw new AgentServiceError(
      `Agent service unreachable for ${phase}: ${ax.message}`,
    );
  }
}
