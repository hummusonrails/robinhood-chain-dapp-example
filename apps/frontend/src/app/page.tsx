"use client";

import { WalkthroughProvider, useWalkthrough } from "@/components/walkthrough/context";
import { StepTabs } from "@/components/walkthrough/step-tabs";
import { LiveConsole } from "@/components/walkthrough/console";
import { TestnetNotice } from "@/components/walkthrough/notice";
import { StepTokens } from "@/components/walkthrough/steps/step-tokens";
import { StepFeeds } from "@/components/walkthrough/steps/step-feeds";
import { StepBasket } from "@/components/walkthrough/steps/step-basket";
import { StepMint } from "@/components/walkthrough/steps/step-mint";
import { StepRedeem } from "@/components/walkthrough/steps/step-redeem";

function CurrentStep() {
  const { step } = useWalkthrough();
  switch (step) {
    case 0:
      return <StepTokens />;
    case 1:
      return <StepFeeds />;
    case 2:
      return <StepBasket />;
    case 3:
      return <StepMint />;
    default:
      return <StepRedeem />;
  }
}

export default function Home() {
  return (
    <WalkthroughProvider>
      <StepTabs />
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_380px]">
        <CurrentStep />
        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <TestnetNotice />
          <LiveConsole />
        </div>
      </div>
    </WalkthroughProvider>
  );
}
