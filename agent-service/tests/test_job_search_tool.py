import os
import sys
import json
import pytest

AGENT_SERVICE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if AGENT_SERVICE_DIR not in sys.path:
    sys.path.insert(0, AGENT_SERVICE_DIR)

from tools.providers.base import JobSearchQuery
from tools.providers.null_provider import NullJobProvider
from tools.job_search_tools import search_jobs, set_configured_provider

import asyncio

def test_null_job_provider_returns_not_configured():
    provider = NullJobProvider()
    query = JobSearchQuery(keywords="React Developer", location="Remote")
    result = asyncio.run(provider.search(query))

    assert result.status == "not_configured"
    assert result.listings == []
    assert "isn't connected" in result.message.lower()

def test_search_jobs_tool_outputs_zero_listings():
    # Guarantee NullJobProvider is set
    set_configured_provider(NullJobProvider())

    output_str = search_jobs._run(query="Senior Full Stack Engineer", location="San Francisco")
    data = json.loads(output_str)

    assert data["status"] == "not_configured"
    assert data["listings"] == []
    assert len(data["listings"]) == 0
    # Assert zero fake company names, URLs, or salaries are in the output
    assert "Google" not in output_str
    assert "Meta" not in output_str
    assert "http" not in output_str

def test_search_jobs_tool_empty_query_handled_safely():
    output_str = search_jobs._run(query="")
    data = json.loads(output_str)

    assert data["status"] == "not_configured"
    assert data["listings"] == []
