"use client";

import { useWalkthrough, type ConsoleActor } from "./context";

const ACTOR_STYLES: Record<ConsoleActor, string> = {
  app: "text-rh-lime",
  wallet: "text-rh-muted",
  chain: "text-rh-faint",
};

const ACTOR_LABELS: Record<ConsoleActor, string> = {
  app: "APP",
  wallet: "WALLET",
  chain: "CHAIN",
};

export function LiveConsole() {
  const { events } = useWalkthrough();

  return (
    <div className="rounded-xl border border-rh-border bg-rh-surface">
      <div className="flex items-center justify-between border-b border-rh-border px-4 py-2.5">
        <p className="font-mono text-xs uppercase tracking-widest text-rh-muted">
          Live console · testnet traffic
        </p>
        <p className="font-mono text-xs text-rh-faint">{events.length} events</p>
      </div>
      <div className="max-h-[480px] space-y-4 overflow-y-auto p-4">
        {events.length === 0 && (
          <p className="text-sm text-rh-faint">
            Onchain reads and transactions appear here as you move through the
            steps.
          </p>
        )}
        {events.map((e) => (
          <div key={e.id}>
            <p
              className={`font-mono text-[11px] uppercase tracking-widest ${ACTOR_STYLES[e.actor]}`}
            >
              ■ {ACTOR_LABELS[e.actor]}
            </p>
            <p className="mt-0.5 font-mono text-sm text-rh-text">{e.title}</p>
            <p className="text-xs text-rh-faint">{e.note}</p>
            {e.payload && (
              <details className="mt-1">
                <summary className="cursor-pointer font-mono text-xs text-rh-lime hover:text-rh-lime-hover">
                  + payload
                </summary>
                <pre className="mt-1 overflow-x-auto rounded-lg bg-rh-bg p-2 font-mono text-[11px] leading-relaxed text-rh-muted">
                  {e.payload}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
