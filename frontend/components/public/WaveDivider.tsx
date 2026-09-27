import React from "react";
import { cn } from "@/lib/utils";

interface WaveDividerProps {
  fill?: string;
  className?: string;
  inverted?: boolean;
}

export default function WaveDivider({
  fill = "fill-white dark:fill-slate-950",
  className = "",
  inverted = false,
}: WaveDividerProps) {
  return (
    <div
      className={cn(
        "w-full overflow-hidden leading-none pointer-events-none select-none",
        inverted ? "rotate-180" : "",
        className
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("w-full h-12 sm:h-16 md:h-24 block", fill)}
        preserveAspectRatio="none"
      >
        <path
          d="M0,32L60,42.7C120,53,240,75,360,80C480,85,600,75,720,58.7C840,43,960,21,1080,21.3C1200,21,1320,43,1380,53.3L1440,64L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
