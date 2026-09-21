/**
 * Attribute ceilings.
 *
 *   ceiling = clamp(round(25 + 74 * heightMult * weightMult * wingspanMult), 25, 99)
 *
 * Weight and wingspan ship two endpoint rows per whole-inch height and
 * interpolate linearly between them. Reproduces all 21 measured ceilings at
 * the reference body exactly.
 */

import type { Body, MultiplierEndpoint, Rules } from './types.ts';
import { ATTRIBUTE_COUNT, RATING_FLOOR, RATING_MAX } from './types.ts';

const SPAN = RATING_MAX - RATING_FLOOR; // 74

/** Linear interpolation between the two shipped endpoints, clamped outside them. */
function interpolate(points: MultiplierEndpoint[], at: number, attribute: number): number {
  if (points.length === 0) return 1;
  if (points.length === 1) return points[0].mult[attribute];

  const first = points[0];
  const last = points[points.length - 1];
  if (at <= first.at) return first.mult[attribute];
  if (at >= last.at) return last.mult[attribute];

  for (let i = 0; i < points.length - 1; i += 1) {
    const lo = points[i];
    const hi = points[i + 1];
    if (at >= lo.at && at <= hi.at) {
      const span = hi.at - lo.at;
      if (span === 0) return lo.mult[attribute];
      const t = (at - lo.at) / span;
      return lo.mult[attribute] + t * (hi.mult[attribute] - lo.mult[attribute]);
    }
  }
  return last.mult[attribute];
}

/**
 * The ceiling for one attribute, or `null` where the game ships no rule.
 *
 * `null` happens for exactly one case: StandingDunk at 69-72 in, where the
 * HeightMultiplier block has no row. Those are legal PG heights and upstream
 * never determined what the engine substitutes, so we decline rather than
 * pick a plausible-looking default.
 */
export function ceilingFor(rules: Rules, body: Body, attribute: number): number | null {
  const heightMults = rules.ceilings.heightMult[String(body.height)];
  if (!heightMults) return null;

  const heightMult = heightMults[attribute];
  if (heightMult === null || heightMult === undefined) return null;

  const weightMult = interpolate(
    rules.ceilings.weightMult[String(body.height)] ?? [],
    body.weight,
    attribute,
  );
  const wingspanMult = interpolate(
    rules.ceilings.wingspanMult[String(body.height)] ?? [],
    body.wingspan,
    attribute,
  );

  const raw = RATING_FLOOR + SPAN * heightMult * weightMult * wingspanMult;
  return Math.min(Math.max(Math.round(raw), RATING_FLOOR), RATING_MAX);
}

/** All 21 ceilings for a body. */
export function ceilingsFor(rules: Rules, body: Body): (number | null)[] {
  const out: (number | null)[] = [];
  for (let attribute = 0; attribute < ATTRIBUTE_COUNT; attribute += 1) {
    out.push(ceilingFor(rules, body, attribute));
  }
  return out;
}
