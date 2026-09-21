/**
 * Badge tokens: what a build earns, what a badge costs, and what we decline.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { cumulativeTokenCost, slots, stepTokenCost, tokensEarned } from '../tokens.ts';
import { loadRules } from './support.ts';
import { TIERS } from '../types.ts';

const rules = loadRules();

describe('badge tokens', () => {
  it('earns nothing at the rating floor', () => {
    const earned = tokensEarned(rules, 75, new Array(21).fill(25));
    assert.equal(earned.available, true);
    if (earned.available) assert.equal(earned.total, 0);
  });

  it('is additive across attributes', () => {
    // Upstream confirmed additivity against 2,048 native vectors, so the sum of
    // single-attribute builds must equal the combined build.
    const combined = new Array(21).fill(25);
    combined[0] = 90;
    combined[6] = 88;

    const both = tokensEarned(rules, 75, combined);
    const first = tokensEarned(rules, 75, combined.map((v, i) => (i === 0 ? v : 25)));
    const second = tokensEarned(rules, 75, combined.map((v, i) => (i === 6 ? v : 25)));

    assert.equal(both.available, true);
    if (both.available && first.available && second.available) {
      assert.equal(both.total, first.total + second.total);
    }
  });

  it('declines at heights the capture never recorded, and says why', () => {
    for (const height of rules.meta.caveats.tokenHeightsWithoutData) {
      const earned = tokensEarned(rules, height, new Array(21).fill(90));
      assert.equal(earned.available, false, `${height} in should decline`);
      if (!earned.available) {
        assert.match(earned.reason, /missing data rather than a game rule/);
      }
    }
    // ...and still answers below that line.
    const fine = tokensEarned(rules, 81, new Array(21).fill(90));
    assert.equal(fine.available, true);
  });

  it('treats tier prices as steps, so climbing costs strictly more', () => {
    // The shipped numbers are increments: 3/2/1/1 for most badges. Read as
    // absolute prices, hall of fame would undercut bronze and bronze would be
    // strictly dominated -- which is incoherent. So the cumulative cost of a
    // higher tier must always exceed a lower one.
    for (const badge of rules.badges) {
      let previous = 0;
      for (const tier of TIERS) {
        const total = cumulativeTokenCost(rules, badge.id, tier, 75);
        if (total === null) continue;
        assert.ok(
          total > previous,
          `${badge.name}: ${tier} totals ${total}, not more than ${previous}`,
        );
        previous = total;
      }
    }
  });

  it('never sells legend, because the builder cannot equip it', () => {
    for (const badge of rules.badges) {
      const prices = rules.tokenCosts[String(badge.id)] as Record<string, unknown>;
      assert.equal(prices?.legend, undefined, `${badge.name} carries a legend price`);
      assert.equal(stepTokenCost(rules, badge.id, 'legend' as never, 75), null);
    }
  });

  it('gives 20 slots to a qualifying build and 0 to one that qualifies for nothing', () => {
    assert.equal(slots(true).total, 20);
    assert.equal(slots(false).total, 0);
  });

  it('refuses to guess the per-discipline split', () => {
    const split = slots(true).byDiscipline;
    assert.equal(split.available, false);
    if (!split.available) assert.match(split.reason, /unresolved/);
  });
});
