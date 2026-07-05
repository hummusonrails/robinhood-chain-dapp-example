"use client";

import type { Address } from "viem";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { basketTokenAbi } from "@/abi/basket-token";

export function useBasketMetadata(basket: Address) {
  const name = useReadContract({
    address: basket,
    abi: basketTokenAbi,
    functionName: "name",
  });
  const symbol = useReadContract({
    address: basket,
    abi: basketTokenAbi,
    functionName: "symbol",
  });
  return { name: name.data, symbol: symbol.data };
}

export function useBasketComponents(basket: Address) {
  return useReadContract({
    address: basket,
    abi: basketTokenAbi,
    functionName: "components",
  });
}

// pricing reverts while any feed is stale so surface the error state to the ui
export function useSharePriceUsd(basket: Address) {
  return useReadContract({
    address: basket,
    abi: basketTokenAbi,
    functionName: "sharePriceUsd",
    query: { refetchInterval: 15_000 },
  });
}

export function useTotalValueUsd(basket: Address) {
  return useReadContract({
    address: basket,
    abi: basketTokenAbi,
    functionName: "totalValueUsd",
    query: { refetchInterval: 15_000 },
  });
}

export function useBasketTotalSupply(basket: Address) {
  return useReadContract({
    address: basket,
    abi: basketTokenAbi,
    functionName: "totalSupply",
    query: { refetchInterval: 15_000 },
  });
}

export function useMaxPriceAge(basket: Address) {
  return useReadContract({
    address: basket,
    abi: basketTokenAbi,
    functionName: "maxPriceAge",
  });
}

export function useQuoteRedeem(basket: Address, shares: bigint) {
  return useReadContract({
    address: basket,
    abi: basketTokenAbi,
    functionName: "quoteRedeem",
    args: [shares],
    query: { enabled: shares > 0n },
  });
}

export function useBasketBalance(basket: Address) {
  const { address } = useAccount();
  return useReadContract({
    address: basket,
    abi: basketTokenAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useBalanceValueUsd(basket: Address) {
  const { address } = useAccount();
  return useReadContract({
    address: basket,
    abi: basketTokenAbi,
    functionName: "balanceValueUsd",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 15_000 },
  });
}

export function useQuoteMint(basket: Address, shares: bigint) {
  return useReadContract({
    address: basket,
    abi: basketTokenAbi,
    functionName: "quoteMint",
    args: [shares],
    query: { enabled: shares > 0n },
  });
}

export function useBasketWrite() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash });

  return {
    mint(basket: Address, shares: bigint, to: Address) {
      writeContract({
        address: basket,
        abi: basketTokenAbi,
        functionName: "mint",
        args: [shares, to],
      });
    },
    redeem(basket: Address, shares: bigint, to: Address) {
      writeContract({
        address: basket,
        abi: basketTokenAbi,
        functionName: "redeem",
        args: [shares, to],
      });
    },
    hash,
    isPending,
    isConfirming: receipt.isLoading,
    isConfirmed: receipt.isSuccess,
    error,
    reset,
  };
}
