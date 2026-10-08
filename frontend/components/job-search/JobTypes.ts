export type WorkMode = "Remote" | "Hybrid" | "On-site";
export type JobTypeOption = "Full-time" | "Part-time" | "Contract" | "Internship" | "All Types";
export type ExperienceLevel = "Entry Level" | "Mid Level" | "Senior" | "Lead" | "Any";
export type SalaryRangeOption = "₹6–10 LPA" | "₹10–18 LPA" | "₹18–30 LPA" | "₹30+ LPA" | "Any";
export type RemoteOption = "Remote" | "Hybrid" | "On-site" | "Any";
export type CompanyTypeOption = "Product" | "Startup" | "Enterprise" | "Any";
export type DatePostedOption = "Past 24h" | "Past Week" | "Past Month" | "Any";
export type SortOption = "relevance" | "date" | "salary" | "match";

export interface JobListing {
  id: string;
  title: string;
  company: string;
  companyInitials: string;
  companyColor: string; // Tailored bg color for monogram
  location: string;
  workMode: WorkMode;
  jobType: string;
  salaryRange: string;
  skills: string[];
  matchScore: number;
  isBestMatch?: boolean;
  postedDate: string;
  experienceLevel: string;
  companyType: string;
  description?: string;
  applyUrl?: string;
}

export interface JobFilterState {
  searchQuery: string;
  location: string;
  jobType: JobTypeOption;
  experience: ExperienceLevel;
  salary: SalaryRangeOption;
  remote: RemoteOption;
  companyType: CompanyTypeOption;
  datePosted: DatePostedOption;
  sortBy: SortOption;
}

export type ApplicationStatus = "Applied" | "Under Review" | "Interview" | "Offer" | "Rejected";

export interface ApplicationRecord {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  salary: string;
  status: ApplicationStatus;
  appliedDate: string;
  lastUpdated: string;
}
