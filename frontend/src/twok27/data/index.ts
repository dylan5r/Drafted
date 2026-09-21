/**
 * The compiled rules tables, as one typed object.
 *
 * Regenerate with:
 *   python3 tools/nba2k27/extract_data.py --dataset <clone of the dataset repo>
 *
 * Do not hand-edit the JSON. Every value is a re-encoding of a measurement,
 * and a hand-tweaked number would silently break the parity tests' meaning
 * even while they keep passing.
 */

import attributes from './attributes.json';
import badges from './badges.json';
import bodies from './bodies.json';
import capBreakers from './capBreakers.json';
import ceilings from './ceilings.json';
import constraints from './constraints.json';
import meta from './meta.json';
import ovr from './ovr.json';
import tokenContributions from './tokenContributions.json';
import tokenCosts from './tokenCosts.json';

import type { Rules } from '../engine/types.ts';

export const rules = {
  meta,
  attributes,
  bodies,
  ceilings,
  ovr,
  constraints,
  badges,
  tokenCosts,
  tokenContributions,
  capBreakers,
} as unknown as Rules;
