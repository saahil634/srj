"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { demoCopy } from "@/lib/copy";
import { usePlatformAccessSession } from "@/lib/platform-access-session";
import { useSRJStore } from "@/lib/srj-store";
import { StoredDemoPackage } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export function RetrievePackagesExperience() {
  const router = useRouter();
  const { accessRecord } = usePlatformAccessSession();
  const currentSecureKey = accessRecord?.keyType === "access-key" ? null : accessRecord;
  const { packages, setActivePackageId, loadError, isLoading, reloadPackages, deletePackage } =
    useSRJStore();
  const [queryKey, setQueryKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [ownerPackages, setOwnerPackages] = useState<StoredDemoPackage[]>([]);
  const [ownerError, setOwnerError] = useState<string | null>(null);
  const [isLoadingOwnerPackages, setIsLoadingOwnerPackages] = useState(false);
  const [hasLoadedOwnerPackages, setHasLoadedOwnerPackages] = useState(false);
  const [isDeletingPackageId, setIsDeletingPackageId] = useState<string | null>(null);
  const [isDownloadingPackageId, setIsDownloadingPackageId] = useState<string | null>(null);

  async function handleRetrieve() {
    setError(null);

    const normalizedKey = queryKey.trim();

    if (!normalizedKey) {
      setError(demoCopy.retrieveExperience.errors.missingKey);
      return;
    }

    setIsRetrieving(true);

    try {
      const nextPackages = await reloadPackages();
      const sourcePackages = nextPackages.length > 0 ? nextPackages : packages;
      const nextPackage = sourcePackages.find((entry) => {
        const reference = entry.manifest.srjKeyReference;

        return (
          reference.accessKey === normalizedKey ||
          reference.relationExpression === normalizedKey ||
          reference.keyId === normalizedKey
        );
      });

      if (!nextPackage) {
        setError(demoCopy.retrieveExperience.errors.incorrectKey);
        return;
      }

      setActivePackageId(nextPackage.manifest.packageId);
      router.push(`/open?packageId=${nextPackage.manifest.packageId}`);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : demoCopy.retrieveExperience.errors.incorrectKey,
      );
    } finally {
      setIsRetrieving(false);
    }
  }

  async function handleLoadOwnerPackages() {
    setOwnerError(null);

    if (!currentSecureKey?.accessKey) {
      setOwnerError(demoCopy.platformAccess.errors.acceptTerms);
      return;
    }

    setIsLoadingOwnerPackages(true);
    setHasLoadedOwnerPackages(true);

    try {
      const params = new URLSearchParams({
        mode: "owner",
        secureKey: currentSecureKey.accessKey,
      });

      if (currentSecureKey.accessKeyId) {
        params.set("secureKeyFileId", currentSecureKey.accessKeyId);
      }

      const response = await fetch(`/api/packages?${params.toString()}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as {
        packages?: StoredDemoPackage[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to load packages for this SRJ-secure-key.");
      }

      setOwnerPackages(payload.packages ?? []);
    } catch (nextError) {
      setOwnerError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to load packages for this SRJ-secure-key.",
      );
    } finally {
      setIsLoadingOwnerPackages(false);
    }
  }

  async function handleDelete(pkg: StoredDemoPackage) {
    if (!currentSecureKey?.accessKey) {
      setOwnerError("Unlock the platform to use your SRJ-secure-key.");
      return;
    }

    setOwnerError(null);
    setIsDeletingPackageId(pkg.manifest.packageId);

    try {
      await deletePackage(
        pkg.manifest.packageId,
        currentSecureKey.accessKey,
        currentSecureKey.accessKeyId ?? null,
      );
      setOwnerPackages((current) =>
        current.filter((entry) => entry.manifest.packageId !== pkg.manifest.packageId),
      );
    } catch (nextError) {
      setOwnerError(
        nextError instanceof Error ? nextError.message : demoCopy.retrieveExperience.errors.deleteFallback,
      );
    } finally {
      setIsDeletingPackageId(null);
    }
  }

  async function handleDownloadAccessRecords(pkg: StoredDemoPackage) {
    if (!currentSecureKey?.accessKey) {
      setOwnerError("Unlock the platform to use your SRJ-secure-key.");
      return;
    }

    setOwnerError(null);
    setIsDownloadingPackageId(pkg.manifest.packageId);

    try {
      const response = await fetch(`/api/packages/${pkg.manifest.packageId}/access-records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secureKey: currentSecureKey.accessKey,
          secureKeyFileId: currentSecureKey.accessKeyId ?? null,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };

        throw new Error(payload.error || "Unable to download SRJ access records.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `${pkg.manifest.packageId}-access-records.txt`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (nextError) {
      setOwnerError(
        nextError instanceof Error ? nextError.message : "Unable to download SRJ access records.",
      );
    } finally {
      setIsDownloadingPackageId(null);
    }
  }

  function openPackage(pkg: StoredDemoPackage) {
    setActivePackageId(pkg.manifest.packageId);
    router.push(`/open?packageId=${pkg.manifest.packageId}`);
  }

  return (
    <div className="grid gap-8 xl:grid-cols-2">
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
            disabled={isRetrieving}
            className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-signal"
          >
            {isRetrieving || isLoading
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

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-panel">
        <p className="text-sm uppercase tracking-[0.22em] text-signal">
          {demoCopy.retrieveExperience.ownerFlow.eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">
          {demoCopy.retrieveExperience.ownerFlow.title}
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate">
          {demoCopy.retrieveExperience.ownerFlow.body}
        </p>

        <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-mist p-4">
          <p className="text-sm font-medium text-ink">
            {demoCopy.retrieveExperience.ownerFlow.rootKeyLabel}
          </p>
          <p className="mt-2 break-all text-sm leading-6 text-slate">
            {currentSecureKey?.accessKey ?? demoCopy.retrieveExperience.ownerFlow.rootKeyFallback}
          </p>
        </div>

        <button
          type="button"
          onClick={handleLoadOwnerPackages}
          disabled={isLoadingOwnerPackages || !accessRecord?.accessKey}
          className="mt-5 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-signal disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isLoadingOwnerPackages
            ? demoCopy.retrieveExperience.ownerFlow.loadingButton
            : demoCopy.retrieveExperience.ownerFlow.loadButton}
        </button>

        {ownerError ? (
          <div className="mt-4 rounded-[1.5rem] border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
            {ownerError}
          </div>
        ) : null}

        <div className="mt-6 space-y-4">
          {hasLoadedOwnerPackages && ownerPackages.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-mist p-4 text-sm leading-6 text-slate">
              {demoCopy.retrieveExperience.ownerFlow.emptyState}
            </div>
          ) : null}

          {ownerPackages.map((pkg) => (
            <div
              key={pkg.manifest.packageId}
              className="rounded-[1.5rem] border border-slate-200 bg-mist p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-ink">{pkg.manifest.title}</p>
                  <p className="mt-1 text-sm text-slate">{pkg.manifest.packageId}</p>
                  <p className="mt-1 text-sm text-slate">
                    {formatDateTime(pkg.manifest.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openPackage(pkg)}
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-ink transition hover:border-signal hover:text-signal"
                  >
                    {demoCopy.retrieveExperience.ownerFlow.openButton}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadAccessRecords(pkg)}
                    disabled={isDownloadingPackageId === pkg.manifest.packageId}
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-ink transition hover:border-signal hover:text-signal disabled:opacity-40"
                  >
                    {isDownloadingPackageId === pkg.manifest.packageId
                      ? demoCopy.retrieveExperience.lookup.retrievingButton
                      : demoCopy.retrieveExperience.ownerFlow.downloadRecordsButton}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(pkg)}
                    disabled={isDeletingPackageId === pkg.manifest.packageId}
                    className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-signal disabled:opacity-40"
                  >
                    {isDeletingPackageId === pkg.manifest.packageId
                      ? demoCopy.retrieveExperience.lookup.retrievingButton
                      : demoCopy.retrieveExperience.ownerFlow.deleteButton}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
