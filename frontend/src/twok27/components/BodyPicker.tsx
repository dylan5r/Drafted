import { heightsFor, POSITIONS, type Position } from "../engine/index.ts";
import { rules } from "../data/index.ts";
import type { BuildState } from "../useBuild.ts";
import { Card } from "./Card.tsx";

function formatHeight(inches: number): string {
  return `${Math.floor(inches / 12)}'${inches % 12}"`;
}

interface RangeProps {
  label: string;
  value: number;
  min: number;
  max: number;
  format: (value: number) => string;
  onChange: (value: number) => void;
}

function Range({ label, value, min, max, format, onChange }: RangeProps) {
  return (
    <label className="block">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-xs uppercase tracking-[0.2em] text-white/50">{label}</span>
        <span className="font-display text-sm text-cyan">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-cyan"
      />
      <div className="mt-1 flex justify-between text-[10px] text-white/25">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </label>
  );
}

export function BodyPicker({ build }: { build: BuildState }) {
  const { body } = build;
  const heights = heightsFor(rules, body.position);
  const limits = rules.bodies[body.position].heights[String(body.height)];

  return (
    <Card
      title="Body"
      hint="Position picks the legal bodies. Height, weight and wingspan set every ceiling that follows — position itself never enters the maths."
    >
      <div className="mb-5 grid grid-cols-5 gap-1.5">
        {POSITIONS.map((position: Position) => (
          <button
            key={position}
            type="button"
            onClick={() => build.setPosition(position)}
            className={`rounded-lg border px-2 py-2 font-display text-sm transition ${
              position === body.position
                ? "border-cyan/60 bg-cyan/10 text-cyan shadow-cyan"
                : "border-slateGlow bg-elevated text-white/60 hover:border-white/20 hover:text-white"
            }`}
          >
            {position}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <Range
          label="Height"
          value={body.height}
          min={heights[0]}
          max={heights[heights.length - 1]}
          format={formatHeight}
          onChange={build.setHeight}
        />
        <Range
          label="Weight"
          value={body.weight}
          min={limits.weight[0]}
          max={limits.weight[1]}
          format={(value) => `${value} lb`}
          onChange={build.setWeight}
        />
        <Range
          label="Wingspan"
          value={body.wingspan}
          min={limits.wingspan[0]}
          max={limits.wingspan[1]}
          format={formatHeight}
          onChange={build.setWingspan}
        />
      </div>
    </Card>
  );
}
