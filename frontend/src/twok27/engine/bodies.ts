/**
 * Legal bodies.
 *
 * Position decides which height/weight/wingspan combinations exist, and
 * nothing else: it does not appear in the ceiling formula or in the overall
 * rating. Wingspan always spans height..height+6 inches.
 */

import type { Body, Position, PositionBodies, Rules } from './types.ts';
import { POSITIONS } from './types.ts';

export function heightsFor(rules: Rules, position: Position): number[] {
  return Object.keys(rules.bodies[position].heights)
    .map(Number)
    .sort((a, b) => a - b);
}

export function limitsFor(rules: Rules, position: Position, height: number) {
  return rules.bodies[position].heights[String(height)] ?? null;
}

/** Positions that can legally be this height. */
export function positionsAtHeight(rules: Rules, height: number): Position[] {
  return POSITIONS.filter((position) => limitsFor(rules, position, height) !== null);
}

export function defaultBody(rules: Rules, position: Position): Body {
  const bodies: PositionBodies = rules.bodies[position];
  const height = bodies.defaultHeight;
  const limits = bodies.heights[String(height)];
  return {
    position,
    height,
    weight: limits.defaultWeight,
    wingspan: limits.defaultWingspan,
  };
}

export interface BodyProblem {
  field: 'height' | 'weight' | 'wingspan';
  message: string;
}

export function validateBody(rules: Rules, body: Body): BodyProblem[] {
  const problems: BodyProblem[] = [];
  const limits = limitsFor(rules, body.position, body.height);
  if (limits === null) {
    const [min, max] = rules.bodies[body.position].heightRange;
    problems.push({
      field: 'height',
      message: `${body.position} is ${min}-${max} in; ${body.height} is not legal`,
    });
    return problems;
  }
  if (body.weight < limits.weight[0] || body.weight > limits.weight[1]) {
    problems.push({
      field: 'weight',
      message: `weight at ${body.height} in is ${limits.weight[0]}-${limits.weight[1]} lb`,
    });
  }
  if (body.wingspan < limits.wingspan[0] || body.wingspan > limits.wingspan[1]) {
    problems.push({
      field: 'wingspan',
      message: `wingspan at ${body.height} in is ${limits.wingspan[0]}-${limits.wingspan[1]} in`,
    });
  }
  return problems;
}

/**
 * Pull a body back inside its legal ranges.
 *
 * Changing height moves both other ranges, so the UI needs this to keep a
 * slider drag from producing an impossible build mid-gesture.
 */
export function clampBody(rules: Rules, body: Body): Body {
  const heights = heightsFor(rules, body.position);
  const height = Math.min(Math.max(body.height, heights[0]), heights[heights.length - 1]);
  const limits = rules.bodies[body.position].heights[String(height)];
  return {
    position: body.position,
    height,
    weight: Math.min(Math.max(body.weight, limits.weight[0]), limits.weight[1]),
    wingspan: Math.min(Math.max(body.wingspan, limits.wingspan[0]), limits.wingspan[1]),
  };
}
