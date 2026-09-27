"use client";

import Link from "next/link";
import { Sparkles, Linkedin, Youtube, Instagram } from "lucide-react";

export default function PublicFooter() {
  return (
    <footer className="w-full bg-[#050B1E] text-white border-t border-slate-800/80 select-none transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        
        {/* Main 5-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-14 border-b border-slate-800/80">
          
          {/* Column 1: Brand & Socials (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-4 h-4 fill-white" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                HireLens
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[10px] font-bold">
                AI
              </span>
            </Link>

            <p className="text-xs font-bold text-slate-300">
              Your Career, Amplified by AI.
            </p>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Build, optimize, and grow your career with AI-powered tools — from resume to interviews and beyond.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-blue-600 text-slate-400 hover:text-white flex items-center justify-center transition-all shadow-xs"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all shadow-xs text-xs font-bold"
                aria-label="X"
              >
                𝕏
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 hover:border-red-500/50 hover:bg-red-600 text-slate-400 hover:text-white flex items-center justify-center transition-all shadow-xs"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 hover:border-pink-500/50 hover:bg-pink-600 text-slate-400 hover:text-white flex items-center justify-center transition-all shadow-xs"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Product (2 Cols) */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
              Product
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/resume-builder" className="hover:text-white transition-colors">
                  Resume Builder
                </Link>
              </li>
              <li>
                <Link href="/ats-score" className="hover:text-white transition-colors">
                  ATS Analyzer
                </Link>
              </li>
              <li>
                <Link href="/job-search" className="hover:text-white transition-colors">
                  Job Search
                </Link>
              </li>
              <li>
                <Link href="/cover-letter" className="hover:text-white transition-colors">
                  Cover Letters
                </Link>
              </li>
              <li>
                <Link href="/interview-trainer" className="hover:text-white transition-colors">
                  Interview Trainer
                </Link>
              </li>
              <li>
                <Link href="/career-roadmap" className="hover:text-white transition-colors">
                  Career Roadmap
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Solutions (2 Cols) */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
              Solutions
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  For Students
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  For Professionals
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  For Career Changers
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  For Recruiters
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  For Teams
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Resources (2 Cols) */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
              Resources
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Career Guides
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Interview Tips
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Resume Templates
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Success Stories
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          {/* Column 5: Company (2 Cols) */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
              Company
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Terms
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2025 HireLens. All rights reserved.</p>
          <p className="flex items-center gap-1 font-medium">
            Made with <span className="text-red-500">❤️</span> for brighter careers.
          </p>
        </div>

      </div>
    </footer>
  );
}
