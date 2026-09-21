/**
 * Builder state.
 *
 * Holds the body and the 21 ratings, keeps the body legal as the position and
 * height change, and re-evaluates on every change. The evaluation is cheap
 * enough to run inline -- 15 archetypes of 21 multiply-adds plus table
 * lookups -- so there is no debounce and no worker.
 */

import { useCallback, useMemo, useState } from 'react';

import {
  clampBody,
  defaultBody,
  emptyRatings,
  evaluateBuild,
  RATING_FLOOR,
  RATING_MAX,
  type Body,
  type BuildEvaluation,
  type Position,
} from './engine/index.ts';
import { rules } from './data/index.ts';

export interface BuildState {
  body: Body;
  ratings: number[];
  evaluation: BuildEvaluation;
  setPosition: (position: Position) => void;
  setHeight: (height: number) => void;
  setWeight: (weight: number) => void;
  setWingspan: (wingspan: number) => void;
  setRating: (attribute: number, rating: number) => void;
  reset: () => void;
}

export function useBuild(): BuildState {
  const [body, setBody] = useState<Body>(() => defaultBody(rules, 'PG'));
  const [ratings, setRatings] = useState<number[]>(() => emptyRatings());

  const evaluation = useMemo(
    () => evaluateBuild(rules, body, ratings),
    [body, ratings],
  );

  // Changing position or height moves the weight and wingspan ranges, so the
  // body has to be pulled back inside them or a drag can leave it illegal.
  const setPosition = useCallback((position: Position) => {
    setBody((current) => clampBody(rules, { ...current, position }));
  }, []);

  const setHeight = useCallback((height: number) => {
    setBody((current) => clampBody(rules, { ...current, height }));
  }, []);

  const setWeight = useCallback((weight: number) => {
    setBody((current) => clampBody(rules, { ...current, weight }));
  }, []);

  const setWingspan = useCallback((wingspan: number) => {
    setBody((current) => clampBody(rules, { ...current, wingspan }));
  }, []);

  const setRating = useCallback((attribute: number, rating: number) => {
    setRatings((current) => {
      const next = current.slice();
      next[attribute] = Math.min(Math.max(Math.round(rating), RATING_FLOOR), RATING_MAX);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setRatings(emptyRatings());
  }, []);

  return {
    body,
    ratings,
    evaluation,
    setPosition,
    setHeight,
    setWeight,
    setWingspan,
    setRating,
    reset,
  };
}
