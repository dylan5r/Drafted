/**
 * Linked attributes -- the hidden bill on every build.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { forcedMinimums, withForcedMinimums } from '../constraints.ts';
import { loadRules } from './support.ts';

const rules = loadRules();
const indexOf = (name: string) => rules.attributes.findIndex((a) => a.name === name);

describe('linked attributes', () => {
  it('forces nothing when everything sits at the floor', () => {
    assert.deepEqual(forcedMinimums(rules, 75, new Array(21).fill(25)), []);
  });

  it('charges for the chain behind a headline attribute', () => {
    const swb = indexOf('speed_with_ball');
    const ratings = new Array(21).fill(25);
    ratings[swb] = 94;

    const forced = forcedMinimums(rules, 75, ratings);
    const byAttribute = new Map(forced.map((f) => [f.attribute, f.minimum]));

    // Ball handle and agility are directly linked; the cascade reaches further.
    assert.ok(byAttribute.has(indexOf('ball_handle')), 'ball handle should be forced');
    assert.ok(byAttribute.has(indexOf('agility')), 'agility should be forced');
    assert.ok(
      forced.length >= 3,
      `a 94 speed with ball should pull several attributes up, got ${forced.length}`,
    );
  });

  it('reaches a fixpoint -- applying the minimums forces nothing further', () => {
    const swb = indexOf('speed_with_ball');
    const ratings = new Array(21).fill(25);
    ratings[swb] = 94;

    const settled = withForcedMinimums(rules, 75, ratings);
    assert.deepEqual(forcedMinimums(rules, 75, settled), []);
  });

  it('costs more at a height with more links', () => {
    const swb = indexOf('speed_with_ball');
    const make = () => {
      const ratings = new Array(21).fill(25);
      ratings[swb] = 90;
      return ratings;
    };
    const short = forcedMinimums(rules, 74, make()).length;
    const tall = forcedMinimums(rules, 84, make()).length;
    assert.ok(tall >= short, `expected the taller build to owe at least as much (${tall} vs ${short})`);
  });

  it('never emits a MaxDelta-0 equality rule', () => {
    // The 20 zero-delta rows are dropped at extraction because a retail build
    // observed at speed_with_ball 88 / speed 87 disproves the equality reading.
    // If they ever come back, this catches it.
    for (const perHeight of Object.values(rules.constraints)) {
      for (const links of Object.values(perHeight)) {
        for (const [, maxDelta] of links) {
          assert.ok(maxDelta > 0, `a zero MaxDelta survived extraction`);
        }
      }
    }
    assert.equal(rules.meta.caveats.droppedZeroMaxDeltaConstraints, 20);
  });
});

describe('build evaluation uses the effective spread', () => {
  it('prices the cascade, not just the headline pick', async () => {
    const { evaluateBuild } = await import('../index.ts');
    const swb = indexOf('speed_with_ball');
    const ratings = new Array(21).fill(25);
    ratings[swb] = 94;

    const body = { position: 'PG' as const, height: 75, weight: 198, wingspan: 78 };
    const evaluation = evaluateBuild(rules, body, ratings);

    // The forced attributes must show up in `effective`, and the overall must
    // reflect them -- pricing the raw picks would understate the build.
    assert.ok(evaluation.forced.length > 0);
    for (const forced of evaluation.forced) {
      assert.equal(evaluation.effective[forced.attribute], forced.minimum);
      assert.ok(evaluation.effective[forced.attribute] > ratings[forced.attribute]);
    }

    const rawOnly = new Array(21).fill(25);
    rawOnly[swb] = 94;
    const { overallFor } = await import('../ovr.ts');
    const naive = overallFor(rules, 75, rawOnly);
    assert.ok(
      evaluation.overall.uncapped > naive.uncapped,
      'the effective spread should price higher than the raw picks',
    );
  });
});
