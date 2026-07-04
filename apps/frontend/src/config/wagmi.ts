import { createConfig, http, injected } from "wagmi";
import { localAnvil, robinhoodChain, robinhoodChainTestnet } from "./chains";
import { configuredChainId } from "./contracts";

// single chain config resolved from the env file written by scripts/deploy.sh
const chains = {
  [robinhoodChain.id]: robinhoodChain,
  [robinhoodChainTestnet.id]: robinhoodChainTestnet,
  [localAnvil.id]: localAnvil,
} as const;

export const activeChain =
  chains[configuredChainId as keyof typeof chains] ?? localAnvil;

export const wagmiConfig = createConfig({
  chains: [activeChain],
  connectors: [injected()],
  transports: {
    [robinhoodChain.id]: http(),
    [robinhoodChainTestnet.id]: http(),
    [localAnvil.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
