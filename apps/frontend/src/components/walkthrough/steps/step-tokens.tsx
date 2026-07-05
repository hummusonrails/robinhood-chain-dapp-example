"use client";

import { useEffect } from "react";
import { useAccount } from "wagmi";
import { useBasketComponents } from "@/hooks/use-basket";
import {
  useBalanceOfUI,
  useStockTokenBalance,
  useStockTokenDecimals,
  useStockTokenName,
  useStockTokenSymbol,
  useUiMultiplier,
} from "@/hooks/use-stock-token";
import { demoBasketAddress } from "@/config/contracts";
import { useMounted } from "@/hooks/use-mounted";
import { formatShares } from "@/lib/format";
import { useWalkthrough } from "../context";
import { StepShell } from "../step-shell";
import { AnnotatedTable } from "../annotated-table";

const DOCS_URL = "https://docs.robinhood.com/chain/stock-tokens/";

export function StepTokens() {
  const { logEvent } = useWalkthrough();
  const { isConnected } = useAccount();
  // ssr renders the disconnected copy so hydration matches after auto reconnect
  const connected = useMounted() && isConnected;
  const components = useBasketComponents(demoBasketAddress);
  const token = components.data?.[0]?.token;

  const name = useStockTokenName(token ?? demoBasketAddress);
  const symbol = useStockTokenSymbol(token ?? demoBasketAddress);
  const decimals = useStockTokenDecimals(token ?? demoBasketAddress);
  const multiplier = useUiMultiplier(token ?? demoBasketAddress);
  const balance = useStockTokenBalance(token ?? demoBasketAddress);
  const balanceUI = useBalanceOfUI(token ?? demoBasketAddress);

  useEffect(() => {
    if (token && name.data && symbol.data && multiplier.data !== undefined) {
      logEvent("step1-token-read", {
        actor: "chain",
        title: `read ${symbol.data} metadata`,
        note: "Plain eth_call reads against the Stock Token contract on testnet.",
        payload: JSON.stringify(
          {
            token,
            name: name.data,
            symbol: symbol.data,
            decimals: decimals.data,
            uiMultiplier: multiplier.data.toString(),
          },
          null,
          2,
        ),
      });
    }
  }, [token, name.data, symbol.data, decimals.data, multiplier.data, logEvent]);

  return (
    <StepShell
      index={0}
      kicker="equities as ERC-20s"
      title="Stock Tokens"
      activeActors={[1]}
      actorNote="Only the Stock Token contract is involved here. Everything on this page is a plain read call any contract or script could make."
    >
      <div className="space-y-3 text-sm leading-relaxed text-rh-muted">
        <p>
          Robinhood Chain represents equities as <strong className="text-rh-text">Stock
          Tokens</strong>: ordinary ERC-20 contracts that any wallet or protocol can
          hold, transfer, and compose with. The one below is the real testnet TSLA
          token that the faucet dispenses, read live from the chain.
        </p>
        <p>
          Corporate actions are where Stock Tokens differ from a plain ERC-20.
          When a 2-for-1 stock split doubles your share count, raw ERC-20
          balances stay exactly where they were, so every integration keeps
          working. The token implements{" "}
          <strong className="text-rh-text">ERC-8056</strong>, the Scaled UI Amount
          extension: a <code className="font-mono text-rh-lime">uiMultiplier</code>{" "}
          that display layers multiply in. Underlying shares equal raw balance times
          the multiplier.
        </p>
      </div>

      <a
        href={DOCS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block rounded-lg border border-rh-border-strong px-3 py-2 font-mono text-xs text-rh-lime transition-colors hover:border-rh-lime"
      >
        Learn more: Stock Token docs →
      </a>

      <AnnotatedTable
        title={`${symbol.data ?? "…"} · live from testnet`}
        caption="eth_call"
        rows={[
          {
            field: "address",
            value: token ?? "…",
            note: "The faucet TSLA token on Robinhood Chain testnet. On mainnet the docs publish canonical addresses per ticker.",
          },
          {
            field: "name / symbol",
            value: name.data && symbol.data ? `${name.data} (${symbol.data})` : "…",
            note: "Standard ERC-20 metadata, nothing special required to read it.",
          },
          {
            field: "decimals",
            value: decimals.data?.toString() ?? "…",
            note: "Stock Tokens use 18 decimals, so 1e18 raw units is one token.",
          },
          {
            field: "uiMultiplier",
            value:
              multiplier.data !== undefined
                ? `${multiplier.data.toString()} (${formatShares(multiplier.data, 2)}×)`
                : "…",
            note: "ERC-8056. 1e18 means 1.0, no split has happened. After a 2-for-1 split this becomes 2e18 while raw balances stay put.",
          },
          {
            field: "balanceOf",
            value: connected ? formatShares(balance.data) : "connect a wallet",
            note: "Your raw balance. This is what contracts like the basket operate on.",
          },
          {
            field: "balanceOfUI",
            value: connected ? formatShares(balanceUI.data) : "connect a wallet",
            note: "Your balance times the multiplier, the number a brokerage UI would show.",
          },
        ]}
      />
    </StepShell>
  );
}
