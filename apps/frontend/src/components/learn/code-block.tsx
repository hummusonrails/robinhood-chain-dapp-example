import { codeToHtml } from "shiki";
import snippets from "@/generated/snippets.json";

export type SnippetId = keyof typeof snippets;

// shiki theme built from the robinhood chain docs palette
const rhTheme = {
  name: "robinhood-chain",
  type: "dark" as const,
  colors: {
    "editor.background": "#110e08",
    "editor.foreground": "#ffffff",
  },
  settings: [
    { settings: { background: "#110e08", foreground: "#ffffff" } },
    { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: "#888784", fontStyle: "italic" } },
    { scope: ["keyword", "storage.type", "storage.modifier"], settings: { foreground: "#ccff00" } },
    { scope: ["entity.name.function", "support.function", "meta.function-call entity.name.function"], settings: { foreground: "#e7ff38" } },
    { scope: ["string", "string.quoted"], settings: { foreground: "#b2f2bb" } },
    { scope: ["constant.numeric", "constant.language"], settings: { foreground: "#b9ad8b" } },
    { scope: ["entity.name.type", "support.type", "entity.name.type.contract", "entity.name.type.interface"], settings: { foreground: "#a5d8ff" } },
    { scope: ["variable.parameter", "variable.other"], settings: { foreground: "#d9d9d9" } },
    { scope: ["keyword.operator"], settings: { foreground: "#bfbfbf" } },
  ],
};

function languageFor(file: string): "solidity" | "shellscript" | "javascript" {
  if (file.endsWith(".sol")) return "solidity";
  if (file.endsWith(".sh")) return "shellscript";
  return "javascript";
}

export async function CodeBlock({ id }: { id: SnippetId }) {
  const snippet = snippets[id];
  const html = await codeToHtml(snippet.code, {
    lang: languageFor(snippet.file),
    theme: rhTheme,
  });

  return (
    <div className="overflow-hidden rounded-xl border border-rh-border bg-rh-bg">
      <div className="flex items-center justify-between gap-3 border-b border-rh-border bg-rh-surface px-4 py-2">
        <p className="truncate font-mono text-xs text-rh-muted">{snippet.file}</p>
        <a
          href={snippet.github}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-md border border-rh-border-strong px-2 py-1 font-mono text-[11px] text-rh-lime transition-colors hover:border-rh-lime"
        >
          L{snippet.startLine}–L{snippet.endLine} on GitHub ↗
        </a>
      </div>
      <div
        className="learn-code overflow-x-auto p-4 text-[13px] leading-relaxed"
        style={{ counterReset: `line ${snippet.startLine - 1}` }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
