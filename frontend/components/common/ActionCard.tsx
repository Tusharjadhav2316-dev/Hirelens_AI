import { LucideIcon, ArrowRight } from "lucide-react";
import IconTile, { FeatureVariant } from "./IconTile";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ActionCardProps {
  icon: LucideIcon;
  iconVariant?: FeatureVariant;
  title: string;
  description: string;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export default function ActionCard({
  icon,
  iconVariant = "indigo",
  title,
  description,
  href,
  onClick,
  className = "",
}: ActionCardProps) {
  const content = (
    <div
      className={cn(
        "group relative flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div>
        <IconTile icon={icon} variant={iconVariant} size="md" className="mb-3.5" />
        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {title}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="flex items-center justify-end mt-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }

  return content;
}
