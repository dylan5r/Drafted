/**
 * NBA 2K27 build engine -- public API.
 *
 * Pure TypeScript, no dependencies, no I/O. Every function takes the rules
 * tables explicitly, so the same code runs in the browser on every slider
 * frame and under `node --test` against the game's own measurements.
 *
 * Provenance and confidence live in `docs/nba2k27/RESEARCH.md`. The short
 * version: the ceiling formula and the overall rating reproduce the game's
 * measurements exactly, the cap breaker table covers one body, and the badge
 * slot allocator is unresolved. Anything the data cannot answer comes back as
 * `{ available: false, reason }` rather than a plausible-looking number.
 */

export * from './types.ts';
export * from './bodies.ts';
export * from './ceilings.ts';
export * from './ovr.ts';
export * from './constraints.ts';
export * from './badges.ts';
export * from './tokens.ts';
export * from './capBreakers.ts';

import { ceilingsFor } from './ceilings.ts';
import { evaluateBadges, type BadgeResult } from './badges.ts';
import { forcedMinimums, withForcedMinimums, type ForcedMinimum } from './constraints.ts';
import { overallFor, type OvrResult } from './ovr.ts';
import { slots, tokensEarned, type TokensByDiscipline } from './tokens.ts';
import {
  confidenceFor,
  projectRange,
  type CapBreakerRange,
} from './capBreakers.ts';
import type { Body, Maybe, Rules } from './types.ts';
import { ATTRIBUTE_COUNT, RATING_FLOOR } from './types.ts';

export interface BuildEvaluation {
  body: Body;
  /** What the user set. */
  ratings: number[];
  /**
   * What the build actually is, once linked-attribute minimums have cascaded.
   *
   * Everything downstream -- overall, badges, tokens, cap breakers -- is
   * computed on this, not on `ratings`, because this is the spread the game
   * ends up with. Asking for 94 Speed With Ball buys Speed, Ball Handle and
   * Agility whether you wanted them or not, and pricing the raw picks would
   * quietly understate the build.
   */
  effective: number[];
  /** Per-attribute ceiling; `null` where the game ships no rule. */
  ceilings: (number | null)[];
  /** Attributes set above what this body allows. Non-empty means impossible. */
  overCeiling: { attribute: number; rating: number; ceiling: number }[];
  overall: OvrResult;
  forced: ForcedMinimum[];
  badges: BadgeResult[];
  unlockedCount: number;
  tokens: Maybe<{ byDiscipline: TokensByDiscipline; total: number }>;
  slotTotal: number;
  slotSplit: Maybe<TokensByDiscipline>;
  capBreakers: CapBreakerRange[];
  capBreakerConfidence: Maybe<{ exactBody: true }>;
}

/** The default spread: every attribute at the floor. */
export function emptyRatings(): number[] {
  return new Array(ATTRIBUTE_COUNT).fill(RATING_FLOOR);
}

/**
 * Everything the builder page shows, in one pass.
 *
 * Cheap enough to run on every slider frame: the overall is 15 archetypes of
 * 21 multiply-adds, and the rest are table lookups.
 */
export function evaluateBuild(rules: Rules, body: Body, ratings: number[]): BuildEvaluation {
  const ceilings = ceilingsFor(rules, body);
  const forced = forcedMinimums(rules, body.height, ratings);
  const effective = withForcedMinimums(rules, body.height, ratings);

  // A forced minimum can land above the body's ceiling. That is not a bug in
  // the cascade, it is the build being impossible -- the body cannot carry the
  // attribute the headline pick demands -- so it is reported the same way an
  // over-ceiling pick is.
  const overCeiling: BuildEvaluation['overCeiling'] = [];
  for (let a = 0; a < ATTRIBUTE_COUNT; a += 1) {
    const ceiling = ceilings[a];
    if (ceiling !== null && effective[a] > ceiling) {
      overCeiling.push({ attribute: a, rating: effective[a], ceiling });
    }
  }

  const badges = evaluateBadges(rules, body.height, effective);
  const unlockedCount = badges.reduce((n, result) => n + (result.tier ? 1 : 0), 0);

  const capBreakers: CapBreakerRange[] = [];
  for (let a = 0; a < ATTRIBUTE_COUNT; a += 1) {
    capBreakers.push(projectRange(rules, a, effective[a]));
  }

  const slotting = slots(unlockedCount > 0);

  return {
    body,
    ratings,
    effective,
    ceilings,
    overCeiling,
    overall: overallFor(rules, body.height, effective),
    forced,
    badges,
    unlockedCount,
    tokens: tokensEarned(rules, body.height, effective),
    slotTotal: slotting.total,
    slotSplit: slotting.byDiscipline,
    capBreakers,
    capBreakerConfidence: confidenceFor(rules, body.height, body.weight, body.wingspan),
  };
}
