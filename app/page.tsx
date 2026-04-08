import type { Route } from "next";
import Link from "next/link";

import { PageHero } from "@/components/page-hero";

const flows: Array<{
  href: Route;
  label: string;
  title: string;
  description: string;
}> = [
  {
    href: "/create",
    label: "Create SRJ",
    title: "Create SRJ package",
    description:
      "Drag in research assets, define usage terms, and generate a manifest object ready for the recipient flow.",
  },
  {
    href: "/open",
    label: "Open SRJ",
    title: "Open SRJ package",
    description:
      "Review package metadata first, then gate previews behind a named terms acceptance step for governance logging.",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-10">
      <PageHero
        eyebrow="SRJ Demo"
        title="A polished conference prototype for governed research package exchange"
        description="This demo showcases a compact two-step story: creators assemble an SRJ package with a generated manifest, and recipients unlock access only after submitting a recorded terms acceptance."
      />

      <section className="grid gap-6 md:grid-cols-2">
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
              Launch flow
              <span aria-hidden>→</span>
            </div>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-ink p-8 text-white shadow-panel">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/60">Demo highlights</p>
          <ul className="mt-5 space-y-3 text-lg leading-8 text-mist">
            <li>App Router pages for overview, package creation, and governed access.</li>
            <li>Drag-and-drop multi-file upload with instant local manifest generation.</li>
            <li>Recipient modal that logs acceptance before unlocking previews.</li>
          </ul>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-panel">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-signal">Narrative arc</p>
          <ol className="mt-5 space-y-4 text-base leading-7 text-slate">
            <li>1. Package owner combines images, PDFs, and videos into one governed object.</li>
            <li>2. The app generates a manifest with package ID, timestamps, file inventory, and terms.</li>
            <li>3. Recipient opens the package, accepts terms, and receives logged access to previews.</li>
          </ol>
        </div>
      </section>
    </div>
  );
}
