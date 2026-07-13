import type { ReactNode } from "react";
import type { TabConfig } from "./tabs.config";
import { PageStatHeader } from "../shared/PageStatHeader";

interface TabHeaderProps {
  config: TabConfig;
  badge?: ReactNode;
}

export function TabHeader({ config, badge }: TabHeaderProps) {
  return (
    <PageStatHeader
      eyebrow={config.region}
      heading={
        <span className="flex items-center gap-3 flex-wrap">
          {config.label}
          {badge}
        </span>
      }
      intro={config.description}
      className="mb-4"
    />
  );
}
