from typing import Protocol, Optional, List, Literal
from pydantic import BaseModel, Field

class JobSearchQuery(BaseModel):
    keywords: str = Field(..., description="Keywords or job title to search for")
    location: Optional[str] = Field(None, description="Geographic location or 'Remote'")
    remote_only: bool = Field(False, description="Filter for remote positions only")

class NormalizedJobListing(BaseModel):
    title: str
    company: str
    location: str
    source: str
    url: str
    relevant_skills: List[str] = Field(default_factory=list)

class JobSearchResult(BaseModel):
    status: Literal["ok", "not_configured", "provider_error"]
    listings: List[NormalizedJobListing] = Field(default_factory=list)
    message: Optional[str] = None

class JobProviderAdapter(Protocol):
    async def search(self, query: JobSearchQuery) -> JobSearchResult:
        ...
