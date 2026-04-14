"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { FilePreviewGrid } from "@/components/file-preview-grid";
import { PackageMetadataCard } from "@/components/package-metadata-card";
import { TermsAcceptanceModal } from "@/components/terms-acceptance-modal";
import { demoCopy } from "@/lib/copy";
import { usePlatformAccessSession } from "@/lib/platform-access-session";
import { useSRJStore } from "@/lib/srj-store";
import { SRJPackageManifest } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export function OpenPackageExperience() {
  const { accessRecord } = usePlatformAccessSession();
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
    () => packages.find((entry) => entry.manifest.packageId === activePackageId) ?? null,
    [activePackageId, packages],
  );

  useEffect(() => {
    const queryPackageId = new URLSearchParams(window.location.search).get("packageId");

    if (queryPackageId && packages.some((entry) => entry.manifest.packageId === queryPackageId)) {
      setActivePackageId(queryPackageId);
    }
  }, [packages, setActivePackageId]);

  function handleImport() {
    setImportError(null);

    try {
      const parsed = JSON.parse(manifestText) as SRJPackageManifest;

      if (!parsed.packageId || !parsed.title || !Array.isArray(parsed.files)) {
        throw new Error(demoCopy.openExperience.importManifest.errors.missingFields);
      }

      importManifest(parsed);
      setManifestText("");
    } catch (error) {
      setImportError(
        error instanceof Error ? error.message : demoCopy.openExperience.importManifest.errors.unableToImport,
      );
    }
  }

  if (!activePackage) {
    return (
      <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center shadow-panel">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-signal">
          {demoCopy.openExperience.emptyState.eyebrow}
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-ink">
          {isLoading
            ? demoCopy.openExperience.emptyState.loadingTitle
            : demoCopy.openExperience.emptyState.idleTitle}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate">
          {isLoading
            ? demoCopy.openExperience.emptyState.loadingBody
            : demoCopy.openExperience.emptyState.idleBody}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/create"
            className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-signal"
          >
            {demoCopy.openExperience.emptyState.createLink}
          </Link>
          <Link
            href={"/retrieve" as const}
            className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-ink transition hover:border-signal hover:text-signal"
          >
            {demoCopy.app.nav.links.retrieve}
          </Link>
        </div>

        {loadError ? (
          <div className="mx-auto mt-6 max-w-3xl rounded-[1.5rem] border border-red-200 bg-red-50 p-4 text-left text-sm leading-6 text-red-700">
            {loadError}
          </div>
        ) : null}

        <div className="mx-auto mt-8 max-w-3xl rounded-[1.75rem] bg-mist p-5 text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate">
            {demoCopy.openExperience.importManifest.eyebrow}
          </p>
          <textarea
            value={manifestText}
            onChange={(event) => setManifestText(event.target.value)}
            rows={10}
            className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 font-mono text-sm outline-none transition focus:border-signal"
            placeholder={demoCopy.openExperience.importManifest.placeholderTop}
          />
          {importError ? <p className="mt-3 text-sm text-red-600">{importError}</p> : null}
          <button
            type="button"
            onClick={handleImport}
            disabled={!manifestText.trim()}
            className="mt-4 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-ink transition hover:border-signal hover:text-signal disabled:opacity-40"
          >
            {demoCopy.openExperience.importManifest.button}
          </button>
        </div>
      </section>
    );
  }

  const isAccepted = Boolean(activePackage.acceptance);
  const isOwnerSessionAccess = Boolean(
    accessRecord?.keyType !== "access-key" &&
      accessRecord?.accessKeyId &&
      activePackage.manifest.ownerRootKeyReference?.accessKeyFileId &&
      accessRecord.accessKeyId === activePackage.manifest.ownerRootKeyReference.accessKeyFileId,
  );

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
            <p className="text-sm uppercase tracking-[0.22em] text-signal">
              {demoCopy.openExperience.packageLoader.eyebrow}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">
              {demoCopy.openExperience.packageLoader.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate">
              {demoCopy.openExperience.packageLoader.body}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-mist p-4">
            <p className="font-semibold text-ink">{activePackage.manifest.title}</p>
            <p className="mt-2 text-sm text-slate">{activePackage.manifest.packageId}</p>
          </div>

          <div className="rounded-[1.5rem] bg-mist p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate">
              {demoCopy.openExperience.recipientStatus.eyebrow}
            </p>
            <p className="mt-2 text-lg font-semibold text-ink">
              {isAccepted
                ? demoCopy.openExperience.recipientStatus.unlockedTitle
                : demoCopy.openExperience.recipientStatus.lockedTitle}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate">
              {isAccepted && activePackage.acceptance
                ? `${demoCopy.openExperience.recipientStatus.acceptedByPrefix} ${activePackage.acceptance.fullName}${activePackage.acceptance.organization ? ` (${activePackage.acceptance.organization})` : ""} ${demoCopy.openExperience.recipientStatus.acceptedOnJoiner} ${formatDateTime(activePackage.acceptance.acceptedAt)}.`
                : demoCopy.openExperience.recipientStatus.lockedBody}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {!isAccepted ? (
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-signal"
              >
                {demoCopy.openExperience.actions.reviewTerms}
              </button>
            ) : null}

            {isAccepted ? (
              <div className="w-full space-y-3">
                <a
                  href={`/api/packages/${activePackage.manifest.packageId}/download`}
                  className="block rounded-full bg-ink px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-signal"
                >
                  {demoCopy.openExperience.actions.downloadZipStructured}
                </a>
                <p className="text-sm leading-6 text-slate">
                  {demoCopy.openExperience.actions.downloadZipStructuredHint}
                </p>

                <a
                  href={`/api/packages/${activePackage.manifest.packageId}/download?mode=flat-embedded`}
                  className="block rounded-full border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-ink transition hover:border-signal hover:text-signal"
                >
                  {demoCopy.openExperience.actions.downloadZipEmbedded}
                </a>
                <p className="text-sm leading-6 text-slate">
                  {demoCopy.openExperience.actions.downloadZipEmbeddedHint}
                </p>
              </div>
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
        <section className="grid gap-4 md:grid-cols-2">
          <UnlockFact label={demoCopy.openExperience.unlockFacts.packageId} value={activePackage.manifest.packageId} />
          <UnlockFact
            label={demoCopy.openExperience.unlockFacts.acceptedAt}
            value={formatDateTime(activePackage.acceptance.acceptedAt)}
          />
        </section>
      ) : null}

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-panel">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-signal">
              {demoCopy.openExperience.importManifest.eyebrow}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">
              {demoCopy.openExperience.importManifest.title}
            </h2>
          </div>
          <Link href="/create" className="text-sm font-semibold text-signal hover:text-ink">
            {demoCopy.openExperience.importManifest.createLink}
          </Link>
        </div>
        <textarea
          value={manifestText}
          onChange={(event) => setManifestText(event.target.value)}
          rows={8}
          className="mt-4 w-full rounded-[1.5rem] border border-slate-200 px-4 py-3 font-mono text-sm outline-none transition focus:border-signal"
          placeholder={demoCopy.openExperience.importManifest.placeholderBottom}
        />
        {importError ? <p className="mt-3 text-sm text-red-600">{importError}</p> : null}
        <button
          type="button"
          onClick={handleImport}
          disabled={!manifestText.trim()}
          className="mt-4 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-ink transition hover:border-signal hover:text-signal disabled:opacity-40"
        >
          {demoCopy.openExperience.importManifest.button}
        </button>
      </section>

      <TermsAcceptanceModal
        packageId={activePackage.manifest.packageId}
        accessorRootKey={
          accessRecord?.keyType === "access-key" ? null : (accessRecord?.accessKey ?? null)
        }
        ownerSession={{
          canSkipIdentity: isOwnerSessionAccess,
          sessionKey: accessRecord?.keyType === "access-key" ? null : (accessRecord?.accessKey ?? null),
          ownerName: accessRecord?.ownerName ?? null,
          ownerEmail: accessRecord?.ownerEmail ?? null,
          ownerOrganization: accessRecord?.ownerOrganization ?? null,
        }}
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
