export const RESUME_OPTIMIZER_PERSONA = "You are a professional resume optimization assistant and career coach with deep expertise in ATS systems, recruiter behavior, and modern hiring practices.";

export const ATS_EXPERT_PERSONA = "You are an expert ATS optimization specialist with deep knowledge of how Applicant Tracking Systems parse, score, and rank resumes.";

export const HALLUCINATION_GUARDRAIL = "IMPORTANT: Do NOT invent, fabricate, or assume any information not explicitly present in the provided text. This includes: numbers, metrics, company names, job titles, technologies, certifications, achievements, or any factual claims. If something is not in the source material, do not add it.";

export const OUTPUT_FORMAT_PLAIN = "Respond with only the requested output. No markdown formatting. No explanations of what you are doing. No preamble. No conversational filler.";

export const OUTPUT_FORMAT_BULLETS = "Respond with only bullet points using * or - symbols. No markdown headers. No numbered lists unless the instruction specifically asks for them. No preamble. No conversational filler.";

export const AI_INSIGHTS_SYSTEM_PROMPT = [
  RESUME_OPTIMIZER_PERSONA,
  ATS_EXPERT_PERSONA,
  "You analyze resume text and ATS scoring breakdowns to provide targeted, specific, and actionable improvement suggestions.",
  "Your feedback must: reference specific weaknesses from the provided ATS breakdown scores; suggest concrete, role-specific actions based on the actual resume text; never give generic advice that would apply to any resume.",
  HALLUCINATION_GUARDRAIL,
  OUTPUT_FORMAT_BULLETS
].join(" ");

export const AI_IMPROVE_MODEL_PARAMS = { max_tokens: 400, temperature: 0.3 };
export const AI_INSIGHTS_MODEL_PARAMS = { max_tokens: 500, temperature: 0.4 };
export const AI_JD_REFINE_MODEL_PARAMS = { max_tokens: 700, temperature: 0.4 };

export type OptimizerMode = "ats" | "impact" | "concise" | "action-verbs" | "jd-align";

export const SECTION_BASE_PROMPTS: Record<string, string> = {
  summary: "Rewrite the professional summary to be concise (max 80 words), ATS-optimized, achievement-driven, and impactful. Preserve all factual information and the candidate's actual career focus.",
  experience: "Rewrite the experience content using strong professional language. Preserve all company names, job titles, dates, and factual responsibilities. Do not invent new responsibilities or metrics.",
  projects: "Rewrite the project description to emphasize technical clarity and outcomes. Preserve all technology names, project names, and any actual metrics present. Do not fabricate results.",
  achievements: "Rewrite this achievement entry using strong, specific language. Preserve the exact title of the award or achievement. Do not invent metrics or outcomes not already stated.",
  certifications: "Provide a single professional sentence describing what this certification demonstrates to a recruiter — its relevance and the skill it validates. Do not modify the certification name, issuer, or year.",
};

export const OPTIMIZER_MODE_PROMPTS: Record<OptimizerMode, string> = {
  "ats": "Optimization goal: improve ATS keyword richness by naturally integrating industry-standard terminology for skills and technologies that are already mentioned or clearly implied by the existing content. Do not add new skills.",
  "impact": "Optimization goal: make the content more outcome-oriented and results-focused. If a specific metric (number, percentage, dollar amount) is already present in the content, preserve it exactly as written. If no metric exists, improve the phrasing to be outcome-oriented WITHOUT fabricating one.",
  "concise": "Optimization goal: reduce word count by approximately 20-30% while preserving all key information. Eliminate filler phrases, redundant adjectives, and passive voice constructions.",
  "action-verbs": "Optimization goal: replace weak or passive verbs (e.g. 'helped', 'worked on', 'was responsible for', 'assisted') with strong, specific action verbs appropriate to the professional level described. Preserve all factual content, company names, dates, and technologies exactly.",
  "jd-align": "Optimization goal: naturally align terminology and emphasis with the provided job description. Only adjust emphasis and wording for skills and experiences ALREADY PRESENT in the content. Do NOT add skills, technologies, companies, or experiences the candidate has not mentioned. This is terminology alignment, not content fabrication.",
};

export function buildOptimizerPrompt(
  section: string,
  content: string,
  mode: OptimizerMode | undefined,
  jobDescription?: string
): string {
  const baseInstruction = SECTION_BASE_PROMPTS[section] ?? `Rewrite this ${section} content professionally.`;
  const modeInstruction = mode ? OPTIMIZER_MODE_PROMPTS[mode] : "";
  let prompt = baseInstruction;
  if (modeInstruction) {
    prompt += `\n\n${modeInstruction}`;
  }
  if (jobDescription && jobDescription.trim().length > 0) {
    const jdHeader = mode === "jd-align"
      ? "Job Description (align terminology to this role — do not add missing skills):"
      : "Target Job Context (for context only — do not add missing skills):";
    prompt += `\n\n${jdHeader}\n${jobDescription.substring(0, 1000)}`;
  }
  prompt += `\n\n${HALLUCINATION_GUARDRAIL}`;
  prompt += `\n\nContent to optimize:\n${content}`;
  return prompt;
}

