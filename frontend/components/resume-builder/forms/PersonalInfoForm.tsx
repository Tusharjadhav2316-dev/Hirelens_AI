"use client";

import { PersonalInfo } from "@/types/resume";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Linkedin, Github, Globe, User, Briefcase } from "lucide-react";

interface Props {
    data: PersonalInfo;
    title?: string;
    onTitleChange?: (title: string) => void;
    onChange: (data: PersonalInfo) => void;
}

export default function PersonalInfoForm({ data, title = "", onTitleChange, onChange }: Props) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...data, [e.target.name]: e.target.value });
    };

    return (
        <div className="space-y-3">
            {/* Compact Header */}
            <div className="space-y-0.5 pb-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Personal Information</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Let's start with your basic details.</p>
            </div>

            <div className="space-y-2.5">
                {/* Full Name */}
                <div className="space-y-1">
                    <Label htmlFor="fullName" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        Full Name
                    </Label>
                    <div className="relative">
                        <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <Input
                            id="fullName"
                            name="fullName"
                            value={data.fullName}
                            onChange={handleChange}
                            placeholder="e.g. Tushar Jadhav"
                            className="h-9 pl-8 text-xs rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {/* Professional Title */}
                <div className="space-y-1">
                    <Label htmlFor="title" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        Professional Title
                    </Label>
                    <div className="relative">
                        <Briefcase className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <Input
                            id="title"
                            name="title"
                            value={title}
                            onChange={(e) => onTitleChange && onTitleChange(e.target.value)}
                            placeholder="e.g. Software Engineer"
                            className="h-9 pl-8 text-xs rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                    <Label htmlFor="email" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        Email
                    </Label>
                    <div className="relative">
                        <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={data.email}
                            onChange={handleChange}
                            placeholder="e.g. tusharjadhav@example.com"
                            className="h-9 pl-8 text-xs rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {/* Phone */}
                <div className="space-y-1">
                    <Label htmlFor="phone" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        Phone
                    </Label>
                    <div className="relative">
                        <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={data.phone}
                            onChange={handleChange}
                            placeholder="e.g. +91 98765 43210"
                            className="h-9 pl-8 text-xs rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {/* Location */}
                <div className="space-y-1">
                    <Label htmlFor="location" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        Location
                    </Label>
                    <div className="relative">
                        <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <Input
                            id="location"
                            name="location"
                            value={data.location}
                            onChange={handleChange}
                            placeholder="e.g. Pune, Maharashtra, India"
                            className="h-9 pl-8 text-xs rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {/* LinkedIn */}
                <div className="space-y-1">
                    <Label htmlFor="linkedinUrl" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        LinkedIn
                    </Label>
                    <div className="relative">
                        <Linkedin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <Input
                            id="linkedinUrl"
                            name="linkedinUrl"
                            type="url"
                            value={data.linkedinUrl || ""}
                            onChange={handleChange}
                            placeholder="e.g. https://www.linkedin.com/in/tusharjadhav"
                            className="h-9 pl-8 text-xs rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {/* GitHub */}
                <div className="space-y-1">
                    <Label htmlFor="githubUrl" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        GitHub
                    </Label>
                    <div className="relative">
                        <Github className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <Input
                            id="githubUrl"
                            name="githubUrl"
                            type="url"
                            value={data.githubUrl || ""}
                            onChange={handleChange}
                            placeholder="e.g. https://github.com/Tusharjadhav2316-dev"
                            className="h-9 pl-8 text-xs rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {/* Portfolio */}
                <div className="space-y-1">
                    <Label htmlFor="portfolioUrl" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        Portfolio (Optional)
                    </Label>
                    <div className="relative">
                        <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <Input
                            id="portfolioUrl"
                            name="portfolioUrl"
                            type="url"
                            value={data.portfolioUrl || ""}
                            onChange={handleChange}
                            placeholder="e.g. https://tusharjadhav.dev"
                            className="h-9 pl-8 text-xs rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
