import { PageHero } from "@/components/page-hero";
import { RetrievePackagesExperience } from "@/components/retrieve-packages-experience";
import { demoCopy } from "@/lib/copy";

export default function RetrievePage() {
  return (
    <div className="space-y-10">
      <PageHero
        eyebrow={demoCopy.retrievePage.hero.eyebrow}
        title={demoCopy.retrievePage.hero.title}
        description={demoCopy.retrievePage.hero.description}
      />
      <RetrievePackagesExperience />
    </div>
  );
}
