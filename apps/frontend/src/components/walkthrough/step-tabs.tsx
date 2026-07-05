"use client";

import { useWalkthrough } from "./context";

export const STEPS = [
  "Stock Tokens",
  "Price feeds",
  "The basket",
  "Mint shares",
  "Redeem",
];

export function StepTabs() {
  const { step, setStep, visited } = useWalkthrough();

  return (
    <nav className="border-b border-rh-border bg-rh-bg">
      <div className="mx-auto flex max-w-6xl overflow-x-auto px-4 sm:px-6">
        {STEPS.map((label, i) => {
          const active = i === step;
          const done = visited.includes(i) && !active;
          return (
            <button
              key={label}
              onClick={() => setStep(i)}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm transition-colors ${
                active
                  ? "border-rh-lime text-rh-text"
                  : "border-transparent text-rh-faint hover:text-rh-muted"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded font-mono text-xs ${
                  active
                    ? "bg-rh-lime text-rh-bg"
                    : done
                      ? "border border-rh-lime text-rh-lime"
                      : "border border-rh-border-strong text-rh-faint"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
