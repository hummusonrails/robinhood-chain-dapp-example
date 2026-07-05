import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/learn/code-block";
import { DeployTerminals } from "@/components/learn/deploy-terminals";
import { Section, Prose } from "@/components/learn/section";
import { Sketch } from "@/components/learn/sketch";

export const metadata: Metadata = {
  title: "Developer Deep Dive · Index Baskets on Robinhood Chain",
  description:
    "The contracts, the deploy pipeline for Robinhood Chain testnet and mainnet, and what the Arbitrum stack changes for developers, with real code and recorded sessions.",
};

const REPO = "https://github.com/hummusonrails/robinhood-chain-dapp-example";

function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-rh-lime underline hover:text-rh-lime-hover"
    >
      {children}
    </a>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return <code className="font-mono text-rh-lime">{children}</code>;
}

export default function LearnPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-16 px-4 py-10 sm:px-6">
      {/* hero */}
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-rh-lime">
          Developer deep dive
        </p>
        <h1 className="mt-2 text-4xl font-semibold leading-tight">
          The code behind the baskets
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-rh-muted">
          The <Link href="/" className="text-rh-lime underline hover:text-rh-lime-hover">walkthrough</Link>{" "}
          shows what the dapp does. This page shows how it is built: the two
          Solidity contracts, the deploy pipeline for Robinhood Chain testnet and
          mainnet, and the places where this chain genuinely differs from the
          Ethereum L2 playbook you may already know. Every snippet is extracted
          from the repo at build time and links to the exact lines on GitHub.
        </p>
      </div>

      {/* architecture */}
      <Section kicker="the shape of the system" title="Architecture">
        <Prose>
          <p>
            Two contracts, no owner, no upgrade path.{" "}
            <Code>BasketFactory</Code> is a permissionless registry that deploys{" "}
            <Code>BasketToken</Code> instances. Each basket is an ERC-20 backed by
            a fixed composition of Stock Tokens it holds itself, priced through the
            Chainlink feed attached to each component.
          </p>
        </Prose>
        <Sketch
          name="architecture"
          caption="The full system. Solid arrows move tokens, the dashed arrow is a read. The factory touches nothing after deployment."
        />
        <CodeBlock id="factory-create" />
        <Prose>
          <p>
            The factory is deliberately thin: deploy, record, emit. All the
            interesting constraints live in the basket constructor, which
            validates every component and rejects any feed that does not answer
            with 8 decimals before the basket can exist.
          </p>
        </Prose>
        <CodeBlock id="basket-constructor" />
      </Section>

      {/* contract tour */}
      <Section kicker="four functions carry the design" title="The contract tour">
        <Prose>
          <p>
            <Code>mint</Code> pulls each component with{" "}
            <Code>transferFrom</Code> and issues shares in the same transaction,
            so the basket cannot exist under-collateralized. The load-bearing
            detail is the rounding direction: amounts round <strong className="text-rh-text">up</strong>,
            because rounding down would let a dust-sized mint pay zero of each
            component and drain reserves one wei at a time.
          </p>
        </Prose>
        <CodeBlock id="basket-mint" />
        <Prose>
          <p>
            <Code>redeem</Code> is the mirror: burn first, then transfer out,
            rounding <strong className="text-rh-text">down</strong>. Note what is
            absent: no allowance check, no oracle read, no pause switch. The exit
            path depends on nothing but the tokens themselves.
          </p>
        </Prose>
        <CodeBlock id="basket-redeem" />
        <Prose>
          <p>
            Valuation is one loop.{" "}
            <Code>sharePriceUsd</Code> multiplies each Chainlink answer by the
            units backing one share and sums. The feeds price the raw Stock Token
            with corporate actions already applied, which is why nothing here
            touches the ERC-8056 multiplier.
          </p>
        </Prose>
        <CodeBlock id="share-price" />
        <Prose>
          <p>
            Every feed read passes through one gate. A non-positive answer or an
            answer older than <Code>maxPriceAge</Code> reverts the pricing views,
            and only the pricing views. This basket uses 4 days because equity
            feeds sleep on weekends, a number you should tune per asset class.
          </p>
        </Prose>
        <CodeBlock id="read-price" />
        <Prose>
          <p>
            The rounding claims above are not vibes, they are a fuzzed invariant.
            This property test mints and redeems random amounts and asserts a user
            can lose at most one wei of dust per component, round trip, while the
            supply always returns to zero.
          </p>
        </Prose>
        <CodeBlock id="fuzz-roundtrip" />
      </Section>

      {/* erc-8056 */}
      <Section kicker="the one new standard" title="ERC-8056, splits without rebasing">
        <Prose>
          <p>
            Stock Tokens are ordinary ERC-20s with one extension you will not find
            on other chains yet. A stock split cannot rewrite every holder&apos;s
            balance without breaking integrations, so raw balances never change.
            Instead the token exposes a <Code>uiMultiplier</Code> and display
            layers multiply: underlying shares equal raw balance times multiplier
            over 1e18. Contracts keep using raw balances, brokerage UIs call{" "}
            <Code>balanceOfUI</Code>. This interface was verified selector by
            selector against the live mainnet TSLA token.
          </p>
        </Prose>
        <CodeBlock id="erc8056-interface" />
      </Section>

      {/* deploy */}
      <Section kicker="testnet and mainnet" title="Deploying on Robinhood Chain">
        <Prose>
          <p>
            One Foundry script serves three networks by switching on{" "}
            <Code>block.chainid</Code>. Anvil gets mocks for everything, testnet
            composes the basket from the real faucet Stock Tokens with mock feeds
            (Chainlink publishes feeds on mainnet only), and mainnet uses the real
            tokens with the real feeds.
          </p>
        </Prose>
        <Sketch
          name="deploy"
          caption="scripts/deploy.sh routes one forge script to three networks, verifies on Blockscout, and hands addresses to the frontend."
        />
        <CodeBlock id="deploy-run" />
        <Prose>
          <p>
            The mainnet component set is just addresses from the{" "}
            <Ext href="https://docs.robinhood.com/chain/contracts/">official token contracts page</Ext>{" "}
            and the{" "}
            <Ext href="https://docs.chain.link/data-feeds/price-feeds/addresses?network=robinhood">Chainlink directory</Ext>,
            wired to the same constructor.
          </p>
        </Prose>
        <CodeBlock id="deploy-mainnet" />
        <Prose>
          <p>
            Replay the real sessions below. The testnet recording is the exact
            deploy that produced the contracts this site reads, and the mainnet
            tab starts with the rehearsal that makes a mainnet deploy boring:
            fork tests that run this exact configuration against live mainnet
            state for free.
          </p>
        </Prose>
        <DeployTerminals />
        <CodeBlock id="fork-setup" />
        <Prose>
          <p>
            Inside a fork test, <Code>deal</Code> conjures real Stock Token
            balances for a test account, so mint and redeem run against the
            actual mainnet bytecode without owning a single token.
          </p>
        </Prose>
        <CodeBlock id="fork-mint" />
      </Section>

      {/* differences */}
      <Section
        kicker="where your l1 instincts need updating"
        title="Not your standard Ethereum chain"
      >
        <Prose>
          <p>
            Robinhood Chain is EVM equivalent, so almost everything you know
            holds. These five things genuinely differ, and two of them bit this
            repo during development.
          </p>
        </Prose>
        <Sketch
          name="gas"
          caption="The life of a transaction: FCFS sequencing into ~250ms blocks, batched and posted to Ethereum as blob data. The fee has two parts."
        />
        <div className="space-y-3">
          <div className="rounded-xl border border-rh-border bg-rh-surface p-4">
            <p className="font-mono text-sm font-semibold text-rh-lime">
              1 · gas estimates include an L1 data fee that moves
            </p>
            <p className="mt-2 text-sm leading-relaxed text-rh-muted">
              Your fee is L2 execution plus the cost of posting your calldata to
              Ethereum, and that second component shifts between estimation and
              execution. Two of this repo&apos;s feed deployments died at exactly
              their gas limit before the deploy script learned to send with
              headroom. This is the fix, in the deploy script every network shares:
            </p>
          </div>
          <CodeBlock id="deploy-sh-forge" />
          <div className="rounded-xl border border-rh-border bg-rh-surface p-4">
            <p className="font-mono text-sm font-semibold text-rh-lime">
              2 · block.number is not your block number
            </p>
            <p className="mt-2 text-sm leading-relaxed text-rh-muted">
              On Arbitrum chains <Code>block.number</Code> returns an estimate of
              the Ethereum block number. For the chain&apos;s own ~250ms block
              height, call <Code>ArbSys(address(100)).arbBlockNumber()</Code>.
              Any time-based logic copied from L1 tutorials needs this check.
            </p>
          </div>
          <div className="rounded-xl border border-rh-border bg-rh-surface p-4">
            <p className="font-mono text-sm font-semibold text-rh-lime">
              3 · first come, first served, no priority auction
            </p>
            <p className="mt-2 text-sm leading-relaxed text-rh-muted">
              The sequencer orders transactions by arrival time. Tipping more gas
              does not jump the queue, which removes the classic sandwich-attack
              economics and makes fee estimation boring in the best way.
            </p>
          </div>
          <div className="rounded-xl border border-rh-border bg-rh-surface p-4">
            <p className="font-mono text-sm font-semibold text-rh-lime">
              4 · contracts can be four times bigger
            </p>
            <p className="mt-2 text-sm leading-relaxed text-rh-muted">
              The code size limit is 96KB against Ethereum&apos;s 24KB, with
              192KB of initcode. Patterns you learned for splitting contracts
              around the Spurious Dragon limit are optional here.
            </p>
          </div>
          <div className="rounded-xl border border-rh-border bg-rh-surface p-4">
            <p className="font-mono text-sm font-semibold text-rh-lime">
              5 · oracles keep market hours
            </p>
            <p className="mt-2 text-sm leading-relaxed text-rh-muted">
              Equity feeds update 24/5, not 24/7. A one-hour staleness threshold,
              standard for crypto pairs, bricks every consumer on Saturday. Design
              staleness per asset class, and never let transfers depend on
              pricing, which is exactly how <Code>BasketToken</Code> splits its
              functions.
            </p>
          </div>
        </div>
      </Section>

      {/* arbitrum stack */}
      <Section kicker="what the stack buys you" title="The Arbitrum stack underneath">
        <Prose>
          <p>
            Robinhood Chain runs on{" "}
            <Ext href="https://docs.arbitrum.io/">Arbitrum Nitro</Ext>, the same
            technology as Arbitrum One, deployed as a dedicated chain. As a
            developer you inherit, without doing anything:
          </p>
        </Prose>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-rh-border bg-rh-surface p-4">
            <p className="text-sm font-semibold text-rh-text">Ethereum settlement</p>
            <p className="mt-1 text-xs leading-relaxed text-rh-muted">
              State roots settle to Ethereum with fraud proofs. The{" "}
              <Ext href="https://portal.arbitrum.io/bridge?destinationChain=robinhood-chain&sourceChain=ethereum">canonical bridge</Ext>{" "}
              is trustless: deposits in ~10 minutes, withdrawals after the 7 day
              challenge window, security inherited from L1 rather than a
              multisig.
            </p>
          </div>
          <div className="rounded-xl border border-rh-border bg-rh-surface p-4">
            <p className="text-sm font-semibold text-rh-text">ETH gas, tiny fees</p>
            <p className="mt-1 text-xs leading-relaxed text-rh-muted">
              No new gas token to acquire. The entire five-contract deployment in
              the terminal above cost 0.00012 ETH on testnet, with blob data
              keeping mainnet costs in the same neighborhood.
            </p>
          </div>
          <div className="rounded-xl border border-rh-border bg-rh-surface p-4">
            <p className="text-sm font-semibold text-rh-text">
              Account abstraction, day one
            </p>
            <p className="mt-1 text-xs leading-relaxed text-rh-muted">
              ERC-4337 EntryPoints v0.6 through v0.8 are deployed at the canonical
              addresses, EIP-7702 delegation is live, and Alchemy provides
              bundler and gas sponsorship infrastructure. Details on the{" "}
              <Ext href="https://docs.robinhood.com/chain/account-abstraction/">account abstraction page</Ext>.
            </p>
          </div>
          <div className="rounded-xl border border-rh-border bg-rh-surface p-4">
            <p className="text-sm font-semibold text-rh-text">Stylus is live</p>
            <p className="mt-1 text-xs leading-relaxed text-rh-muted">
              The Stylus WASM runtime answers on both networks:{" "}
              <Code>ArbWasm.stylusVersion()</Code> at precompile{" "}
              <Code>0x…0071</Code> returns 3. Rust contracts deploy alongside
              Solidity and interoperate through the same ABI.
            </p>
          </div>
        </div>
      </Section>

      {/* sync */}
      <Section kicker="docs that cannot rot" title="How this page stays honest">
        <Prose>
          <p>
            Every snippet above is extracted from the repo by{" "}
            <Ext href={`${REPO}/blob/main/scripts/extract-snippets.mjs`}>scripts/extract-snippets.mjs</Ext>{" "}
            before every build, with line numbers computed at extraction time. A
            GitHub Action re-runs the extraction on every contract change and
            commits the refresh, and Vercel redeploys on every push. Change{" "}
            <Code>mint</Code> tomorrow and this page shows the new code, with
            correct GitHub links, without anyone touching the frontend.
          </p>
        </Prose>
        <Sketch
          name="sync"
          caption="The sync pipeline. Contract edits flow to the deployed site through build-time extraction, so prose and code cannot drift apart."
        />
      </Section>

      {/* cta */}
      <div className="rounded-xl border border-rh-lime/40 bg-rh-lime/5 p-6">
        <p className="text-lg font-semibold">Build your own basket</p>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-rh-muted">
          Clone the repo, run the local flow in five commands, then point the
          deploy script at testnet with faucet funds. The README covers every
          step, including the MetaMask setup and the addresses cheat sheet.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-rh-lime px-4 py-2 text-sm font-semibold text-rh-bg transition-colors hover:bg-rh-lime-hover"
          >
            Clone the repo
          </a>
          <Link
            href="/"
            className="rounded-lg border border-rh-border-strong px-4 py-2 text-sm text-rh-muted transition-colors hover:border-rh-lime hover:text-rh-lime"
          >
            ← Back to the walkthrough
          </Link>
          <a
            href="https://faucet.testnet.chain.robinhood.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-rh-border-strong px-4 py-2 text-sm text-rh-muted transition-colors hover:border-rh-lime hover:text-rh-lime"
          >
            Get testnet tokens
          </a>
        </div>
      </div>
    </div>
  );
}
