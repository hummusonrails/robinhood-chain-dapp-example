"use client";

import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { parseUnits, type Address } from "viem";
import { useAccount } from "wagmi";
import {
  useBasketBalance,
  useBasketComponents,
  useBasketWrite,
  useQuoteMint,
} from "@/hooks/use-basket";
import { useStockTokenBalance, useStockTokenSymbol } from "@/hooks/use-stock-token";
import { demoBasketAddress } from "@/config/contracts";
import { formatShares } from "@/lib/format";
import { ApproveRow } from "@/components/approve-row";
import { TxStatus } from "@/components/tx-status";
import { ConnectButton } from "@/components/connect-button";
import { useWalkthrough } from "../context";
import { StepShell } from "../step-shell";

const FAUCET_URL = "https://faucet.testnet.chain.robinhood.com";

export function toShares(input: string): bigint {
  try {
    return parseUnits(input || "0", 18);
  } catch {
    return 0n;
  }
}

function BalanceChip({ token }: { token: Address }) {
  const symbol = useStockTokenSymbol(token);
  const balance = useStockTokenBalance(token);
  return (
    <span className="rounded-md bg-rh-elevated px-2 py-1 font-mono text-xs text-rh-muted">
      {symbol.data ?? "…"}: {formatShares(balance.data)}
    </span>
  );
}

export function StepMint() {
  const { logEvent } = useWalkthrough();
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
  const [input, setInput] = useState("0.1");

  const shares = toShares(input);
  const components = useBasketComponents(demoBasketAddress);
  const quote = useQuoteMint(demoBasketAddress, shares);
  const basketBalance = useBasketBalance(demoBasketAddress);
  const { mint, hash, isPending, isConfirming, isConfirmed, error, reset } =
    useBasketWrite();

  useEffect(() => {
    if (isConfirmed && hash) {
      queryClient.invalidateQueries();
      logEvent(`mint-${hash}`, {
        actor: "chain",
        title: "Minted(sender, to, shares)",
        note: "The basket pulled every component with transferFrom, then minted shares.",
        payload: JSON.stringify({ hash, shares: shares.toString() }, null, 2),
      });
    }
  }, [isConfirmed, hash, queryClient, logEvent, shares]);

  const onApproveConfirmed = useCallback(
    (token: Address, symbol: string, txHash: `0x${string}`) => {
      logEvent(`approve-${txHash}`, {
        actor: "wallet",
        title: `approve(basket, amount) · ${symbol}`,
        note: "Standard ERC-20 allowance so the basket can pull this component.",
        payload: JSON.stringify({ token, hash: txHash }, null, 2),
      });
    },
    [logEvent],
  );

  const submit = () => {
    if (!address || shares === 0n) return;
    reset();
    logEvent(`mint-submit-${Date.now()}`, {
      actor: "wallet",
      title: `mint(${formatShares(shares)} shares, you)`,
      note: "One transaction. The contract rounds each component amount up so a minter can never underpay.",
    });
    mint(demoBasketAddress, shares, address);
  };

  return (
    <StepShell
      index={3}
      kicker="deposit components, receive shares"
      title="Mint shares"
      activeActors={[0, 1, 2]}
    >
      <div className="space-y-3 text-sm leading-relaxed text-rh-muted">
        <p>
          Minting is a two-part dance every ERC-20 protocol shares. First you grant
          the basket an <strong className="text-rh-text">allowance</strong> on each
          component. Then a single{" "}
          <code className="font-mono text-rh-lime">mint(shares, to)</code> call pulls
          the exact backing amounts with <code className="font-mono">transferFrom</code>{" "}
          and mints your shares in the same transaction, so the basket can never be
          under-collateralized.
        </p>
        <p>
          One subtlety worth teaching: component amounts{" "}
          <strong className="text-rh-text">round up</strong>. If they rounded down, a
          dust-sized mint would cost zero of each component and drain the reserves
          one wei at a time.
        </p>
      </div>

      {!isConnected ? (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-rh-border bg-rh-surface p-4">
          <p className="text-sm text-rh-muted">
            Connect a wallet on Robinhood Chain testnet to mint for real. You will
            need testnet ETH and Stock Tokens from the{" "}
            <a
              href={FAUCET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-rh-lime underline hover:text-rh-lime-hover"
            >
              faucet
            </a>
            .
          </p>
          <ConnectButton />
        </div>
      ) : (
        <div className="rounded-xl border border-rh-border bg-rh-surface p-4">
          <div className="flex flex-wrap gap-2">
            {components.data?.map((c) => <BalanceChip key={c.token} token={c.token} />)}
          </div>

          <label className="mt-4 block text-xs uppercase tracking-wide text-rh-faint">
            Shares to mint
          </label>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            inputMode="decimal"
            className="mt-1 w-full rounded-lg border border-rh-border-strong bg-rh-bg px-3 py-2 font-mono text-lg outline-none focus:border-rh-lime"
          />

          {shares > 0n && components.data && quote.data && (
            <div className="mt-3 space-y-2">
              {components.data.map((c, i) => (
                <ApproveRow
                  key={c.token}
                  token={c.token}
                  spender={demoBasketAddress}
                  required={quote.data[i]}
                  onConfirmed={onApproveConfirmed}
                />
              ))}
            </div>
          )}

          <button
            onClick={submit}
            disabled={shares === 0n || isPending || isConfirming}
            className="mt-4 w-full rounded-lg bg-rh-lime px-4 py-2.5 font-semibold text-rh-bg transition-colors hover:bg-rh-lime-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            Mint {input || "0"} shares
          </button>
          <TxStatus
            hash={hash}
            isPending={isPending}
            isConfirming={isConfirming}
            isConfirmed={isConfirmed}
            error={error}
          />
          <p className="mt-3 text-xs text-rh-faint">
            You hold {formatShares(basketBalance.data)} basket shares.
          </p>
        </div>
      )}
    </StepShell>
  );
}
