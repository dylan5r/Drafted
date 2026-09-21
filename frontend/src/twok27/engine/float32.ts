/**
 * Single-precision arithmetic.
 *
 * The game accumulates the overall rating in IEEE-754 binary32. JavaScript
 * numbers are binary64, so every intermediate has to be rounded back down or
 * the result drifts -- most visibly at the 98 -> 99 completion edge, where the
 * clamp surfaces as 98.999992 rather than 99.
 *
 * Do not "simplify" these by dropping the fround calls.
 */

export const f32 = Math.fround;

export function mul(a: number, b: number): number {
  return Math.fround(a * b);
}

export function add(a: number, b: number): number {
  return Math.fround(a + b);
}

export function div(a: number, b: number): number {
  return Math.fround(a / b);
}

export function sub(a: number, b: number): number {
  return Math.fround(a - b);
}
