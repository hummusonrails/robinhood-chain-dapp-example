"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

// false during ssr and the first client render so hydration always matches
export function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
