"use client";

import { useEffect } from "react";
import type { Address } from "viem";
import { useAllowance, useApprove, useStockTokenSymbol } from "@/hooks/use-stock-token";
import { formatShares } from "@/lib/format";
import { TxStatus } from "./tx-status";

type Props = {
  token: Address;
  spender: Address;
  required: bigint;
};

// one component token approval, hidden once the allowance covers the quote
export function ApproveRow({ token, spender, required }: Props) {
  const symbol = useStockTokenSymbol(token);
  const allowance = useAllowance(token, spender);
  const { approve, hash, isPending, isConfirming, isConfirmed, error } = useApprove();

  const refetchAllowance = allowance.refetch;
  useEffect(() => {
    if (isConfirmed) refetchAllowance();
  }, [isConfirmed, refetchAllowance]);

  const approved = allowance.data !== undefined && allowance.data >= required;
  if (approved) {
    return (
      <div className="flex items-center justify-between rounded-lg bg-rh-elevated/50 px-3 py-2 text-sm">
        <span className="font-mono">{symbol.data ?? "…"}</span>
        <span className="text-rh-lime">approved ✓</span>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-rh-elevated/50 px-3 py-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-mono">
          {symbol.data ?? "…"}{" "}
          <span className="text-rh-faint">needs {formatShares(required)}</span>
        </span>
        <button
          onClick={() => approve(token, spender, required)}
          disabled={isPending || isConfirming}
          className="rounded-md border border-rh-lime px-3 py-1 text-xs font-semibold text-rh-lime transition-colors hover:bg-rh-lime hover:text-rh-bg disabled:opacity-50"
        >
          Approve
        </button>
      </div>
      <TxStatus
        hash={hash}
        isPending={isPending}
        isConfirming={isConfirming}
        isConfirmed={isConfirmed}
        error={error}
      />
    </div>
  );
}
