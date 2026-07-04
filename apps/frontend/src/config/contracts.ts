import type { Address } from "viem";

// addresses come from apps/frontend/.env.local written by scripts/deploy.sh
export const factoryAddress = (process.env.NEXT_PUBLIC_FACTORY_ADDRESS ??
  "0x0000000000000000000000000000000000000000") as Address;

export const demoBasketAddress = (process.env.NEXT_PUBLIC_DEMO_BASKET_ADDRESS ??
  "0x0000000000000000000000000000000000000000") as Address;

export const configuredChainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 31337);
