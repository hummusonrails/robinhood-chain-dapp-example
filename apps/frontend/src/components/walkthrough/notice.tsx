const REPO_URL = "https://github.com/hummusonrails/robinhood-chain-dapp-example";
const FAUCET_URL = "https://faucet.testnet.chain.robinhood.com";

export function TestnetNotice() {
  return (
    <div className="rounded-xl border border-rh-lime/40 bg-rh-lime/5 px-4 py-3 text-sm leading-relaxed text-rh-muted">
      <span className="font-mono text-xs font-semibold uppercase tracking-widest text-rh-lime">
        Live testnet demo
      </span>{" "}
      Every value on this page is read from real contracts on Robinhood Chain
      testnet (chain 46630), and the mint and redeem steps send real
      transactions. Grab testnet ETH and Stock Tokens from the{" "}
      <a
        href={FAUCET_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-rh-lime underline hover:text-rh-lime-hover"
      >
        official faucet
      </a>{" "}
      to try it, or{" "}
      <a
        href={REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-rh-lime underline hover:text-rh-lime-hover"
      >
        clone the repo
      </a>{" "}
      to run everything locally.
    </div>
  );
}
