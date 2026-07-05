export type AnnotatedRow = {
  field: string;
  value: string;
  note: string;
};

export function AnnotatedTable({
  title,
  caption,
  rows,
}: {
  title: string;
  caption?: string;
  rows: AnnotatedRow[];
}) {
  return (
    <div className="rounded-xl border border-rh-border bg-rh-surface">
      <div className="flex items-center justify-between border-b border-rh-border px-4 py-2.5">
        <p className="font-mono text-xs uppercase tracking-widest text-rh-muted">
          {title}
        </p>
        {caption && <p className="font-mono text-xs text-rh-faint">{caption}</p>}
      </div>
      <div>
        {rows.map((r) => (
          <div
            key={r.field}
            className="grid grid-cols-[110px_1fr] gap-3 border-t border-rh-border/60 px-4 py-3 first:border-t-0 sm:grid-cols-[140px_1fr]"
          >
            <p className="break-words font-mono text-xs text-rh-lime">{r.field}</p>
            <div>
              <p className="break-all font-mono text-sm text-rh-text">{r.value}</p>
              <p className="mt-0.5 text-xs text-rh-faint">{r.note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
