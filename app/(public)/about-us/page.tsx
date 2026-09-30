import { AboutHero } from "@/ui/components/marketing/AboutHero";
import { AboutIntro } from "@/ui/components/marketing/AboutIntro";
import { AboutJourney } from "@/ui/components/marketing/AboutJourney";
import { AboutStrengths } from "@/ui/components/marketing/AboutStrengths";
import { AboutAudiences } from "@/ui/components/marketing/AboutAudiences";
import { AboutInitiative } from "@/ui/components/marketing/AboutInitiative";
import { WhyTheLeague } from "@/ui/components/marketing/WhyTheLeague";
import { ClosingCta } from "@/ui/components/marketing/ClosingCta";

export const metadata = {
  title: "About Us | Navigations",
  description: "More than a classroom — where opportunities lead.",
};

export default function AboutUsPage() {
  return (
    <div className="overflow-x-clip bg-background">
      <AboutHero />
      <AboutIntro />
      <AboutJourney />
      <AboutStrengths />
      <AboutAudiences />
      <AboutInitiative />
      <WhyTheLeague className="py-32 sm:py-40" />
      <ClosingCta />
    </div>
  );
}
