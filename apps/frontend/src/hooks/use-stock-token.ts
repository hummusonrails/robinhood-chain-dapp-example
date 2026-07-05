"use client";

import type { Address } from "viem";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { stockTokenAbi } from "@/abi/stock-token";
import { priceFeedAbi } from "@/abi/price-feed";

export function useStockTokenSymbol(token: Address) {
  return useReadContract({
    address: token,
    abi: stockTokenAbi,
    functionName: "symbol",
  });
}

export function useStockTokenName(token: Address) {
  return useReadContract({
    address: token,
    abi: stockTokenAbi,
    functionName: "name",
  });
}

export function useStockTokenDecimals(token: Address) {
  return useReadContract({
    address: token,
    abi: stockTokenAbi,
    functionName: "decimals",
  });
}

// erc-8056 scaled balance for the connected account
export function useBalanceOfUI(token: Address) {
  const { address } = useAccount();
  return useReadContract({
    address: token,
    abi: stockTokenAbi,
    functionName: "balanceOfUI",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useStockTokenBalance(token: Address) {
  const { address } = useAccount();
  return useReadContract({
    address: token,
    abi: stockTokenAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

// erc-8056, raw balance times multiplier equals underlying shares
export function useUiMultiplier(token: Address) {
  return useReadContract({
    address: token,
    abi: stockTokenAbi,
    functionName: "uiMultiplier",
  });
}

export function useAllowance(token: Address, spender: Address) {
  const { address } = useAccount();
  return useReadContract({
    address: token,
    abi: stockTokenAbi,
    functionName: "allowance",
    args: address ? [address, spender] : undefined,
    query: { enabled: !!address },
  });
}

export function useApprove() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash });

  return {
    approve(token: Address, spender: Address, amount: bigint) {
      writeContract({
        address: token,
        abi: stockTokenAbi,
        functionName: "approve",
        args: [spender, amount],
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

export function useFeedPrice(feed: Address) {
  return useReadContract({
    address: feed,
    abi: priceFeedAbi,
    functionName: "latestRoundData",
    query: { refetchInterval: 15_000 },
  });
}

export function useFeedDescription(feed: Address) {
  return useReadContract({
    address: feed,
    abi: priceFeedAbi,
    functionName: "description",
  });
}

export function useFeedDecimals(feed: Address) {
  return useReadContract({
    address: feed,
    abi: priceFeedAbi,
    functionName: "decimals",
  });
}
