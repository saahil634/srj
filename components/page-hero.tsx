interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  contentClassName?: string;
  descriptionClassName?: string;
}

export function PageHero({
  eyebrow,
  title,
  description,
  contentClassName,
  descriptionClassName,
}: PageHeroProps) {
  return (
    <section className="space-y-4">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-signal">{eyebrow}</p>
      <div className={`max-w-5xl space-y-3 ${contentClassName ?? ""}`.trim()}>
        <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">{title}</h1>
        <p
          className={`text-lg leading-8 text-[#224d58] ${descriptionClassName ?? ""}`.trim()}
        >
          {description}
        </p>
      </div>
    </section>
  );
}
