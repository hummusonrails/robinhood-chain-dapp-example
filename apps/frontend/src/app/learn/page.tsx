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
          Ethereum playbook you may already know. Every snippet is real code from
          the repo and links to the exact lines on GitHub.
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
            so every share is fully backed from the moment it exists. The
            load-bearing detail is the rounding direction: amounts round{" "}
            <strong className="text-rh-text">up</strong>, so even the smallest
            mint pays its full share of the backing and the reserves stay whole.
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
            A fuzzed invariant backs the rounding guarantees. This property test
            mints and redeems random amounts and asserts a user keeps everything
            except at most one wei of dust per component, round trip, while the
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
            deploy that produced the contracts this site reads. The mainnet tab
            starts with the rehearsal: fork tests that run this exact
            configuration against live mainnet state, free of charge, so the
            real deploy holds no surprises.
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
            Robinhood Chain is EVM equivalent, so almost everything you already
            know carries over. These five differences are worth learning early,
            and each one comes with a simple pattern you can build in from day
            one.
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
              Ethereum, and that second component can shift a little between
              estimation and execution. The pattern to adopt: send deployments
              with generous gas headroom and they land reliably on the first
              try. Here is how this repo&apos;s deploy script does it for every
              network:
            </p>
          </div>
          <CodeBlock id="deploy-sh-forge" />
          <div className="rounded-xl border border-rh-border bg-rh-surface p-4">
            <p className="font-mono text-sm font-semibold text-rh-lime">
              2 · block.number is not your block number
            </p>
            <p className="mt-2 text-sm leading-relaxed text-rh-muted">
              On Arbitrum chains <Code>block.number</Code> returns an estimate of
              the Ethereum block number, which is handy for logic anchored to L1
              time. When you want the chain&apos;s own ~250ms block height,{" "}
              <Code>ArbSys(address(100)).arbBlockNumber()</Code> has you covered.
              Knowing which clock you are reading makes time-based logic easy to
              get right.
            </p>
          </div>
          <div className="rounded-xl border border-rh-border bg-rh-surface p-4">
            <p className="font-mono text-sm font-semibold text-rh-lime">
              3 · first come, first served, no priority auction
            </p>
            <p className="mt-2 text-sm leading-relaxed text-rh-muted">
              The sequencer orders transactions by arrival time. Everyone pays
              the same fair price for the same position in line, sandwich
              attacks lose their economics, and fee estimation becomes simple
              and predictable.
            </p>
          </div>
          <div className="rounded-xl border border-rh-border bg-rh-surface p-4">
            <p className="font-mono text-sm font-semibold text-rh-lime">
              4 · contracts can be four times bigger
            </p>
            <p className="mt-2 text-sm leading-relaxed text-rh-muted">
              A contract can hold up to 96KB of code here, four times
              Ethereum&apos;s 24KB, with 192KB for constructor code. Features
              that would need to be split across several contracts on Ethereum
              can live together in one readable file.
            </p>
          </div>
          <div className="rounded-xl border border-rh-border bg-rh-surface p-4">
            <p className="font-mono text-sm font-semibold text-rh-lime">
              5 · oracles keep market hours
            </p>
            <p className="mt-2 text-sm leading-relaxed text-rh-muted">
              Equity feeds update 24 hours a day, five days a week, matching the
              markets they track. Two patterns make this a joy to work with:
              size your staleness window per asset class (this basket uses 4
              days, so weekends pass without a hiccup), and keep transfers
              independent of pricing, which is exactly how{" "}
              <Code>BasketToken</Code> splits its functions.
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
            <p className="text-sm font-semibold text-rh-text">
              Rust contracts, too
            </p>
            <p className="mt-1 text-xs leading-relaxed text-rh-muted">
              The chain also runs{" "}
              <Ext href="https://docs.arbitrum.io/stylus/gentle-introduction">Stylus</Ext>,
              which lets you write contracts in Rust and deploy them right
              alongside Solidity ones. Stylus is switched on for both testnet
              and mainnet, and a Solidity contract can call a Rust one the same
              way it calls any other contract.
            </p>
          </div>
        </div>
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
