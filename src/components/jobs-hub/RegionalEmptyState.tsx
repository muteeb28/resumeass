import type { TabId } from "./tabs.config";

interface Attribute {
  label: string;
  value: string;
}

interface RegionalConfig {
  description: string;
  attributes: Attribute[];
  launchNote: string;
}

// Each region has a genuinely different value proposition — copy reflects that,
// not just region-swapped filler.
const CONFIGS: Record<string, RegionalConfig> = {
  "gulf-jobs": {
    description:
      "Sourcing listings across Saudi Arabia, UAE, Qatar, and Kuwait — technology, engineering, finance, and healthcare roles in the GCC expat market.",
    attributes: [
      {
        label: "Compensation",
        value: "Tax-free salaries · ₹20–80L equivalent ranges for tech roles",
      },
      {
        label: "Key sectors",
        value: "Technology, Engineering, Banking & Finance, Healthcare",
      },
      {
        label: "Target cities",
        value: "Dubai, Riyadh, Doha, Abu Dhabi, Kuwait City",
      },
      {
        label: "Sourcing from",
        value: "Bayt, Naukrigulf, GulfTalent, LinkedIn GCC",
      },
    ],
    launchNote:
      "Ingestion pipeline is being configured. First batch of listings expected soon.",
  },

  "au-nz": {
    description:
      "Tech and professional roles across Australia and New Zealand — with active visa sponsorship opportunities and permanent residency pathways.",
    attributes: [
      {
        label: "Visa pathways",
        value:
          "Skilled Nominated (190), Skilled Independent (189), NZ Skilled Migrant",
      },
      {
        label: "Key sectors",
        value: "Software, Cloud & DevOps, Healthcare, Engineering, Agritech",
      },
      {
        label: "Target cities",
        value: "Sydney, Melbourne, Perth, Auckland, Wellington",
      },
      {
        label: "Sourcing from",
        value: "Seek, LinkedIn AU, Adzuna, TradeMe Jobs",
      },
    ],
    launchNote:
      "Pipeline in progress. Listings expected to go live soon.",
  },
};

interface RegionalEmptyStateProps {
  tabId: TabId;
}

export function RegionalEmptyState({ tabId }: RegionalEmptyStateProps) {
  const config = CONFIGS[tabId];
  if (!config) return null;

  return (
    <div
      className="border border-hub-border rounded-[14px] px-7 py-8"
      style={{ fontFamily: "var(--font-hub)" }}
    >
      <p className="text-[13.5px] text-hub-text-2 leading-relaxed max-w-[520px] mb-7">
        {config.description}
      </p>

      <div className="flex flex-col gap-[9px]">
        {config.attributes.map((attr) => (
          <div key={attr.label} className="flex items-baseline gap-4">
            <span className="text-[11.5px] font-semibold text-hub-text-3 w-[110px] flex-shrink-0">
              {attr.label}
            </span>
            <span className="text-[13px] text-hub-text-2">{attr.value}</span>
          </div>
        ))}
      </div>

      <div className="mt-7 pt-5 border-t border-hub-border">
        <p className="text-[11.5px] text-hub-text-3">{config.launchNote}</p>
      </div>
    </div>
  );
}
