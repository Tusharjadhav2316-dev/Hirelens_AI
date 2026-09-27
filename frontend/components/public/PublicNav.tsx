"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  ChevronDown, 
  Menu, 
  X, 
  Sparkles, 
  FileText, 
  Target, 
  Briefcase, 
  PenTool, 
  Mic, 
  TrendingUp,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Zap,
  CreditCard,
  Crown,
  Building2,
  Compass
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function PublicNav() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveDropdown(null);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleMouseEnter = (name: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(name);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  return (
    <header
      ref={navRef}
      className="absolute top-0 left-0 right-0 z-50 w-full bg-[#0a0f26]/30 backdrop-blur-md border-b border-white/10 text-white transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Wordmark */}
        <Link
          href="/"
          className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-4 h-4 fill-white" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
              HireLens
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-500/20 border border-blue-400/30 text-blue-300">
              AI
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links (4 Dropdown Groups) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {/* 1. Product Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter("product")}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => toggleDropdown("product")}
              aria-expanded={activeDropdown === "product"}
              aria-haspopup="true"
              className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <span>Product</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  activeDropdown === "product" ? "rotate-180" : ""
                }`}
              />
            </button>

            {activeDropdown === "product" && (
              <div 
                className="absolute left-0 top-full pt-1.5 w-72 z-50"
                onMouseEnter={() => handleMouseEnter("product")}
                onMouseLeave={handleMouseLeave}
              >
                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 animate-in fade-in zoom-in-95 duration-150">
                  <a
                    href="#features"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Platform Features</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Explore AI resume and interview tools</p>
                    </div>
                  </a>
                  <a
                    href="#how-it-works"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">How It Works</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Step-by-step career acceleration flow</p>
                    </div>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* 2. Solutions Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter("solutions")}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => toggleDropdown("solutions")}
              aria-expanded={activeDropdown === "solutions"}
              aria-haspopup="true"
              className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <span>Solutions</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  activeDropdown === "solutions" ? "rotate-180" : ""
                }`}
              />
            </button>

            {activeDropdown === "solutions" && (
              <div 
                className="absolute left-0 top-full pt-1.5 w-80 z-50"
                onMouseEnter={() => handleMouseEnter("solutions")}
                onMouseLeave={handleMouseLeave}
              >
                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 animate-in fade-in zoom-in-95 duration-150">
                  <Link
                    href="/resume-builder"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Resume Builder</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Create, edit, and optimize resumes with AI</p>
                    </div>
                  </Link>

                  <Link
                    href="/ats-score"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center flex-shrink-0">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">ATS Analyzer</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Check ATS score and keyword insights</p>
                    </div>
                  </Link>

                  <Link
                    href="/job-search"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Job Search</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Match opportunities to your skill profile</p>
                    </div>
                  </Link>

                  <Link
                    href="/cover-letter"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
                      <PenTool className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Cover Letters</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Generate tailored cover letters in seconds</p>
                    </div>
                  </Link>

                  <Link
                    href="/interview-trainer"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                      <Mic className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Interview Trainer</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Practice with AI and build confidence</p>
                    </div>
                  </Link>

                  <Link
                    href="/career-roadmap"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Career Roadmap</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Personalized guidance for long-term growth</p>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* 3. Resources Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter("resources")}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => toggleDropdown("resources")}
              aria-expanded={activeDropdown === "resources"}
              aria-haspopup="true"
              className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <span>Resources</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  activeDropdown === "resources" ? "rotate-180" : ""
                }`}
              />
            </button>

            {activeDropdown === "resources" && (
              <div 
                className="absolute left-0 top-full pt-1.5 w-72 z-50"
                onMouseEnter={() => handleMouseEnter("resources")}
                onMouseLeave={handleMouseLeave}
              >
                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-2.5 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-500" /> Career Guides
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
                        Coming Soon
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Curated guides for resume optimization and technical rounds.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-blue-500" /> Interview Cheatsheets
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
                        Coming Soon
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Top behavioral & technical question playbooks.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. Pricing Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter("pricing")}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => toggleDropdown("pricing")}
              aria-expanded={activeDropdown === "pricing"}
              aria-haspopup="true"
              className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <span>Pricing</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  activeDropdown === "pricing" ? "rotate-180" : ""
                }`}
              />
            </button>

            {activeDropdown === "pricing" && (
              <div 
                className="absolute left-0 top-full pt-1.5 w-72 z-50"
                onMouseEnter={() => handleMouseEnter("pricing")}
                onMouseLeave={handleMouseLeave}
              >
                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 animate-in fade-in zoom-in-95 duration-150">
                  <Link
                    href="/signup"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">Free Plan</h4>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">$0</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Core builder, ATS scoring & job matches</p>
                    </div>
                  </Link>

                  <div className="flex items-start gap-3 p-2.5 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                      <Crown className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">Pro Career Pass</h4>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">Soon</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Unlimited AI mock sessions & coaching</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">Enterprise</h4>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">Soon</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">University & team cohort licenses</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right Section: Theme Toggle + Auth CTAs */}
        <div className="hidden sm:flex items-center gap-3">
          <ThemeToggle />

          <Link
            href="/login"
            className="px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            Sign in
          </Link>

          <Link
            href="/signup"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center gap-1.5"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex sm:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md px-4 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-1">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              How It Works
            </a>
            <Link
              href="/resume-builder"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Resume Builder
            </Link>
            <Link
              href="/ats-score"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              ATS Analyzer
            </Link>
            <Link
              href="/interview-trainer"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Interview Trainer
            </Link>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Pricing
            </a>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full py-2.5 text-center text-sm font-semibold text-slate-800 dark:text-slate-200 rounded-xl bg-slate-100 dark:bg-slate-800"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full py-2.5 text-center text-sm font-bold text-white rounded-xl bg-blue-600 hover:bg-blue-700 shadow-xs"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
