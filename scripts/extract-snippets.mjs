#!/usr/bin/env node
// extracts real code regions from the repo into apps/frontend/src/generated/snippets.json
// runs before every frontend build so the learn page always matches the contracts
// each anchor finds a start marker, captures to a matching brace or end marker,
// and records exact line numbers for deep links into github

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const GITHUB = "https://github.com/hummusonrails/robinhood-chain-dapp-example/blob/main";

// end: "brace" counts braces from the marker line, "marker" captures until a literal line match
const ANCHORS = [
  { id: "component-struct", file: "contracts/src/BasketToken.sol", start: "struct Component {", end: "brace" },
  { id: "basket-constructor", file: "contracts/src/BasketToken.sol", start: "constructor(", end: "brace" },
  { id: "basket-mint", file: "contracts/src/BasketToken.sol", start: "function mint(", end: "brace" },
  { id: "basket-redeem", file: "contracts/src/BasketToken.sol", start: "function redeem(", end: "brace" },
  { id: "share-price", file: "contracts/src/BasketToken.sol", start: "function sharePriceUsd(", end: "brace" },
  { id: "read-price", file: "contracts/src/BasketToken.sol", start: "function _readPrice(", end: "brace" },
  { id: "factory-create", file: "contracts/src/BasketFactory.sol", start: "function createBasket(", end: "brace" },
  { id: "erc8056-interface", file: "contracts/src/interfaces/IScaledUIAmount.sol", start: "interface IScaledUIAmount {", end: "brace" },
  { id: "fork-setup", file: "contracts/test/fork/BasketMainnetFork.t.sol", start: "function setUp(", end: "brace" },
  { id: "fork-mint", file: "contracts/test/fork/BasketMainnetFork.t.sol", start: "function test_mintAndRedeem_withRealStockTokens(", end: "brace" },
  { id: "deploy-run", file: "contracts/script/Deploy.s.sol", start: "function run(", end: "brace" },
  { id: "deploy-mainnet", file: "contracts/script/Deploy.s.sol", start: "function _mainnetComponents(", end: "brace" },
  { id: "deploy-testnet", file: "contracts/script/Deploy.s.sol", start: "function _testnetComponents(", end: "brace" },
  { id: "deploy-sh-forge", file: "scripts/deploy.sh", start: "# gas estimates on arbitrum stack chains", end: "marker", endMarker: "echo \"$OUTPUT\" >&2" },
  { id: "deploy-sh-verify", file: "scripts/deploy.sh", start: "testnet)", end: "marker", endMarker: "    ;;" },
  { id: "fuzz-roundtrip", file: "contracts/test/BasketToken.t.sol", start: "function testFuzz_mintRedeemRoundTrip(", end: "brace" },
];

function extract(anchor) {
  const path = join(root, anchor.file);
  const lines = readFileSync(path, "utf8").split("\n");
  const startIdx = lines.findIndex((l) => l.includes(anchor.start));
  if (startIdx === -1) {
    throw new Error(`anchor "${anchor.id}": start marker not found in ${anchor.file}`);
  }

  let endIdx = -1;
  if (anchor.end === "brace") {
    let depth = 0;
    let opened = false;
    for (let i = startIdx; i < lines.length; i++) {
      for (const ch of lines[i]) {
        if (ch === "{") {
          depth += 1;
          opened = true;
        } else if (ch === "}") {
          depth -= 1;
        }
      }
      if (opened && depth === 0) {
        endIdx = i;
        break;
      }
    }
  } else {
    for (let i = startIdx + 1; i < lines.length; i++) {
      if (lines[i] === anchor.endMarker || lines[i].includes(anchor.endMarker)) {
        endIdx = i;
        break;
      }
    }
  }
  if (endIdx === -1) {
    throw new Error(`anchor "${anchor.id}": end not found in ${anchor.file}`);
  }

  // include a leading comment block directly above the start marker
  let firstIdx = startIdx;
  while (firstIdx > 0 && lines[firstIdx - 1].trim().startsWith("//")) {
    firstIdx -= 1;
  }

  const raw = lines.slice(firstIdx, endIdx + 1);
  const indent = Math.min(
    ...raw.filter((l) => l.trim().length > 0).map((l) => l.length - l.trimStart().length),
  );
  const code = raw.map((l) => l.slice(indent)).join("\n");

  return {
    file: anchor.file,
    startLine: firstIdx + 1,
    endLine: endIdx + 1,
    github: `${GITHUB}/${anchor.file}#L${firstIdx + 1}-L${endIdx + 1}`,
    code,
  };
}

const out = {};
for (const anchor of ANCHORS) {
  out[anchor.id] = extract(anchor);
}

const target = join(root, "apps/frontend/src/generated/snippets.json");
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, JSON.stringify(out, null, 2) + "\n");
console.log(`extracted ${ANCHORS.length} snippets to ${target}`);
