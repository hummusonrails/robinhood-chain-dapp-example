"use client";

import { useEffect } from "react";
import { useBasketComponents, useMaxPriceAge } from "@/hooks/use-basket";
import {
  useFeedDecimals,
  useFeedDescription,
  useFeedPrice,
} from "@/hooks/use-stock-token";
import { demoBasketAddress } from "@/config/contracts";
import { formatUsd } from "@/lib/format";
import { useWalkthrough } from "../context";
import { StepShell } from "../step-shell";
import { AnnotatedTable } from "../annotated-table";

const CHAINLINK_URL =
  "https://docs.chain.link/data-feeds/price-feeds/addresses?network=robinhood";

function relativeTime(timestamp: bigint | undefined): string {
  if (timestamp === undefined) return "…";
  const seconds = Math.floor(Date.now() / 1000) - Number(timestamp);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

export function StepFeeds() {
  const { logEvent } = useWalkthrough();
  const components = useBasketComponents(demoBasketAddress);
  const feed = components.data?.[0]?.feed;

  const description = useFeedDescription(feed ?? demoBasketAddress);
  const decimals = useFeedDecimals(feed ?? demoBasketAddress);
  const round = useFeedPrice(feed ?? demoBasketAddress);
  const maxPriceAge = useMaxPriceAge(demoBasketAddress);

  const answer = round.data?.[1];
  const updatedAt = round.data?.[3];

  useEffect(() => {
    if (feed && answer !== undefined) {
      logEvent("step2-feed-read", {
        actor: "chain",
        title: "latestRoundData()",
        note: "The AggregatorV3Interface call every Chainlink consumer makes.",
        payload: JSON.stringify(
          {
            feed,
            description: description.data,
            answer: answer.toString(),
            updatedAt: updatedAt?.toString(),
            decimals: decimals.data,
          },
          null,
          2,
        ),
      });
    }
  }, [feed, answer, updatedAt, description.data, decimals.data, logEvent]);

  return (
    <StepShell
      index={1}
      kicker="oracles with market hours"
      title="Price feeds"
      activeActors={[3]}
      actorNote="Only the Chainlink feed is read in this step. Nothing moves and no wallet is needed, price data is a free view call."
    >
      <div className="space-y-3 text-sm leading-relaxed text-rh-muted">
        <p>
          Chainlink publishes a USD price feed for every Stock Token on Robinhood
          Chain mainnet, exposed through the standard{" "}
          <code className="font-mono text-rh-lime">AggregatorV3Interface</code>.
          Feeds exist on mainnet only, so this testnet demo deploys mock feeds with
          the same interface. Everything a consumer contract does is identical.
        </p>
        <p>
          Equity feeds have a rhythm of their own: <strong className="text-rh-text">
          markets keep hours</strong>. Stock feeds update 24 hours a day, 5 days a
          week, so the staleness window belongs to the asset class. Size it for a
          quiet weekend and pricing sails through Monday open. The basket accepts a{" "}
          <code className="font-mono text-rh-lime">maxPriceAge</code> at deployment
          and this one uses {maxPriceAge.data ? Number(maxPriceAge.data) / 86400 : 4}{" "}
          days.
        </p>
      </div>

      <a
        href={CHAINLINK_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block rounded-lg border border-rh-border-strong px-3 py-2 font-mono text-xs text-rh-lime transition-colors hover:border-rh-lime"
      >
        Learn more: Robinhood Chain feed directory →
      </a>

      <AnnotatedTable
        title={`${description.data ?? "feed"} · latestRoundData()`}
        caption="mock on testnet, real on mainnet"
        rows={[
          {
            field: "feed",
            value: feed ?? "…",
            note: "Mock feed deployed by this demo. The mainnet RHTSLA / USD feed lives at 0x4A1166a659A55625345e9515b32adECea5547C38.",
          },
          {
            field: "description",
            value: description.data ?? "…",
            note: "Chainlink names Stock Token feeds RH<ticker> / USD because they price the token, not the exchange listing.",
          },
          {
            field: "answer",
            value:
              answer !== undefined && answer > 0n
                ? `${answer.toString()} (${formatUsd(answer)})`
                : "…",
            note: "Price with 8 decimals, the Chainlink convention for USD feeds. Corporate actions are already applied, so consumers never touch uiMultiplier.",
          },
          {
            field: "updatedAt",
            value:
              updatedAt !== undefined
                ? `${updatedAt.toString()} (${relativeTime(updatedAt)})`
                : "…",
            note: "The staleness input. The basket reverts pricing when now exceeds updatedAt plus maxPriceAge.",
          },
          {
            field: "decimals",
            value: decimals.data?.toString() ?? "…",
            note: "The basket constructor rejects any feed that does not answer with 8 decimals.",
          },
        ]}
      />
    </StepShell>
  );
}
