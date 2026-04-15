"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type SelectHTMLAttributes } from "react";

import { demoCopy } from "@/lib/copy";
import { usePlatformAccessSession } from "@/lib/platform-access-session";
import { useSRJStore } from "@/lib/srj-store";
import { MetadataLayerType, StoredDemoPackage } from "@/lib/types";

const layerTypeOptions: Array<{ value: MetadataLayerType; label: string }> = [
  { value: "translation", label: demoCopy.metadataLayerForm.layerTypeOptions.translation },
  { value: "annotation", label: demoCopy.metadataLayerForm.layerTypeOptions.annotation },
  { value: "summary", label: demoCopy.metadataLayerForm.layerTypeOptions.summary },
  { value: "context-note", label: demoCopy.metadataLayerForm.layerTypeOptions.contextNote },
  { value: "rights-note", label: demoCopy.metadataLayerForm.layerTypeOptions.rightsNote },
  {
    value: "cultural-sensitivity-note",
    label: demoCopy.metadataLayerForm.layerTypeOptions.culturalSensitivityNote,
  },
  {
    value: "educational-note",
    label: demoCopy.metadataLayerForm.layerTypeOptions.educationalNote,
  },
  { value: "transcription", label: demoCopy.metadataLayerForm.layerTypeOptions.transcription },
  { value: "other", label: demoCopy.metadataLayerForm.layerTypeOptions.other },
];

export function MetadataLayerForm({ packageId }: { packageId: string }) {
  const router = useRouter();
  const { accessRecord } = usePlatformAccessSession();
  const { packages, reloadPackages, isLoading } = useSRJStore();
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [layerType, setLayerType] = useState<MetadataLayerType | "">("");
  const [layerTitle, setLayerTitle] = useState("");
  const [language, setLanguage] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [translationLanguage, setTranslationLanguage] = useState("");
  const [translationScope, setTranslationScope] = useState("");
  const [annotationText, setAnnotationText] = useState("");
  const [fileRegionReference, setFileRegionReference] = useState("");
  const [summaryText, setSummaryText] = useState("");
  const [intendedAudience, setIntendedAudience] = useState("");
  const [rightsNote, setRightsNote] = useState("");
  const [rightsScope, setRightsScope] = useState("");
  const [contextText, setContextText] = useState("");
  const [sensitivityNote, setSensitivityNote] = useState("");
  const [handlingGuidance, setHandlingGuidance] = useState("");
  const [teachingContext, setTeachingContext] = useState("");
  const [transcriptionText, setTranscriptionText] = useState("");
  const [customTypeLabel, setCustomTypeLabel] = useState("");
  const [customContent, setCustomContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const activePackage = useMemo(
    () => packages.find((entry) => entry.manifest.packageId === packageId) ?? null,
    [packageId, packages],
  );

  useEffect(() => {
    if (!activePackage && !isLoading) {
      void reloadPackages().catch(() => {});
    }
  }, [activePackage, isLoading, reloadPackages]);

  useEffect(() => {
    if (!layerType) {
      return;
    }

    const seededByType: Record<
      MetadataLayerType,
      {
        title: string;
        language: string;
        description: string;
        notes: string;
      }
    > = {
      translation: {
        title: "Spanish translation layer",
        language: "es",
        description:
          "Adds translated framing and language context for the selected files.",
        notes: "Prepared for demo review and collaborative refinement.",
      },
      annotation: {
        title: "Context annotation layer",
        language: "en",
        description:
          "Adds explanatory annotations and light interpretive notes to the selected files.",
        notes: "Anchored to the current package for local testing.",
      },
      summary: {
        title: "Research summary layer",
        language: "en",
        description:
          "Adds a concise summary to help future recipients review the files quickly.",
        notes: "Draft summary for presentation and walkthrough purposes.",
      },
      "context-note": {
        title: "Community context note",
        language: "en",
        description:
          "Adds contextual framing that travels with the selected files for downstream readers.",
        notes: "Short contextual note for demo communication.",
      },
      "rights-note": {
        title: "Rights reminder layer",
        language: "en",
        description:
          "Adds a practical note about handling, reuse, and scope for the selected files.",
        notes: "Friendly governance reminder for the current package.",
      },
      "cultural-sensitivity-note": {
        title: "Cultural sensitivity layer",
        language: "en",
        description:
          "Adds handling guidance and sensitivity context for the selected package files.",
        notes: "Initial note for careful use during review.",
      },
      "educational-note": {
        title: "Teaching note layer",
        language: "en",
        description:
          "Adds educational framing to help instructors or students approach the selected files.",
        notes: "Demo-facing teaching note for classroom use.",
      },
      transcription: {
        title: "Working transcription layer",
        language: "en",
        description:
          "Adds a draft transcription layer for the selected media files without changing the source package.",
        notes: "Initial transcript draft for testing and revision.",
      },
      other: {
        title: "Additional metadata layer",
        language: "en",
        description:
          "Adds a custom metadata layer for the selected files in the current package.",
        notes: "Flexible placeholder layer for demo testing.",
      },
    };

    const nextSeed = seededByType[layerType];

    setLayerTitle(nextSeed.title);
    setLanguage(nextSeed.language);
    setDescription(nextSeed.description);
    setNotes(nextSeed.notes);
    setTranslationLanguage(layerType === "translation" ? "es" : "");
    setTranslationScope(
      layerType === "translation" ? "Captions and key file passages" : "",
    );
    setAnnotationText(
      layerType === "annotation"
        ? "Adds clarifying notes for the selected file passages."
        : "",
    );
    setFileRegionReference(layerType === "annotation" ? "Page 1, opening section" : "");
    setSummaryText(
      layerType === "summary"
        ? "This layer adds a concise summary of the selected files for quick review."
        : "",
    );
    setIntendedAudience(
      layerType === "summary" ? "Researchers and invited collaborators" : "",
    );
    setRightsNote(
      layerType === "rights-note"
        ? "Reuse should stay within the accepted scope of this SRJ package."
        : "",
    );
    setRightsScope(layerType === "rights-note" ? "Selected files only" : "");
    setContextText(
      layerType === "context-note"
        ? "This note adds community and research context to the selected files."
        : "",
    );
    setSensitivityNote(
      layerType === "cultural-sensitivity-note"
        ? "These materials should be reviewed with cultural context in mind."
        : "",
    );
    setHandlingGuidance(
      layerType === "cultural-sensitivity-note"
        ? "Share only within the accepted use case and retain attribution."
        : "",
    );
    setTeachingContext(
      layerType === "educational-note"
        ? "Use this layer to support guided discussion and classroom interpretation."
        : "",
    );
    setTranscriptionText(
      layerType === "transcription"
        ? "Draft transcription text for the selected media file goes here."
        : "",
    );
    setCustomTypeLabel(layerType === "other" ? "Additional contribution" : "");
    setCustomContent(
      layerType === "other"
        ? "Custom metadata content for the selected files goes here."
        : "",
    );
  }, [layerType]);

  const contributorSnapshot = useMemo(() => {
    return {
      name:
        accessRecord?.ownerName ??
        activePackage?.acceptance?.fullName ??
        demoCopy.metadataLayerForm.contributorFallbackName,
      email:
        accessRecord?.ownerEmail ??
        activePackage?.acceptance?.email ??
        demoCopy.metadataLayerForm.contributorFallbackEmail,
      organization:
        accessRecord?.ownerOrganization ??
        activePackage?.acceptance?.organization ??
        demoCopy.metadataLayerForm.contributorFallbackOrganization,
    };
  }, [accessRecord, activePackage]);

  function toggleFile(fileId: string) {
    setSelectedFileIds((current) =>
      current.includes(fileId)
        ? current.filter((value) => value !== fileId)
        : [...current, fileId],
    );
  }

  function buildPayload(pkg: StoredDemoPackage) {
    const payload: Record<string, string | string[] | null> = {
      notes: notes.trim() || null,
    };

    if (layerType === "translation") {
      payload.targetLanguage = translationLanguage.trim() || language.trim() || null;
      payload.translatedFromFileId = selectedFileIds[0] || null;
      payload.translationScope = translationScope.trim() || null;
      payload.sourceLinkStatus = demoCopy.metadataLayerForm.sourceLinkStatus;
    }

    if (layerType === "annotation") {
      payload.annotationText = annotationText.trim() || null;
      payload.fileRegionReference = fileRegionReference.trim() || null;
    }

    if (layerType === "summary") {
      payload.summaryText = summaryText.trim() || null;
      payload.intendedAudience = intendedAudience.trim() || null;
    }

    if (layerType === "rights-note") {
      payload.rightsNote = rightsNote.trim() || null;
      payload.rightsScope = rightsScope.trim() || null;
    }

    if (layerType === "context-note") {
      payload.contextText = contextText.trim() || null;
    }

    if (layerType === "cultural-sensitivity-note") {
      payload.sensitivityNote = sensitivityNote.trim() || null;
      payload.handlingGuidance = handlingGuidance.trim() || null;
    }

    if (layerType === "educational-note") {
      payload.teachingContext = teachingContext.trim() || null;
    }

    if (layerType === "transcription") {
      payload.transcribedFromFileId = selectedFileIds[0] || null;
      payload.transcriptionText = transcriptionText.trim() || null;
      payload.sourceLinkStatus = demoCopy.metadataLayerForm.sourceLinkStatus;
    }

    if (layerType === "other") {
      payload.customTypeLabel = customTypeLabel.trim() || null;
      payload.customContent = customContent.trim() || null;
    }

    payload.selectedFileNames = selectedFileIds.map(
      (fileId) => pkg.manifest.files.find((file) => file.fileId === fileId)?.name ?? fileId,
    );

    return payload;
  }

  async function handleSave() {
    if (!accessRecord) {
      setError(demoCopy.metadataLayerForm.errors.sessionRequired);
      return;
    }

    if (!activePackage) {
      setError(demoCopy.metadataLayerForm.errors.packageUnavailable);
      return;
    }

    if (selectedFileIds.length === 0) {
      setError(demoCopy.metadataLayerForm.errors.fileRequired);
      return;
    }

    if (!layerType) {
      setError(demoCopy.metadataLayerForm.errors.layerTypeRequired);
      return;
    }

    if (!layerTitle.trim()) {
      setError(demoCopy.metadataLayerForm.errors.titleRequired);
      return;
    }

    if (!description.trim()) {
      setError(demoCopy.metadataLayerForm.errors.descriptionRequired);
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      const response = await fetch(`/api/packages/${packageId}/metadata-layers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileIds: selectedFileIds,
          layerType,
          layerTitle,
          language: language.trim() || null,
          description,
          payload: buildPayload(activePackage),
          createdBy: {
            rootKeyFileId: accessRecord.accessKeyId ?? null,
            rootKeyValue: accessRecord.keyType === "access-key" ? null : accessRecord.accessKey,
            name: contributorSnapshot.name,
            email: contributorSnapshot.email,
            organization: contributorSnapshot.organization,
            keyType: accessRecord.keyType === "access-key" ? "access-key" : "secure-key",
          },
          sourceAccess: {
            accessorRootKey: accessRecord.keyType === "access-key" ? null : accessRecord.accessKey,
          },
        }),
      });
      const payload = (await response.json()) as {
        metadataLayer?: unknown;
        error?: string;
      };

      if (!response.ok || !payload.metadataLayer) {
        throw new Error(payload.error || demoCopy.metadataLayerForm.errors.saveFailed);
      }

      setIsSaved(true);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : demoCopy.metadataLayerForm.errors.saveFailed,
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (!activePackage) {
    return (
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-panel">
        <p className="text-sm leading-6 text-slate">
          {isLoading
            ? "Loading package context..."
            : demoCopy.metadataLayerForm.errors.packageUnavailable}
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-panel">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-signal">
            {demoCopy.metadataLayerForm.packageContextEyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">{activePackage.manifest.title}</h2>
          <p className="mt-2 text-sm text-slate">{activePackage.manifest.packageId}</p>
        </div>
        <Link
          href={`/open?packageId=${activePackage.manifest.packageId}`}
          className="text-sm font-semibold text-signal hover:text-ink"
        >
          {demoCopy.metadataLayerForm.backLink}
        </Link>
      </div>

      <div className="rounded-[1.5rem] border border-slate-200 bg-mist p-4">
        <p className="text-sm uppercase tracking-[0.18em] text-slate">
          {demoCopy.metadataLayerForm.contributorEyebrow}
        </p>
        <p className="mt-2 text-lg font-semibold text-ink">{contributorSnapshot.name}</p>
        <p className="mt-1 text-sm text-slate">{contributorSnapshot.organization}</p>
        <p className="mt-1 text-sm text-slate">{contributorSnapshot.email}</p>
      </div>

      <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ember">
          {demoCopy.metadataLayerForm.progressTitle}
        </p>
        <p className="mt-2 text-sm leading-6 text-ink">
          {demoCopy.metadataLayerForm.progressBody}
        </p>
        <p className="mt-2 text-sm leading-6 text-slate">
          {demoCopy.metadataLayerForm.progressBodyTwo}
        </p>
      </div>

      <div className="rounded-[1.5rem] border border-slate-200 bg-mist p-4">
        <p className="text-sm font-medium text-ink">{demoCopy.metadataLayerForm.fileSelectorLabel}</p>
        <div className="mt-4 space-y-3">
          {activePackage.manifest.files.map((file) => (
            <label
              key={file.fileId}
              className="flex items-start gap-3 rounded-[1.25rem] bg-white p-3 text-sm text-ink"
            >
              <input
                type="checkbox"
                checked={selectedFileIds.includes(file.fileId)}
                onChange={() => toggleFile(file.fileId)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-signal focus:ring-signal"
              />
              <span>
                <span className="block font-semibold">{file.name}</span>
                <span className="block text-slate">{file.fileId}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink">{demoCopy.metadataLayerForm.layerTypeLabel}</span>
          <SelectField
            value={layerType}
            onChange={(event) => setLayerType(event.target.value as MetadataLayerType | "")}
          >
            <option value="">Select a layer type</option>
            {layerTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink">{demoCopy.metadataLayerForm.languageLabel}</span>
          <input
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-signal"
            placeholder={demoCopy.metadataLayerForm.languagePlaceholder}
          />
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-ink">{demoCopy.metadataLayerForm.titleLabel}</span>
        <input
          value={layerTitle}
          onChange={(event) => setLayerTitle(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-signal"
          placeholder={demoCopy.metadataLayerForm.titlePlaceholder}
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-ink">{demoCopy.metadataLayerForm.descriptionLabel}</span>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={4}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-signal"
          placeholder={demoCopy.metadataLayerForm.descriptionPlaceholder}
        />
      </label>

      <DynamicLayerFields
        layerType={layerType}
        translationLanguage={translationLanguage}
        setTranslationLanguage={setTranslationLanguage}
        translationScope={translationScope}
        setTranslationScope={setTranslationScope}
        annotationText={annotationText}
        setAnnotationText={setAnnotationText}
        fileRegionReference={fileRegionReference}
        setFileRegionReference={setFileRegionReference}
        summaryText={summaryText}
        setSummaryText={setSummaryText}
        intendedAudience={intendedAudience}
        setIntendedAudience={setIntendedAudience}
        rightsNote={rightsNote}
        setRightsNote={setRightsNote}
        rightsScope={rightsScope}
        setRightsScope={setRightsScope}
        contextText={contextText}
        setContextText={setContextText}
        sensitivityNote={sensitivityNote}
        setSensitivityNote={setSensitivityNote}
        handlingGuidance={handlingGuidance}
        setHandlingGuidance={setHandlingGuidance}
        teachingContext={teachingContext}
        setTeachingContext={setTeachingContext}
        transcriptionText={transcriptionText}
        setTranscriptionText={setTranscriptionText}
        customTypeLabel={customTypeLabel}
        setCustomTypeLabel={setCustomTypeLabel}
        customContent={customContent}
        setCustomContent={setCustomContent}
      />

      <label className="block space-y-2">
        <span className="text-sm font-medium text-ink">{demoCopy.metadataLayerForm.notesLabel}</span>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-signal"
          placeholder={demoCopy.metadataLayerForm.notesPlaceholder}
        />
      </label>

      {error ? (
        <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
          {error}
        </div>
      ) : null}

      {isSaved ? (
        <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-lg font-semibold text-ink">{demoCopy.metadataLayerForm.successTitle}</p>
          <p className="mt-2 text-sm leading-6 text-slate">{demoCopy.metadataLayerForm.successBody}</p>
          <button
            type="button"
            onClick={() => router.push(`/open?packageId=${packageId}`)}
            className="mt-4 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-signal"
          >
            {demoCopy.metadataLayerForm.backLink}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-signal disabled:opacity-40"
        >
          {isSaving ? demoCopy.metadataLayerForm.savingButton : demoCopy.metadataLayerForm.saveButton}
        </button>
      )}
    </section>
  );
}

function DynamicLayerFields(
  props: {
    layerType: MetadataLayerType | "";
    translationLanguage: string;
    setTranslationLanguage: (value: string) => void;
    translationScope: string;
    setTranslationScope: (value: string) => void;
    annotationText: string;
    setAnnotationText: (value: string) => void;
    fileRegionReference: string;
    setFileRegionReference: (value: string) => void;
    summaryText: string;
    setSummaryText: (value: string) => void;
    intendedAudience: string;
    setIntendedAudience: (value: string) => void;
    rightsNote: string;
    setRightsNote: (value: string) => void;
    rightsScope: string;
    setRightsScope: (value: string) => void;
    contextText: string;
    setContextText: (value: string) => void;
    sensitivityNote: string;
    setSensitivityNote: (value: string) => void;
    handlingGuidance: string;
    setHandlingGuidance: (value: string) => void;
    teachingContext: string;
    setTeachingContext: (value: string) => void;
    transcriptionText: string;
    setTranscriptionText: (value: string) => void;
    customTypeLabel: string;
    setCustomTypeLabel: (value: string) => void;
    customContent: string;
    setCustomContent: (value: string) => void;
  },
) {
  if (props.layerType === "translation") {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink">{demoCopy.metadataLayerForm.translationLanguageLabel}</span>
          <input
            value={props.translationLanguage}
            onChange={(event) => props.setTranslationLanguage(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-signal"
            placeholder={demoCopy.metadataLayerForm.translationLanguagePlaceholder}
          />
        </label>
        <UnderDevelopmentSourceBlock />
        <label className="block space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-ink">{demoCopy.metadataLayerForm.translationScopeLabel}</span>
          <input
            value={props.translationScope}
            onChange={(event) => props.setTranslationScope(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-signal"
            placeholder={demoCopy.metadataLayerForm.translationScopePlaceholder}
          />
        </label>
      </div>
    );
  }

  if (props.layerType === "annotation") {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-ink">{demoCopy.metadataLayerForm.annotationTextLabel}</span>
          <textarea
            value={props.annotationText}
            onChange={(event) => props.setAnnotationText(event.target.value)}
            rows={4}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-signal"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink">{demoCopy.metadataLayerForm.regionReferenceLabel}</span>
          <input
            value={props.fileRegionReference}
            onChange={(event) => props.setFileRegionReference(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-signal"
            placeholder={demoCopy.metadataLayerForm.regionReferencePlaceholder}
          />
        </label>
      </div>
    );
  }

  if (props.layerType === "summary") {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-ink">{demoCopy.metadataLayerForm.summaryTextLabel}</span>
          <textarea
            value={props.summaryText}
            onChange={(event) => props.setSummaryText(event.target.value)}
            rows={4}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-signal"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink">{demoCopy.metadataLayerForm.intendedAudienceLabel}</span>
          <input
            value={props.intendedAudience}
            onChange={(event) => props.setIntendedAudience(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-signal"
            placeholder={demoCopy.metadataLayerForm.intendedAudiencePlaceholder}
          />
        </label>
      </div>
    );
  }

  if (props.layerType === "rights-note") {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-ink">{demoCopy.metadataLayerForm.rightsNoteLabel}</span>
          <textarea
            value={props.rightsNote}
            onChange={(event) => props.setRightsNote(event.target.value)}
            rows={4}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-signal"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink">{demoCopy.metadataLayerForm.rightsScopeLabel}</span>
          <input
            value={props.rightsScope}
            onChange={(event) => props.setRightsScope(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-signal"
            placeholder={demoCopy.metadataLayerForm.rightsScopePlaceholder}
          />
        </label>
      </div>
    );
  }

  if (props.layerType === "context-note") {
    return (
      <label className="block space-y-2">
        <span className="text-sm font-medium text-ink">{demoCopy.metadataLayerForm.contextTextLabel}</span>
        <textarea
          value={props.contextText}
          onChange={(event) => props.setContextText(event.target.value)}
          rows={4}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-signal"
        />
      </label>
    );
  }

  if (props.layerType === "cultural-sensitivity-note") {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink">{demoCopy.metadataLayerForm.sensitivityNoteLabel}</span>
          <textarea
            value={props.sensitivityNote}
            onChange={(event) => props.setSensitivityNote(event.target.value)}
            rows={4}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-signal"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink">{demoCopy.metadataLayerForm.handlingGuidanceLabel}</span>
          <textarea
            value={props.handlingGuidance}
            onChange={(event) => props.setHandlingGuidance(event.target.value)}
            rows={4}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-signal"
          />
        </label>
      </div>
    );
  }

  if (props.layerType === "educational-note") {
    return (
      <label className="block space-y-2">
        <span className="text-sm font-medium text-ink">{demoCopy.metadataLayerForm.teachingContextLabel}</span>
        <textarea
          value={props.teachingContext}
          onChange={(event) => props.setTeachingContext(event.target.value)}
          rows={4}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-signal"
        />
      </label>
    );
  }

  if (props.layerType === "transcription") {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <UnderDevelopmentSourceBlock />
        <label className="block space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-ink">{demoCopy.metadataLayerForm.transcriptionTextLabel}</span>
          <textarea
            value={props.transcriptionText}
            onChange={(event) => props.setTranscriptionText(event.target.value)}
            rows={5}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-signal"
          />
        </label>
      </div>
    );
  }

  if (props.layerType === "other") {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink">{demoCopy.metadataLayerForm.customTypeLabel}</span>
          <input
            value={props.customTypeLabel}
            onChange={(event) => props.setCustomTypeLabel(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-signal"
            placeholder={demoCopy.metadataLayerForm.customTypePlaceholder}
          />
        </label>
        <label className="block space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-ink">{demoCopy.metadataLayerForm.customContentLabel}</span>
          <textarea
            value={props.customContent}
            onChange={(event) => props.setCustomContent(event.target.value)}
            rows={4}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-signal"
          />
        </label>
      </div>
    );
  }

  return null;
}

function SelectField(
  props: SelectHTMLAttributes<HTMLSelectElement>,
) {
  return (
    <div className="relative">
      <select
        {...props}
        className={`w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 outline-none transition focus:border-signal ${props.className ?? ""}`.trim()}
      />
      <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate">
        <svg
          aria-hidden="true"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  );
}

function UnderDevelopmentSourceBlock() {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-4">
      <p className="text-sm font-medium text-ink">{demoCopy.metadataLayerForm.sourceLinkTitle}</p>
      <button
        type="button"
        disabled
        className="mt-3 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate disabled:cursor-not-allowed disabled:opacity-60"
      >
        {demoCopy.metadataLayerForm.sourceLinkButton}
      </button>
      <p className="mt-3 text-sm font-semibold text-signal">
        {demoCopy.metadataLayerForm.sourceLinkStatus}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate">
        {demoCopy.metadataLayerForm.sourceLinkBody}
      </p>
    </div>
  );
}
