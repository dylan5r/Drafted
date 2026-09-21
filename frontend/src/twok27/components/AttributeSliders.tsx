import { DISCIPLINES, type Discipline } from "../engine/index.ts";
import { rules } from "../data/index.ts";
import type { BuildState } from "../useBuild.ts";
import { Card } from "./Card.tsx";

const LABELS: Record<Discipline, string> = {
  finishing: "Finishing",
  shooting: "Shooting",
  playmaking: "Playmaking",
  defense: "Defense",
  rebounding: "Rebounding",
  physicals: "Physicals",
};

interface RowProps {
  index: number;
  build: BuildState;
  selected: number | null;
  onSelect: (index: number) => void;
}

function AttributeRow({ index, build, selected, onSelect }: RowProps) {
  const attribute = rules.attributes[index];
  const picked = build.ratings[index];
  // The slider shows what the build actually ends up at. A forced attribute is
  // not a suggestion -- the game raises it for you -- so showing the raw pick
  // would misrepresent the build you are planning.
  const value = build.evaluation.effective[index];
  const ceiling = build.evaluation.ceilings[index];
  const over = ceiling !== null && value > ceiling;
  const forced = build.evaluation.forced.find((f) => f.attribute === index);

  // The ceiling is where this body stops. Showing it as a track marker is the
  // whole point of the page: you can see the wall before you spend anything.
  const ceilingPercent =
    ceiling === null ? null : ((ceiling - 25) / (99 - 25)) * 100;

  return (
    <div
      className={`rounded-lg px-2 py-1.5 transition ${
        selected === index ? "bg-white/5" : "hover:bg-white/[0.03]"
      }`}
      onPointerDown={() => onSelect(index)}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate text-xs text-white/70">{attribute.label}</span>
        <span className="flex items-baseline gap-1.5 font-display text-sm tabular-nums">
          <span
            className={over ? "text-magenta" : forced ? "text-green" : "text-white"}
          >
            {value}
          </span>
          <span className="text-[10px] text-white/30">
            / {ceiling === null ? "??" : ceiling}
          </span>
        </span>
      </div>

      <div className="relative mt-1">
        <input
          type="range"
          min={25}
          max={99}
          step={1}
          value={value}
          onChange={(event) => build.setRating(index, Number(event.target.value))}
          className="w-full"
          style={{
            accentColor: over ? "#FF0055" : forced ? "#CCFF00" : attribute.colour,
          }}
          aria-label={attribute.label}
        />
        {ceilingPercent !== null && ceilingPercent < 100 ? (
          <span
            aria-hidden
            className="pointer-events-none absolute top-1/2 h-3 w-px -translate-y-1/2 bg-white/40"
            style={{ left: `${ceilingPercent}%` }}
          />
        ) : null}
      </div>

      {over ? (
        <p className="mt-0.5 text-[10px] text-magenta/90">
          {forced
            ? `${rules.attributes[forced.forcedBy].label} demands ${forced.minimum}, past this body's ceiling of ${ceiling}.`
            : `Above this body's ceiling of ${ceiling} — impossible to build.`}
        </p>
      ) : null}
      {!over && forced ? (
        <p className="mt-0.5 text-[10px] text-green/70">
          {rules.attributes[forced.forcedBy].label} drags this to {forced.minimum}
          {picked > 25 ? ` (you set ${picked})` : ""}.
        </p>
      ) : null}
      {ceiling === null ? (
        <p className="mt-0.5 text-[10px] text-magenta/80">
          No ceiling rule shipped for this attribute at this height.
        </p>
      ) : null}
    </div>
  );
}

interface Props {
  build: BuildState;
  selected: number | null;
  onSelect: (index: number) => void;
}

export function AttributeSliders({ build, selected, onSelect }: Props) {
  return (
    <Card
      title="Attributes"
      hint="The tick on each track is your ceiling for this body. Green means a linked attribute dragged this one up for you — that is the hidden bill on every build."
      right={
        <button
          type="button"
          onClick={build.reset}
          className="rounded-lg border border-slateGlow px-3 py-1.5 text-xs text-white/50 transition hover:border-white/20 hover:text-white"
        >
          Reset
        </button>
      }
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {DISCIPLINES.map((discipline) => {
          const indices = rules.attributes
            .filter((attribute) => attribute.discipline === discipline)
            .map((attribute) => attribute.index);
          if (indices.length === 0) return null;
          return (
            <div key={discipline}>
              <h4 className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/35">
                {LABELS[discipline]}
              </h4>
              <div className="space-y-0.5">
                {indices.map((index) => (
                  <AttributeRow
                    key={index}
                    index={index}
                    build={build}
                    selected={selected}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
