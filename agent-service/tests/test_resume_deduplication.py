import pytest
from crew.grounded_resume import (
    generate_grounded_structured_resume,
    deduplicate_sentences,
    normalize_and_deduplicate_resume,
    smart_merge_records,
    build_education_canonical_key,
)

SAMPLE_TUSHAR_RESUME_WITH_NOISE = """
Tushar Jadhav
+91 74980 92316 | tushar.jadhav2316@gmail.com | Pune, India
https://linkedin.com/in/tushar-jadhav https://github.com/tushar-jadhav

SUMMARY
Computer Science undergraduate and aspiring Full-Stack & AI Engineer proficient in React.js, Next.js, Node.js, Python, and cloud technologies.

TECHNICAL SKILLS
Languages: Java, Python, JavaScript, TypeScript, HTML5, CSS3, SQL
Frameworks: React.js, Node.js, Express.js, Streamlit, Tailwind CSS, ShadCN UI
Databases & Cloud: MySQL, Firebase Firestore, Oracle SQL, Microsoft Azure
AI / ML & APIs: OpenAI GPT API, Google Gemini API, OpenRouter API
Tools: Git, GitHub, VS Code, Agile/SDLC

EXPERIENCE
Microsoft Azure Intern – Emerging Technologies
Jan 2026 – Feb 2026 | Microsoft Elevate | AICTE
Virtual / Remote
- Engineered cloud deployment pipelines and AI integration modules using Azure.

AI & Cloud Technology Intern
Sep 2025 – Oct 2025 | Edunet Foundation | IBM SkillsBuild & Microsoft Azure
- Developed cloud-native prototypes integrating AI services and modern Web APIs.

PROJECTS
HireLens AI – Resume Builder & ATS Analyzer SaaS
Sep – Oct 2025 | Next.js 16, TypeScript, Firebase, OpenRouter API
- Developed deterministic ATS scoring engine and AI career coach agent.

Swastik – GPT-Powered Voice AI Assistant
Sep – Nov 2025 | Python, OpenAI GPT-3.5, NLP, Speech Recognition
- Built voice-activated AI assistant with natural language processing.

Habit Tracker – Full-Stack Productivity App
Jan – Feb 2026 | Next.js 16, TypeScript, Firebase, ShadCN UI
- Created real-time habit tracking web application.

EDUCATION
Nutan College of Engineering and Research
B.Tech in Computer Science and Engineering | CGPA: 6.92 / 10.0
Expected Aug 2027

HSC: 69.83%, Feb 2023
SSC: 83.80%, 2021

ACHIEVEMENTS & LEADERSHIP
- Smart India Hackathon 2025 – Core Team Member: Smart India Hackathon 2025 – Core Team Member
- Hackathon Coordinator, CODEMENT '24
- Dual Industry Recognition: IBM SkillsBuild 2025 & Microsoft Elevate 2026

CERTIFICATIONS
- Cloud Administration & Engineering – Microsoft Elevate & AICTE (40 hrs)
- AI & ML – Microsoft Elevate & AICTE (20 hrs)
- IBM Web Developer – NSDC / Skill India
- Java & Python – GeeksforGeeks
- TCS iON Career Edge – Professional Communication
- 2026 Aspire Leaders Program – Aspire Institute (40 hrs)
"""

def test_education_deduplication_single_btech():
    """Verify Education produces exactly 3 records (1 B.Tech, 1 HSC, 1 SSC), with zero duplicate B.Tech records."""
    res = generate_grounded_structured_resume(SAMPLE_TUSHAR_RESUME_WITH_NOISE)
    edu = res.get("education", [])
    
    assert len(edu) == 3, f"Expected exactly 3 education records, got {len(edu)}: {edu}"
    
    btech_records = [e for e in edu if "btech" in str(e.get("degree", "")).lower() or "b.tech" in str(e.get("degree", "")).lower() or "computer science" in str(e.get("degree", "")).lower()]
    assert len(btech_records) == 1, f"Expected exactly 1 B.Tech record, got {len(btech_records)}"

    hsc_records = [e for e in edu if "hsc" in str(e.get("degree", "")).lower() or "69.83" in str(e.get("gpa", ""))]
    assert len(hsc_records) == 1, f"Expected exactly 1 HSC record, got {len(hsc_records)}"

    ssc_records = [e for e in edu if "ssc" in str(e.get("degree", "")).lower() or "83.80" in str(e.get("gpa", ""))]
    assert len(ssc_records) == 1, f"Expected exactly 1 SSC record, got {len(ssc_records)}"

def test_achievement_sentence_deduplication():
    """Verify repeated phrases inside achievement strings are cleaned."""
    dirty_text = "Smart India Hackathon 2025 – Core Team Member: Smart India Hackathon 2025 – Core Team Member"
    cleaned = deduplicate_sentences(dirty_text)
    assert cleaned == "Smart India Hackathon 2025 – Core Team Member"

def test_projects_deduplication_and_clean_separation():
    """Verify each of the 3 projects appears exactly once."""
    res = generate_grounded_structured_resume(SAMPLE_TUSHAR_RESUME_WITH_NOISE)
    projects = res.get("projects", [])
    
    assert len(projects) == 3, f"Expected exactly 3 projects, got {len(projects)}"
    proj_names = [p.get("name", "") for p in projects]
    assert "HireLens AI" in proj_names
    assert "Swastik" in proj_names
    assert "Habit Tracker" in proj_names

def test_certifications_and_experience_deduplication():
    """Verify 6 certifications and 2 internships each appear exactly once."""
    res = generate_grounded_structured_resume(SAMPLE_TUSHAR_RESUME_WITH_NOISE)
    
    certs = res.get("certifications", [])
    assert len(certs) == 6, f"Expected exactly 6 certifications, got {len(certs)}"

    exp = res.get("experience", [])
    assert len(exp) == 2, f"Expected exactly 2 work experiences, got {len(exp)}"

def test_smart_llm_fallback_merge_non_duplication():
    """Verify LLM output and fallback containing identical canonical records merge cleanly into 1 record."""
    llm_edu = [
        {"id": "edu-llm-1", "institution": "Nutan College of Engineering and Research", "degree": "B.Tech in Computer Science"}
    ]
    fallback_edu = [
        {"id": "edu-fb-1", "institution": "Nutan College of Engineering and Research", "degree": "B.Tech in Computer Science and Engineering", "gpa": "CGPA: 6.92"}
    ]
    merged = smart_merge_records(llm_edu, fallback_edu, build_education_canonical_key)
    
    assert len(merged) == 1, f"Expected exactly 1 merged education record, got {len(merged)}"
    assert merged[0]["gpa"] == "CGPA: 6.92"

def test_zero_forbidden_placeholders():
    """Verify zero placeholder string leaks in complete output."""
    res = generate_grounded_structured_resume(SAMPLE_TUSHAR_RESUME_WITH_NOISE)
    serialized = str(res)
    assert "candidate@example.com" not in serialized
    assert "+1 555-0199" not in serialized
    assert "Target Location" not in serialized
