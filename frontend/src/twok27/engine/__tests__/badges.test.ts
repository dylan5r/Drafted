/**
 * Badge evaluation, cross-checked against the game's own slot allocations.
 *
 * Upstream recorded slot totals for 2,123 real vectors across 10 heights. The
 * total is 20 when a build qualifies for at least one badge and 0 when it
 * qualifies for none -- so those records are ground truth for the badge
 * evaluator too, not just for the allocator. If our tier logic wrongly said a
 * build qualifies for nothing, this test catches it.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { evaluateBadges, isHeightEligible, tierFor, unlockedBadges } from '../badges.ts';
import { slots } from '../tokens.ts';
import { loadRules, loadUpstream } from './support.ts';
import { TIERS } from '../types.ts';

interface SlotRow {
  vector: string;
  height_inches: number;
  values: number[];
  slots: number[];
  slot_total: number;
}

const rules = loadRules();

describe('badges', () => {
  it('ships all 53 badges with four builder tiers each', () => {
    assert.equal(rules.badges.length, 53);
    for (const badge of rules.badges) {
      const tiers = Object.keys(badge.tiers);
      assert.equal(tiers.length, 4, `${badge.name} has ${tiers.length} tiers`);
    }
  });

  it('never lets a higher tier ask for less than a lower one', () => {
    for (const badge of rules.badges) {
      for (let i = 1; i < TIERS.length; i += 1) {
        const lower = badge.tiers[TIERS[i - 1]]!;
        const higher = badge.tiers[TIERS[i]]!;
        for (let r = 0; r < Math.min(lower.length, higher.length); r += 1) {
          assert.ok(
            higher[r].minimum >= lower[r].minimum,
            `${badge.name}: ${TIERS[i]} asks ${higher[r].minimum} but ` +
              `${TIERS[i - 1]} asks ${lower[r].minimum}`,
          );
        }
      }
    }
  });

  it('honours height restrictions', () => {
    const restricted = rules.badges.filter(
      (badge) => !(badge.heightRange[0] === 63 && badge.heightRange[1] === 91),
    );
    assert.ok(restricted.length > 0, 'expected some height-gated badges');
    for (const badge of restricted) {
      assert.ok(!isHeightEligible(badge, badge.heightRange[0] - 1));
      assert.ok(isHeightEligible(badge, badge.heightRange[0]));
      assert.ok(isHeightEligible(badge, badge.heightRange[1]));
      assert.ok(!isHeightEligible(badge, badge.heightRange[1] + 1));

      // A maxed spread must still not unlock a badge the body is barred from.
      const maxed = new Array(21).fill(99);
      assert.equal(tierFor(badge, badge.heightRange[0] - 1, maxed), null);
    }
  });

  it('unlocks nothing at the rating floor', () => {
    const floor = new Array(21).fill(25);
    assert.equal(unlockedBadges(rules, 75, floor).length, 0);
  });

  const allocations = loadUpstream<{ data: SlotRow[] }>('badges/slot_allocations.json');

  it(
    'agrees with 2,123 measured slot totals on whether a build qualifies',
    { skip: !allocations },
    () => {
      const rows = allocations!.data;
      assert.ok(rows.length > 2000, `expected the full ground truth, got ${rows.length}`);

      let checked = 0;
      for (const row of rows) {
        const unlocked = unlockedBadges(rules, row.height_inches, row.values);
        const expected = slots(unlocked.length > 0).total;
        assert.equal(
          expected,
          row.slot_total,
          `${row.vector} at ${row.height_inches} in: we say ${expected} slots ` +
            `(${unlocked.length} badges unlocked), the game says ${row.slot_total}`,
        );
        checked += 1;
      }
      assert.equal(checked, rows.length);
    },
  );

  it('reports every badge, blocked ones included', () => {
    const results = evaluateBadges(rules, 69, new Array(21).fill(99));
    assert.equal(results.length, 53);
    const blocked = results.filter((result) => result.blocked !== null);
    assert.ok(blocked.length > 0, 'a 5-9 build should be barred from big-man badges');
    for (const result of blocked) {
      assert.equal(result.tier, null);
    }
  });
});
