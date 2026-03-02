interface Props {
    currentTemplate: string;
    onChange: (template: string) => void;
}

const templates = [
    { id: "modern", name: "Modern" },
    { id: "professional", name: "Professional" },
    { id: "minimalist", name: "Minimalist" },
    { id: "creative", name: "Creative" }
];

export default function TemplateSwitcher({ currentTemplate, onChange }: Props) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Template:</span>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                {templates.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => onChange(t.id)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${currentTemplate === t.id
                                ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            }`}
                    >
                        {t.name}
                    </button>
                ))}
            </div>
        </div>
    );
}
