import { SRJPackageManifest } from "@/lib/types";
import { demoCopy } from "@/lib/copy";
import { cn } from "@/lib/utils";

interface ManifestPreviewProps {
  className?: string;
  manifest: SRJPackageManifest | null;
}

export function ManifestPreview({ className, manifest }: ManifestPreviewProps) {
  return (
    <section className={cn("rounded-[2rem] border border-slate-200 bg-ink p-6 text-white shadow-panel", className)}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-white/60">
            {demoCopy.manifestPreview.eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-semibold">{demoCopy.manifestPreview.title}</h2>
        </div>
        <div className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/70">
          {demoCopy.manifestPreview.badge}
        </div>
      </div>
      <pre className="max-h-[30rem] overflow-auto rounded-[1.5rem] bg-white/10 p-4 text-sm leading-7 text-mist xl:max-h-[calc(100vh-15rem)]">
        {JSON.stringify(manifest, null, 2) || demoCopy.manifestPreview.emptyState}
      </pre>
    </section>
  );
}
