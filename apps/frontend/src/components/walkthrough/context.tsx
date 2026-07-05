"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

export type ConsoleActor = "app" | "wallet" | "chain";

export type ConsoleEvent = {
  id: number;
  actor: ConsoleActor;
  title: string;
  note: string;
  payload?: string;
};

type WalkthroughState = {
  step: number;
  setStep: (step: number) => void;
  visited: number[];
  events: ConsoleEvent[];
  // key deduplicates events so re-renders and refetches log once
  logEvent: (key: string, event: Omit<ConsoleEvent, "id">) => void;
};

const WalkthroughContext = createContext<WalkthroughState | null>(null);

export function WalkthroughProvider({ children }: { children: React.ReactNode }) {
  const [step, setStepState] = useState(0);
  const [visited, setVisited] = useState<number[]>([0]);
  const [events, setEvents] = useState<ConsoleEvent[]>([]);
  const seen = useRef(new Set<string>());
  const nextId = useRef(0);

  const setStep = useCallback((next: number) => {
    setStepState(next);
    setVisited((v) => (v.includes(next) ? v : [...v, next]));
  }, []);

  const logEvent = useCallback((key: string, event: Omit<ConsoleEvent, "id">) => {
    if (seen.current.has(key)) return;
    seen.current.add(key);
    nextId.current += 1;
    setEvents((e) => [...e, { ...event, id: nextId.current }]);
  }, []);

  return (
    <WalkthroughContext.Provider value={{ step, setStep, visited, events, logEvent }}>
      {children}
    </WalkthroughContext.Provider>
  );
}

export function useWalkthrough() {
  const ctx = useContext(WalkthroughContext);
  if (!ctx) throw new Error("useWalkthrough must be used inside WalkthroughProvider");
  return ctx;
}
