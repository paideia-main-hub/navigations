import { createClient } from "@/data/supabase/server";
import { listAllAnnouncements } from "@/domain/announcements/service";
import { pageMetadata } from "@/lib/seo";
import { PageBanner } from "@/ui/components/marketing/PageBanner";
import { AnnouncementsList } from "./AnnouncementsList";

export const metadata = pageMetadata({
  title: "Announcements",
  description: "Official Navigations and Future Ready League notices for schools, students, and families.",
  path: "/announcements",
});

export default async function AnnouncementsPage() {
  const supabase = await createClient();
  const announcements = await listAllAnnouncements(supabase);

  return (
    <div className="bg-background">
      <PageBanner
        eyebrow="Announcements"
        title="Announcements"
        subtitle="Site-wide and competition-specific notices, published by administrators."
      />
      <div className="mx-auto max-w-4xl px-6 py-12">
        <AnnouncementsList announcements={announcements} />
      </div>
    </div>
  );
}
