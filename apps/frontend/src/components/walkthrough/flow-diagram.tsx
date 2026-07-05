const ACTORS = [
  { name: "Your Wallet", detail: "holds tokens" },
  { name: "Stock Tokens", detail: "ERC-20 + 8056" },
  { name: "BasketToken", detail: "mint / redeem" },
  { name: "Chainlink", detail: "USD feeds" },
];

export function FlowDiagram({ active }: { active: number[] }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2">
      {ACTORS.map((actor, i) => (
        <div key={actor.name} className="flex shrink-0 items-center gap-2">
          {i > 0 && <span className="text-rh-border-strong">┄┄</span>}
          <div
            className={`rounded-lg border px-3 py-2 text-center transition-colors ${
              active.includes(i)
                ? "border-rh-lime bg-rh-lime/10"
                : "border-rh-border bg-rh-surface opacity-50"
            }`}
          >
            <p
              className={`text-xs font-semibold ${
                active.includes(i) ? "text-rh-text" : "text-rh-muted"
              }`}
            >
              {actor.name}
            </p>
            <p className="font-mono text-[10px] text-rh-faint">{actor.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
