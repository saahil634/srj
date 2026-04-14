"use client";

import Link from "next/link";
import { useState } from "react";

import { FileDropzone } from "@/components/file-dropzone";
import { ManifestPreview } from "@/components/manifest-preview";
import { demoCopy } from "@/lib/copy";
import { MAX_TOTAL_UPLOAD_BYTES } from "@/lib/constants";
import { usePlatformAccessSession } from "@/lib/platform-access-session";
import { SRJPackageManifest } from "@/lib/types";
import { exceedsUploadLimit } from "@/lib/upload-rules";
import { useSRJStore } from "@/lib/srj-store";

export function CreatePackageForm() {
  const { accessRecord } = usePlatformAccessSession();
  const currentSecureKey = accessRecord?.keyType === "access-key" ? null : accessRecord;
  const { createPackage, loadError } = useSRJStore();
  const [title, setTitle] = useState<string>(demoCopy.createForm.defaultTitle);
  const [termsPreset, setTermsPreset] = useState<string>(demoCopy.createForm.defaultTermsPreset);
  const [noticeText, setNoticeText] = useState<string>(demoCopy.createForm.defaultNoticeText);
  const [packageAccessKey, setPackageAccessKey] = useState<string>(
    demoCopy.createForm.defaultPackageAccessKey,
  );
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdPackageId, setCreatedPackageId] = useState<string | null>(null);
  const [createdManifest, setCreatedManifest] = useState<SRJPackageManifest | null>(null);
  const [isManifestOpen, setIsManifestOpen] = useState(false);

  const titleTone =
    title === demoCopy.createForm.defaultTitle ? "text-slate-400" : "text-ink";
  const termsTone =
    termsPreset === demoCopy.createForm.defaultTermsPreset ? "text-slate-400" : "text-ink";
  const noticeTone =
    noticeText === demoCopy.createForm.defaultNoticeText ? "text-slate-400" : "text-ink";
  const accessKeyTone =
    packageAccessKey === demoCopy.createForm.defaultPackageAccessKey
      ? "text-slate-400"
      : "text-ink";

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

    if (!termsPreset.trim()) {
      setError("Terms and conditions of use are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const nextPackage = await createPackage({
        title,
        termsPreset,
        noticeText,
        packageAccessKey,
        ownerSecureKeyFileId: currentSecureKey?.accessKeyId ?? null,
        files,
      });

      setCreatedPackageId(nextPackage.manifest.packageId);
      setCreatedManifest(nextPackage.manifest);
      setFiles([]);
      setTitle(demoCopy.createForm.defaultTitle);
      setTermsPreset(demoCopy.createForm.defaultTermsPreset);
      setNoticeText(demoCopy.createForm.defaultNoticeText);
      setPackageAccessKey(demoCopy.createForm.defaultPackageAccessKey);
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
    <>
      <div className="grid items-start gap-8">
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
                className={`w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition placeholder:text-slate-300 focus:border-signal ${titleTone}`}
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
              className={`w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition placeholder:text-slate-300 focus:border-signal ${termsTone}`}
              placeholder={demoCopy.createForm.fields.termsPresetPlaceholder}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink">
              {demoCopy.createForm.fields.noticeTextLabel}
            </span>
            <textarea
              value={noticeText}
              onChange={(event) => setNoticeText(event.target.value)}
              rows={3}
              className={`w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition placeholder:text-slate-300 focus:border-signal ${noticeTone}`}
              placeholder={demoCopy.createForm.fields.noticeTextPlaceholder}
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
              className={`w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition placeholder:text-slate-300 focus:border-signal ${accessKeyTone}`}
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
              disabled={!title.trim() || !termsPreset.trim() || files.length === 0 || isSubmitting}
              className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-signal disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSubmitting ? demoCopy.createForm.submitLoading : demoCopy.createForm.submitIdle}
            </button>
            <button
              type="button"
              onClick={() => setIsManifestOpen(true)}
              disabled={!createdManifest}
              className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-ink transition hover:border-signal hover:text-signal disabled:cursor-not-allowed disabled:opacity-40"
            >
              {demoCopy.createForm.viewManifestButton}
            </button>
          </div>

          {createdPackageId && createdManifest ? (
            <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-ink">
              <p className="font-semibold">
                {demoCopy.createForm.successTitlePrefix} {createdPackageId}
              </p>
              <p className="mt-2 text-slate">{demoCopy.createForm.successBody}</p>
              <Link
                href={`/open?packageId=${createdPackageId}`}
                className="mt-3 inline-flex font-semibold text-signal transition hover:text-ink"
              >
                {demoCopy.createForm.successLink}
              </Link>
            </div>
          ) : null}

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
      </div>
      {isManifestOpen && createdManifest ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-6 backdrop-blur-sm">
          <div className="w-full max-w-4xl">
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => setIsManifestOpen(false)}
                className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                {demoCopy.createForm.closeManifestButton}
              </button>
            </div>
            <ManifestPreview manifest={createdManifest} />
          </div>
        </div>
      ) : null}
    </>
  );
}
