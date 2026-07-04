"use client";

import type { Address } from "viem";
import { useBasketComponents } from "@/hooks/use-basket";
import { ComponentRow } from "./component-row";

export function ComponentTable({ basket }: { basket: Address }) {
  const components = useBasketComponents(basket);

  return (
    <section className="rounded-xl border border-rh-border bg-rh-surface">
      <div className="border-b border-rh-border px-4 py-3">
        <h2 className="text-sm font-semibold">What backs one share</h2>
        <p className="text-xs text-rh-faint">
          Stock Tokens are ERC-20s with an ERC-8056 UI multiplier for corporate
          actions. Prices come from Chainlink feeds.
        </p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-rh-faint">
            <th className="px-4 py-2 font-medium">Token</th>
            <th className="px-4 py-2 font-medium">Units / Share</th>
            <th className="px-4 py-2 font-medium">Feed Price</th>
            <th className="px-4 py-2 font-medium">UI Multiplier</th>
            <th className="px-4 py-2 text-right font-medium">Your Balance</th>
          </tr>
        </thead>
        <tbody>
          {components.data?.map((c) => (
            <ComponentRow
              key={c.token}
              token={c.token}
              feed={c.feed}
              unitsPerShare={c.unitsPerShare}
            />
          ))}
        </tbody>
      </table>
    </section>
  );
}
