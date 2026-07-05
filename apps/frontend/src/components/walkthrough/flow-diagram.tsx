const ACTORS = [
  { name: "Your Wallet", detail: "holds tokens" },
  { name: "Stock Tokens", detail: "ERC-20 + 8056" },
  { name: "BasketToken", detail: "mint / redeem" },
  { name: "Chainlink", detail: "USD feeds" },
];

export function FlowDiagram({ active, note }: { active: number[]; note: string }) {
  return (
    <div className="rounded-xl border border-rh-border bg-rh-surface">
      <div className="border-b border-rh-border px-4 py-2.5">
        <p className="font-mono text-xs uppercase tracking-widest text-rh-muted">
          Who takes part in this step
        </p>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto px-4 py-4">
        {ACTORS.map((actor, i) => {
          const on = active.includes(i);
          return (
            <div key={actor.name} className="flex shrink-0 items-center gap-2">
              {i > 0 && <span className="text-rh-border-strong">┄┄</span>}
              <div
                className={`relative rounded-lg border-2 px-3 py-2 text-center transition-all ${
                  on
                    ? "border-rh-lime bg-rh-lime/15 shadow-[0_0_18px_rgba(204,255,0,0.25)]"
                    : "border-rh-border bg-rh-bg opacity-35"
                }`}
              >
                <p
                  className={`flex items-center justify-center gap-1.5 text-xs font-semibold ${
                    on ? "text-rh-lime" : "text-rh-muted"
                  }`}
                >
                  {on && (
                    <span className="h-1.5 w-1.5 rounded-full bg-rh-lime" />
                  )}
                  {actor.name}
                </p>
                <p className="font-mono text-[10px] text-rh-faint">
                  {actor.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <p className="border-t border-rh-border/60 px-4 py-2.5 text-xs leading-relaxed text-rh-muted">
        {note}
      </p>
    </div>
  );
}
