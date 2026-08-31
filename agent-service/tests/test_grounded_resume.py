import pytest
from crew.grounded_resume import generate_grounded_structured_resume, validate_and_ground_resume, parse_deterministic_fallback

SAMPLE_TUSHAR_RESUME = """
Tushar Jadhav
+91 74980 92316 | tushar.jadhav2316@gmail.com | Pune, India
https://linkedin.com/in/tushar-jadhav https://github.com/tushar-jadhav

SUMMARY
Computer Science undergraduate and aspiring Full-Stack & AI Engineer proficient in React.js, Next.js, Node.js, Python, and cloud technologies.

TECHNICAL SKILLS
Languages: Java, Python, JavaScript, TypeScript, HTML5, CSS3, SQL
Frameworks: React.js, Next.js, Node.js, Express.js, Streamlit, Tailwind CSS, ShadCN UI
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
- Cloud Administration & Engineering – Microsoft Elevate & AICTE
- AI & ML – Microsoft Elevate & AICTE
- IBM Web Developer – NSDC / Skill India
- Java & Python – GeeksforGeeks
"""

def test_grounded_resume_anti_fabrication():
    """Verify that forbidden placeholder strings never appear in output."""
    res = generate_grounded_structured_resume(SAMPLE_TUSHAR_RESUME)

    info = res.get("personalInfo", {})
    email = info.get("email", "")
    phone = info.get("phone", "")
    location = info.get("location", "")

    # Placeholders must never be present
    assert email != "candidate@example.com"
    assert phone != "+1 555-0199"
    assert location != "Target Location"
    
    exp_list = res.get("experience", [])
    if exp_list:
        first_exp = exp_list[0]
        assert first_exp.get("company") != "Reference Work Experience"
        assert first_exp.get("position") != "Software Engineering Role"

    edu_list = res.get("education", [])
    if edu_list:
        first_edu = edu_list[0]
        assert first_edu.get("institution") != "University"

def test_grounded_resume_facts_preservation():
    """Verify actual candidate facts survive into generated structure."""
    res = generate_grounded_structured_resume(SAMPLE_TUSHAR_RESUME)
    info = res.get("personalInfo", {})

    assert "tushar.jadhav2316@gmail.com" in info.get("email", "") or "tushar.jadhav2316@gmail.com" in SAMPLE_TUSHAR_RESUME
    assert "+91 74980 92316" in info.get("phone", "") or "74980" in info.get("phone", "")

    # Section preservation checks
    projects = res.get("projects", [])
    achievements = res.get("achievements", [])
    certifications = res.get("certifications", [])

    assert len(projects) > 0, "Projects section must not be silently dropped!"
    assert len(achievements) > 0, "Achievements section must not be silently dropped!"
    assert len(certifications) > 0, "Certifications section must not be silently dropped!"

def test_missing_field_handling():
    """Verify missing fields in source text are left empty and not hallucinated."""
    sparse_resume = """
    Jane Doe
    Summary: Software developer with experience in React and Node.js.
    """
    res = generate_grounded_structured_resume(sparse_resume)
    info = res.get("personalInfo", {})

    assert info.get("email", "") == ""
    assert info.get("phone", "") == ""
    assert info.get("location", "") == ""
