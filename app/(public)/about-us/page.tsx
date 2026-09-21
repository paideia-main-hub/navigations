import { AboutHero } from "@/ui/components/marketing/AboutHero";
import { AboutIntro } from "@/ui/components/marketing/AboutIntro";

export const metadata = {
  title: "About Us | Future Competence Series",
  description: "More than a classroom — where opportunities lead.",
};

export default function AboutUsPage() {
  return (
    <div className="bg-background">
      <AboutHero />
      <AboutIntro />
    </div>
  );
}
