/**
 * Linked attributes.
 *
 * Raising a source attribute forces each attribute associated with it up to at
 * least `source - maxDelta`. The rules are height-specific and they cascade,
 * because a forced raise is itself a source.
 *
 * This is the hidden bill on every build. Asking for 94 Speed With Ball also
 * buys Speed, Ball Handle and Agility, and the chain keeps going -- which is
 * why a build that looks like three attributes is really twelve at 6'2" and
 * twenty at 7'0".
 *
 * `MaxDelta 0` is deliberately absent from the compiled tables. It appears
 * once per height, always SpeedWithBall -> Speed, and a retail build observed
 * at speed_with_ball 88 with speed 87 disproves the equality reading. Upstream
 * never recovered what it actually means, so it is dropped rather than
 * enforced wrongly.
 */

import type { Rules } from './types.ts';
import { ATTRIBUTE_COUNT } from './types.ts';

export interface ForcedMinimum {
  attribute: number;
  minimum: number;
  /** The attribute whose rating forced it, for explaining the cost to a user. */
  forcedBy: number;
}

function linksFor(rules: Rules, height: number): Record<string, [number, number][]> {
  return rules.constraints[String(height)] ?? {};
}

/**
 * The minimums a spread implies, after cascading to a fixpoint.
 *
 * Returns only attributes whose forced minimum exceeds the rating already set,
 * so an already-satisfied link stays out of the way.
 */
export function forcedMinimums(
  rules: Rules,
  height: number,
  ratings: number[],
): ForcedMinimum[] {
  const links = linksFor(rules, height);
  const effective = ratings.slice();
  const forcedBy: (number | null)[] = new Array(ATTRIBUTE_COUNT).fill(null);

  // Each pass can raise an attribute that is itself a source, so iterate.
  // The bound is the attribute count: a cycle cannot raise anything forever
  // because every step is bounded above by the source it derives from.
  for (let pass = 0; pass < ATTRIBUTE_COUNT; pass += 1) {
    let changed = false;
    for (let source = 0; source < ATTRIBUTE_COUNT; source += 1) {
      const sourceLinks = links[String(source)];
      if (!sourceLinks) continue;
      for (const [associated, maxDelta] of sourceLinks) {
        const required = effective[source] - maxDelta;
        if (required > effective[associated]) {
          effective[associated] = required;
          forcedBy[associated] = source;
          changed = true;
        }
      }
    }
    if (!changed) break;
  }

  const out: ForcedMinimum[] = [];
  for (let a = 0; a < ATTRIBUTE_COUNT; a += 1) {
    if (effective[a] > ratings[a]) {
      out.push({ attribute: a, minimum: effective[a], forcedBy: forcedBy[a]! });
    }
  }
  return out;
}

/** The spread with every forced minimum applied. */
export function withForcedMinimums(
  rules: Rules,
  height: number,
  ratings: number[],
): number[] {
  const out = ratings.slice();
  for (const forced of forcedMinimums(rules, height, ratings)) {
    out[forced.attribute] = forced.minimum;
  }
  return out;
}
