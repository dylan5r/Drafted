/**
 * Overall rating.
 *
 * There is no attribute point pool in 2K27: you raise sliders until the
 * overall reads 99. So the real price of a point is its weight in the
 * per-position overall formula, which is what this computes.
 *
 * The build is priced against all 15 archetypes and the highest result wins;
 * that archetype is the one the builder names.
 *
 *   raw = sum(w[a] * s(a, r[a]) * r[a]) / sum(w[a] * s(a, r[a]))
 *   ovr = lerp(raw, HeightBasedOverallLerp[height])
 *
 * The denominator is the trap: it is the scale-weighted sum, not the plain
 * sum of weights. Normalising by sum(w) reproduces 1 of the game's 256 test
 * vectors. With sum(w * s) it reproduces all 256.
 */

import { add, div, f32, mul, sub } from './float32.ts';
import type { Rules } from './types.ts';
import { ATTRIBUTE_COUNT, RATING_MAX } from './types.ts';

/**
 * The largest float32 strictly below 99, derived rather than hardcoded.
 *
 * The game's 99 clamp lands here, not on 99.0, which is why an overshooting
 * build displays 98.
 */
const JUST_UNDER_MAX = (() => {
  const floats = new Float32Array(1);
  const bits = new Uint32Array(floats.buffer);
  floats[0] = RATING_MAX;
  bits[0] -= 1;
  return floats[0];
})();

export interface OvrResult {
  /** Before the 99 display clamp. Only rarely above 99, but it does happen. */
  uncapped: number;
  /** Clamped to 99. In float32 the clamp surfaces as 98.999992. */
  detailed: number;
  /** The integer the builder shows. */
  overall: number;
  /** Index of the winning archetype, 0-14. The game ships no names for these. */
  archetype: number;
}

function isFullyMaxed(ratings: number[]): boolean {
  for (let a = 0; a < ATTRIBUTE_COUNT; a += 1) {
    if (ratings[a] < RATING_MAX) return false;
  }
  return true;
}

function scaleFor(rules: Rules, attribute: number, rating: number): number {
  const from = rules.ovr.scaleFrom;
  if (rating < from) return 1;
  const row = rules.ovr.scale[attribute];
  const value = row[rating - from];
  return value === undefined ? 1 : value;
}

/** Price a full 21-attribute spread at a height. */
export function overallFor(rules: Rules, height: number, ratings: number[]): OvrResult {
  const weightsByArchetype = rules.ovr.weights[String(height)];
  const lerp = rules.ovr.lerp[String(height)];
  if (!weightsByArchetype || !lerp) {
    throw new Error(`no overall tables for height ${height} in`);
  }
  const [inMin, inMax, outMin, outMax] = lerp;

  // The scale term depends only on (attribute, rating), so hoist it out of the
  // archetype loop -- 15x fewer lookups per evaluation, which matters when
  // this runs on every slider frame.
  const scales: number[] = new Array(ATTRIBUTE_COUNT);
  for (let a = 0; a < ATTRIBUTE_COUNT; a += 1) {
    scales[a] = scaleFor(rules, a, ratings[a]);
  }

  let best = -Infinity;
  let bestArchetype = 0;

  for (let t = 0; t < weightsByArchetype.length; t += 1) {
    const weights = weightsByArchetype[t];
    let numerator = 0;
    let denominator = 0;
    for (let a = 0; a < ATTRIBUTE_COUNT; a += 1) {
      const weighted = mul(weights[a], scales[a]);
      numerator = add(numerator, mul(weighted, ratings[a]));
      denominator = add(denominator, weighted);
    }
    if (denominator === 0) continue;

    const raw = div(numerator, denominator);
    const value = f32(outMin + mul(div(sub(raw, inMin), sub(inMax, inMin)), sub(outMax, outMin)));
    if (value > best) {
      best = value;
      bestArchetype = t;
    }
  }

  // INFERENCE, not a measurement. The engine holds a sub-maximal build one
  // float32 ULP below 99 so the builder keeps showing 98 until the build is
  // complete -- upstream calls this the "98-to-99 completion edge". Uniform
  // ratings 84-98 all price above 99 and all report 98.999992/98; only the
  // fully maxed vector reports a clean 99.0/99.
  //
  // No tuning key carries this constant, and exactly one recorded row reaches
  // 99.0, so the predicate below (lift the cap only for a fully maxed spread)
  // is the deliberately conservative reading of a single observation. If a
  // real 99 build ever disagrees, this is the line to revisit.
  const cap = isFullyMaxed(ratings) ? RATING_MAX : JUST_UNDER_MAX;
  const detailed = best > cap ? cap : best;
  return {
    uncapped: best,
    detailed,
    overall: Math.floor(detailed),
    archetype: bestArchetype,
  };
}
