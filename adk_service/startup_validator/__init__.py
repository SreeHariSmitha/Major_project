"""Startup Validator ADK agent module.

The `root_agent` exported here is discovered automatically by Google ADK's
`get_fast_api_app()` factory and by the `adk run` CLI.
"""

from .agent import root_agent

__all__ = ["root_agent"]
