/**
 * Cap breakers -- the thing the builder will not show you until 99 overall.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  MAX_APPLICATIONS,
  TOTAL_EARNABLE,
  confidenceFor,
  project,
  projectRange,
} from '../capBreakers.ts';
import { ceilingFor } from '../ceilings.ts';
import { loadRules } from './support.ts';

const rules = loadRules();
const indexOf = (name: string) => rules.attributes.findIndex((a) => a.name === name);

/** The body every gain was measured at. */
const REFERENCE = { height: 75, weight: 198, wingspan: 78 };

describe('cap breakers', () => {
  it('allows at most five per attribute', () => {
    assert.equal(MAX_APPLICATIONS, 5);
    assert.equal(TOTAL_EARNABLE, 28);
    const result = project(rules, 'near_caps', indexOf('three_point'), 30, 99);
    assert.ok(result.applied <= MAX_APPLICATIONS);
  });

  it('gains shrink as the rating climbs', () => {
    const attribute = indexOf('free_throw');
    const low = project(rules, 'near_caps', attribute, 30, 1);
    const high = project(rules, 'near_caps', attribute, 90, 1);
    const lowGain = low.rating - 30;
    const highGain = high.rating - 90;
    assert.ok(
      lowGain > highGain,
      `expected a bigger gain low down: ${lowGain} at 30 vs ${highGain} at 90`,
    );
  });

  it('never carries an attribute past 99', () => {
    for (let attribute = 0; attribute < 21; attribute += 1) {
      for (const scenario of ['isolated', 'near_caps'] as const) {
        const result = project(rules, scenario, attribute, 95);
        assert.ok(result.rating <= 99, `${scenario}/${attribute} reached ${result.rating}`);
      }
    }
  });

  it('each application starts from where the last one landed', () => {
    const result = project(rules, 'near_caps', indexOf('steal'), 40);
    for (let i = 1; i < result.steps.length; i += 1) {
      assert.ok(
        result.steps[i] >= result.steps[i - 1],
        `step ${i} went backwards: ${result.steps.join(' -> ')}`,
      );
    }
    assert.equal(result.steps[0], 40);
    assert.equal(result.steps[result.steps.length - 1], result.rating);
  });

  it('stops and says so rather than inventing a gain it has no data for', () => {
    // Past the reference body's ceiling there is no row at all. That is missing
    // data, not a zero gain, and it has to be reported as such.
    const result = project(rules, 'near_caps', indexOf('post_control'), 81);
    assert.equal(result.applied, 0);
    assert.ok(result.note, 'an unmeasured sequence must explain itself');
    assert.match(result.note!, /probed at/);
  });

  it('a sequence that runs out of gain simply stops, with no note', () => {
    // The table has rows, they just score zero once the attribute is near its
    // ceiling. Nothing is missing, so there is nothing to explain.
    const result = project(rules, 'near_caps', indexOf('standing_dunk'), 40);
    assert.ok(result.applied > 0 && result.applied < MAX_APPLICATIONS);
    assert.equal(result.note, null);
  });

  it('reports a bracket, and says when it is only a bracket', () => {
    const range = projectRange(rules, indexOf('three_point'), 60);
    assert.ok(range.high.rating >= range.low.rating);
    assert.equal(range.from, 60);

    const atReference = confidenceFor(
      rules,
      REFERENCE.height,
      REFERENCE.weight,
      REFERENCE.wingspan,
    );
    assert.equal(atReference.available, true);

    const elsewhere = confidenceFor(rules, 84, 250, 88);
    assert.equal(elsewhere.available, false);
    if (!elsewhere.available) {
      assert.match(elsewhere.reason, /measured only at/);
    }
  });

  it('is barely archetype-sensitive for free throw, and very much so elsewhere', () => {
    // Free throw is exempt from the overall-rating scale, so the two scenarios
    // nearly agree on it -- but not exactly, so this measures the gap rather
    // than asserting they are identical. Three point, which carries real
    // weight, diverges far more.
    const spread = (name: string) => {
      let worst = 0;
      for (let rating = 30; rating <= 90; rating += 5) {
        const low = project(rules, 'isolated', indexOf(name), rating, 1).rating - rating;
        const high = project(rules, 'near_caps', indexOf(name), rating, 1).rating - rating;
        worst = Math.max(worst, Math.abs(high - low));
      }
      return worst;
    };
    const freeThrow = spread('free_throw');
    const threePoint = spread('three_point');
    assert.ok(freeThrow <= 1, `free throw scenarios diverged by ${freeThrow}`);
    assert.ok(
      threePoint > freeThrow,
      `three point (${threePoint}) should be more scenario-sensitive than free throw (${freeThrow})`,
    );
  });
});

describe('the ladder reading', () => {
  const DD = indexOf('driving_dunk');

  // Rows read straight off the retail builder's cap-breaker screen, for the
  // attributes where no ceiling truncates the climb at either end. These are
  // the strongest evidence in the project about how the table is walked.
  const RETAIL: [string, number, number][] = [
    ['driving_dunk', 70, 94],
    ['free_throw', 66, 92],
    ['ball_handle', 86, 91],
    ['perimeter_defense', 91, 96],
    ['speed', 78, 83],
    ['vertical', 75, 88],
  ];

  it('reproduces the retail cap-breaker screen', () => {
    for (const [name, from, to] of RETAIL) {
      const got = project(rules, 'near_caps', indexOf(name), from).rating;
      assert.equal(got, to, `${name} ${from} -> ${got}, the builder says ${to}`);
    }
  });

  it('spends every breaker the table scores above zero', () => {
    const result = project(rules, 'near_caps', DD, 70);
    assert.equal(result.applied, MAX_APPLICATIONS);
    assert.equal(result.steps.length, MAX_APPLICATIONS + 1);
  });

  it('never carries an attribute past the body ceiling it was measured at', () => {
    const reference = {
      position: 'PG' as const,
      height: rules.capBreakers.referenceBody.height_inches,
      weight: rules.capBreakers.referenceBody.weight_lb,
      wingspan: rules.capBreakers.referenceBody.wingspan_inches,
    };
    for (let attribute = 0; attribute < 21; attribute += 1) {
      const ceiling = ceilingFor(rules, reference, attribute);
      if (ceiling === null) continue;
      for (let rating = 25; rating <= ceiling; rating += 1) {
        const result = project(rules, 'isolated', attribute, rating);
        assert.ok(
          result.rating <= ceiling,
          `${rules.attributes[attribute].name} ${rating} -> ${result.rating} past ${ceiling}`,
        );
      }
    }
  });
});
