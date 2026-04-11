"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { FileDropzone } from "@/components/file-dropzone";
import { ManifestPreview } from "@/components/manifest-preview";
import { demoCopy } from "@/lib/copy";
import { MAX_TOTAL_UPLOAD_BYTES, TERMS_PRESET, UPLOAD_ACCEPT_LABEL } from "@/lib/constants";
import { usePlatformAccessSession } from "@/lib/platform-access-session";
import { exceedsUploadLimit } from "@/lib/upload-rules";
import { useSRJStore } from "@/lib/srj-store";

export function CreatePackageForm() {
  const router = useRouter();
  const { accessRecord } = usePlatformAccessSession();
  const currentSecureKey = accessRecord?.keyType === "access-key" ? null : accessRecord;
  const { createPackage, loadError } = useSRJStore();
  const [title, setTitle] = useState<string>(demoCopy.createForm.defaultTitle);
  const [termsPreset, setTermsPreset] = useState<string>(TERMS_PRESET);
  const [packageAccessKey, setPackageAccessKey] = useState<string>(
    demoCopy.createForm.defaultPackageAccessKey,
  );
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate() {
    setError(null);

    if (uploadError) {
      setError(uploadError);
      return;
    }

    if (exceedsUploadLimit(files)) {
      setError(
        demoCopy.createForm.errors.totalUploadLimit.replace(
          "10",
          String(Math.round(MAX_TOTAL_UPLOAD_BYTES / (1024 * 1024))),
        ),
      );
      return;
    }

    if (!packageAccessKey.trim()) {
      setError(demoCopy.createForm.errors.invalidRelation);
      return;
    }

    setIsSubmitting(true);

    try {
      const nextPackage = await createPackage({
        title,
        termsPreset,
        packageAccessKey,
        ownerSecureKeyFileId: currentSecureKey?.accessKeyId ?? null,
        files,
      });

      setFiles([]);
      router.push(`/open?packageId=${nextPackage.manifest.packageId}`);
    } catch (creationError) {
      setError(
        creationError instanceof Error
          ? creationError.message
          : demoCopy.createForm.errors.unableToCreate,
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
            <p className="text-sm uppercase tracking-[0.22em] text-signal">
              {demoCopy.createForm.eyebrow}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">{demoCopy.createForm.title}</h2>
          </div>
          <div className="rounded-full bg-mist px-4 py-2 text-sm font-medium text-slate">
            {demoCopy.createForm.storageBadge}
          </div>
        </div>

        <div className="space-y-5">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink">
              {demoCopy.createForm.fields.packageTitleLabel}
            </span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-signal"
              placeholder={demoCopy.createForm.fields.packageTitlePlaceholder}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink">
              {demoCopy.createForm.fields.termsPresetLabel}
            </span>
            <textarea
              value={termsPreset}
              onChange={(event) => setTermsPreset(event.target.value)}
              rows={3}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-signal"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink">
              {demoCopy.createForm.fields.rootKeyLabel}
            </span>
            <input
              value={currentSecureKey?.accessKey ?? demoCopy.createForm.fields.rootKeyFallback}
              readOnly
              className="w-full rounded-2xl border border-slate-200 bg-mist px-4 py-3 text-slate outline-none"
            />
            <p className="text-sm leading-6 text-slate">
              {demoCopy.createForm.fields.rootKeyHelp}
            </p>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink">
              {demoCopy.createForm.fields.packageAccessKeyLabel}
            </span>
            <input
              value={packageAccessKey}
              onChange={(event) => setPackageAccessKey(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-signal"
              placeholder={demoCopy.createForm.fields.packageAccessKeyPlaceholder}
            />
            <p className="text-sm leading-6 text-slate">
              {demoCopy.createForm.fields.packageAccessKeyHelp}
            </p>
          </label>

          <FileDropzone
            files={files}
            onFilesChange={setFiles}
            error={uploadError}
            onErrorChange={setUploadError}
          />

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleCreate}
              disabled={!title.trim() || files.length === 0 || isSubmitting}
              className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-signal disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSubmitting ? demoCopy.createForm.submitLoading : demoCopy.createForm.submitIdle}
            </button>
            <p className="text-sm text-slate">
              {demoCopy.createForm.uploadSummaryPrefix} {UPLOAD_ACCEPT_LABEL.toLowerCase()}
              {demoCopy.createForm.uploadSummarySuffix}
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
        </div>
      </section>

      <ManifestPreview
        className="xl:sticky xl:top-24"
        manifest={null}
      />
    </div>
  );
}
