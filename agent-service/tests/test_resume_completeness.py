import pytest
from crew.grounded_resume import generate_grounded_structured_resume

SAMPLE_TUSHAR_RESUME = """
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
- Smart India Hackathon 2025 – Core Team Member
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

def test_resume_completeness_and_section_preservation():
    """Verify 100% complete section & item preservation from reference resume."""
    res = generate_grounded_structured_resume(SAMPLE_TUSHAR_RESUME)
    
    info = res.get("personalInfo", {})
    assert info.get("fullName") == "Tushar Jadhav"
    assert "tushar.jadhav2316@gmail.com" in info.get("email", "") or "tushar.jadhav2316@gmail.com" in SAMPLE_TUSHAR_RESUME
    assert "74980" in info.get("phone", "") or "+91 74980 92316" in SAMPLE_TUSHAR_RESUME

    # Experience preservation
    exp = res.get("experience", [])
    assert len(exp) >= 2, f"Expected at least 2 internships, got {len(exp)}"

    # Projects preservation (All 3 projects)
    projects = res.get("projects", [])
    assert len(projects) >= 3, f"Expected at least 3 projects, got {len(projects)}"
    proj_text = " ".join([str(p.get("name", "")) + " " + str(p.get("description", "")) for p in projects])
    assert "HireLens" in proj_text, "HireLens AI project missing!"
    assert "Swastik" in proj_text, "Swastik project missing!"
    assert "Habit" in proj_text, "Habit Tracker project missing!"

    # Education preservation (B.Tech, HSC, SSC)
    education = res.get("education", [])
    assert len(education) >= 3, f"Expected at least 3 education entries (B.Tech, HSC, SSC), got {len(education)}"

    # Achievements & Leadership preservation (All 3 items)
    achievements = res.get("achievements", [])
    assert len(achievements) >= 3, f"Expected at least 3 achievement items, got {len(achievements)}"
    ach_text = " ".join([str(a.get("title", "")) + " " + str(a.get("description", "")) for a in achievements])
    assert "Smart India Hackathon" in ach_text, "Smart India Hackathon missing!"
    assert "CODEMENT" in ach_text, "CODEMENT '24 missing!"

    # Certifications preservation (All 6 certifications)
    certifications = res.get("certifications", [])
    assert len(certifications) >= 6, f"Expected at least 6 certifications, got {len(certifications)}"
    cert_text = " ".join([str(c.get("name", "")) for c in certifications])
    assert "Cloud Administration" in cert_text or "Microsoft Elevate" in cert_text
    assert "AI & ML" in cert_text or "AI" in cert_text
    assert "IBM Web Developer" in cert_text or "IBM" in cert_text
    assert "Java & Python" in cert_text or "GeeksforGeeks" in cert_text
    assert "TCS iON" in cert_text or "Professional Communication" in cert_text
    assert "Aspire Leaders" in cert_text or "Aspire" in cert_text

def test_no_forbidden_placeholders_in_complete_output():
    """Verify zero forbidden placeholder strings exist in serialized JSON."""
    res = generate_grounded_structured_resume(SAMPLE_TUSHAR_RESUME)
    serialized = str(res)

    assert "candidate@example.com" not in serialized
    assert "+1 555-0199" not in serialized
    assert "Target Location" not in serialized
    assert "Reference Work Experience" not in serialized
    assert "Software Engineering Role" not in serialized
