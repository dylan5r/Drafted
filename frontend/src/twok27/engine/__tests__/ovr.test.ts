/**
 * Parity against the game's own measurements.
 *
 * These vectors came out of NBA 2K HQ's native rules engine. If a change to
 * `ovr.ts` breaks them, the change is wrong -- that is the whole point of
 * keeping them. Do not adjust the tolerances to make a failure go away.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { overallFor } from '../ovr.ts';
import { loadRules, loadUpstream } from './support.ts';

interface MixedVector {
  sample: number;
  values: number[];
  uncapped: number;
  uncapped_player_type: number;
  detailed: number;
  player_type: number;
  overall: number;
}

interface UniformRow {
  rating: number;
  detailed: number;
  overall: number;
}

/** The reference body every `overall/` measurement was taken at. */
const REFERENCE_HEIGHT = 75;
const TOLERANCE = 1e-4;

const rules = loadRules();

describe('overall rating', () => {
  const mixed = loadUpstream<{ data: MixedVector[] }>('overall/mixed_vectors.json');

  it('reproduces all 256 mixed vectors and their winning archetypes', { skip: !mixed }, () => {
    const vectors = mixed!.data;
    assert.equal(vectors.length, 256, 'expected the full 256-vector parity set');

    let worst = 0;
    for (const vector of vectors) {
      const got = overallFor(rules, REFERENCE_HEIGHT, vector.values);
      const delta = Math.abs(got.uncapped - vector.uncapped);
      worst = Math.max(worst, delta);
      assert.ok(
        delta < TOLERANCE,
        `sample ${vector.sample}: uncapped ${got.uncapped} vs ${vector.uncapped}`,
      );
      assert.equal(
        got.archetype,
        vector.uncapped_player_type,
        `sample ${vector.sample}: archetype ${got.archetype} vs ${vector.uncapped_player_type}`,
      );
      assert.equal(
        got.overall,
        vector.overall,
        `sample ${vector.sample}: displayed ${got.overall} vs ${vector.overall}`,
      );
    }
    assert.ok(worst < TOLERANCE, `worst deviation ${worst}`);
  });

  const uniform = loadUpstream<{ data: UniformRow[] }>('overall/uniform_ratings.json');

  it('reproduces the 75 uniform-rating rows', { skip: !uniform }, () => {
    for (const row of uniform!.data) {
      const ratings = new Array(21).fill(row.rating);
      const got = overallFor(rules, REFERENCE_HEIGHT, ratings);
      assert.ok(
        Math.abs(got.detailed - row.detailed) < TOLERANCE,
        `uniform ${row.rating}: ${got.detailed} vs ${row.detailed}`,
      );
      assert.equal(
        got.overall,
        row.overall,
        `uniform ${row.rating}: displayed ${got.overall} vs ${row.overall}`,
      );
    }
  });

  it('holds an overshooting build one ULP below 99 so it displays 98', () => {
    // Uniform 90 prices well above 99 but is not a complete build, so the
    // builder keeps it at 98. This is the completion edge, and it is the
    // single most surprising behaviour in the whole rating model.
    const overshoot = new Array(21).fill(90);
    const got = overallFor(rules, REFERENCE_HEIGHT, overshoot);
    assert.ok(got.uncapped > 99, 'uniform 90 should price above 99');
    assert.ok(got.detailed < 99);
    assert.equal(got.overall, 98);
  });

  it('lets only a fully maxed spread show a clean 99', () => {
    const maxed = new Array(21).fill(99);
    const got = overallFor(rules, REFERENCE_HEIGHT, maxed);
    assert.equal(got.detailed, 99);
    assert.equal(got.overall, 99);
  });

  it('prices the same spread differently at different heights', () => {
    const spread = new Array(21).fill(70);
    const short = overallFor(rules, 69, spread);
    const tall = overallFor(rules, 88, spread);
    assert.notEqual(short.overall, tall.overall);
  });
});
