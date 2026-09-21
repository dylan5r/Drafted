# NBA 2K27 build creator — how the algorithm works

Research notes behind `frontend/src/twok27/`. Written so someone picking this
up cold knows which numbers are measured, which are inferred, and which are
still open.

## The short version

2K27's builder is five separate mechanisms, not one algorithm:

1. **Body legality** — position decides which height/weight/wingspan
   combinations exist, and then plays no further part.
2. **Attribute ceilings** — a closed-form function of the three body
   measurements.
3. **Overall rating** — a weighted price for the spread, evaluated against 15
   archetypes, highest wins. There is **no attribute point pool** in 2K27; you
   raise sliders until the overall reads 99.
4. **Linked attributes** — raising one attribute drags others up with it,
   cascading.
5. **Cap breakers** — post-creation rewards that push an attribute past its
   builder ceiling.

Ceilings and the overall rating are solved exactly. Cap breakers are measured
at one body only. The badge slot allocator is unsolved.

## Where the data comes from

[`lightmatmul/nba2k27-builder-dataset`](https://github.com/lightmatmul/nba2k27-builder-dataset)
— the measured rules data, and the reason this project is arithmetic rather
than guesswork.

The capture method matters, so it is worth stating: NBA 2K HQ (the official
companion app, `com.VisualConcepts.MyNBASherpa`) ships its game logic in a
native library that **exports its builder functions as plain C symbols** —
`ATTRIBUTES_CalculateBestOverallRating`, `BADGES_GetBadgeTokenPotential` and
others. Upstream pulled the library off a rooted device, wrote a harness that
`dlopen`s it and calls those symbols in-process with the live tuning blob
loaded, and swept exhaustive input grids. So the numbers are the game's own
answers, not inferences from observed builds.

Alongside that sits `tuning/progression_attributes.txt`, a **named** key/value
export of the same career-mode tuning the engine reads. The binary tuning blob
is keyless — it addresses values by offset — so this named export is what makes
the packed numbers legible.

That gives the dataset a genuinely useful property: the maths can be rebuilt
from the tuning tables alone and held against the recorded engine output, with
neither side informing the other.

[`sondberg84/nba2k27-build-lab`](https://github.com/sondberg84/nba2k27-build-lab)
— a Python engine over the same data. Used here as a second opinion; it reached
the same conclusion about the 99 display edge independently.

**Neither repository ships a LICENSE.** The numbers are factual measurements of
game tuning, and facts are not copyrightable, but the compilations are not ours
to relicense. Both are credited in the UI footer and in `extract_data.py`.

## 1. Body legality

Per position: a height range, and per height a weight range and a wingspan
range. Wingspan is always `height … height+6` inches.

Position restricts which bodies are legal and **does not enter any formula
after that** — not the ceiling calculation, not the overall rating. Two builds
with the same body and spread rate identically whether they are a PG or a C.

## 2. Attribute ceilings — solved

```
ceiling = clamp(round(25 + 74 × heightMult × weightMult × wingspanMult), 25, 99)
```

Weight and wingspan ship two endpoint rows per whole-inch height and
interpolate linearly between them.

Reproduces all 21 measured ceilings at the reference body exactly
(`ceilings.test.ts`).

**One genuine gap.** The NBA `HeightMultiplier` block has 416 rows where 20
heights × 21 attributes would give 420: `StandingDunk` has no entry at 69–72
inches. Those are legal PG heights, so the formula is undefined somewhere a
user can actually stand. Whether the engine substitutes 1.0, reuses the next
height, or forces the floor was never determined, so the engine returns `null`
and the UI says the rule is missing.

## 3. Overall rating — solved

```
raw = Σ(w[a] · s(a, r[a]) · r[a]) / Σ(w[a] · s(a, r[a]))
ovr = lerp(raw, HeightBasedOverallLerp[height])
```

where `w` is `HeightBasedAttributeWeight[height][archetype][attribute]` and `s`
is `AttributeRatingWeightScale[attribute][rating]`, shipped only for ratings
75–99 and implicitly 1.0 below that.

Evaluate for all 15 archetypes, keep the highest; that archetype is the one the
builder names.

**The denominator is the trap.** It is the scale-weighted sum `Σ w·s`, not the
plain `Σ w`. Normalising by `Σ w` reproduces 1 of the 256 test vectors.

**Accumulate in float32.** The engine uses IEEE-754 binary32. JavaScript is
binary64, so `float32.ts` rounds every intermediate back down. Dropping those
`Math.fround` calls does not change the displayed integer in most cases, which
is exactly what makes it dangerous.

Verified: 256/256 mixed vectors on value, winning archetype **and** displayed
integer; 75/75 uniform rows (`ovr.test.ts`).

### The 98-to-99 completion edge — inferred, not measured

The single most surprising behaviour in the model.

A spread that prices **above** 99 displays **98**, not 99. Uniform ratings
84–98 all price over 99 and all report `98.999992` — exactly the float32
predecessor of 99 — and a displayed 98. Only a fully maxed spread reports a
clean `99.0` and displays 99.

So the engine holds an incomplete build one ULP below 99 to keep the builder
saying 98 until the build is finished.

No tuning key carries that constant, and exactly one recorded row reaches 99.0,
so "lift the cap only for a fully maxed spread" is the deliberately
conservative reading of a single observation. `build-lab` reached the same
conclusion independently, which is corroboration but not proof. **If a real 99
build ever disagrees, `ovr.ts` is the file to revisit.**

## 4. Linked attributes — solved

`AssociatedAttributeConstraints[source][height][i]` gives an associated
attribute and a `MaxDelta`. Raising a source forces each associate to at least
`source − MaxDelta`, and this cascades because a forced raise is itself a
source.

This is the hidden bill on every build, and it is large. Asking for 94 Speed
With Ball also buys Speed, Ball Handle and Agility, and the chain keeps going —
twelve attributes at 6'2", twenty at 7'0".

**It follows that the builder must price the cascade, not the raw picks.**
`evaluateBuild` computes the effective spread first and prices *that*. On a
94 Speed With Ball guard this is the difference between an overall of 55 and
an overall of 89.

**`MaxDelta 0` is dropped, deliberately.** It occurs exactly 20 times, once per
height, always SpeedWithBall → Speed, which the rule above would read as "speed
must be at least speed with ball". A build observed in the retail builder
carries speed_with_ball 88 with speed 87, so that reading is wrong. Its real
meaning was never recovered, so it is dropped at extraction rather than
enforced incorrectly. `constraints.test.ts` fails if it ever comes back.

## 5. Badges and tokens

53 badges, four builder tiers each. A fifth tier, legend, exists but cannot be
reached in the builder — it is unlocked in-game through the Synergy system.

Requirements are an ordered predicate list joined per-entry by AND/OR. In the
shipped data no badge has more than two predicates and none mixes the two
operators, but the evaluator handles the general case so new data cannot
silently change the meaning of an existing badge.

**Cross-check worth knowing about.** Upstream recorded slot totals for 2,123
real vectors, and the total is 20 when a build qualifies for at least one badge
and 0 when it qualifies for none. That makes those records ground truth for the
badge evaluator, not just the allocator — and our evaluator agrees on all
2,123 (`badges.test.ts`).

### Token costs are per-step — inferred

The shipped costs run 3/2/1/1 across bronze/silver/gold/hall of fame. Read as
absolute prices that would make hall of fame cost one token against bronze's
three, leaving bronze strictly dominated — nobody would ever equip it. So they
are increments, and `cumulativeTokenCost` sums them.

Upstream describes the field only as "tokens required" and never disambiguated
it. If it turns out to be absolute, `stepTokenCost` is already correct and the
cumulative helper is the one to delete.

### The slot allocator is unsolved

Its **inputs** are established: the allocation is a deterministic function of
(per-discipline token totals, per-discipline count of qualifying badges).
Across 2,084 distinct feature keys no key maps to two different allocations,
and adding height changes nothing.

The **combining rule** is not. The plausible reading of the shipped constants
reproduces 27% of the ground truth, the stated `maximums` are demonstrably not
caps (recorded allocations exceed them), and no blend value fits.

So the engine reports the slot total and declines the per-discipline split.

### Token data is missing above 6'9"

The capture records zero tokens for every attribute at 82 inches and above
while the slot data in the same rows keeps working — the signature of a capture
that stopped recording, not a game rule. Taken at face value it would tell
every centre they earn no badge tokens at all, so `tokensEarned` declines at
those heights and says why.

## 6. Cap breakers — the main open problem

28 earnable across REP, Crew, Build Specialization, Lifetime Challenges and the
Season ladders. At most five per attribute. Permanent and non-refundable. The
game will not show you any of this until the build reaches 99 overall, which is
precisely why previewing it is worth doing.

Upstream measured 13,280 gain rows — but at **one body** (PG, 6'3", 198 lb, 78"
wingspan) under two scenarios: `isolated` (everything else at the 25 floor) and
`near_caps` (everything else at its ceiling). The gain genuinely depends on the
whole build, because it is computed against the build's winning archetype.

So for any other body the engine reports the two scenarios as a **bracket** and
says it is a bracket. It does not interpolate, and it does not pick one.

### What was tried, and what was found

The obvious model — that a cap breaker grants a fixed overall-rating budget
spent at the attribute's marginal price — is **falsified**. Measuring the
overall delta of each measured gain gives values from 0.0008 to 0.26, two and a
half orders of magnitude apart.

What the data does show is a **common base gain curve**. At rating 30/50/70/85/92
the gains are 14/10/7/4/3, and several attributes hit it *exactly*: free throw,
driving dunk, post control, standing dunk. Attributes carrying real weight in
the winning archetype are cut below it — three point runs 9/7/1/1/1, mid-range
4/3/1/1/1.

So the shape is:

```
gain = min(baseCurve(rating), somethingLimitedByPrice)
```

and recovering the second term is the open problem. Two uninvestigated tuning
key families look like candidates:

- `AttributePriceCapOverMaxRatioToMultiplierLerp` — six values, `0.1, 0.3,
  0.45, 0.1, 0.7, 1.0`, which reads as a ratio-to-multiplier curve
- `PerPosition[…].MultiplierToRelativeAttributeImportanceForPricing`

Solving this would let the preview be exact for every body rather than the
reference one. As far as I can tell no public builder does this today.

## Known-stale data, and what to do about it

Everything is a **pre-release Community Day capture dated 2026-08-22**. The game
has shipped since. 2K patches tuning **server-side**, so `live_tuning_version`
can move without a client update — some of these numbers are already wrong.

Re-capturing needs the app's native library and a rooted device or emulator.
The method is in the upstream README; the pipeline here
(`tools/nba2k27/extract_data.py`) takes a dataset clone and re-emits the tables,
so a refresh is one command once a new capture exists.

The 256 golden vectors are the safety net: if a new capture still reproduces
them, the change is safe; if not, either the rules genuinely changed or the
capture broke, and the tests will say so loudly rather than silently adopting
bad data.

## Design consequences

**The engine runs in the browser.** Live preview means dragging 21 sliders and
seeing everything update per frame. A server round-trip per input event kills
that, and the whole computation is 15 archetypes × 21 multiply-adds plus table
lookups. The compiled tables are 226 kB of JSON, 30 kB gzipped in their own
lazy-loaded chunk.

**The engine is pure and takes its data explicitly.** No imports of the data
module, no I/O, no DOM. That is what lets the same code run in the browser and
under `node --test` against the game's own measurements.

**Unavailable is a first-class return value.** Anything the data cannot answer
comes back as `{ available: false, reason }` and the UI renders the reason.
Cap breakers are permanent and non-refundable; a confident wrong number is
worse than a blank.

## Running it

```bash
# Recompile the tables from a dataset clone
python3 tools/nba2k27/extract_data.py --dataset ../nba2k27-builder-dataset

# Engine tests. Parity tests skip without the dataset; the rest always run.
cd frontend
npm run test:engine                 # structural tests only
NBA2K27_DATASET=../../nba2k27-builder-dataset npm run test:engine   # full parity

npm run dev                         # the builder lives at /2k27
```
