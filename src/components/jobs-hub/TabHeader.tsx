import type { ReactNode } from "react";
import type { TabConfig } from "./tabs.config";

interface TabHeaderProps {
  config: TabConfig;
  badge?: ReactNode;
}

export function TabHeader({ config, badge }: TabHeaderProps) {
  return (
    <div style={{ fontFamily: 'var(--font-hub)' }} className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.3em] text-hub-text-3 mb-2 uppercase">
            {config.region}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-hub-text-1 tracking-tight">
              {config.label}
            </h1>
            {badge}
          </div>
          <p className="text-xs text-hub-text-3 mt-2 max-w-2xl leading-relaxed">
            {config.description}
          </p>
        </div>
      </div>
    </div>
  );
}