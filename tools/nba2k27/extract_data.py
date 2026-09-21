"""Compile the NBA 2K27 builder rules into compact JSON for the web engine.

Reads two upstream research repositories and emits the tables
`frontend/src/twok27/data/` needs. Everything here is a re-encoding of
upstream measurements -- no value is invented, adjusted or interpolated.

Upstream (clone these first, see docs/nba2k27/RESEARCH.md):
  lightmatmul/nba2k27-builder-dataset  -- the measured rules data
  sondberg84/nba2k27-build-lab         -- the animation requirement rows

Usage:
  python3 tools/nba2k27/extract_data.py --dataset PATH [--out PATH]
"""

import argparse
import json
import os
import sys

# The 21 attributes carry two names: the snake_case one the dataset uses and
# the internal one the tuning export keys off. Nothing joins them but this map.
INTERNAL = {
    "close_shot": "ShotClose",
    "driving_layup": "DrivingLayup",
    "driving_dunk": "DrivingDunk",
    "standing_dunk": "StandingDunk",
    "post_control": "PostControl",
    "mid_range": "ShotMidrange",
    "three_point": "ShotThree",
    "free_throw": "ShotFreeThrow",
    "pass_accuracy": "PassAccuracy",
    "ball_handle": "BallControl",
    "speed_with_ball": "SpeedWithBall",
    "interior_defense": "InteriorDefense",
    "perimeter_defense": "PerimeterDefense",
    "steal": "Steal",
    "block": "Block",
    "offensive_rebound": "ReboundOffense",
    "defensive_rebound": "ReboundDefense",
    "speed": "Speed",
    "agility": "Agility",
    "strength": "Strength",
    "vertical": "Vertical",
}

LABELS = {
    "close_shot": "Close Shot",
    "driving_layup": "Driving Layup",
    "driving_dunk": "Driving Dunk",
    "standing_dunk": "Standing Dunk",
    "post_control": "Post Control",
    "mid_range": "Mid-Range Shot",
    "three_point": "Three-Point Shot",
    "free_throw": "Free Throw",
    "pass_accuracy": "Pass Accuracy",
    "ball_handle": "Ball Handle",
    "speed_with_ball": "Speed With Ball",
    "interior_defense": "Interior Defense",
    "perimeter_defense": "Perimeter Defense",
    "steal": "Steal",
    "block": "Block",
    "offensive_rebound": "Offensive Rebound",
    "defensive_rebound": "Defensive Rebound",
    "speed": "Speed",
    "agility": "Agility",
    "strength": "Strength",
    "vertical": "Vertical",
}

POSITION_KEYS = {
    "PG": "POINT_GUARD",
    "SG": "SHOOTING_GUARD",
    "SF": "SMALL_FORWARD",
    "PF": "POWER_FORWARD",
    "C": "CENTER",
}

ARCHETYPE_COUNT = 15
FLOOR = 25
MAX_RATING = 99
SCALE_FROM = 75  # AttributeRatingWeightScale is only shipped for 75..99


def load_tuning(path):
    """Parse the named tuning export into a flat key -> raw string map.

    The export carries 27 degenerate rows with neither key nor value; they are
    upstream artifacts and are dropped rather than 'repaired'.
    """
    tuning = {}
    with open(path, encoding="utf-8", errors="replace") as handle:
        for line in handle:
            line = line.strip()
            if not line or line.startswith("//") or "," not in line:
                continue
            key, _, value = line.partition(",")
            if key:
                tuning[key] = value
    return tuning


def doc(dataset, relative):
    with open(os.path.join(dataset, relative), encoding="utf-8") as handle:
        return json.load(handle)


def height_codes(tuning):
    """inches -> HEIGHT_nn, for every height the tuning export names."""
    codes = {}
    for index in range(40):
        code = f"HEIGHT_{index:02d}"
        key = f"HeightInWholeInches[{code}]"
        if key in tuning:
            codes[int(tuning[key])] = code
    return codes


def build_bodies(dataset):
    """Legal bodies per position, keyed by height for direct lookup."""
    out = {}
    for record in doc(dataset, "bodies/legal_bodies.json")["data"]:
        heights = {}
        for body in record["bodies"]:
            heights[str(body["height_inches"])] = {
                "weight": body["weight_lb"],
                "defaultWeight": body["default_weight_lb"],
                "wingspan": body["wingspan_inches"],
                "defaultWingspan": body["default_wingspan_inches"],
            }
        out[record["position"]] = {
            "heightRange": record["height_inches"],
            "defaultHeight": record["default_height_inches"],
            "heights": heights,
        }
    return out


def build_ceilings(tuning, names, heights):
    """The three multiplier families behind the attribute ceiling formula.

    ceiling = clamp(round(25 + 74 * heightMult * weightMult * wingspanMult), 25, 99)

    Weight and wingspan ship two endpoint rows per whole-inch height and
    interpolate linearly between them.
    """
    codes = height_codes(tuning)

    height_mult = {}
    missing = []
    for inches in heights:
        code = codes[inches]
        row = []
        for name in names:
            key = f"PlayerRestrictions[NBA].HeightMultiplier[{code}][{INTERNAL[name]}]"
            if key in tuning:
                row.append(float(tuning[key]))
            else:
                # StandingDunk genuinely has no row at 69-72in. Upstream never
                # determined what the engine substitutes, so neither do we:
                # null propagates to the UI as "unavailable", not as a guess.
                row.append(None)
                missing.append((inches, name))
        height_mult[str(inches)] = row

    def endpoint_family(prefix, axis_key):
        """Collect the indexed endpoint rows and group them by height."""
        by_height = {}
        index = 0
        while True:
            base = f"PlayerRestrictions[NBA].{prefix}[{index}]"
            height_key = f"{base}.HeightInInches"
            if height_key not in tuning:
                break
            inches = int(tuning[height_key])
            index += 1
            # Both families carry a height-0 sentinel pair alongside the real
            # 69-88in rows. It is not a height any body can be, so it is
            # dropped rather than shipped as a lookup nobody can hit.
            if inches == 0:
                continue
            point = float(tuning[f"{base}.{axis_key}"])
            mults = [
                float(tuning[f"{base}.Multiplier[{INTERNAL[name]}]"]) for name in names
            ]
            by_height.setdefault(str(inches), []).append({"at": point, "mult": mults})
        for rows in by_height.values():
            rows.sort(key=lambda row: row["at"])
        return by_height

    return {
        "heightMult": height_mult,
        "weightMult": endpoint_family("WeightMultiplier", "Weight"),
        "wingspanMult": endpoint_family("WingspanMultiplier", "WingspanInInches"),
        "missingHeightMult": [{"height": h, "attribute": n} for h, n in missing],
    }


def build_ovr(tuning, names, heights):
    """Per-archetype weights, the non-linear rating scale, and the height lerp."""
    codes = height_codes(tuning)

    weights = {}
    for inches in heights:
        code = codes[inches]
        per_type = []
        for archetype in range(ARCHETYPE_COUNT):
            per_type.append([
                float(tuning.get(
                    f"HeightBasedAttributeWeight[{code}][PLAYERTYPE_{archetype:02d}]"
                    f"[PLAYERDATA_ATTRIBUTE_{INTERNAL[name]}Ability]",
                    0.0,
                ))
                for name in names
            ])
        weights[str(inches)] = per_type

    # Ratings below 75 have no shipped scale and are implicitly 1.0, so only
    # the 75..99 tail is stored. The engine supplies 1.0 below SCALE_FROM.
    scale = []
    for name in names:
        scale.append([
            float(tuning.get(
                f"AttributeRatingWeightScale[PLAYERDATA_ATTRIBUTE_{INTERNAL[name]}Ability][{rating}]",
                1.0,
            ))
            for rating in range(SCALE_FROM, MAX_RATING + 1)
        ])

    lerp = {}
    for inches in heights:
        code = codes[inches]
        lerp[str(inches)] = [
            float(tuning[f"HeightBasedOverallLerp[{code}].Value[{i}][{j}]"])
            for i in (0, 1)
            for j in (0, 1)
        ]

    return {"weights": weights, "scale": scale, "scaleFrom": SCALE_FROM, "lerp": lerp}


def build_constraints(tuning, names, heights):
    """Linked-attribute minimums: raising a source forces its associates up.

    MaxDelta 0 is deliberately NOT emitted. It occurs once per height, always
    SpeedWithBall -> Speed, and a retail build observed at speed_with_ball 88
    with speed 87 proves the equality reading is wrong. Upstream never
    recovered its real meaning, so we drop it rather than enforce a rule we
    know contradicts the game.
    """
    codes = height_codes(tuning)
    by_internal = {INTERNAL[name]: index for index, name in enumerate(names)}

    out = {}
    dropped = 0
    for inches in heights:
        code = codes[inches]
        per_height = {}
        for source_index, source in enumerate(names):
            links = []
            slot = 0
            while True:
                base = f"AssociatedAttributeConstraints[{INTERNAL[source]}][{code}][{slot}]"
                assoc_key = f"{base}.AssociatedAttribute"
                if assoc_key not in tuning:
                    break
                assoc = tuning[assoc_key]
                delta = int(float(tuning[f"{base}.MaxDelta"]))
                slot += 1
                if assoc not in by_internal:
                    continue
                if delta == 0:
                    dropped += 1
                    continue
                links.append([by_internal[assoc], delta])
            if links:
                per_height[str(source_index)] = links
        out[str(inches)] = per_height
    return out, dropped


def build_badges(dataset):
    definitions = doc(dataset, "badges/definitions.json")["data"]
    tiers = doc(dataset, "badges/tier_requirements.json")["data"]

    by_badge = {}
    for record in definitions:
        by_badge[record["badge"]] = {
            "id": record["badge"],
            "name": record["name"],
            "label": record["name"].replace("_", " ").title(),
            "discipline": record["discipline"],
            "heightRange": record["height_inches"],
            "allowed": record["allowed"],
            "tiers": {},
        }
    for record in tiers:
        badge = by_badge.get(record["badge"])
        if badge is None:
            continue
        badge["tiers"][record["tier"]] = [
            {
                "attribute": requirement["attribute"],
                "minimum": requirement["minimum"],
                "next": requirement.get("operator_to_next"),
            }
            for requirement in record["requirements"]
        ]
    return [by_badge[key] for key in sorted(by_badge)]


def build_token_costs(dataset, tiers):
    """[badgeId][tier] -> {height: cost}.

    Every legend row costs 0 because legend cannot be equipped in the builder
    at all. That is "not purchasable here", not "free", and the engine must
    never read it as a price -- so legend is dropped entirely.
    """
    out = {}
    for record in doc(dataset, "badges/token_costs.json")["data"]:
        tier = record["tier"]
        if tier == "legend":
            continue
        out.setdefault(str(record["badge"]), {}).setdefault(tier, {})[
            str(record["height_inches"])
        ] = record["cost"]
    return out


def build_token_contributions(dataset, names):
    """[height][attribute][rating-25] -> tokens earned.

    Upstream stores 6 values per row in discipline order. If an attribute only
    ever feeds its own discipline, 6x of this table is padding -- so check,
    and collapse only if the check holds.
    """
    records = doc(dataset, "badges/token_contributions.json")["data"]
    attributes = doc(dataset, "reference/attributes.json")["data"]
    order = ["finishing", "shooting", "playmaking", "defense", "rebounding", "physicals"]
    discipline_of = {a["index"]: a["discipline"] for a in attributes}

    collapsible = True
    for record in records:
        own = order.index(discipline_of[record["attribute"]])
        for index, value in enumerate(record["tokens"]):
            if index != own and value:
                collapsible = False
                break
        if not collapsible:
            break

    table = {}
    heights = set()
    for record in records:
        height = str(record["height_inches"])
        heights.add(record["height_inches"])
        per_height = table.setdefault(height, {})
        per_attribute = per_height.setdefault(str(record["attribute"]), {})
        own = order.index(discipline_of[record["attribute"]])
        per_attribute[record["rating"]] = (
            record["tokens"][own] if collapsible else record["tokens"]
        )

    dense = {}
    for height, per_height in table.items():
        dense[height] = {}
        for attribute, per_attribute in per_height.items():
            dense[height][attribute] = [
                per_attribute.get(rating, 0)
                for rating in range(FLOOR, MAX_RATING + 1)
            ]

    # Token data is recorded as zero for every attribute at 6'10" and above
    # while the slot data in the same rows keeps working -- the signature of a
    # capture that stopped recording, not a game rule. Flag the affected
    # heights so the UI can decline instead of telling every centre they earn
    # no tokens at all.
    unusable = sorted(
        height
        for height in heights
        if not any(
            any(dense[str(height)][attribute])
            for attribute in dense[str(height)]
        )
    )

    return {
        "collapsed": collapsible,
        "from": FLOOR,
        "table": dense,
        "unusableHeights": unusable,
    }


def build_cap_breakers(dataset):
    """[scenario][attribute][rating-25][application] -> gain.

    Sparse upstream: combinations with no headroom left are simply absent, and
    a missing entry means "no data", never "zero gain". null preserves that.
    """
    records = doc(dataset, "cap_breakers/gains_by_rating.json")["data"]
    meta = doc(dataset, "cap_breakers/gains_by_rating.json")["_meta"]

    nested = {}
    for record in records:
        nested.setdefault(record["scenario"], {}).setdefault(
            str(record["attribute"]), {}
        ).setdefault(record["rating"], {})[record["application"]] = record["gain"]

    out = {}
    for scenario, per_scenario in nested.items():
        out[scenario] = {}
        for attribute, per_attribute in per_scenario.items():
            rows = []
            for rating in range(FLOOR, MAX_RATING + 1):
                applications = per_attribute.get(rating)
                if applications is None:
                    rows.append(None)
                else:
                    rows.append([applications.get(i) for i in range(5)])
            out[scenario][attribute] = rows

    return {
        "from": FLOOR,
        "applications": 5,
        "referenceBody": meta["reference_body"],
        "scenarios": out,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dataset", required=True,
                        help="clone of lightmatmul/nba2k27-builder-dataset")
    parser.add_argument("--out", default="frontend/src/twok27/data",
                        help="directory to write the compiled tables into")
    args = parser.parse_args()

    dataset = args.dataset
    tuning_path = os.path.join(dataset, "tuning/progression_attributes.txt")
    if not os.path.exists(tuning_path):
        parser.error(f"no tuning export at {tuning_path}; is --dataset correct?")

    tuning = load_tuning(tuning_path)
    attributes = doc(dataset, "reference/attributes.json")["data"]
    names = [record["name"] for record in attributes]
    bodies = build_bodies(dataset)

    # Only heights some position can actually legally reach are worth shipping.
    heights = sorted({
        int(height)
        for position in bodies.values()
        for height in position["heights"]
    })

    source_meta = doc(dataset, "reference/attributes.json")["_meta"]["build"]

    written = {}

    def write(name, payload):
        path = os.path.join(args.out, name)
        with open(path, "w", encoding="utf-8") as handle:
            json.dump(payload, handle, separators=(",", ":"), sort_keys=True)
            handle.write("\n")
        written[name] = os.path.getsize(path)

    constraints, dropped_zero_deltas = build_constraints(tuning, names, heights)
    ceilings = build_ceilings(tuning, names, heights)
    contributions = build_token_contributions(dataset, names)
    badges = build_badges(dataset)

    write("attributes.json", [
        {
            "index": record["index"],
            "name": record["name"],
            "label": LABELS[record["name"]],
            "discipline": record["discipline"],
            "colour": record["colour"],
        }
        for record in attributes
    ])
    write("bodies.json", bodies)
    write("ceilings.json", ceilings)
    write("ovr.json", build_ovr(tuning, names, heights))
    write("constraints.json", constraints)
    write("badges.json", badges)
    write("tokenCosts.json", build_token_costs(dataset, badges))
    write("tokenContributions.json", contributions)
    write("capBreakers.json", build_cap_breakers(dataset))

    write("meta.json", {
        "source": source_meta,
        "extractedFrom": {
            "dataset": "lightmatmul/nba2k27-builder-dataset",
            "note": "Measured by calling NBA 2K HQ's own native builder "
                    "functions. Re-encoded here, not re-derived.",
        },
        "heights": heights,
        "positions": sorted(bodies),
        "floor": FLOOR,
        "maxRating": MAX_RATING,
        "archetypes": ARCHETYPE_COUNT,
        "caveats": {
            "standingDunkHeightGap": ceilings["missingHeightMult"],
            "tokenHeightsWithoutData": contributions["unusableHeights"],
            "droppedZeroMaxDeltaConstraints": dropped_zero_deltas,
            "capBreakersAreSingleBody": True,
        },
    })

    total = sum(written.values())
    for name in sorted(written):
        print(f"  {name:<28} {written[name]:>9,} bytes")
    print(f"  {'TOTAL':<28} {total:>9,} bytes")
    return 0


if __name__ == "__main__":
    sys.exit(main())
