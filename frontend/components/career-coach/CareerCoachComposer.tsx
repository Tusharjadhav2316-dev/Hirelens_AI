import React, { useRef, useEffect } from "react";
import {
  Send,
  Paperclip,
  Sparkles,
  Target,
  Code2,
  DollarSign,
  FileText,
  X,
  Loader2,
  Compass,
  Layers,
  Calendar,
  Briefcase,
  Users,
  Award,
  Zap,
  TrendingUp,
  ShieldCheck,
  BarChart3,
  ArrowRightLeft,
} from "lucide-react";
import { TopicQuickTool } from "./CareerCoachConfig";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Target,
  Code2,
  DollarSign,
  FileText,
  Compass,
  Layers,
  Calendar,
  Briefcase,
  Users,
  Award,
  Zap,
  TrendingUp,
  ShieldCheck,
  BarChart3,
  ArrowRightLeft,
  Sparkles,
};

interface CareerCoachComposerProps {
  inputValue: string;
  onInputChange: (val: string) => void;
  onSend: (text?: string) => void;
  isStreaming: boolean;
  quickTools: TopicQuickTool[];
  onAttachFile?: () => void;
  attachedFileName?: string | null;
  onRemoveAttachment?: () => void;
  onQuickPrompt?: (promptText: string) => void;
}

export default function CareerCoachComposer({
  inputValue,
  onInputChange,
  onSend,
  isStreaming,
  quickTools,
  onAttachFile,
  attachedFileName,
  onRemoveAttachment,
  onQuickPrompt,
}: CareerCoachComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim() && !isStreaming) {
        onSend();
      }
    }
  };

  return (
    <div className="p-3.5 sm:p-4 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-2xl space-y-2.5 flex-shrink-0">
      {/* Quick Tool Pills (Dynamic per Topic) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-xs">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex-shrink-0 mr-1">
          Topic Tools:
        </span>
        {quickTools.map((tool, idx) => {
          const IconComp = ICON_MAP[tool.iconName] || Sparkles;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onQuickPrompt && onQuickPrompt(tool.prompt)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300 border border-slate-200/80 dark:border-slate-700/80 transition-colors text-[11px] font-medium flex-shrink-0 cursor-pointer shadow-2xs"
            >
              <IconComp className="w-3 h-3 text-blue-500" />
              <span>{tool.label}</span>
            </button>
          );
        })}
      </div>

      {/* Attached File Chip */}
      {attachedFileName && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/80 text-xs text-blue-700 dark:text-blue-300 w-fit">
          <FileText className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <span className="font-semibold truncate max-w-xs">{attachedFileName}</span>
          <button
            type="button"
            onClick={onRemoveAttachment}
            className="ml-1 text-slate-400 hover:text-red-500 transition-colors p-0.5 rounded-full"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Input Box and Action Buttons — Perfectly Aligned Single Row */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (inputValue.trim() && !isStreaming) {
            onSend();
          }
        }}
        className="flex items-center gap-2 sm:gap-2.5"
      >
        <div className="relative flex-1 flex items-center min-w-0">
          {onAttachFile && (
            <button
              type="button"
              onClick={onAttachFile}
              title="Attach document or resume context"
              className="absolute left-3 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50 z-10 cursor-pointer"
            >
              <Paperclip className="w-4.5 h-4.5" />
            </button>
          )}

          <textarea
            ref={textareaRef}
            rows={1}
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value.slice(0, 2000))}
            onKeyDown={handleKeyDown}
            placeholder="Ask your Career Coach a strategic question or ask for milestone guidance..."
            className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:bg-white dark:focus:bg-slate-800 transition-all custom-scrollbar flex items-center"
            style={{ minHeight: "44px", maxHeight: "120px" }}
          />
        </div>

        <button
          type="submit"
          disabled={!inputValue.trim() || isStreaming}
          className="h-11 px-4 sm:px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs sm:text-sm rounded-xl transition shadow-xs shadow-blue-500/20 flex items-center justify-center gap-1.5 flex-shrink-0 cursor-pointer"
        >
          {isStreaming ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send</span>
            </>
          )}
        </button>
      </form>

      {/* Footer Info & Counter */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 px-1">
        <span>Strategic guidance aligned with your current coaching focus and industry roadmaps.</span>
        <span className={inputValue.length > 1800 ? "text-amber-500 font-semibold" : ""}>
          {inputValue.length} / 2000
        </span>
      </div>
    </div>
  );
}
