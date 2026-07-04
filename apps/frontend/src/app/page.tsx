"use client";

import { useState } from "react";
import type { Address } from "viem";
import { BasketPicker } from "@/components/basket-picker";
import { BasketStats } from "@/components/basket-stats";
import { ComponentTable } from "@/components/component-table";
import { MintRedeem } from "@/components/mint-redeem";
import { demoBasketAddress } from "@/config/contracts";

export default function Home() {
  const [basket, setBasket] = useState<Address>(demoBasketAddress);

  return (
    <div className="space-y-6">
      <BasketPicker selected={basket} onSelect={setBasket} />
      <BasketStats basket={basket} />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <ComponentTable basket={basket} />
        <MintRedeem basket={basket} />
      </div>
      <p className="text-xs leading-relaxed text-rh-faint">
        One basket share is always redeemable for a fixed amount of each
        underlying Stock Token. Prices are read live from Chainlink feeds and
        the basket never rebalances. It is a transparent, fully collateralized
        wrapper, not managed exposure.
      </p>
    </div>
  );
}
