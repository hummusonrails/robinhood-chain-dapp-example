"use client";

import type { Address } from "viem";
import {
  useFeedDescription,
  useFeedPrice,
  useStockTokenBalance,
  useStockTokenSymbol,
  useUiMultiplier,
} from "@/hooks/use-stock-token";
import { formatShares, formatUsd, shortAddress } from "@/lib/format";

type Props = {
  token: Address;
  feed: Address;
  unitsPerShare: bigint;
};

export function ComponentRow({ token, feed, unitsPerShare }: Props) {
  const symbol = useStockTokenSymbol(token);
  const price = useFeedPrice(feed);
  const description = useFeedDescription(feed);
  const multiplier = useUiMultiplier(token);
  const balance = useStockTokenBalance(token);

  const answer = price.data?.[1];

  return (
    <tr className="border-t border-rh-border">
      <td className="px-4 py-3">
        <p className="font-mono font-semibold text-rh-text">
          {symbol.data ?? shortAddress(token)}
        </p>
        <p className="text-xs text-rh-faint">{description.data ?? ""}</p>
      </td>
      <td className="px-4 py-3 font-mono text-rh-muted">
        {formatShares(unitsPerShare)}
      </td>
      <td className="px-4 py-3 font-mono text-rh-text">
        {answer !== undefined && answer > 0n ? formatUsd(answer) : "—"}
      </td>
      <td className="px-4 py-3 font-mono text-rh-muted">
        {multiplier.data !== undefined
          ? `${formatShares(multiplier.data, 2)}×`
          : "—"}
      </td>
      <td className="px-4 py-3 text-right font-mono text-rh-muted">
        {formatShares(balance.data)}
      </td>
    </tr>
  );
}
