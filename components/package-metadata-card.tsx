import { SRJPackageManifest } from "@/lib/types";
import { formatBytes, formatDateTime } from "@/lib/utils";

interface PackageMetadataCardProps {
  manifest: SRJPackageManifest;
}

export function PackageMetadataCard({ manifest }: PackageMetadataCardProps) {
  const totalBytes = manifest.files.reduce((sum, file) => sum + file.size, 0);

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-panel">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-signal">Package metadata</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">{manifest.title}</h2>
        </div>
        <div className="rounded-full bg-mist px-4 py-2 text-sm font-medium text-ink">
          {manifest.packageId}
        </div>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <MetadataItem label="Created at" value={formatDateTime(manifest.createdAt)} />
        <MetadataItem label="Terms version" value={manifest.termsVersion} />
        <MetadataItem label="File count" value={`${manifest.files.length} assets`} />
        <MetadataItem label="Total package size" value={formatBytes(totalBytes)} />
      </dl>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-[1.5rem] bg-mist p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate">Allowed uses</p>
          <p className="mt-2 text-base leading-7 text-ink">{manifest.allowedUses}</p>
        </div>
        <div className="rounded-[1.5rem] bg-amber-50 p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ember">Notice text</p>
          <p className="mt-2 text-base leading-7 text-ink">{manifest.noticeText}</p>
        </div>
      </div>

      <div className="mt-4 rounded-[1.5rem] border border-slate-200 p-4">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate">SRJ key reference</p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <ReferenceFact label="Key ID" value={manifest.srjKeyReference.keyId} />
          <ReferenceFact label="Relation" value={manifest.srjKeyReference.relationExpression} />
          <ReferenceFact label="Target value" value={String(manifest.srjKeyReference.targetValue)} />
        </div>
        <p className="mt-3 text-sm leading-6 text-slate">
          Every file in this package is associated to the uploader-defined SRJ key via
          <span className="font-medium text-ink"> {manifest.srjKeyReference.keyId}</span>.
        </p>
      </div>
    </section>
  );
}

function MetadataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 p-4">
      <dt className="text-sm uppercase tracking-[0.2em] text-slate">{label}</dt>
      <dd className="mt-2 text-lg font-semibold text-ink">{value}</dd>
    </div>
  );
}

function ReferenceFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] bg-mist p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate">{label}</p>
      <p className="mt-2 break-all text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}
