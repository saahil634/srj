import { MetadataLayerForm } from "@/components/metadata-layer-form";
import { PageHero } from "@/components/page-hero";
import { demoCopy } from "@/lib/copy";

export default async function NewMetadataLayerPage({
  params,
}: {
  params: Promise<{ packageId: string }>;
}) {
  const { packageId } = await params;

  return (
    <div className="space-y-10">
      <PageHero
        eyebrow={demoCopy.metadataLayerForm.hero.eyebrow}
        title={demoCopy.metadataLayerForm.hero.title}
        description={demoCopy.metadataLayerForm.hero.description}
      />
      <MetadataLayerForm packageId={packageId} />
    </div>
  );
}
