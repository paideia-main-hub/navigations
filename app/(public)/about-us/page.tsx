import { AboutHero } from "@/ui/components/marketing/AboutHero";
import { AboutIntro } from "@/ui/components/marketing/AboutIntro";
import { AboutJourney } from "@/ui/components/marketing/AboutJourney";
import { AboutStrengths } from "@/ui/components/marketing/AboutStrengths";
import { AboutAudiences } from "@/ui/components/marketing/AboutAudiences";
import { AboutInitiative } from "@/ui/components/marketing/AboutInitiative";

export const metadata = {
  title: "About Us | Future Competence Series",
  description: "More than a classroom — where opportunities lead.",
};

export default function AboutUsPage() {
  return (
    <div className="bg-background">
      <AboutHero />
      <AboutIntro />
      <AboutJourney />
      <AboutStrengths />
      <AboutAudiences />
      <AboutInitiative />
    </div>
  );
}
