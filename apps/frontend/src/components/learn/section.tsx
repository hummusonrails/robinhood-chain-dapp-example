export function Section({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-rh-faint">
          {kicker}
        </p>
        <h2 className="mt-1 text-2xl font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-3 text-sm leading-relaxed text-rh-muted">{children}</div>
  );
}
