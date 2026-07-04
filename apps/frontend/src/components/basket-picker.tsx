"use client";

import type { Address } from "viem";
import { useAllBaskets } from "@/hooks/use-factory";
import { useBasketMetadata } from "@/hooks/use-basket";
import { shortAddress } from "@/lib/format";

function PickerItem({
  basket,
  active,
  onSelect,
}: {
  basket: Address;
  active: boolean;
  onSelect: (basket: Address) => void;
}) {
  const { symbol } = useBasketMetadata(basket);
  return (
    <button
      onClick={() => onSelect(basket)}
      className={`rounded-full px-3 py-1 font-mono text-xs transition-colors ${
        active
          ? "bg-rh-lime text-rh-bg"
          : "border border-rh-border-strong text-rh-muted hover:border-rh-lime hover:text-rh-lime"
      }`}
    >
      {symbol ?? shortAddress(basket)}
    </button>
  );
}

export function BasketPicker({
  selected,
  onSelect,
}: {
  selected: Address;
  onSelect: (basket: Address) => void;
}) {
  const baskets = useAllBaskets();
  if (!baskets.data || baskets.data.length < 2) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs uppercase tracking-wide text-rh-faint">
        Baskets
      </span>
      {baskets.data.map((b) => (
        <PickerItem key={b} basket={b} active={b === selected} onSelect={onSelect} />
      ))}
    </div>
  );
}
