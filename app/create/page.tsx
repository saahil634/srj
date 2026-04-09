import { CreatePackageForm } from "@/components/create-package-form";
import { PageHero } from "@/components/page-hero";
import { demoCopy } from "@/lib/copy";

export default function CreatePage() {
  return (
    <div className="space-y-10">
      <PageHero
        eyebrow={demoCopy.createPage.hero.eyebrow}
        title={demoCopy.createPage.hero.title}
        description={demoCopy.createPage.hero.description}
      />
      <CreatePackageForm />
    </div>
  );
}
