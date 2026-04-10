"use client";

import type { Route } from "next";
import Link from "next/link";

import { demoCopy } from "@/lib/copy";
import { usePlatformAccessSession } from "@/lib/platform-access-session";

const links: Array<{ href: Route; label: string }> = [
  { href: "/", label: demoCopy.app.nav.links.overview },
  { href: "/create", label: demoCopy.app.nav.links.create },
  { href: "/open", label: demoCopy.app.nav.links.open },
];

export function NavBar() {
  const { accessRecord, logout } = usePlatformAccessSession();

  return (
    <header className="border-b border-white/60 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-signal">
            {demoCopy.app.nav.eyebrow}
          </p>
          <p className="text-lg font-semibold text-ink">{demoCopy.app.nav.title}</p>
        </div>
        <nav className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 p-1 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 font-medium text-slate transition hover:bg-mist hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
          {accessRecord ? (
            <button
              type="button"
              onClick={logout}
              className="rounded-full px-4 py-2 font-medium text-slate transition hover:bg-mist hover:text-ink"
            >
              {demoCopy.app.nav.links.logout}
            </button>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
