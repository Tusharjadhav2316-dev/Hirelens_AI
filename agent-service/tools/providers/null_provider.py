from tools.providers.base import JobSearchQuery, JobSearchResult, JobProviderAdapter

class NullJobProvider:
    """
    Honest Null Provider implementation when no external job board API is configured.
    Guarantees status='not_configured' and listings=[] with zero fabricated job listings.
    """
    async def search(self, query: JobSearchQuery) -> JobSearchResult:
        return JobSearchResult(
            status="not_configured",
            listings=[],
            message="Job search isn't connected to a live job board yet. No external job provider API is currently provisioned."
        )
