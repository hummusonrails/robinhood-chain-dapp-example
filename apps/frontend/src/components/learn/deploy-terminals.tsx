"use client";

import { useState } from "react";
import { Terminal, type TerminalFrame } from "./terminal";

// recorded from real sessions against this repo, see scripts/deploy.sh
const LOCAL: TerminalFrame[] = [
  { kind: "cmd", text: "anvil" },
  { kind: "note", text: "terminal 1 keeps running, everything below is terminal 2" },
  { kind: "cmd", text: "pnpm run deploy:local" },
  { kind: "out", text: "deploying to local (chain id 31337) via http://localhost:8545" },
  { kind: "out", text: "TSLA=0x5FbDB2315678afecb367f032d93F642f64180aa3" },
  { kind: "out", text: "TSLA_FEED=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9" },
  { kind: "out", text: "FACTORY=0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e" },
  { kind: "out", text: "DEMO_BASKET=0x8dAF17A20c9DBA35f005b6324F493785D239719d" },
  { kind: "ok", text: "wrote apps/frontend/.env.local" },
  { kind: "cmd", text: "pnpm run smoke" },
  { kind: "out", text: "share price: $265.0000 (raw 26500000000)" },
  { kind: "ok", text: "smoke test passed" },
];

const TESTNET: TerminalFrame[] = [
  { kind: "cmd", text: "export PRIVATE_KEY=0x…   # funded from the faucet" },
  { kind: "cmd", text: "pnpm run deploy:testnet" },
  { kind: "out", text: "deploying to testnet (chain id 46630) via https://rpc.testnet.chain.robinhood.com" },
  { kind: "out", text: "Estimated gas price: 0.020000001 gwei" },
  { kind: "out", text: "Estimated total gas used for script: 6102021" },
  { kind: "out", text: "Estimated amount required: 0.000122040426102021 ETH" },
  { kind: "out", text: "FACTORY=0xC1940D5fd58ce735A44a53f910852B12250F6a14" },
  { kind: "out", text: "DEMO_BASKET=0x7633e0920Ea46A8Ec54F61C95adECD391c01Edd4" },
  { kind: "out", text: "Response: `OK`" },
  { kind: "out", text: "Details: `Pass - Verified`" },
  { kind: "ok", text: "All (5) contracts were verified!" },
  { kind: "ok", text: "wrote apps/frontend/.env.local" },
  { kind: "note", text: "those two addresses are the live contracts this site reads right now" },
];

const MAINNET: TerminalFrame[] = [
  { kind: "note", text: "rehearse first, fork tests run this exact config against live mainnet for free" },
  { kind: "cmd", text: "pnpm run test:fork" },
  { kind: "out", text: "Ran 5 tests for test/fork/BasketMainnetFork.t.sol:BasketMainnetForkTest" },
  { kind: "out", text: "[PASS] test_balanceValueUsd_withRealFeeds() (gas: 828800)" },
  { kind: "out", text: "[PASS] test_feedsAreLiveUsdFeeds() (gas: 21981)" },
  { kind: "out", text: "[PASS] test_mintAndRedeem_withRealStockTokens() (gas: 808620)" },
  { kind: "out", text: "[PASS] test_sharePriceUsd_againstRealFeeds() (gas: 89444)" },
  { kind: "out", text: "[PASS] test_stockTokensExposeErc8056() (gas: 45112)" },
  { kind: "ok", text: "Suite result: ok. 5 passed; 0 failed; 0 skipped" },
  { kind: "cmd", text: "PRIVATE_KEY=$MAINNET_KEY scripts/deploy.sh mainnet" },
  { kind: "note", text: "same script, chain id 4663, real ETH for gas, real TSLA NVDA AAPL and real Chainlink feeds" },
  { kind: "note", text: "verification goes to robinhoodchain.blockscout.com automatically" },
];

const TABS = [
  { key: "local", label: "Local anvil", title: "local · chain 31337", frames: LOCAL },
  { key: "testnet", label: "Testnet", title: "robinhood chain testnet · 46630", frames: TESTNET },
  { key: "mainnet", label: "Mainnet", title: "robinhood chain · 4663", frames: MAINNET },
];

export function DeployTerminals() {
  const [tab, setTab] = useState("testnet");
  const active = TABS.find((t) => t.key === tab) ?? TABS[1];

  return (
    <div>
      <div className="mb-3 flex gap-1 rounded-lg bg-rh-surface p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
              tab === t.key ? "bg-rh-lime text-rh-bg" : "text-rh-muted hover:text-rh-text"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <Terminal key={active.key} title={active.title} frames={active.frames} />
    </div>
  );
}
