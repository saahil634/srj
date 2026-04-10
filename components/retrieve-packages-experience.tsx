"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { demoCopy } from "@/lib/copy";
import { usePlatformAccessSession } from "@/lib/platform-access-session";
import { useSRJStore } from "@/lib/srj-store";

export function RetrievePackagesExperience() {
  const router = useRouter();
  const { accessRecord } = usePlatformAccessSession();
  const { packages, deletePackage, setActivePackageId, loadError, isLoading } = useSRJStore();
  const [queryKey, setQueryKey] = useState(accessRecord?.accessKey ?? "");
  const [submittedKey, setSubmittedKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const matchingPackages = useMemo(() => {
    const normalizedKey = submittedKey.trim();

    if (!normalizedKey) {
      return [];
    }

    return packages.filter((entry) => {
      const reference = entry.manifest.srjKeyReference;

      return (
        reference.accessKey === normalizedKey ||
        reference.relationExpression === normalizedKey ||
        reference.keyId === normalizedKey
      );
    });
  }, [packages, submittedKey]);

  function handleRetrieve() {
    setError(null);

    if (!queryKey.trim()) {
      setSubmittedKey("");
      setError(demoCopy.retrieveExperience.errors.missingKey);
      return;
    }

    setSubmittedKey(queryKey.trim());
  }

  async function handleDelete(packageId: string) {
    setDeleteError(null);
    setPendingDeleteId(packageId);
    setIsDeleting(true);

    try {
      await deletePackage(packageId, submittedKey);
    } catch (nextError) {
      setDeleteError(
        nextError instanceof Error
          ? nextError.message
          : demoCopy.retrieveExperience.errors.deleteFallback,
      );
    } finally {
      setIsDeleting(false);
      setPendingDeleteId(null);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-panel">
        <p className="text-sm uppercase tracking-[0.22em] text-signal">
          {demoCopy.retrieveExperience.lookup.eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">
          {demoCopy.retrieveExperience.lookup.title}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate">
          {demoCopy.retrieveExperience.lookup.body}
        </p>

        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end">
          <label className="block flex-1 space-y-2">
            <span className="text-sm font-medium text-ink">
              {demoCopy.retrieveExperience.lookup.keyLabel}
            </span>
            <input
              value={queryKey}
              onChange={(event) => setQueryKey(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-signal"
              placeholder={demoCopy.retrieveExperience.lookup.keyPlaceholder}
            />
          </label>
          <button
            type="button"
            onClick={handleRetrieve}
            className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-signal"
          >
            {isLoading
              ? demoCopy.retrieveExperience.lookup.retrievingButton
              : demoCopy.retrieveExperience.lookup.retrieveButton}
          </button>
        </div>

        {loadError ? (
          <div className="mt-4 rounded-[1.5rem] border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
            {loadError}
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-[1.5rem] border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
            {error}
          </div>
        ) : null}
      </section>

      {submittedKey ? (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-panel">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-signal">
                {demoCopy.retrieveExperience.lookup.resultsTitle}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">
                {matchingPackages.length > 0
                  ? `${matchingPackages.length} package${matchingPackages.length === 1 ? "" : "s"}`
                  : demoCopy.retrieveExperience.lookup.emptyResults}
              </h2>
            </div>
          </div>

          {deleteError ? (
            <div className="mt-4 rounded-[1.5rem] border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
              {deleteError}
            </div>
          ) : null}

          {matchingPackages.length > 0 ? (
            <div className="mt-6 space-y-4">
              {matchingPackages.map((entry) => (
                <article
                  key={entry.manifest.packageId}
                  className="rounded-[1.75rem] border border-slate-200 bg-mist p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xl font-semibold text-ink">{entry.manifest.title}</p>
                      <p className="mt-2 text-sm text-slate">
                        {demoCopy.retrieveExperience.lookup.packageIdLabel}: {entry.manifest.packageId}
                      </p>
                      <p className="mt-1 text-sm text-slate">
                        {demoCopy.retrieveExperience.lookup.keyIdLabel}: {entry.manifest.srjKeyReference.keyId}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setActivePackageId(entry.manifest.packageId);
                          router.push(`/open?packageId=${entry.manifest.packageId}`);
                        }}
                        className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-signal"
                      >
                        {demoCopy.retrieveExperience.lookup.openButton}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(entry.manifest.packageId)}
                        disabled={isDeleting && pendingDeleteId === entry.manifest.packageId}
                        className="rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-white disabled:opacity-50"
                      >
                        {isDeleting && pendingDeleteId === entry.manifest.packageId
                          ? demoCopy.retrieveExperience.lookup.deletingButton
                          : demoCopy.retrieveExperience.lookup.deleteButton}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 rounded-[1.25rem] border border-red-200 bg-white p-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-700">
                      {demoCopy.retrieveExperience.lookup.deletePanelTitle}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate">
                      {demoCopy.retrieveExperience.lookup.deletePanelBody}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
