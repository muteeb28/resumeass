"use client";

import { cn } from "@/lib/utils";

export type TemplateOption = {
  id: string;
  label: string;
  description?: string;
};

export const TemplateSwitcher = ({
  templates,
  selectedId,
  onSelect,
}: {
  templates: TemplateOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}) => {
  return (
    <div className="flex flex-wrap gap-3">
      {templates.map((template) => {
        const isActive = template.id === selectedId;
        return (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template.id)}
            className={cn(
              "rounded-xl border px-4 py-3 text-left text-sm transition",
              isActive
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
            )}
          >
            <div className="font-semibold">{template.label}</div>
            {template.description && (
              <div className="mt-1 text-xs text-neutral-400">
                {template.description}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};
