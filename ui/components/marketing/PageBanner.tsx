export function PageBanner({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="bg-brand-deep px-6 py-14">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-semibold tracking-wider text-accent uppercase">{eyebrow}</p>
        <h1 className="mt-1 text-3xl font-extrabold text-white sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-brand-deep-muted">{subtitle}</p>}
      </div>
    </div>
  );
}
