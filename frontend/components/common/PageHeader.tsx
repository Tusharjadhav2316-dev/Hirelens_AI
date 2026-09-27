import { LucideIcon } from "lucide-react";
import IconTile, { FeatureVariant } from "./IconTile";
import ScriptAccent from "./ScriptAccent";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  icon: LucideIcon;
  iconVariant?: FeatureVariant;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
  scriptText?: string;
  showScriptFlourish?: boolean;
  className?: string;
}

export default function PageHeader({
  icon,
  iconVariant = "indigo",
  title,
  subtitle,
  action,
  scriptText,
  showScriptFlourish = false,
  className = "",
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 mb-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <IconTile icon={icon} variant={iconVariant} size="lg" />
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h1>
            {scriptText && (
              <div className="hidden lg:block ml-2">
                <ScriptAccent text={scriptText} showFlourish={showScriptFlourish} />
              </div>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>

      {action && (
        <div className="flex items-center gap-3 flex-shrink-0 self-start md:self-center">
          {action}
        </div>
      )}
    </div>
  );
}
