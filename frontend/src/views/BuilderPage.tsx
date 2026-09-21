import { useState } from "react";

import { SectionTitle } from "../ui/SectionTitle";
import { AttributeSliders } from "../twok27/components/AttributeSliders.tsx";
import { BadgePanel } from "../twok27/components/BadgePanel.tsx";
import { BodyPicker } from "../twok27/components/BodyPicker.tsx";
import { CapBreakerPanel } from "../twok27/components/CapBreakerPanel.tsx";
import { OverallPanel } from "../twok27/components/OverallPanel.tsx";
import { rules } from "../twok27/data/index.ts";
import { useBuild } from "../twok27/useBuild.ts";

export function BuilderPage() {
  const build = useBuild();
  const [selected, setSelected] = useState<number | null>(null);
  const captured = rules.meta.source.captured;

  return (
    <main className="mx-auto max-w-[1600px] px-4 py-10 md:px-8">
      <SectionTitle eyebrow="NBA 2K27" title="MyPLAYER build lab">
        <p className="max-w-md text-xs leading-relaxed text-white/40">
          Ceilings and the overall rating reproduce the game&apos;s own measurements
          exactly. Where the data cannot answer, this page says so instead of
          guessing.
        </p>
      </SectionTitle>

      <div className="mt-8 grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <BodyPicker build={build} />
          <OverallPanel build={build} />
        </div>

        <AttributeSliders build={build} selected={selected} onSelect={setSelected} />

        <div className="space-y-5">
          <CapBreakerPanel build={build} selected={selected} />
          <BadgePanel build={build} />
        </div>
      </div>

      <footer className="mt-10 border-t border-slateGlow pt-4 text-[11px] leading-relaxed text-white/30">
        <p>
          Rules data captured {captured} from {rules.meta.source.source_app} (api{" "}
          {rules.meta.source.api_version}). 2K patches tuning server-side, so any
          of these numbers can move without a client update.
        </p>
        <p className="mt-1">
          Measurements by{" "}
          <a
            className="text-cyan/60 underline-offset-2 hover:underline"
            href="https://github.com/lightmatmul/nba2k27-builder-dataset"
            target="_blank"
            rel="noreferrer"
          >
            lightmatmul/nba2k27-builder-dataset
          </a>
          ; engine derivation cross-checked against{" "}
          <a
            className="text-cyan/60 underline-offset-2 hover:underline"
            href="https://github.com/sondberg84/nba2k27-build-lab"
            target="_blank"
            rel="noreferrer"
          >
            sondberg84/nba2k27-build-lab
          </a>
          . Not affiliated with 2K Sports, Visual Concepts or Take-Two Interactive.
        </p>
      </footer>
    </main>
  );
}
