import { Resume } from "@/types/resume";
import { ATS_SECTION_ORDER, AtsSection } from "@/lib/atsOrder";

export default function MinimalistTemplate({ resume }: { resume: Resume }) {
    const renderSection = (section: AtsSection) => {
        switch (section) {
            case "summary":
                return resume.personalInfo.summary ? (
                    <section key="summary" className="mb-5">
                        <p className="text-sm font-light leading-relaxed text-slate-600">
                            {resume.personalInfo.summary}
                        </p>
                    </section>
                ) : null;
            case "skills":
                return resume.skills.length > 0 ? (
                    <section key="skills" className="mb-5">
                        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3 border-t border-slate-100 pt-3">
                            Skills
                        </h2>
                        <div className="flex flex-wrap gap-2 text-sm font-light text-slate-600">
                            {resume.skills.map((skill, i) => (
                                <span key={skill.id}>
                                    {skill.name}
                                    {i < resume.skills.length - 1 && <span className="text-slate-300 mx-1">•</span>}
                                </span>
                            ))}
                        </div>
                    </section>
                ) : null;
            case "experience":
                return resume.experience.length > 0 ? (
                    <section key="experience" className="mb-5">
                        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3 border-t border-slate-100 pt-3">
                            Experience
                        </h2>
                        <div className="space-y-5">
                            {resume.experience.map((exp) => (
                                <div key={exp.id}>
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h3 className="font-medium text-slate-900">{exp.position}</h3>
                                        <span className="text-sm text-slate-500 font-light">
                                            {exp.startDate} — {exp.current ? "Present" : exp.endDate}
                                        </span>
                                    </div>
                                    <div className="text-sm text-slate-500 mb-1 font-light">{exp.company}</div>
                                    {exp.description && (
                                        <div className="text-sm text-slate-600 font-light leading-relaxed whitespace-pre-wrap space-y-1">
                                            {exp.description}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                ) : null;
            case "projects":
                return resume.projects && resume.projects.length > 0 ? (
                    <section key="projects" className="mb-5">
                        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3 border-t border-slate-100 pt-3">
                            Projects
                        </h2>
                        <div className="space-y-5">
                            {resume.projects.map((project) => (
                                <div key={project.id}>
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h3 className="font-medium text-slate-900">
                                            {project.name}
                                            {project.liveUrl && <a href={project.liveUrl} className="text-slate-400 hover:text-slate-900 transition-colors ml-2 text-xs">↗ Live</a>}
                                        </h3>
                                        {project.technologies && project.technologies.length > 0 && (
                                            <span className="text-sm text-slate-500 font-light">
                                                {project.technologies.slice(0, 3).join(", ")}
                                            </span>
                                        )}
                                    </div>
                                    {project.description && (
                                        <div className="text-sm text-slate-600 font-light leading-relaxed whitespace-pre-wrap mt-1 space-y-1">
                                            {project.description}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                ) : null;
            case "education":
                return resume.education.length > 0 ? (
                    <section key="education" className="mb-5">
                        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3 border-t border-slate-100 pt-3">
                            Education
                        </h2>
                        <div className="space-y-4">
                            {resume.education.map((edu) => (
                                <div key={edu.id}>
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h3 className="font-medium text-slate-900">{edu.institution}</h3>
                                        <span className="text-sm text-slate-500 font-light">
                                            {edu.startDate} — {edu.endDate}
                                        </span>
                                    </div>
                                    <div className="text-sm text-slate-600 font-light">
                                        {edu.degree} in {edu.fieldOfStudy}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ) : null;
            case "certifications":
                return resume.certifications && resume.certifications.length > 0 ? (
                    <section key="certifications" className="mb-5">
                        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3 border-t border-slate-100 pt-3">
                            Certifications
                        </h2>
                        <ul className="list-disc list-inside text-sm text-slate-600 font-light space-y-1">
                            {resume.certifications.map(cert => (
                                <li key={cert.id}>
                                    <span className="font-medium text-slate-800">{cert.name}</span>
                                    <span className="ml-2">— {cert.issuer} {cert.year ? `(${cert.year})` : ''}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                ) : null;
            case "achievements":
                return resume.achievements && resume.achievements.length > 0 ? (
                    <section key="achievements" className="mb-5">
                        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3 border-t border-slate-100 pt-3">
                            Achievements
                        </h2>
                        <ul className="list-disc list-inside text-sm text-slate-600 font-light space-y-1">
                            {resume.achievements.map(ach => (
                                <li key={ach.id}>
                                    <span className="font-medium text-slate-800">{ach.title}</span>
                                    {ach.description && <span className="block ml-4 mt-0.5">{ach.description}</span>}
                                </li>
                            ))}
                        </ul>
                    </section>
                ) : null;
            default:
                return null;
        }
    };

    return (
        <div className="w-full h-full bg-white text-slate-800 font-sans">
            <header className="text-left mb-6">
                <h1 className="text-3xl font-light text-slate-900 tracking-tight mb-2">
                    {resume.personalInfo.fullName || "Your Name"}
                </h1>

                <div className="flex flex-wrap gap-4 text-sm text-slate-500 font-light">
                    {resume.personalInfo.email && <span>{resume.personalInfo.email}</span>}
                    {resume.personalInfo.phone && <span>{resume.personalInfo.phone}</span>}
                    {resume.personalInfo.location && <span>{resume.personalInfo.location}</span>}
                    {resume.personalInfo.linkedinUrl && <span>{resume.personalInfo.linkedinUrl.replace('https://', '')}</span>}
                    {resume.personalInfo.portfolioUrl && <span>{resume.personalInfo.portfolioUrl.replace('https://', '')}</span>}
                </div>
            </header>

            <div className="flex flex-col">
                {ATS_SECTION_ORDER.map(section => renderSection(section))}
            </div>
        </div>
    );
}
