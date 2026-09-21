/**
 * Cap breakers.
 *
 * Post-creation rewards that raise an attribute past its builder ceiling. 28
 * are earnable across REP, Crew, Build Specialization, Lifetime Challenges and
 * the Season ladders; each attribute accepts at most five; every one is
 * permanent and non-refundable. They are only visible in-game once the build
 * reaches 99 overall, which is exactly why previewing them here is worth
 * doing.
 *
 * The honest caveat, and it is a big one: upstream measured gains at ONE body
 * (PG, 6'3", 198 lb, 78 in wingspan) under two scenarios. The gain genuinely
 * depends on the whole build, because it is computed against the build's
 * winning archetype -- so for any other body these numbers are a bracket, not
 * an answer.
 *
 * The two scenarios bracket it:
 *   `isolated`  - every other attribute at the 25 floor
 *   `near_caps` - every other attribute at its ceiling
 *
 * A real 99-overall build sits between them, so `project()` reports both and
 * labels the pair a range rather than pretending to a single number.
 */

import type { CapBreakerScenario, Maybe, Rules } from './types.ts';
import { RATING_MAX, unavailable } from './types.ts';

export const MAX_APPLICATIONS = 5;
/** Total earnable across all tracks; 26 of them can go on any attribute. */
export const TOTAL_EARNABLE = 28;

function gainsRow(
  rules: Rules,
  scenario: CapBreakerScenario,
  attribute: number,
  rating: number,
): (number | null)[] | null {
  const rows = rules.capBreakers.scenarios[scenario]?.[String(attribute)];
  if (!rows) return null;
  const row = rows[rating - rules.capBreakers.from];
  return (row as (number | null)[] | null) ?? null;
}

export interface Projection {
  scenario: CapBreakerScenario;
  /** Rating after each successive application, starting from the input. */
  steps: number[];
  /** Final rating reached. */
  rating: number;
  /** How many of the five actually landed. */
  applied: number;
  /** Set when the sequence ran out of measured data before five. */
  note: string | null;
}

/**
 * Apply up to five cap breakers under one scenario.
 *
 * The gain depends on BOTH the rating you are applying at and how many
 * breakers that attribute has already taken, so each step re-reads the table
 * at the new rating under the next application index. That is what the
 * recorded fields say: `rating` is "the starting rating before this
 * application" and `application` is "which of the five breakers".
 *
 * CALIBRATION. A player reported a 71 driving dunk finishing at 84 in the
 * retail builder. This walk predicts 85 under `near_caps` and 76 under
 * `isolated`; 84 sits one below the near-caps end, which is what a real build
 * close to (but not at) its ceilings should do. An earlier version of this
 * function read straight across the starting row instead, which predicts 94
 * for the same build -- ten points out, and wrong.
 *
 * The rival reading is seductive because summing a row lands exactly on the
 * attribute's ceiling 739 times and never overshoots. That is a property of
 * the curve, not evidence for the walk. Measured behaviour wins.
 */
export function project(
  rules: Rules,
  scenario: CapBreakerScenario,
  attribute: number,
  rating: number,
  count = MAX_APPLICATIONS,
): Projection {
  const steps: number[] = [rating];
  let current = rating;
  let applied = 0;
  let note: string | null = null;

  const limit = Math.min(count, MAX_APPLICATIONS);
  for (let application = 0; application < limit; application += 1) {
    const row = gainsRow(rules, scenario, attribute, current);
    const gain = row ? row[application] : null;
    if (gain === null || gain === undefined) {
      note =
        `no measured gain beyond ${applied} application(s) from ${rating}: the ` +
        `table was probed at ${rules.capBreakers.referenceBody.height_inches} in / ` +
        `${rules.capBreakers.referenceBody.weight_lb} lb and stops at that body's ceiling`;
      break;
    }
    if (gain === 0) break;
    current = Math.min(current + gain, RATING_MAX);
    steps.push(current);
    applied += 1;
    if (current >= RATING_MAX) break;
  }

  return { scenario, steps, rating: current, applied, note };
}

export interface CapBreakerRange {
  attribute: number;
  from: number;
  /** Lower bound: the `isolated` scenario. */
  low: Projection;
  /** Upper bound: the `near_caps` scenario. */
  high: Projection;
  /** True when both scenarios agree, so the bracket collapses to one number. */
  exact: boolean;
}

/** Both scenarios, presented as the bracket they actually are. */
export function projectRange(
  rules: Rules,
  attribute: number,
  rating: number,
  count = MAX_APPLICATIONS,
): CapBreakerRange {
  const low = project(rules, 'isolated', attribute, rating, count);
  const high = project(rules, 'near_caps', attribute, rating, count);
  return {
    attribute,
    from: rating,
    low,
    high,
    exact: low.rating === high.rating,
  };
}

/**
 * Whether a projection can be trusted for this body.
 *
 * Only the reference body is measured. Everything else is an extrapolation and
 * the UI has to say so -- these are permanent, non-refundable decisions.
 */
export function confidenceFor(
  rules: Rules,
  height: number,
  weight: number,
  wingspan: number,
): Maybe<{ exactBody: true }> {
  const reference = rules.capBreakers.referenceBody;
  if (
    height === reference.height_inches &&
    weight === reference.weight_lb &&
    wingspan === reference.wingspan_inches
  ) {
    return { available: true, exactBody: true };
  }
  return unavailable(
    `cap breaker gains were measured only at ${reference.position} ` +
      `${reference.height_inches} in / ${reference.weight_lb} lb / ` +
      `${reference.wingspan_inches} in wingspan; for this body they are an ` +
      `estimate bracketed by the two scenarios, not a measurement`,
  );
}
