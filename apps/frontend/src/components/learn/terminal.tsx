"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type TerminalFrame = {
  kind: "cmd" | "out" | "ok" | "note";
  text: string;
};

type Props = {
  title: string;
  frames: TerminalFrame[];
};

const CMD_CHAR_MS = 18;
const OUT_LINE_MS = 90;

// replays a recorded shell session with typewriter commands and streamed output
export function Terminal({ title, frames }: Props) {
  const [visible, setVisible] = useState<TerminalFrame[]>([]);
  const [typing, setTyping] = useState("");
  const [state, setState] = useState<"idle" | "playing" | "done">("idle");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const bodyRef = useRef<HTMLDivElement>(null);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => clearTimers, []);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [visible, typing]);

  const play = useCallback(() => {
    clearTimers();
    setVisible([]);
    setTyping("");
    setState("playing");

    let delay = 200;
    frames.forEach((frame) => {
      if (frame.kind === "cmd") {
        for (let i = 1; i <= frame.text.length; i++) {
          const slice = frame.text.slice(0, i);
          timers.current.push(setTimeout(() => setTyping(slice), delay));
          delay += CMD_CHAR_MS;
        }
        delay += 250;
        timers.current.push(
          setTimeout(() => {
            setTyping("");
            setVisible((v) => [...v, frame]);
          }, delay),
        );
      } else {
        delay += OUT_LINE_MS;
        timers.current.push(
          setTimeout(() => setVisible((v) => [...v, frame]), delay),
        );
      }
    });
    timers.current.push(setTimeout(() => setState("done"), delay + 200));
  }, [frames]);

  const skip = useCallback(() => {
    clearTimers();
    setTyping("");
    setVisible(frames);
    setState("done");
  }, [frames]);

  return (
    <div className="overflow-hidden rounded-xl border border-rh-border bg-black">
      <div className="flex items-center justify-between border-b border-rh-border bg-rh-surface px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rh-danger/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#b9ad8b]/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-rh-lime/70" />
          <p className="ml-2 font-mono text-xs text-rh-muted">{title}</p>
        </div>
        <div className="flex gap-2">
          {state === "playing" && (
            <button
              onClick={skip}
              className="rounded-md border border-rh-border-strong px-2 py-1 font-mono text-[11px] text-rh-muted transition-colors hover:border-rh-lime hover:text-rh-lime"
            >
              skip ⇥
            </button>
          )}
          <button
            onClick={play}
            className="rounded-md bg-rh-lime px-3 py-1 font-mono text-[11px] font-semibold text-rh-bg transition-colors hover:bg-rh-lime-hover"
          >
            {state === "idle" ? "▶ run" : state === "done" ? "↺ replay" : "…"}
          </button>
        </div>
      </div>
      <div
        ref={bodyRef}
        className="max-h-80 min-h-44 overflow-y-auto p-4 font-mono text-[13px] leading-relaxed"
      >
        {state === "idle" && (
          <p className="text-rh-faint">
            Press run to replay this session. Commands and output were recorded
            from a real deployment.
          </p>
        )}
        {visible.map((frame, i) => (
          <div key={i} className="whitespace-pre-wrap break-all">
            {frame.kind === "cmd" && (
              <span className="text-rh-lime">
                <span className="text-rh-faint">$ </span>
                {frame.text}
              </span>
            )}
            {frame.kind === "out" && <span className="text-rh-muted">{frame.text}</span>}
            {frame.kind === "ok" && <span className="text-rh-lime">{frame.text}</span>}
            {frame.kind === "note" && (
              <span className="italic text-rh-faint"># {frame.text}</span>
            )}
          </div>
        ))}
        {typing && (
          <div className="whitespace-pre-wrap break-all text-rh-lime">
            <span className="text-rh-faint">$ </span>
            {typing}
            <span className="animate-pulse">▌</span>
          </div>
        )}
      </div>
    </div>
  );
}
