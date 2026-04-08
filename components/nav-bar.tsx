import type { Route } from "next";
import Link from "next/link";

const links: Array<{ href: Route; label: string }> = [
  { href: "/", label: "Overview" },
  { href: "/create", label: "Create SRJ" },
  { href: "/open", label: "Open SRJ" },
];

export function NavBar() {
  return (
    <header className="border-b border-white/60 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-signal">
            Conference Prototype
          </p>
          <p className="text-lg font-semibold text-ink">SRJ Demo</p>
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
        </nav>
      </div>
    </header>
  );
}
