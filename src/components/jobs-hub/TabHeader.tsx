import type { ReactNode } from "react";
import type { TabConfig } from "./tabs.config";
import { Lock } from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";

interface TabHeaderProps {
  config: TabConfig;
  badge?: ReactNode;
}

const ShinyButton = () => {
  // Define the keyframes and animation class as a string
  const animationStyles = `
    @keyframes shine {
      0% { transform: translateX(-100%) skewX(-15deg); }
      100% { transform: translateX(100%) skewX(-15deg); }
    }
    .animate-inline-shine {
      animation: shine 2s infinite ease-in-out;
    }
  `;

  return (
    <>
      <style>{animationStyles}</style>

      <button
        style={{
          backgroundColor: '#0a0a0a',
          boxShadow: '0 4px 15px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.1)'
        }}
        className="cursor-pointer relative flex items-center gap-2 overflow-hidden rounded-full px-4 py-0 h-8 text-[11px] font-semibold text-white active:scale-95 transition-transform"
      >
        {/* The Shine Element */}
        <span
          className="animate-inline-shine absolute inset-0 w-1/2 h-full"
          style={{
            background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.15), transparent)',
            left: '0',
            pointerEvents: 'none',
          }}
        />

        {/* Button Content */}
        <Lock size={16} strokeWidth={2.5} style={{ opacity: 0.9 }} />
        <span style={{ letterSpacing: '0.025em' }} className="mt-[2px]">Unlock All Emails & Job tracker</span>

        {/* Subtle Inner Border */}
        <div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        />
      </button>
    </>
  );
};

export function TabHeader({ config, badge }: TabHeaderProps) {

  const { membership } = useUserStore();

  return (
    <div className="flex items-center justify-between">
      <div className="mb-5" style={{ fontFamily: 'var(--font-hub)' }}>
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
      <div>
        { !membership && <ShinyButton /> }
      </div>
    </div>
  );
}
