import { OpenPackageExperience } from "@/components/open-package-experience";
import { PageHero } from "@/components/page-hero";
import { demoCopy } from "@/lib/copy";

export default function OpenPage() {
  return (
    <div className="space-y-10">
      <PageHero
        eyebrow={demoCopy.openPage.hero.eyebrow}
        title={demoCopy.openPage.hero.title}
        description={demoCopy.openPage.hero.description}
      />
      <OpenPackageExperience />
    </div>
  );
}
