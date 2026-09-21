/**
 * The attribute ceiling formula, held against the game's measured caps.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ceilingFor, ceilingsFor } from '../ceilings.ts';
import { loadRules, loadUpstream } from './support.ts';
import type { Body } from '../types.ts';

const rules = loadRules();

/** PG 6'3", 198 lb, 78 in wingspan -- the body every probe was taken at. */
const REFERENCE: Body = { position: 'PG', height: 75, weight: 198, wingspan: 78 };

describe('attribute ceilings', () => {
  const sample = loadUpstream<{ data: { attribute: number; name: string; cap: number }[] }>(
    'bodies/attribute_caps_sample.json',
  );

  it('reproduces all 21 measured ceilings at the reference body', { skip: !sample }, () => {
    for (const row of sample!.data) {
      const got = ceilingFor(rules, REFERENCE, row.attribute);
      assert.equal(got, row.cap, `${row.name}: ${got} vs ${row.cap}`);
    }
  });

  it('declines rather than guesses where the game ships no rule', () => {
    const standingDunk = rules.attributes.findIndex((a) => a.name === 'standing_dunk');
    // 69-72 in have no StandingDunk height multiplier. Those are legal PG
    // heights, so this gap is reachable in the UI and must not be papered over.
    for (const height of [69, 70, 71, 72]) {
      const body: Body = { position: 'PG', height, weight: 170, wingspan: height + 3 };
      assert.equal(ceilingFor(rules, body, standingDunk), null);
    }
    const body: Body = { position: 'PG', height: 73, weight: 180, wingspan: 76 };
    assert.notEqual(ceilingFor(rules, body, standingDunk), null);
  });

  it('keeps every ceiling inside the rating range', () => {
    for (const height of rules.meta.heights) {
      const positions = rules.meta.positions.filter(
        (p) => rules.bodies[p].heights[String(height)],
      );
      if (positions.length === 0) continue;
      const limits = rules.bodies[positions[0]].heights[String(height)];
      const body: Body = {
        position: positions[0],
        height,
        weight: limits.defaultWeight,
        wingspan: limits.defaultWingspan,
      };
      for (const ceiling of ceilingsFor(rules, body)) {
        if (ceiling === null) continue;
        assert.ok(ceiling >= 25 && ceiling <= 99, `${height} in produced ${ceiling}`);
      }
    }
  });

  it('moves ceilings when weight and wingspan move', () => {
    const light: Body = { ...REFERENCE, weight: 145 };
    const heavy: Body = { ...REFERENCE, weight: 220 };
    const strength = rules.attributes.findIndex((a) => a.name === 'strength');
    assert.ok(ceilingFor(rules, heavy, strength)! > ceilingFor(rules, light, strength)!);
  });
});
