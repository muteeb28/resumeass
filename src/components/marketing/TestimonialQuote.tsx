import { Container, MonoLabel } from "./primitives";

export function TestimonialQuote({
  eyebrow,
  quote,
  name,
  role,
}: {
  eyebrow: string;
  quote: string;
  name: string;
  role: string;
}) {
  return (
    <section className="bg-surface-alt py-[var(--jf-space-section)]">
      <Container width="prose">
        <div className="text-center">
          <MonoLabel tone="accent">{eyebrow}</MonoLabel>
          <blockquote className="mt-6 text-2xl font-medium leading-[1.28] tracking-[-0.018em] text-ink-900 sm:text-3xl">
            &ldquo;{quote}&rdquo;
          </blockquote>
          <div className="mt-6">
            <div className="text-sm font-medium text-ink-900">{name}</div>
            <div className="text-sm text-ink-500">{role}</div>
          </div>
        </div>
      </Container>
    </section>
  );
}
