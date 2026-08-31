import asyncio
import json
import concurrent.futures
from typing import Optional
from crewai.tools import tool
from tools.providers.base import JobSearchQuery, JobSearchResult, JobProviderAdapter
from tools.providers.null_provider import NullJobProvider

# Default provider instance
_current_provider: JobProviderAdapter = NullJobProvider()

def get_configured_provider() -> JobProviderAdapter:
    return _current_provider

def set_configured_provider(provider: JobProviderAdapter) -> None:
    global _current_provider
    _current_provider = provider

def _run_async_fn(async_fn, *args):
    """
    Executes an async function safely in a new event loop inside a worker thread
    when called from an already running asyncio event loop.
    Prevents 'asyncio.run() cannot be called from a running event loop' errors
    and unawaited coroutine warnings.
    """
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop and loop.is_running():
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(lambda: asyncio.run(async_fn(*args)))
            return future.result()
    else:
        return asyncio.run(async_fn(*args))

@tool("search_jobs")
def search_jobs(query: str = "", location: Optional[str] = None, remote_only: bool = False) -> str:
    """
    Search open job listings matched to query keywords and location.
    Queries the configured JobProviderAdapter (default: NullJobProvider).
    When no provider is configured, returns status='not_configured' with zero listings.
    """
    clean_query = (query or "").strip()
    if not clean_query:
        return json.dumps({
            "status": "not_configured",
            "listings": [],
            "message": "A valid search query (keywords or job title) is required."
        })

    search_query = JobSearchQuery(
        keywords=clean_query,
        location=location.strip() if location else None,
        remote_only=remote_only
    )

    provider = get_configured_provider()

    try:
        result: JobSearchResult = _run_async_fn(provider.search, search_query)
    except Exception as e:
        print(f"[search_jobs] Async execution fallback exception: {str(e)}")
        result = JobSearchResult(
            status="not_configured",
            listings=[],
            message="Job search isn't connected to a live job board yet."
        )

    # Strict enforcement: if status is not_configured, force listings to be empty
    if result.status == "not_configured":
        result.listings = []

    return result.model_dump_json()
