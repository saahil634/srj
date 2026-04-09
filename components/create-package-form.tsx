"use client";

import Link from "next/link";
import { useState } from "react";

import { FileDropzone } from "@/components/file-dropzone";
import { ManifestPreview } from "@/components/manifest-preview";
import { TERMS_PRESET } from "@/lib/constants";
import { useSRJStore } from "@/lib/srj-store";
import { StoredDemoPackage } from "@/lib/types";

export function CreatePackageForm() {
  const { createPackage, loadError } = useSRJStore();
  const [title, setTitle] = useState("Climate Dataset Field Study");
  const [termsPreset, setTermsPreset] = useState(TERMS_PRESET);
  const [files, setFiles] = useState<File[]>([]);
  const [latestPackage, setLatestPackage] = useState<StoredDemoPackage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate() {
    setError(null);
    setIsSubmitting(true);

    try {
      const nextPackage = await createPackage({
        title,
        termsPreset,
        files,
      });

      setLatestPackage(nextPackage);
      setFiles([]);
    } catch (creationError) {
      setError(
        creationError instanceof Error ? creationError.message : "Unable to create the SRJ package.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.65fr)]">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-panel">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-signal">Create flow</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Assemble an SRJ package</h2>
          </div>
          <div className="rounded-full bg-mist px-4 py-2 text-sm font-medium text-slate">
            Vercel Blob storage
          </div>
        </div>

        <div className="space-y-5">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink">Package title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-signal"
              placeholder="Enter a presentation-ready package name"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink">Terms preset</span>
            <textarea
              value={termsPreset}
              onChange={(event) => setTermsPreset(event.target.value)}
              rows={3}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-signal"
            />
          </label>

          <FileDropzone files={files} onFilesChange={setFiles} />

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleCreate}
              disabled={!title.trim() || files.length === 0 || isSubmitting}
              className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-signal disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSubmitting ? "Uploading to Blob..." : "Generate SRJ package"}
            </button>
            <p className="text-sm text-slate">
              Files are uploaded to Vercel Blob and the manifest is saved for the open flow.
            </p>
          </div>

          {loadError ? (
            <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
              {loadError}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
              {error}
            </div>
          ) : null}

          {latestPackage ? (
            <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-ink">
              <p className="font-semibold">Package created: {latestPackage.manifest.packageId}</p>
              <p className="mt-1">
                The package is now available in the open flow, along with its persisted acceptance gate.
              </p>
              <Link href="/open" className="mt-3 inline-flex font-semibold text-signal hover:text-ink">
                Continue to Open SRJ →
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      <ManifestPreview
        className="xl:sticky xl:top-24"
        manifest={latestPackage?.manifest ?? null}
      />
    </div>
  );
}
