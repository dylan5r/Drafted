import type { ReactNode } from "react";

interface CardProps {
  title: string;
  hint?: string;
  right?: ReactNode;
  children: ReactNode;
}

export function Card({ title, hint, right, children }: CardProps) {
  return (
    <section className="rounded-2xl border border-slateGlow bg-surface/70 p-5 shadow-card backdrop-blur">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold tracking-wide">{title}</h3>
          {hint ? <p className="mt-1 text-xs text-white/40">{hint}</p> : null}
        </div>
        {right}
      </header>
      {children}
    </section>
  );
}

/**
 * Renders a value the rules cannot supply.
 *
 * Deliberately prominent rather than hidden: cap breakers are permanent and
 * non-refundable, so a blank with a reason beats a confident wrong number.
 */
export function Unavailable({ reason }: { reason: string }) {
  return (
    <p className="rounded-lg border border-magenta/30 bg-magenta/5 px-3 py-2 text-xs leading-relaxed text-magenta/90">
      <span className="font-semibold uppercase tracking-wider">Not known — </span>
      {reason}
    </p>
  );
}
