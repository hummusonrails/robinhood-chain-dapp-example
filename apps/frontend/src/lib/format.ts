import { formatUnits } from "viem";

// chainlink usd values carry 8 decimals
export function formatUsd(value: bigint | undefined): string {
  if (value === undefined) return "—";
  const num = Number(formatUnits(value, 8));
  return num.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

// token and share amounts carry 18 decimals
export function formatShares(value: bigint | undefined, maxFraction = 4): string {
  if (value === undefined) return "—";
  const num = Number(formatUnits(value, 18));
  return num.toLocaleString("en-US", { maximumFractionDigits: maxFraction });
}

export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
