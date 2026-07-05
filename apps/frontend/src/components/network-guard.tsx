"use client";

import { useAccount, useSwitchChain } from "wagmi";
import { activeChain } from "@/config/wagmi";

// writes go through the wallet's current chain, so block actions until it matches
export function useOnCorrectChain() {
  const { isConnected, chainId } = useAccount();
  return isConnected && chainId === activeChain.id;
}

export function NetworkGuard() {
  const { isConnected, chainId } = useAccount();
  const { switchChain, isPending, error } = useSwitchChain();

  if (!isConnected || chainId === activeChain.id) return null;

  return (
    <div className="rounded-lg border border-rh-danger/50 bg-rh-danger/10 px-3 py-3">
      <p className="text-xs leading-relaxed text-rh-danger">
        Your wallet is connected to a different network (chain {chainId}). This
        demo transacts on {activeChain.name} (chain {activeChain.id}).
      </p>
      <button
        onClick={() => switchChain({ chainId: activeChain.id })}
        disabled={isPending}
        className="mt-2 rounded-lg bg-rh-lime px-4 py-2 text-sm font-semibold text-rh-bg transition-colors hover:bg-rh-lime-hover disabled:opacity-50"
      >
        {isPending ? "Check your wallet…" : `Switch to ${activeChain.name}`}
      </button>
      {error && (
        <p className="mt-2 break-all text-xs text-rh-danger">
          {error.message.split("\n")[0]}
        </p>
      )}
    </div>
  );
}
