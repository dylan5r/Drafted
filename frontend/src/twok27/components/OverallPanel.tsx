import type { BuildState } from "../useBuild.ts";
import { Card, Unavailable } from "./Card.tsx";

export function OverallPanel({ build }: { build: BuildState }) {
  const { overall, overCeiling, unlockedCount, tokens, slotTotal } = build.evaluation;
  const impossible = overCeiling.length > 0;

  return (
    <Card
      title="Overall"
      hint="There is no attribute point pool in 2K27. You raise sliders until the overall reads 99, so a point's real price is its weight in the per-height rating formula."
    >
      <div className="flex items-end gap-4">
        <div>
          <div
            className={`font-display text-6xl font-semibold leading-none tabular-nums ${
              impossible ? "text-magenta" : "text-cyan"
            }`}
          >
            {overall.overall}
          </div>
          <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/35">
            Archetype {overall.archetype}
          </p>
        </div>
        <dl className="flex-1 space-y-1 text-xs">
          <div className="flex justify-between">
            <dt className="text-white/40">Exact</dt>
            <dd className="tabular-nums text-white/70">{overall.detailed.toFixed(6)}</dd>
          </div>
          {overall.uncapped > 99 ? (
            <div className="flex justify-between">
              <dt className="text-white/40">Before clamp</dt>
              <dd className="tabular-nums text-white/70">{overall.uncapped.toFixed(4)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between">
            <dt className="text-white/40">Badges unlocked</dt>
            <dd className="tabular-nums text-white/70">{unlockedCount} / 53</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-white/40">Badge slots</dt>
            <dd className="tabular-nums text-white/70">{slotTotal}</dd>
          </div>
        </dl>
      </div>

      {overall.uncapped > 99 && overall.overall === 98 ? (
        <p className="mt-3 rounded-lg border border-green/25 bg-green/5 px-3 py-2 text-[11px] leading-relaxed text-green/80">
          This spread prices above 99 but still shows 98. The game holds an
          incomplete build one step below 99 — only a fully maxed spread
          displays a clean 99.
        </p>
      ) : null}

      {impossible ? (
        <p className="mt-3 rounded-lg border border-magenta/30 bg-magenta/5 px-3 py-2 text-[11px] text-magenta/90">
          {overCeiling.length} attribute{overCeiling.length === 1 ? " is" : "s are"} above
          what this body allows. This build cannot exist.
        </p>
      ) : null}

      <div className="mt-4 border-t border-slateGlow pt-3">
        <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/35">
          Badge tokens
        </h4>
        {tokens.available ? (
          <div className="grid grid-cols-3 gap-1.5 text-[11px]">
            {Object.entries(tokens.byDiscipline).map(([discipline, value]) => (
              <div key={discipline} className="rounded-md bg-elevated px-2 py-1.5">
                <div className="truncate text-white/40">{discipline}</div>
                <div className="font-display tabular-nums text-white">{value}</div>
              </div>
            ))}
            <div className="col-span-3 mt-1 flex justify-between rounded-md bg-cyan/10 px-2 py-1.5">
              <span className="text-cyan/70">Total earned</span>
              <span className="font-display tabular-nums text-cyan">{tokens.total}</span>
            </div>
          </div>
        ) : (
          <Unavailable reason={tokens.reason} />
        )}
      </div>
    </Card>
  );
}
