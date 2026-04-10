import type { Route } from "next";
import Link from "next/link";

import { PageHero } from "@/components/page-hero";
import { demoCopy } from "@/lib/copy";

const flows: Array<{
  href: Route;
  label: string;
  title: string;
  description: string;
}> = [
  {
    href: "/create",
    label: demoCopy.home.flows.create.label,
    title: demoCopy.home.flows.create.title,
    description: demoCopy.home.flows.create.description,
  },
  {
    href: "/open",
    label: demoCopy.home.flows.open.label,
    title: demoCopy.home.flows.open.title,
    description: demoCopy.home.flows.open.description,
  },
  {
    href: "/retrieve" as Route,
    label: demoCopy.home.flows.retrieve.label,
    title: demoCopy.home.flows.retrieve.title,
    description: demoCopy.home.flows.retrieve.description,
  },
];

export default function HomePage() {
  return (
    <div className="space-y-10">
      <PageHero
        eyebrow={demoCopy.home.hero.eyebrow}
        title={demoCopy.home.hero.title}
        description={demoCopy.home.hero.description}
      />

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {flows.map((flow) => (
          <Link
            key={flow.href}
            href={flow.href}
            className="group rounded-[2rem] border border-slate-200 bg-white p-8 shadow-panel transition hover:-translate-y-1 hover:border-signal"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-signal">{flow.label}</p>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-ink">{flow.title}</h2>
            <p className="mt-3 max-w-xl leading-7 text-slate">{flow.description}</p>
            <div className="mt-8 inline-flex items-center gap-2 font-semibold text-ink transition group-hover:text-signal">
              {demoCopy.home.launchFlowLabel}
              <span aria-hidden>→</span>
            </div>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-ink p-8 text-white shadow-panel">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/60">
            {demoCopy.home.highlights.eyebrow}
          </p>
          <ul className="mt-5 space-y-3 text-lg leading-8 text-mist">
            {demoCopy.home.highlights.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-panel">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-signal">
            {demoCopy.home.narrative.eyebrow}
          </p>
          <ol className="mt-5 space-y-4 text-base leading-7 text-slate">
            {demoCopy.home.narrative.items.map((item, index) => (
              <li key={item}>{index + 1}. {item}</li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
