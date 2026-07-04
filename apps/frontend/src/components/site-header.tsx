import { ConnectButton } from "./connect-button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-rh-border bg-rh-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rh-lime font-mono text-lg font-bold text-rh-bg">
            B
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight">Index Baskets</p>
            <p className="text-xs leading-tight text-rh-faint">
              on Robinhood Chain
            </p>
          </div>
        </div>
        <ConnectButton />
      </div>
    </header>
  );
}
