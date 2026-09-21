/**
 * Shared types for the NBA 2K27 build engine.
 *
 * The engine is pure: every function takes the rules tables explicitly and
 * returns plain data. Nothing here touches the DOM, the network or a module
 * loader, so the same code runs in the browser and under `node --test`.
 */

export const DISCIPLINES = [
  'finishing',
  'shooting',
  'playmaking',
  'defense',
  'rebounding',
  'physicals',
] as const;

export type Discipline = (typeof DISCIPLINES)[number];

export const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C'] as const;
export type Position = (typeof POSITIONS)[number];

/** Builder tiers, in ascending order. `legend` is not reachable in the builder. */
export const TIERS = ['bronze', 'silver', 'gold', 'hall_of_fame'] as const;
export type Tier = (typeof TIERS)[number];

export const ATTRIBUTE_COUNT = 21;
export const RATING_FLOOR = 25;
export const RATING_MAX = 99;

/** 21 ratings, in `attributes.json` index order. */
export type Ratings = number[];

export interface Attribute {
  index: number;
  name: string;
  label: string;
  discipline: Discipline;
  colour: string;
}

export interface Body {
  position: Position;
  height: number;
  weight: number;
  wingspan: number;
}

export interface BodyLimits {
  weight: [number, number];
  defaultWeight: number;
  wingspan: [number, number];
  defaultWingspan: number;
}

export interface PositionBodies {
  heightRange: [number, number];
  defaultHeight: number;
  heights: Record<string, BodyLimits>;
}

export interface MultiplierEndpoint {
  at: number;
  mult: number[];
}

export interface CeilingTables {
  /** height -> 21 multipliers; `null` where the game ships no row. */
  heightMult: Record<string, (number | null)[]>;
  weightMult: Record<string, MultiplierEndpoint[]>;
  wingspanMult: Record<string, MultiplierEndpoint[]>;
  missingHeightMult: { height: number; attribute: string }[];
}

export interface OvrTables {
  /** height -> archetype -> 21 weights. */
  weights: Record<string, number[][]>;
  /** attribute -> scale for ratings `scaleFrom`..99. Below that it is 1.0. */
  scale: number[][];
  scaleFrom: number;
  /** height -> [inMin, inMax, outMin, outMax]. */
  lerp: Record<string, number[]>;
}

/** height -> source attribute index -> [[associated index, maxDelta], ...]. */
export type ConstraintTables = Record<string, Record<string, [number, number][]>>;

export interface BadgeRequirement {
  attribute: number;
  minimum: number;
  next: 'AND' | 'OR' | null;
}

export interface Badge {
  id: number;
  name: string;
  label: string;
  discipline: Discipline;
  heightRange: [number, number];
  allowed: boolean;
  tiers: Partial<Record<Tier, BadgeRequirement[]>>;
}

/** badge id -> tier -> height -> token cost. Legend is absent by design. */
export type TokenCostTables = Record<string, Record<string, Record<string, number>>>;

export interface TokenContributionTables {
  collapsed: boolean;
  from: number;
  /** height -> attribute -> tokens indexed by `rating - from`. */
  table: Record<string, Record<string, number[]>>;
  /** Heights whose capture recorded no tokens at all. Not a game rule. */
  unusableHeights: number[];
}

export type CapBreakerScenario = 'isolated' | 'near_caps';

export interface CapBreakerTables {
  from: number;
  applications: number;
  referenceBody: {
    position: string;
    height_inches: number;
    weight_lb: number;
    wingspan_inches: number;
  };
  /**
   * scenario -> attribute -> row per rating from `from`.
   * A row is `null` where upstream recorded nothing; an entry inside a row is
   * `null` for an application with no measurement. Neither means "zero gain".
   */
  scenarios: Record<
    CapBreakerScenario,
    Record<string, (number | null)[] | null[]>
  >;
}

export interface RulesMeta {
  source: {
    game: string;
    source_app: string;
    api_version: number;
    live_tuning_version: number;
    captured: string;
  };
  heights: number[];
  positions: Position[];
  floor: number;
  maxRating: number;
  archetypes: number;
  caveats: {
    standingDunkHeightGap: { height: number; attribute: string }[];
    tokenHeightsWithoutData: number[];
    droppedZeroMaxDeltaConstraints: number;
    capBreakersAreSingleBody: boolean;
  };
}

/** Everything the engine needs, loaded once and passed in explicitly. */
export interface Rules {
  meta: RulesMeta;
  attributes: Attribute[];
  bodies: Record<Position, PositionBodies>;
  ceilings: CeilingTables;
  ovr: OvrTables;
  constraints: ConstraintTables;
  badges: Badge[];
  tokenCosts: TokenCostTables;
  tokenContributions: TokenContributionTables;
  capBreakers: CapBreakerTables;
}

/**
 * A value the rules cannot supply, with the reason attached.
 *
 * Used wherever upstream data is absent or known-defective. The UI renders the
 * reason rather than a number, because a confident wrong answer about a
 * permanent, non-refundable decision is worse than a blank.
 */
export interface Unavailable {
  available: false;
  reason: string;
}

export type Maybe<T> = ({ available: true } & T) | Unavailable;

export function unavailable(reason: string): Unavailable {
  return { available: false, reason };
}
