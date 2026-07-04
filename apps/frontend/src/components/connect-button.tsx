"use client";

import { useSyncExternalStore } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { shortAddress } from "@/lib/format";

const emptySubscribe = () => () => {};

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  // render the disconnected state on the server so hydration matches
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  if (mounted && isConnected && address) {
    return (
      <button
        onClick={() => disconnect()}
        className="rounded-full border border-rh-border-strong px-4 py-2 font-mono text-sm text-rh-muted transition-colors hover:border-rh-lime hover:text-rh-lime"
      >
        {shortAddress(address)}
      </button>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: connectors[0] })}
      disabled={isPending}
      className="rounded-full bg-rh-lime px-4 py-2 text-sm font-semibold text-rh-bg transition-colors hover:bg-rh-lime-hover disabled:opacity-50"
    >
      {isPending ? "Connecting…" : "Connect Wallet"}
    </button>
  );
}
