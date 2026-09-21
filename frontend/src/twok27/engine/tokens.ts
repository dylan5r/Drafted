/**
 * Badge tokens.
 *
 * New in 2K27: qualifying for a badge is not enough, you also spend tokens to
 * equip it. A build earns tokens from its attributes and pays a per-height
 * price per badge per tier -- so the same spread can afford a different badge
 * set at 6'4" than at 6'9".
 *
 * Earnings are additive across attributes (upstream confirmed this against
 * 2,048 native vectors), so a build's budget is the sum of its 21 rows.
 *
 * Slot allocation is NOT additive and its formula is unresolved, so this
 * module deliberately does not compute a per-discipline split. See `slots()`.
 */

import type { Discipline, Maybe, Rules, Tier } from './types.ts';
import { ATTRIBUTE_COUNT, DISCIPLINES, TIERS, unavailable } from './types.ts';

export type TokensByDiscipline = Record<Discipline, number>;

function emptyTotals(): TokensByDiscipline {
  return {
    finishing: 0,
    shooting: 0,
    playmaking: 0,
    defense: 0,
    rebounding: 0,
    physicals: 0,
  };
}

/**
 * Tokens this build earns, split by discipline.
 *
 * Unavailable at 6'10" and above: the capture recorded zero tokens for every
 * attribute at those heights while the slot data in the same rows kept
 * working, which is the signature of a capture that stopped recording rather
 * than a game rule. Reported at face value it would tell every centre they
 * earn no tokens at all, so we decline instead.
 */
export function tokensEarned(
  rules: Rules,
  height: number,
  ratings: number[],
): Maybe<{ byDiscipline: TokensByDiscipline; total: number }> {
  if (rules.tokenContributions.unusableHeights.includes(height)) {
    return unavailable(
      `badge token earnings are not known at ${height} in: the source capture ` +
        `recorded zero for every attribute at ${rules.tokenContributions.unusableHeights[0]} in ` +
        `and above, which is missing data rather than a game rule`,
    );
  }

  const table = rules.tokenContributions.table[String(height)];
  if (!table) {
    return unavailable(`no badge token data for height ${height} in`);
  }

  const byDiscipline = emptyTotals();
  let total = 0;
  for (let a = 0; a < ATTRIBUTE_COUNT; a += 1) {
    const row = table[String(a)];
    if (!row) continue;
    const earned = row[ratings[a] - rules.tokenContributions.from] ?? 0;
    if (earned === 0) continue;
    byDiscipline[rules.attributes[a].discipline] += earned;
    total += earned;
  }
  return { available: true, byDiscipline, total };
}

/**
 * The shipped token price for one tier of one badge at this height.
 *
 * This is the price of the STEP, not of the tier outright -- see
 * `cumulativeTokenCost`. The shipped numbers run 3/2/1/1 (bronze, silver,
 * gold, hall of fame) for most badges, and the alternative reading, that a
 * tier's price is absolute, would make hall of fame cost one token against
 * bronze's three and leave bronze strictly dominated. Nobody would ever equip
 * it. So these are increments.
 *
 * That reading is an INFERENCE. Upstream describes the field only as "tokens
 * required" and never disambiguated it. If it turns out to be absolute, this
 * function is already correct and `cumulativeTokenCost` is the one to delete.
 */
export function stepTokenCost(
  rules: Rules,
  badgeId: number,
  tier: Tier,
  height: number,
): number | null {
  const cost = rules.tokenCosts[String(badgeId)]?.[tier]?.[String(height)];
  return cost === undefined ? null : cost;
}

/**
 * What it costs to take a badge from unequipped all the way to `tier`.
 *
 * The sum of every step up to and including it. Depends on the increment
 * reading documented on `stepTokenCost`.
 */
export function cumulativeTokenCost(
  rules: Rules,
  badgeId: number,
  tier: Tier,
  height: number,
): number | null {
  let total = 0;
  for (const step of TIERS) {
    const cost = stepTokenCost(rules, badgeId, step, height);
    if (cost === null) return null;
    total += cost;
    if (step === tier) return total;
  }
  return null;
}

/**
 * Badge slots.
 *
 * A build that qualifies for at least one badge gets 20 slots; one that
 * qualifies for nothing gets 0, not 20.
 *
 * The per-discipline split is a deterministic function of (per-discipline
 * token totals, per-discipline count of qualifying badges) -- upstream
 * established that much across 2,084 distinct feature keys with no key mapping
 * to two allocations. The combining rule itself was never recovered: the
 * shipped `maximums` are demonstrably not caps, and no blend value fits better
 * than 27% of the ground truth. So the split is reported as unavailable rather
 * than guessed.
 */
export function slots(qualifiesForAnyBadge: boolean): {
  total: number;
  byDiscipline: Maybe<Record<Discipline, number>>;
} {
  return {
    total: qualifiesForAnyBadge ? 20 : 0,
    byDiscipline: unavailable(
      'the per-discipline slot allocator is unresolved: its inputs are known ' +
        '(per-discipline token totals and qualifying badge counts) but the ' +
        'combining rule reproduces only 27% of the measured allocations',
    ),
  };
}

export { DISCIPLINES };
