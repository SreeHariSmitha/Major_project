"""Weave (W&B) tracing setup — isolated from api.py for clarity.

Usage:
    from utils.weave_tracing import init_weave, trace

    init_weave(logger)            # call ONCE, after load_dotenv(), before agent imports
    @trace                        # decorate any fn you want as a span
    async def my_fn(...): ...

Behaviour:
  - If WANDB_API_KEY is not set, Weave is disabled and `trace` becomes a no-op.
  - If weave init raises (network down, bad key, etc.), we log a warning and
    continue without tracing so local dev never hard-fails on observability.

Env vars:
  WANDB_API_KEY   — required; key from https://wandb.ai/authorize
  WANDB_PROJECT   — project name, default "startup-validator"
  WANDB_ENTITY    — W&B username or team; optional
"""

from __future__ import annotations

import logging
import os

_WEAVE_ENABLED = False
_weave = None  # module handle, set on successful init


def init_weave(logger: logging.Logger | None = None) -> bool:
    """Initialize Weave. Returns True if tracing is active, False otherwise.

    Call after load_dotenv() and BEFORE importing the agents module, so
    LiteLlm's auto-patch is in place when agents construct model clients.
    """
    global _WEAVE_ENABLED, _weave
    log = logger or logging.getLogger(__name__)

    if not os.getenv("WANDB_API_KEY"):
        log.info("WANDB_API_KEY not set — Weave tracing disabled.")
        return False

    try:
        import weave  # imported lazily so the dep is optional

        project = os.getenv("WANDB_PROJECT", "startup-validator")
        entity = os.getenv("WANDB_ENTITY") or None
        target = f"{entity}/{project}" if entity else project
        weave.init(target)
        _weave = weave
        _WEAVE_ENABLED = True
        log.info("Weave tracing enabled: project=%s", target)
        return True
    except Exception as exc:  # noqa: BLE001
        log.warning("Weave init failed (%s) — continuing without tracing.", exc)
        return False


def trace(fn):
    """Decorator: wraps fn as a Weave op when enabled, no-op otherwise."""
    if _WEAVE_ENABLED and _weave is not None:
        return _weave.op()(fn)
    return fn


# ---------------------------------------------------------------------------
# Sub-agent tagging — label every outgoing LiteLlm call with the ADK sub-agent
# that triggered it. Otherwise every Groq call shows up in Weave as a generic
# `litellm.completion` span and you can't tell which sub-agent produced the
# tokens. Attach the returned callback as `before_model_callback=` on each
# `LlmAgent`. Best-effort: if none of the injection paths work on the current
# ADK version, we still tag the parent op's attributes.
# ---------------------------------------------------------------------------


def tag_sub_agent(agent_name: str):
    """Return a before_model_callback that tags the LLM call with agent_name.

    Effects on the Weave dashboard (when enabled):
    - The LiteLlm child span gets `metadata.agent_name = <agent_name>` so
      you can filter/sort traces by sub-agent.
    - The parent op (generate_phaseN) records `current_sub_agent` in its
      attributes as each sub-agent starts, giving a quick "who ran last"
      indicator if a pipeline errors mid-flight.
    """

    def _callback(callback_context, llm_request):  # noqa: ANN001
        if not _WEAVE_ENABLED or _weave is None:
            return None
        # 1) Tag the outgoing LiteLlm call via request metadata. ADK's
        #    LiteLlm adapter forwards `labels` on GenerateContentConfig to
        #    LiteLlm's `metadata` kwarg, which Weave surfaces in the span.
        try:
            cfg = getattr(llm_request, "config", None)
            if cfg is not None:
                labels = dict(getattr(cfg, "labels", None) or {})
                labels["agent_name"] = agent_name
                try:
                    cfg.labels = labels
                except Exception:  # noqa: BLE001
                    pass
        except Exception:  # noqa: BLE001
            pass

        # 2) Tag the current Weave call (the parent `_run_pipeline_state`
        #    op) with `current_sub_agent` — useful for diagnosing a stall:
        #    whichever name is last-set is the agent the pipeline was in.
        try:
            get_current_call = getattr(_weave, "get_current_call", None)
            if callable(get_current_call):
                current = get_current_call()
                if current is not None and hasattr(current, "attributes"):
                    current.attributes["current_sub_agent"] = agent_name
        except Exception:  # noqa: BLE001
            pass

        return None

    return _callback
