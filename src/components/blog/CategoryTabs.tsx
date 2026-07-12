"use client";

import { cn } from "@/lib/utils";

interface CategoryTabsProps {
  categories: string[];
  active: string;
  onSelect: (category: string) => void;
}

export default function CategoryTabs({ categories, active, onSelect }: CategoryTabsProps) {
  return (
    <div className="bg-page border-b border-border-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-7 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelect(cat)}
              className={cn(
                "flex-shrink-0 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] transition-colors duration-150 border-b-2 -mb-px",
                active === cat
                  ? "text-ink-900 border-sapphire-bright"
                  : "text-ink-500 border-transparent hover:text-ink-900 hover:border-ink-900/20"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
