import { OpenPackageExperience } from "@/components/open-package-experience";
import { PageHero } from "@/components/page-hero";

export default function OpenPage() {
  return (
    <div className="space-y-10">
      <PageHero
        eyebrow="Open SRJ"
        title="Review the package, then unlock access under terms"
        description="This recipient view keeps metadata visible up front while placing file access behind an acceptance modal that records the recipient identity and timestamp."
      />
      <OpenPackageExperience />
    </div>
  );
}
