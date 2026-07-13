import * as React from "react";
import { Container, MonoLabel } from "./primitives";
import { cn } from "../../lib/utils";

export function FeatureRow({
  eyebrow,
  heading,
  copy,
  checklist,
  linkHref,
  linkLabel,
  panel,
  reverse = false,
}: {
  eyebrow: string;
  heading: string;
  copy: string;
  checklist: string[];
  linkHref: string;
  linkLabel: string;
  panel: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <section
      className={cn(
        "py-[var(--jf-space-section)]",
        reverse ? "border-y border-border-soft bg-surface-alt" : "bg-page"
      )}
    >
      <Container width="content">
        <div className={cn("grid items-center gap-[var(--jf-gap-feature)] lg:grid-cols-2")}>
          <div className={cn(reverse && "lg:order-2")}>
            <MonoLabel tone="accent">{eyebrow}</MonoLabel>
            <h3 className="mt-3 max-w-[420px] text-[1.75rem] font-medium leading-[1.1] tracking-[-0.018em] text-ink-900 sm:text-[2.375rem]">
              {heading}
            </h3>
            <p className="mt-4 max-w-md text-[17px] leading-[1.6] text-ink-600">{copy}</p>
            <ul className="mt-6 space-y-2.5">
              {checklist.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[15px] leading-[1.45] text-ink-700">
                  <span className="mt-0.5 text-sapphire-brand">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <a
              href={linkHref}
              className="mt-6 inline-block text-sm font-medium text-sapphire-bright transition-colors duration-150 hover:text-sapphire-brand"
            >
              {linkLabel} →
            </a>
          </div>
          <div className={cn(reverse && "lg:order-1")}>{panel}</div>
        </div>
      </Container>
    </section>
  );
}
