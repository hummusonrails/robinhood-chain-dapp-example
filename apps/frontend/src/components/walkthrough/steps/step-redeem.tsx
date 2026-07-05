"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { formatUnits, type Address } from "viem";
import { useAccount } from "wagmi";
import {
  useBasketBalance,
  useBasketComponents,
  useBasketWrite,
  useQuoteRedeem,
} from "@/hooks/use-basket";
import { useStockTokenSymbol } from "@/hooks/use-stock-token";
import { demoBasketAddress } from "@/config/contracts";
import { formatShares } from "@/lib/format";
import { TxStatus } from "@/components/tx-status";
import { ConnectButton } from "@/components/connect-button";
import { NetworkGuard, useOnCorrectChain } from "@/components/network-guard";
import { useWalkthrough } from "../context";
import { StepShell } from "../step-shell";
import { toShares } from "./step-mint";

const REPO_URL = "https://github.com/hummusonrails/robinhood-chain-dapp-example";

function QuoteRow({ token, amount }: { token: Address; amount: bigint }) {
  const symbol = useStockTokenSymbol(token);
  return (
    <div className="flex items-center justify-between rounded-lg bg-rh-elevated/50 px-3 py-2 font-mono text-sm">
      <span>{symbol.data ?? "…"}</span>
      <span className="text-rh-muted">{formatShares(amount)}</span>
    </div>
  );
}

export function StepRedeem() {
  const { logEvent } = useWalkthrough();
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");

  const onCorrectChain = useOnCorrectChain();
  const shares = toShares(input);
  const components = useBasketComponents(demoBasketAddress);
  const balance = useBasketBalance(demoBasketAddress);
  const quote = useQuoteRedeem(demoBasketAddress, shares);
  const insufficient =
    balance.data !== undefined && shares > 0n && shares > balance.data;
  const { redeem, hash, isPending, isConfirming, isConfirmed, error, reset } =
    useBasketWrite();

  useEffect(() => {
    if (isConfirmed && hash) {
      queryClient.invalidateQueries();
      logEvent(`redeem-${hash}`, {
        actor: "chain",
        title: "Redeemed(sender, to, shares)",
        note: "Shares burned, every component transferred back to your wallet.",
        payload: JSON.stringify({ hash }, null, 2),
      });
    }
  }, [isConfirmed, hash, queryClient, logEvent]);

  const submit = () => {
    if (!address || shares === 0n) return;
    reset();
    logEvent(`redeem-submit-${Date.now()}`, {
      actor: "wallet",
      title: `redeem(${formatShares(shares)} shares, you)`,
      note: "No approval needed, you can always burn what you hold. Amounts round down so reserves never overdraw.",
    });
    redeem(demoBasketAddress, shares, address);
  };

  return (
    <StepShell
      index={4}
      kicker="burn shares, withdraw the backing"
      title="Redeem"
      activeActors={[0, 1, 2]}
    >
      <div className="space-y-3 text-sm leading-relaxed text-rh-muted">
        <p>
          Redemption is the mirror image of minting and needs no approvals: you can
          always burn what you hold.{" "}
          <code className="font-mono text-rh-lime">redeem(shares, to)</code> burns
          your shares first, then transfers every component back. Amounts{" "}
          <strong className="text-rh-text">round down</strong>, the mirror of
          mint&apos;s round up, so the reserves can never be overdrawn.
        </p>
        <p>
          This exit ramp is the whole trust model. There is no manager who can gate
          withdrawals and no oracle dependency on the way out: redemption works even
          while the price feeds are stale, because moving tokens should never depend
          on quoting them.
        </p>
      </div>

      {!isConnected ? (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-rh-border bg-rh-surface p-4">
          <p className="text-sm text-rh-muted">
            Connect a wallet holding basket shares to redeem.
          </p>
          <ConnectButton />
        </div>
      ) : (
        <div className="space-y-3 rounded-xl border border-rh-border bg-rh-surface p-4">
          <NetworkGuard />
          <label className="block text-xs uppercase tracking-wide text-rh-faint">
            Shares to redeem
          </label>
          <div className="mt-1 flex gap-2">
            <input
              value={input}
              onChange={(e) => {
                if (isConfirmed) reset();
                setInput(e.target.value);
              }}
              inputMode="decimal"
              placeholder="0.0"
              className="w-full rounded-lg border border-rh-border-strong bg-rh-bg px-3 py-2 font-mono text-lg outline-none focus:border-rh-lime"
            />
            <button
              onClick={() => {
                if (balance.data === undefined) return;
                if (isConfirmed) reset();
                setInput(formatUnits(balance.data, 18));
              }}
              disabled={!balance.data}
              className="rounded-lg border border-rh-border-strong px-4 font-mono text-xs text-rh-muted transition-colors hover:border-rh-lime hover:text-rh-lime disabled:opacity-40"
            >
              Max
            </button>
          </div>
          <p className="mt-1 text-xs text-rh-faint">
            You hold {formatShares(balance.data)} shares.
          </p>

          {insufficient && !isConfirmed && (
            <p className="mt-3 rounded-lg border border-rh-danger/50 bg-rh-danger/10 px-3 py-2 text-xs leading-relaxed text-rh-danger">
              That is more than you hold. Mint some shares in step 4 first, then
              come back to redeem them.
            </p>
          )}

          {shares > 0n && !isConfirmed && components.data && quote.data && (
            <div className="mt-3 space-y-2">
              <p className="text-xs uppercase tracking-wide text-rh-faint">
                You receive
              </p>
              {components.data.map((c, i) => (
                <QuoteRow key={c.token} token={c.token} amount={quote.data[i]} />
              ))}
            </div>
          )}

          <button
            onClick={submit}
            disabled={shares === 0n || insufficient || !onCorrectChain || isPending || isConfirming}
            className="mt-4 w-full rounded-lg bg-rh-lime px-4 py-2.5 font-semibold text-rh-bg transition-colors hover:bg-rh-lime-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            Redeem {input || "0"} shares
          </button>
          {isConfirmed && (
            <div className="mt-3 rounded-lg border border-rh-lime/40 bg-rh-lime/10 px-3 py-3">
              <p className="text-sm font-semibold text-rh-lime">
                Redeemed ✓ full lifecycle complete
              </p>
              <p className="mt-1 text-xs leading-relaxed text-rh-muted">
                Your shares were burned and every Stock Token is back in your
                wallet. You have now done everything this basket can do: compose,
                price, mint, and unwind, all onchain.
              </p>
            </div>
          )}
          <TxStatus
            hash={hash}
            isPending={isPending}
            isConfirming={isConfirming}
            isConfirmed={isConfirmed}
            error={error}
          />
        </div>
      )}

      <div className="rounded-xl border border-rh-border bg-rh-surface p-4 text-sm leading-relaxed text-rh-muted">
        <p className="font-mono text-xs uppercase tracking-widest text-rh-lime">
          Where to go next
        </p>
        <p className="mt-2">
          The contracts behind this walkthrough are about 200 lines of commented
          Solidity with a full Foundry test suite, including fork tests that run the
          same code against the real mainnet Stock Tokens and Chainlink feeds.{" "}
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-rh-lime underline hover:text-rh-lime-hover"
          >
            Clone the repo
          </a>{" "}
          to deploy your own basket, change the composition, or break the rounding
          on purpose and watch the fuzz tests catch it.
        </p>
      </div>
    </StepShell>
  );
}
