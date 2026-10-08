import { ShieldCheck, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustRowProps {
  className?: string;
}

export default function TrustRow({ className = "" }: TrustRowProps) {
  const trustItems = [
    {
      icon: ShieldCheck,
      iconColor: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/40",
      title: "Secure & Private",
      subtitle: "Your data is always protected",
    },
    {
      icon: Users,
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/40",
      title: "Trusted by 500K+",
      subtitle: "Students & professionals",
    },
    {
      icon: Zap,
      iconColor: "text-violet-600 dark:text-violet-400",
      bgColor: "bg-violet-50 dark:bg-violet-950/40",
      title: "AI-Powered",
      subtitle: "Smarter career growth",
    },
  ];

  return (
    <div
      className={cn(
        "grid grid-cols-3 gap-2 pt-6 border-t border-slate-100 dark:border-slate-800/80",
        className
      )}
    >
      {trustItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div key={idx} className="flex items-start gap-2 group">
            <div
              className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                item.bgColor,
                item.iconColor
              )}
            >
              <Icon className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 leading-tight block">
                {item.title}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight block mt-0.5">
                {item.subtitle}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
