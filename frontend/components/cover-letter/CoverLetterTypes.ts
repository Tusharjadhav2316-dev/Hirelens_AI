export type CoverLetterTemplateId = "professional" | "modern" | "minimal" | "creative";

export interface CoverLetterTemplate {
  id: CoverLetterTemplateId;
  name: string;
  description: string;
  fontFamily: string;
  accentColor: string;
  badge: string;
}

export const COVER_LETTER_TEMPLATES: CoverLetterTemplate[] = [
  {
    id: "professional",
    name: "Professional",
    description: "Classic serif typography with standard formal employer header and clean margins.",
    fontFamily: "font-serif",
    accentColor: "border-slate-800",
    badge: "Most Popular",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Contemporary sans-serif typography with colored top border and geometric header.",
    fontFamily: "font-sans",
    accentColor: "border-indigo-600",
    badge: "Recommended",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Ultra-clean layout with generous whitespace, subtle rules, and concise structure.",
    fontFamily: "font-sans",
    accentColor: "border-slate-300",
    badge: "Tech / Startups",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Distinctive two-tone header with elegant styling for design and marketing roles.",
    fontFamily: "font-sans",
    accentColor: "border-purple-600",
    badge: "Design / Creative",
  },
];

export interface CoverLetterFormData {
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  sourceMode: "builder" | "pdf" | "custom";
  customInput: string;
  additionalInfo: string;
  tone: string;
  templateId: CoverLetterTemplateId;
}

export interface SavedCoverLetterRecord {
  id: string;
  title: string;
  company: string;
  jobTitle: string;
  createdAt: string;
  content: string;
  templateId: CoverLetterTemplateId;
}
