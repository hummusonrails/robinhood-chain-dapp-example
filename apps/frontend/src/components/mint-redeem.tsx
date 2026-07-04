"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { parseUnits, type Address } from "viem";
import { useAccount } from "wagmi";
import {
  useBasketBalance,
  useBasketComponents,
  useBasketWrite,
  useQuoteMint,
} from "@/hooks/use-basket";
import { formatShares } from "@/lib/format";
import { ApproveRow } from "./approve-row";
import { TxStatus } from "./tx-status";

type Mode = "mint" | "redeem";

function toShares(input: string): bigint {
  try {
    return parseUnits(input || "0", 18);
  } catch {
    return 0n;
  }
}

export function MintRedeem({ basket }: { basket: Address }) {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<Mode>("mint");
  const [input, setInput] = useState("1");

  const shares = toShares(input);

  const components = useBasketComponents(basket);
  const quote = useQuoteMint(basket, shares);
  const balance = useBasketBalance(basket);
  const { mint, redeem, hash, isPending, isConfirming, isConfirmed, error, reset } =
    useBasketWrite();

  // refresh balances and allowances after a confirmed transaction
  useEffect(() => {
    if (isConfirmed) queryClient.invalidateQueries();
  }, [isConfirmed, queryClient]);

  const submit = () => {
    if (!address || shares === 0n) return;
    reset();
    if (mode === "mint") mint(basket, shares, address);
    else redeem(basket, shares, address);
  };

  return (
    <section className="rounded-xl border border-rh-border bg-rh-surface p-4">
      <div className="flex gap-1 rounded-lg bg-rh-bg p-1">
        {(["mint", "redeem"] as const).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              reset();
            }}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-semibold capitalize transition-colors ${
              mode === m
                ? "bg-rh-lime text-rh-bg"
                : "text-rh-muted hover:text-rh-text"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <label className="mt-4 block text-xs uppercase tracking-wide text-rh-faint">
        Shares
      </label>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        inputMode="decimal"
        placeholder="0.0"
        className="mt-1 w-full rounded-lg border border-rh-border-strong bg-rh-bg px-3 py-2 font-mono text-lg outline-none focus:border-rh-lime"
      />
      {mode === "redeem" && (
        <p className="mt-1 text-xs text-rh-faint">
          You hold {formatShares(balance.data)} shares
        </p>
      )}

      {mode === "mint" && shares > 0n && components.data && quote.data && (
        <div className="mt-3 space-y-2">
          {components.data.map((c, i) => (
            <ApproveRow
              key={c.token}
              token={c.token}
              spender={basket}
              required={quote.data[i]}
            />
          ))}
        </div>
      )}

      <button
        onClick={submit}
        disabled={!isConnected || shares === 0n || isPending || isConfirming}
        className="mt-4 w-full rounded-lg bg-rh-lime px-4 py-2.5 font-semibold text-rh-bg transition-colors hover:bg-rh-lime-hover disabled:cursor-not-allowed disabled:opacity-40"
      >
        {!isConnected
          ? "Connect a wallet first"
          : mode === "mint"
            ? "Mint shares"
            : "Redeem shares"}
      </button>

      <TxStatus
        hash={hash}
        isPending={isPending}
        isConfirming={isConfirming}
        isConfirmed={isConfirmed}
        error={error}
      />
    </section>
  );
}
