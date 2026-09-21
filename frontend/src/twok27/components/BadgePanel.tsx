import { cumulativeTokenCost, TIERS, type Tier } from "../engine/index.ts";
import { rules } from "../data/index.ts";
import type { BuildState } from "../useBuild.ts";
import { Card } from "./Card.tsx";

const TIER_LABEL: Record<Tier, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  hall_of_fame: "Hall of Fame",
};

const TIER_CLASS: Record<Tier, string> = {
  bronze: "text-[#C08457]",
  silver: "text-white/70",
  gold: "text-green",
  hall_of_fame: "text-cyan",
};

export function BadgePanel({ build }: { build: BuildState }) {
  const unlocked = build.evaluation.badges.filter((result) => result.tier !== null);
  const byTier = new Map<Tier, typeof unlocked>();
  for (const tier of TIERS) byTier.set(tier, []);
  for (const result of unlocked) byTier.get(result.tier as Tier)!.push(result);

  return (
    <Card
      title="Badges"
      hint="Qualifying is only half of it in 2K27 — you also spend tokens to equip. Costs shown are the full climb from nothing to that tier at this height."
    >
      {unlocked.length === 0 ? (
        <p className="text-xs text-white/35">
          No badges yet. Raise an attribute past a threshold and it appears here.
        </p>
      ) : (
        <div className="space-y-4">
          {[...TIERS].reverse().map((tier) => {
            const results = byTier.get(tier)!;
            if (results.length === 0) return null;
            return (
              <div key={tier}>
                <h4
                  className={`mb-1.5 text-[10px] font-semibold uppercase tracking-[0.25em] ${TIER_CLASS[tier]}`}
                >
                  {TIER_LABEL[tier]} · {results.length}
                </h4>
                <ul className="grid gap-1 sm:grid-cols-2">
                  {results.map(({ badge }) => {
                    const cost = cumulativeTokenCost(
                      rules,
                      badge.id,
                      tier,
                      build.body.height,
                    );
                    return (
                      <li
                        key={badge.id}
                        className="flex items-center justify-between gap-2 rounded-md bg-elevated px-2 py-1.5 text-[11px]"
                      >
                        <span className="truncate text-white/70">{badge.label}</span>
                        <span className="shrink-0 tabular-nums text-white/35">
                          {cost === null ? "—" : `${cost} tok`}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
