import { demoCopy } from "@/lib/copy";
import { MetadataLayerLog, SRJManifestFile } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

interface MetadataLayerListProps {
  metadataLayers: MetadataLayerLog[];
  files: SRJManifestFile[];
}

export function MetadataLayerList({
  metadataLayers,
  files,
}: MetadataLayerListProps) {
  const fileNameById = new Map(files.map((file) => [file.fileId, file.name]));

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-panel">
      <p className="text-sm uppercase tracking-[0.22em] text-signal">
        {demoCopy.openExperience.metadataLayers.eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-ink">
        {demoCopy.openExperience.metadataLayers.title}
      </h2>

      {metadataLayers.length === 0 ? (
        <div className="mt-5 rounded-[1.5rem] border border-dashed border-slate-300 bg-mist p-4 text-sm leading-6 text-slate">
          {demoCopy.openExperience.metadataLayers.emptyState}
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {metadataLayers.map((layer) => (
            <article
              key={layer.metadataLayerId}
              className="rounded-[1.5rem] border border-slate-200 bg-mist p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-ink">{layer.layerTitle}</p>
                  <p className="mt-1 text-sm text-slate">
                    {demoCopy.openExperience.metadataLayers.typePrefix}: {getLayerTypeLabel(layer.layerType)}
                  </p>
                </div>
                <p className="text-sm text-slate">{formatDateTime(layer.createdAt)}</p>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate">{layer.description}</p>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-[1.25rem] bg-white p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate">
                    {demoCopy.openExperience.metadataLayers.addedByPrefix}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-ink">
                    {layer.createdBy.name || demoCopy.metadataLayerForm.contributorFallbackName}
                  </p>
                  <p className="mt-1 text-sm text-slate">
                    {layer.createdBy.organization ||
                      demoCopy.metadataLayerForm.contributorFallbackOrganization}
                  </p>
                </div>

                <div className="rounded-[1.25rem] bg-white p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate">
                    {demoCopy.openExperience.metadataLayers.linkedFilesPrefix}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-ink">
                    {layer.fileIds
                      .map((fileId) => fileNameById.get(fileId) ?? fileId)
                      .join(", ")}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function getLayerTypeLabel(value: MetadataLayerLog["layerType"]) {
  switch (value) {
    case "translation":
      return demoCopy.metadataLayerForm.layerTypeOptions.translation;
    case "annotation":
      return demoCopy.metadataLayerForm.layerTypeOptions.annotation;
    case "summary":
      return demoCopy.metadataLayerForm.layerTypeOptions.summary;
    case "context-note":
      return demoCopy.metadataLayerForm.layerTypeOptions.contextNote;
    case "rights-note":
      return demoCopy.metadataLayerForm.layerTypeOptions.rightsNote;
    case "cultural-sensitivity-note":
      return demoCopy.metadataLayerForm.layerTypeOptions.culturalSensitivityNote;
    case "educational-note":
      return demoCopy.metadataLayerForm.layerTypeOptions.educationalNote;
    case "transcription":
      return demoCopy.metadataLayerForm.layerTypeOptions.transcription;
    case "other":
      return demoCopy.metadataLayerForm.layerTypeOptions.other;
    default:
      return value;
  }
}
