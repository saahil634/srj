"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { FilePreviewGrid } from "@/components/file-preview-grid";
import { PackageMetadataCard } from "@/components/package-metadata-card";
import { TermsAcceptanceModal } from "@/components/terms-acceptance-modal";
import { GOVERNANCE_NOTICE } from "@/lib/constants";
import { useSRJStore } from "@/lib/srj-store";
import { SRJPackageManifest } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export function OpenPackageExperience() {
  const {
    packages,
    activePackageId,
    setActivePackageId,
    importManifest,
    saveAcceptance,
    isLoading,
    loadError,
  } = useSRJStore();
  const [showModal, setShowModal] = useState(false);
  const [manifestText, setManifestText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);

  const activePackage = useMemo(
    () => packages.find((entry) => entry.manifest.packageId === activePackageId) ?? packages[0] ?? null,
    [activePackageId, packages],
  );

  function handleImport() {
    setImportError(null);

    try {
      const parsed = JSON.parse(manifestText) as SRJPackageManifest;

      if (!parsed.packageId || !parsed.title || !Array.isArray(parsed.files)) {
        throw new Error("Manifest is missing required package fields.");
      }

      importManifest(parsed);
      setManifestText("");
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Unable to import manifest.");
    }
  }

  if (!activePackage) {
    return (
      <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center shadow-panel">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-signal">Open flow</p>
        <h2 className="mt-3 text-3xl font-semibold text-ink">
          {isLoading ? "Loading packages..." : "No package loaded yet"}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate">
          {isLoading
            ? "The app is checking Blob-backed package records so the recipient flow can pick up persisted demos."
            : "Create a package first, or paste a manifest JSON to demo the recipient view with metadata, modal acceptance, and governed file access."}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/create"
            className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-signal"
          >
            Go to Create SRJ
          </Link>
        </div>

        {loadError ? (
          <div className="mx-auto mt-6 max-w-3xl rounded-[1.5rem] border border-red-200 bg-red-50 p-4 text-left text-sm leading-6 text-red-700">
            {loadError}
          </div>
        ) : null}

        <div className="mx-auto mt-8 max-w-3xl rounded-[1.75rem] bg-mist p-5 text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate">Import manifest</p>
          <textarea
            value={manifestText}
            onChange={(event) => setManifestText(event.target.value)}
            rows={10}
            className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 font-mono text-sm outline-none transition focus:border-signal"
            placeholder='Paste a package manifest JSON here to simulate "Open SRJ"'
          />
          {importError ? <p className="mt-3 text-sm text-red-600">{importError}</p> : null}
          <button
            type="button"
            onClick={handleImport}
            disabled={!manifestText.trim()}
            className="mt-4 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-ink transition hover:border-signal hover:text-signal disabled:opacity-40"
          >
            Import manifest
          </button>
        </div>
      </section>
    );
  }

  const isAccepted = Boolean(activePackage.acceptance);

  return (
    <div className="space-y-8">
      {loadError ? (
        <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
          {loadError}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <PackageMetadataCard manifest={activePackage.manifest} />

        <aside className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-panel">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-signal">Package loader</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Choose a package</h2>
          </div>

          <div className="space-y-3">
            {packages.map((entry) => (
              <button
                key={entry.manifest.packageId}
                type="button"
                onClick={() => setActivePackageId(entry.manifest.packageId)}
                className={`w-full rounded-[1.5rem] border px-4 py-3 text-left transition ${
                  entry.manifest.packageId === activePackage.manifest.packageId
                    ? "border-signal bg-teal-50"
                    : "border-slate-200 bg-mist hover:border-slate-300"
                }`}
              >
                <p className="font-semibold text-ink">{entry.manifest.title}</p>
                <p className="mt-1 text-sm text-slate">{entry.manifest.packageId}</p>
              </button>
            ))}
          </div>

          <div className="rounded-[1.5rem] bg-mist p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate">Recipient status</p>
            <p className="mt-2 text-lg font-semibold text-ink">
              {isAccepted ? "Access unlocked" : "Awaiting terms acceptance"}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate">
              {isAccepted && activePackage.acceptance
                ? `Accepted by ${activePackage.acceptance.fullName} on ${formatDateTime(activePackage.acceptance.acceptedAt)}.`
                : "Metadata is visible now. File previews remain blocked until the modal flow is completed."}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ember">Governance notice</p>
            <p className="mt-2 text-sm leading-6 text-ink">{GOVERNANCE_NOTICE}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {!isAccepted ? (
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-signal"
              >
                Review and accept terms
              </button>
            ) : null}

            {isAccepted ? (
              <a
                href={`/api/packages/${activePackage.manifest.packageId}/download`}
                className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-signal"
              >
                Download ZIP
              </a>
            ) : null}
          </div>
        </aside>
      </section>

      <FilePreviewGrid
        files={activePackage.manifest.files}
        assets={isAccepted ? activePackage.assets : []}
        locked={!isAccepted}
      />

      {isAccepted && activePackage.acceptance ? (
        <section className="grid gap-4 md:grid-cols-3">
          <UnlockFact label="Package ID" value={activePackage.manifest.packageId} />
          <UnlockFact label="Accepted at" value={formatDateTime(activePackage.acceptance.acceptedAt)} />
          <UnlockFact label="Governance" value="ZIP download unlocked" />
        </section>
      ) : null}

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-panel">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-signal">Import manifest</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Load another package object</h2>
          </div>
          <Link href="/create" className="text-sm font-semibold text-signal hover:text-ink">
            Create a new package →
          </Link>
        </div>
        <textarea
          value={manifestText}
          onChange={(event) => setManifestText(event.target.value)}
          rows={8}
          className="mt-4 w-full rounded-[1.5rem] border border-slate-200 px-4 py-3 font-mono text-sm outline-none transition focus:border-signal"
          placeholder="Paste a manifest to simulate opening a shared package"
        />
        {importError ? <p className="mt-3 text-sm text-red-600">{importError}</p> : null}
        <button
          type="button"
          onClick={handleImport}
          disabled={!manifestText.trim()}
          className="mt-4 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-ink transition hover:border-signal hover:text-signal disabled:opacity-40"
        >
          Import manifest
        </button>
      </section>

      <TermsAcceptanceModal
        packageId={activePackage.manifest.packageId}
        open={showModal}
        onClose={() => setShowModal(false)}
        onAccepted={(acceptance) =>
          saveAcceptance(activePackage.manifest.packageId, acceptance)
        }
      />
    </div>
  );
}

function UnlockFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-panel">
      <p className="text-sm uppercase tracking-[0.2em] text-slate">{label}</p>
      <p className="mt-2 text-lg font-semibold text-ink">{value}</p>
    </div>
  );
}
