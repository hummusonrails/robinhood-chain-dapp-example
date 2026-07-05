"use client";

import { useEffect } from "react";
import type { Address } from "viem";
import {
  useBasketComponents,
  useBasketMetadata,
  useBasketTotalSupply,
  useSharePriceUsd,
  useTotalValueUsd,
} from "@/hooks/use-basket";
import { useFeedPrice, useStockTokenSymbol } from "@/hooks/use-stock-token";
import { demoBasketAddress, factoryAddress } from "@/config/contracts";
import { activeChain } from "@/config/wagmi";
import { formatShares, formatUsd, shortAddress } from "@/lib/format";
import { useWalkthrough } from "../context";
import { StepShell } from "../step-shell";

function MathRow({
  token,
  feed,
  unitsPerShare,
}: {
  token: Address;
  feed: Address;
  unitsPerShare: bigint;
}) {
  const symbol = useStockTokenSymbol(token);
  const round = useFeedPrice(feed);
  const answer = round.data?.[1];
  const product =
    answer !== undefined && answer > 0n
      ? (unitsPerShare * answer) / 10n ** 18n
      : undefined;

  return (
    <div className="grid grid-cols-[80px_1fr_auto] items-baseline gap-3 border-t border-rh-border/60 px-4 py-3 first:border-t-0">
      <p className="font-mono text-sm font-semibold text-rh-text">
        {symbol.data ?? shortAddress(token)}
      </p>
      <p className="font-mono text-xs text-rh-faint">
        {formatShares(unitsPerShare)} × {answer ? formatUsd(answer) : "…"}
      </p>
      <p className="font-mono text-sm text-rh-lime">
        {product !== undefined ? formatUsd(product) : "…"}
      </p>
    </div>
  );
}

export function StepBasket() {
  const { logEvent } = useWalkthrough();
  const { name, symbol } = useBasketMetadata(demoBasketAddress);
  const components = useBasketComponents(demoBasketAddress);
  const sharePrice = useSharePriceUsd(demoBasketAddress);
  const totalValue = useTotalValueUsd(demoBasketAddress);
  const totalSupply = useBasketTotalSupply(demoBasketAddress);

  const explorer = activeChain.blockExplorers?.default.url;

  useEffect(() => {
    if (sharePrice.data !== undefined) {
      logEvent("step3-price-read", {
        actor: "chain",
        title: "sharePriceUsd()",
        note: "One view call sums every component price times its weight.",
        payload: JSON.stringify(
          {
            basket: demoBasketAddress,
            sharePriceUsd: sharePrice.data.toString(),
            totalSupply: totalSupply.data?.toString(),
            totalValueUsd: totalValue.data?.toString(),
          },
          null,
          2,
        ),
      });
    }
  }, [sharePrice.data, totalSupply.data, totalValue.data, logEvent]);

  return (
    <StepShell
      index={2}
      kicker="a transparent wrapper, not a fund"
      title="The basket"
      activeActors={[1, 2, 3]}
    >
      <div className="space-y-3 text-sm leading-relaxed text-rh-muted">
        <p>
          <strong className="text-rh-text">{name ?? "…"}</strong> ({symbol ?? "…"})
          is an ERC-20 deployed by the permissionless{" "}
          <a
            href={`${explorer}/address/${factoryAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-rh-lime underline hover:text-rh-lime-hover"
          >
            BasketFactory
          </a>
          . Its composition is fixed at creation: every share is backed by exactly{" "}
          the amounts below, held by the contract itself. No owner, no fees, no
          rebalancing, so the contract stays small enough to read in one sitting.
        </p>
        <p>
          Valuation is just a weighted sum. For each component, multiply the
          Chainlink price by the units backing one share, then add them up. The
          contract does this onchain in{" "}
          <code className="font-mono text-rh-lime">sharePriceUsd()</code> and the
          math below reproduces it in the browser from the same reads.
        </p>
      </div>

      <div className="rounded-xl border border-rh-border bg-rh-surface">
        <div className="border-b border-rh-border px-4 py-2.5">
          <p className="font-mono text-xs uppercase tracking-widest text-rh-muted">
            One share of {symbol ?? "…"} · live math
          </p>
        </div>
        {components.data?.map((c) => (
          <MathRow
            key={c.token}
            token={c.token}
            feed={c.feed}
            unitsPerShare={c.unitsPerShare}
          />
        ))}
        <div className="grid grid-cols-[80px_1fr_auto] items-baseline gap-3 border-t border-rh-lime/40 px-4 py-3">
          <p className="font-mono text-sm font-semibold text-rh-text">Σ</p>
          <p className="font-mono text-xs text-rh-faint">
            sharePriceUsd() returned by the contract
          </p>
          <p className="font-mono text-base font-semibold text-rh-lime">
            {formatUsd(sharePrice.data)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-rh-border bg-rh-surface p-4">
          <p className="text-xs uppercase tracking-wide text-rh-faint">
            Total supply
          </p>
          <p className="mt-1 font-mono text-xl">{formatShares(totalSupply.data)}</p>
          <p className="mt-1 text-xs text-rh-faint">
            Shares minted by everyone who has tried this demo.
          </p>
        </div>
        <div className="rounded-xl border border-rh-border bg-rh-surface p-4">
          <p className="text-xs uppercase tracking-wide text-rh-faint">
            Total value locked
          </p>
          <p className="mt-1 font-mono text-xl">{formatUsd(totalValue.data)}</p>
          <p className="mt-1 text-xs text-rh-faint">
            Supply times share price, all of it redeemable at any moment.
          </p>
        </div>
      </div>
    </StepShell>
  );
}
