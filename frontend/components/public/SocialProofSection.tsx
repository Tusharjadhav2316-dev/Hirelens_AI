"use client";

import { Star, ChevronLeft, ChevronRight } from "lucide-react";

export default function SocialProofSection() {
  const testimonials = [
    {
      quote: "HireLens helped me refine my resume and prepare for interviews. I landed my dream role in just a few weeks!",
      name: "Priya Sharma",
      role: "Product Designer",
      initials: "PS",
      initialsBg: "from-blue-600 to-indigo-600",
    },
    {
      quote: "The AI suggestions were spot on! It's like having a career coach available 24/7.",
      name: "Arjun Mehta",
      role: "Data Analyst",
      initials: "AM",
      initialsBg: "from-violet-600 to-purple-600",
    },
    {
      quote: "From resume to interview prep, everything I needed was in one place. Highly recommended!",
      name: "Neha Kapoor",
      role: "Marketing Specialist",
      initials: "NK",
      initialsBg: "from-emerald-600 to-teal-600",
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Left Title & Right Navigation Arrows */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div className="space-y-2.5 max-w-2xl">
            <div className="text-xs font-extrabold tracking-widest text-blue-600 dark:text-blue-400 uppercase">
              REAL STORIES, REAL PROGRESS
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Professionals are building brighter futures with HireLens.
            </h2>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center transition-all shadow-xs"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="w-10 h-10 rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 flex items-center justify-center transition-all shadow-xs"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3 Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between p-7 rounded-3xl bg-slate-50/70 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* Quote */}
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed font-normal mb-8">
                &ldquo;{item.quote}&rdquo;
              </p>

              {/* Author Info + Stars */}
              <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${item.initialsBg} text-white font-bold text-xs flex items-center justify-center shadow-xs`}>
                    {item.initials}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {item.name}
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {item.role}
                    </div>
                  </div>
                </div>

                {/* 5 Yellow Stars */}
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
