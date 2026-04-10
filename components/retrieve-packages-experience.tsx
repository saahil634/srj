"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { demoCopy } from "@/lib/copy";
import { usePlatformAccessSession } from "@/lib/platform-access-session";
import { useSRJStore } from "@/lib/srj-store";

export function RetrievePackagesExperience() {
  const router = useRouter();
  const { accessRecord } = usePlatformAccessSession();
  const { packages, setActivePackageId, loadError, isLoading } = useSRJStore();
  const [queryKey, setQueryKey] = useState(accessRecord?.accessKey ?? "");
  const [error, setError] = useState<string | null>(null);

  function handleRetrieve() {
    setError(null);

    const normalizedKey = queryKey.trim();

    if (!normalizedKey) {
      setError(demoCopy.retrieveExperience.errors.missingKey);
      return;
    }

    const matchingPackages = packages.filter((entry) => {
      const reference = entry.manifest.srjKeyReference;

      return (
        reference.accessKey === normalizedKey ||
        reference.relationExpression === normalizedKey ||
        reference.keyId === normalizedKey
      );
    });

    if (matchingPackages.length === 0) {
      setError(demoCopy.retrieveExperience.errors.incorrectKey);
      return;
    }

    const nextPackage = matchingPackages[0];

    setActivePackageId(nextPackage.manifest.packageId);
    router.push(`/open?packageId=${nextPackage.manifest.packageId}`);
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
    </div>
  );
}
