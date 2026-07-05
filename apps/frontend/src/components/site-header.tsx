import Link from "next/link";
import { ConnectButton } from "./connect-button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-rh-border bg-rh-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rh-lime font-mono text-lg font-bold text-rh-bg">
            B
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight">
              Index Baskets on Robinhood Chain
            </p>
            <p className="font-mono text-[10px] uppercase tracking-widest leading-tight text-rh-faint">
              Interactive walkthrough · live testnet
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/learn"
            className="hidden items-center gap-1.5 rounded-full border border-rh-lime/50 px-4 py-2 font-mono text-xs text-rh-lime transition-colors hover:bg-rh-lime hover:text-rh-bg sm:flex"
          >
            <span aria-hidden>{"</>"}</span> Developer deep dive
          </Link>
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
