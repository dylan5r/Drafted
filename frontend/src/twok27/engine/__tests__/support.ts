/**
 * Test support: load the compiled rules tables from disk.
 *
 * The browser build imports the JSON through Vite. Tests read it with `fs` so
 * the engine can be exercised under plain `node --test` with no bundler and no
 * dependencies.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Rules } from '../types.ts';

const here = dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = join(here, '..', '..', 'data');

/** Upstream's golden vectors live outside this repo; skip when absent. */
export const DATASET_DIR = process.env.NBA2K27_DATASET ?? '';

function read<T>(dir: string, name: string): T {
  return JSON.parse(readFileSync(join(dir, name), 'utf8')) as T;
}

export function loadRules(): Rules {
  return {
    meta: read(DATA_DIR, 'meta.json'),
    attributes: read(DATA_DIR, 'attributes.json'),
    bodies: read(DATA_DIR, 'bodies.json'),
    ceilings: read(DATA_DIR, 'ceilings.json'),
    ovr: read(DATA_DIR, 'ovr.json'),
    constraints: read(DATA_DIR, 'constraints.json'),
    badges: read(DATA_DIR, 'badges.json'),
    tokenCosts: read(DATA_DIR, 'tokenCosts.json'),
    tokenContributions: read(DATA_DIR, 'tokenContributions.json'),
    capBreakers: read(DATA_DIR, 'capBreakers.json'),
  } as Rules;
}

export function loadUpstream<T>(relative: string): T | null {
  if (!DATASET_DIR) return null;
  try {
    return JSON.parse(readFileSync(join(DATASET_DIR, relative), 'utf8')) as T;
  } catch {
    return null;
  }
}
