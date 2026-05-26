import type { ReactNode } from "react";

interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}

export function SectionTitle({ eyebrow, title, children }: SectionTitleProps) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan/70">{eyebrow}</p>
        ) : null}
        <h2 className="font-display text-2xl font-semibold tracking-wide md:text-3xl">{title}</h2>
      </div>
      {children}
    </div>
  );
}
