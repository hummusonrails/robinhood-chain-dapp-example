"use client";

import { useChainId } from "wagmi";
import { localAnvil, robinhoodChain, robinhoodChainTestnet } from "@/config/chains";

type Props = {
  hash?: `0x${string}`;
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  error: Error | null;
};

export function TxStatus({ hash, isPending, isConfirming, isConfirmed, error }: Props) {
  const chainId = useChainId();
  const explorer =
    chainId === robinhoodChain.id
      ? robinhoodChain.blockExplorers.default.url
      : chainId === robinhoodChainTestnet.id
        ? robinhoodChainTestnet.blockExplorers.default.url
        : chainId === localAnvil.id
          ? null
          : null;

  if (error) {
    const message = error.message.split("\n")[0];
    return <p className="mt-2 break-all text-xs text-rh-danger">{message}</p>;
  }
  if (isPending) {
    return <p className="mt-2 text-xs text-rh-muted">Confirm in your wallet…</p>;
  }
  if (isConfirming) {
    return <p className="mt-2 text-xs text-rh-muted">Waiting for confirmation…</p>;
  }
  if (isConfirmed && hash) {
    return (
      <p className="mt-2 text-xs text-rh-lime">
        Confirmed{" "}
        {explorer && (
          <a
            href={`${explorer}/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-rh-lime-hover"
          >
            view on Blockscout
          </a>
        )}
      </p>
    );
  }
  return null;
}
