import { CreatePackageForm } from "@/components/create-package-form";
import { PageHero } from "@/components/page-hero";

export default function CreatePage() {
  return (
    <div className="space-y-10">
      <PageHero
        eyebrow="Create SRJ"
        title="Build a governed package in a few clicks"
        description="Use drag and drop to assemble a package, apply the preset usage terms, and generate the manifest object that powers the recipient-side unlock flow."
      />
      <CreatePackageForm />
    </div>
  );
}
