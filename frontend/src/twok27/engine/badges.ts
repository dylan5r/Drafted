/**
 * Badges.
 *
 * 53 badges, each with attribute thresholds across four builder tiers. A fifth
 * tier, legend, exists but cannot be reached in the builder at all -- it is
 * unlocked in-game through the Synergy system, so it is not modelled here.
 *
 * Requirements are an ordered predicate list joined by each entry's operator.
 * In the shipped data no badge has more than two predicates and none mixes AND
 * with OR, but the evaluator handles the general case (AND binds tighter than
 * OR) so new data cannot silently change the meaning of an existing badge.
 */

import type { Badge, Rules, Tier } from './types.ts';
import { TIERS } from './types.ts';

/** `63-91` in the data means "no height restriction". */
const UNRESTRICTED: [number, number] = [63, 91];

export function isHeightEligible(badge: Badge, height: number): boolean {
  const [min, max] = badge.heightRange;
  if (min === UNRESTRICTED[0] && max === UNRESTRICTED[1]) return true;
  return height >= min && height <= max;
}

function meetsRequirements(badge: Badge, tier: Tier, ratings: number[]): boolean {
  const requirements = badge.tiers[tier];
  if (!requirements || requirements.length === 0) return false;

  // Sum of products: AND-groups joined by OR.
  let group = true;
  let result = false;
  for (let i = 0; i < requirements.length; i += 1) {
    const requirement = requirements[i];
    const met = ratings[requirement.attribute] >= requirement.minimum;
    group = group && met;

    const operator = i < requirements.length - 1 ? requirement.next : null;
    if (operator === 'OR' || operator === null) {
      result = result || group;
      group = true;
    }
  }
  return result;
}

export interface BadgeResult {
  badge: Badge;
  /** Highest tier reached, or null if the build qualifies for none. */
  tier: Tier | null;
  /** Why it is unreachable, when height rules it out entirely. */
  blocked: string | null;
}

/** Highest tier this spread reaches for one badge. */
export function tierFor(badge: Badge, height: number, ratings: number[]): Tier | null {
  if (!badge.allowed || !isHeightEligible(badge, height)) return null;
  let best: Tier | null = null;
  for (const tier of TIERS) {
    if (meetsRequirements(badge, tier, ratings)) best = tier;
  }
  return best;
}

/** Every badge, with the tier this build reaches. */
export function evaluateBadges(
  rules: Rules,
  height: number,
  ratings: number[],
): BadgeResult[] {
  return rules.badges.map((badge) => {
    const eligible = badge.allowed && isHeightEligible(badge, height);
    return {
      badge,
      tier: eligible ? tierFor(badge, height, ratings) : null,
      blocked: eligible
        ? null
        : !badge.allowed
          ? 'not active in this game build'
          : `requires height ${badge.heightRange[0]}-${badge.heightRange[1]} in`,
    };
  });
}

/** Just the badges the build actually unlocks. */
export function unlockedBadges(
  rules: Rules,
  height: number,
  ratings: number[],
): BadgeResult[] {
  return evaluateBadges(rules, height, ratings).filter((result) => result.tier !== null);
}
