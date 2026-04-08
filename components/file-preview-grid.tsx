import { DemoFileAsset, SRJManifestFile } from "@/lib/types";
import { formatBytes } from "@/lib/utils";

interface FilePreviewGridProps {
  files: SRJManifestFile[];
  assets: DemoFileAsset[];
  locked: boolean;
}

export function FilePreviewGrid({ files, assets, locked }: FilePreviewGridProps) {
  return (
    <section className="relative rounded-[2rem] border border-slate-200 bg-white p-6 shadow-panel">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-signal">Package files</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">
            {locked ? "Locked previews" : "Unlocked previews"}
          </h2>
        </div>
        <div className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate">
          {files.length} items
        </div>
      </div>

      <div className={locked ? "pointer-events-none select-none opacity-30 blur-[2px]" : ""}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {files.map((file) => {
            const asset = assets.find((entry) => entry.fileId === file.fileId);

            return (
              <article
                key={file.fileId}
                className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-mist"
              >
                <div className="aspect-[4/3] bg-slate-100">
                  {asset && file.kind === "image" ? (
                    <img src={asset.previewUrl} alt={file.name} className="h-full w-full object-cover" />
                  ) : null}
                  {asset && file.kind === "video" ? (
                    <video src={asset.previewUrl} controls={!locked} className="h-full w-full object-cover" />
                  ) : null}
                  {file.kind === "pdf" ? (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-amber-100 to-orange-50">
                      <div className="rounded-2xl border border-amber-200 bg-white px-5 py-4 text-center shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember">PDF</p>
                        <p className="mt-2 max-w-[12rem] truncate font-medium text-ink">{file.name}</p>
                      </div>
                    </div>
                  ) : null}
                  {!asset && file.kind !== "pdf" ? (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50 px-6 text-center text-sm text-slate">
                      Preview unavailable in persisted demo state
                    </div>
                  ) : null}
                </div>
                <div className="space-y-1 px-4 py-4">
                  <p className="truncate font-semibold text-ink">{file.name}</p>
                  <p className="text-sm text-slate">
                    {file.type || "Unknown type"} • {formatBytes(file.size)}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {locked ? (
        <div className="absolute inset-0 flex items-center justify-center rounded-[2rem] bg-white/40 p-6">
          <div className="max-w-md rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 text-center shadow-panel backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-signal">Terms gate</p>
            <h3 className="mt-2 text-2xl font-semibold text-ink">Accept terms to unlock file access</h3>
            <p className="mt-3 leading-7 text-slate">
              Metadata remains visible for review, but previews and file access stay blocked until
              the recipient submits a named acceptance record.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
