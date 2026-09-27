import { cn } from "@/lib/utils";

interface ScriptAccentProps {
  text?: string;
  className?: string;
  rotation?: string;
  showFlourish?: boolean;
}

export default function ScriptAccent({
  text = "Same You. Bigger Opportunities.",
  className = "",
  rotation = "-rotate-3",
  showFlourish = false,
}: ScriptAccentProps) {
  return (
    <div
      className={cn(
        "inline-flex flex-col items-center select-none font-script pointer-events-none",
        rotation,
        className
      )}
    >
      <span className="text-xl sm:text-2xl text-slate-500/80 dark:text-slate-400/80 tracking-wide font-medium">
        {text}
      </span>
      {showFlourish && (
        <svg
          className="w-20 h-3 text-indigo-400/60 dark:text-indigo-400/40 -mt-1"
          viewBox="0 0 100 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 10 C 35 2, 65 14, 95 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  );
}
