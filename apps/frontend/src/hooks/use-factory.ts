"use client";

import { useReadContract } from "wagmi";
import { basketFactoryAbi } from "@/abi/basket-factory";
import { factoryAddress } from "@/config/contracts";

export function useAllBaskets() {
  return useReadContract({
    address: factoryAddress,
    abi: basketFactoryAbi,
    functionName: "allBaskets",
  });
}
