"use client";

import type { Address } from "viem";
import { useAccount } from "wagmi";
import {
  useBalanceValueUsd,
  useBasketBalance,
  useBasketMetadata,
  useSharePriceUsd,
  useTotalValueUsd,
} from "@/hooks/use-basket";
import { formatShares, formatUsd } from "@/lib/format";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-rh-border bg-rh-surface p-4">
      <p className="text-xs uppercase tracking-wide text-rh-faint">{label}</p>
      <p className="mt-1 font-mono text-xl text-rh-text">{value}</p>
    </div>
  );
}

export function BasketStats({ basket }: { basket: Address }) {
  const { isConnected } = useAccount();
  const { name, symbol } = useBasketMetadata(basket);
  const sharePrice = useSharePriceUsd(basket);
  const totalValue = useTotalValueUsd(basket);
  const balance = useBasketBalance(basket);
  const balanceValue = useBalanceValueUsd(basket);

  return (
    <section>
      <div className="flex items-baseline gap-3">
        <h1 className="text-2xl font-semibold">{name ?? "…"}</h1>
        {symbol && (
          <span className="rounded-md bg-rh-elevated px-2 py-0.5 font-mono text-sm text-rh-lime">
            {symbol}
          </span>
        )}
      </div>

      {sharePrice.isError && (
        <p className="mt-3 rounded-lg border border-rh-danger/50 bg-rh-surface px-4 py-2 text-sm text-rh-danger">
          Pricing unavailable: a component price feed is stale or invalid.
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Share Price" value={formatUsd(sharePrice.data)} />
        <Stat label="Total Value Locked" value={formatUsd(totalValue.data)} />
        <Stat
          label="Your Shares"
          value={isConnected ? formatShares(balance.data) : "—"}
        />
        <Stat
          label="Your Value"
          value={isConnected ? formatUsd(balanceValue.data) : "—"}
        />
      </div>
    </section>
  );
}
