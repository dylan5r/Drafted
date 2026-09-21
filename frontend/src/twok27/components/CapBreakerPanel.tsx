import { MAX_APPLICATIONS, TOTAL_EARNABLE, type CapBreakerRange } from "../engine/index.ts";
import { rules } from "../data/index.ts";
import type { BuildState } from "../useBuild.ts";
import { Card, Unavailable } from "./Card.tsx";

function span(range: CapBreakerRange): number {
  return range.high.rating - range.from;
}

function Ladder({ range }: { range: CapBreakerRange }) {
  const steps = [];
  for (let i = 1; i <= MAX_APPLICATIONS; i += 1) {
    const low = range.low.steps[i];
    const high = range.high.steps[i];
    steps.push(
      <li key={i} className="flex items-center justify-between gap-2 py-1">
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">
          Breaker {i}
        </span>
        <span className="font-display text-sm tabular-nums">
          {high === undefined ? (
            <span className="text-white/25">—</span>
          ) : low === high ? (
            <span className="text-cyan">{high}</span>
          ) : (
            <span className="text-cyan">
              {low ?? range.low.rating}
              <span className="mx-1 text-white/25">–</span>
              {high}
            </span>
          )}
        </span>
      </li>,
    );
  }
  return <ul className="divide-y divide-white/5">{steps}</ul>;
}

interface Props {
  build: BuildState;
  selected: number | null;
}

export function CapBreakerPanel({ build, selected }: Props) {
  const { capBreakers, capBreakerConfidence } = build.evaluation;

  // Where the 28 you can actually earn are worth spending, best first. The
  // upper bound drives the ranking because a finished build sits nearer the
  // near-caps scenario than the isolated one.
  const ranked = capBreakers
    .map((range) => ({ range, gain: span(range) }))
    .filter((entry) => entry.gain > 0)
    .sort((a, b) => b.gain - a.gain)
    .slice(0, 8);

  const focus = selected === null ? null : capBreakers[selected];

  return (
    <Card
      title="Cap breakers"
      hint={`${TOTAL_EARNABLE} earnable, at most ${MAX_APPLICATIONS} per attribute, every one permanent. The game will not show you any of this until the build hits 99 overall.`}
    >
      {!capBreakerConfidence.available ? (
        <div className="mb-4">
          <Unavailable reason={capBreakerConfidence.reason} />
        </div>
      ) : (
        <p className="mb-4 rounded-lg border border-cyan/25 bg-cyan/5 px-3 py-2 text-[11px] text-cyan/80">
          This is the exact body the gains were measured at, so these numbers
          are measurements rather than a bracket.
        </p>
      )}

      {focus ? (
        <div className="mb-5 rounded-xl border border-slateGlow bg-elevated p-3">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="font-display text-sm">
              {rules.attributes[focus.attribute].label}
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">
              from {focus.from}
            </span>
          </div>
          <Ladder range={focus} />
          {focus.high.note ? (
            <p className="mt-2 text-[10px] leading-relaxed text-magenta/80">
              {focus.high.note}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="mb-5 text-xs text-white/35">
          Pick an attribute on the left to see its full five-breaker ladder.
        </p>
      )}

      <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/35">
        Best return, all five applied
      </h4>
      {ranked.length === 0 ? (
        <p className="text-xs text-white/35">
          Nothing to gain yet — every attribute is already at its ceiling or has
          no measured headroom.
        </p>
      ) : (
        <ul className="space-y-1">
          {ranked.map(({ range, gain }) => (
            <li
              key={range.attribute}
              className="flex items-center gap-2 rounded-md bg-elevated px-2 py-1.5 text-[11px]"
            >
              <span className="flex-1 truncate text-white/70">
                {rules.attributes[range.attribute].label}
              </span>
              <span className="tabular-nums text-white/40">
                {range.from} → {range.high.rating}
              </span>
              <span className="w-10 text-right font-display tabular-nums text-green">
                +{gain}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
