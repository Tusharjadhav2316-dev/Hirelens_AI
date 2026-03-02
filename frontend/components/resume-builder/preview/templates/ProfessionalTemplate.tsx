import { Resume } from "@/types/resume";
import { Mail, Phone, MapPin, Globe, Linkedin } from "lucide-react";
import { ATS_SECTION_ORDER, AtsSection } from "@/lib/atsOrder";

export default function ProfessionalTemplate({ resume }: { resume: Resume }) {
    const renderSection = (section: AtsSection) => {
        switch (section) {
            case "summary":
                return resume.personalInfo.summary ? (
                    <section key="summary" className="mb-4">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-900 border-b-2 border-slate-200 mb-2 pb-1">
                            Professional Summary
                        </h2>
                        <p className="text-sm leading-relaxed text-slate-700">
                            {resume.personalInfo.summary}
                        </p>
                    </section>
                ) : null;
            case "skills":
                return resume.skills.length > 0 ? (
                    <section key="skills" className="mb-4">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-900 border-b-2 border-slate-200 mb-2 pb-1">
                            Skills
                        </h2>
                        <div className="text-sm text-slate-700">
                            {resume.skills.map(s => s.name).join(' • ')}
                        </div>
                    </section>
                ) : null;
            case "experience":
                return resume.experience.length > 0 ? (
                    <section key="experience" className="mb-4">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-900 border-b-2 border-slate-200 mb-2 pb-1">
                            Professional Experience
                        </h2>
                        <div className="space-y-4">
                            {resume.experience.map((exp) => (
                                <div key={exp.id}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-slate-800 text-base">{exp.position}</h3>
                                        <span className="text-sm font-medium text-slate-600">
                                            {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                                        </span>
                                    </div>
                                    <div className="text-sm font-medium text-blue-600 mb-2">
                                        {exp.company}
                                    </div>
                                    {exp.description && (
                                        <div className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed space-y-1">
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
                    <section key="projects" className="mb-4">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-900 border-b-2 border-slate-200 mb-2 pb-1">
                            Selected Projects
                        </h2>
                        <div className="space-y-4">
                            {resume.projects.map((project) => (
                                <div key={project.id}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-slate-800 text-base">{project.name}</h3>
                                    </div>
                                    {project.technologies && project.technologies.length > 0 && (
                                        <div className="text-xs font-medium text-slate-500 mb-1">
                                            {project.technologies.join(", ")}
                                        </div>
                                    )}
                                    {project.description && (
                                        <div className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed space-y-1">
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
                    <section key="education" className="mb-4">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-900 border-b-2 border-slate-200 mb-2 pb-1">
                            Education
                        </h2>
                        <div className="space-y-3">
                            {resume.education.map((edu) => (
                                <div key={edu.id}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-base">{edu.institution}</h3>
                                            <div className="text-sm text-slate-700">
                                                {edu.degree} in {edu.fieldOfStudy}
                                                {edu.gpa && <span className="text-slate-500 ml-2">GPA: {edu.gpa}</span>}
                                            </div>
                                        </div>
                                        <span className="text-sm font-medium text-slate-600">
                                            {edu.startDate} - {edu.endDate}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ) : null;
            case "certifications":
                return resume.certifications && resume.certifications.length > 0 ? (
                    <section key="certifications" className="mb-4">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-900 border-b-2 border-slate-200 mb-2 pb-1">
                            Certifications
                        </h2>
                        <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                            {resume.certifications.map(cert => (
                                <li key={cert.id}>
                                    <span className="font-semibold">{cert.name}</span>
                                    <span className="text-slate-500 ml-2">{cert.issuer} {cert.year ? `(${cert.year})` : ''}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                ) : null;
            case "achievements":
                return resume.achievements && resume.achievements.length > 0 ? (
                    <section key="achievements" className="mb-4">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-900 border-b-2 border-slate-200 mb-2 pb-1">
                            Achievements
                        </h2>
                        <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                            {resume.achievements.map(ach => (
                                <li key={ach.id}>
                                    <span className="font-semibold">{ach.title}</span>
                                    {ach.description && <span className="block ml-4 text-slate-600 mt-0.5">{ach.description}</span>}
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
        <div className="w-full h-full bg-white text-slate-900 font-sans">
            <header className="mb-6 pb-4 border-b-4 border-slate-200">
                <h1 className="text-3xl font-bold uppercase tracking-wide text-slate-900 mb-2">
                    {resume.personalInfo.fullName || "YOUR NAME"}
                </h1>

                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
                    {resume.personalInfo.email && (
                        <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            <span>{resume.personalInfo.email}</span>
                        </div>
                    )}
                    {resume.personalInfo.phone && (
                        <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            <span>{resume.personalInfo.phone}</span>
                        </div>
                    )}
                    {resume.personalInfo.location && (
                        <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{resume.personalInfo.location}</span>
                        </div>
                    )}
                    {resume.personalInfo.linkedinUrl && (
                        <div className="flex items-center gap-1">
                            <Linkedin className="w-4 h-4" />
                            <span>{resume.personalInfo.linkedinUrl.replace('https://', '')}</span>
                        </div>
                    )}
                    {resume.personalInfo.portfolioUrl && (
                        <div className="flex items-center gap-1">
                            <Globe className="w-4 h-4" />
                            <span>{resume.personalInfo.portfolioUrl.replace('https://', '')}</span>
                        </div>
                    )}
                </div>
            </header>

            <div className="flex flex-col">
                {ATS_SECTION_ORDER.map(section => renderSection(section))}
            </div>
        </div>
    );
}
