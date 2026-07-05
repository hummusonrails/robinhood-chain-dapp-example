"use client";

import { useWalkthrough } from "./context";
import { STEPS } from "./step-tabs";
import { FlowDiagram } from "./flow-diagram";

type Props = {
  index: number;
  kicker: string;
  title: string;
  activeActors: number[];
  children: React.ReactNode;
};

export function StepShell({ index, kicker, title, activeActors, children }: Props) {
  const { setStep } = useWalkthrough();
  const last = index === STEPS.length - 1;

  return (
    <div className="space-y-5">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-rh-faint">
          Step {index + 1} of {STEPS.length} · {kicker}
        </p>
        <h1 className="mt-1 text-3xl font-semibold">{title}</h1>
      </div>
      {children}
      <FlowDiagram active={activeActors} />
      <div className="flex gap-3">
        {index > 0 && (
          <button
            onClick={() => setStep(index - 1)}
            className="rounded-lg border border-rh-border-strong px-4 py-2 text-sm text-rh-muted transition-colors hover:border-rh-lime hover:text-rh-lime"
          >
            ← Back
          </button>
        )}
        {!last && (
          <button
            onClick={() => setStep(index + 1)}
            className="rounded-lg bg-rh-lime px-4 py-2 text-sm font-semibold text-rh-bg transition-colors hover:bg-rh-lime-hover"
          >
            Next: {STEPS[index + 1]} →
          </button>
        )}
      </div>
    </div>
  );
}
