import { createClient } from "@/data/supabase/server";
import { listAllAnnouncements } from "@/domain/announcements/service";
import { AnnouncementsList } from "./AnnouncementsList";

export const metadata = { title: "Announcements | Future Competence Series" };

export default async function AnnouncementsPage() {
  const supabase = await createClient();
  const announcements = await listAllAnnouncements(supabase);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold text-foreground">Announcements</h1>
      <p className="mt-2 text-muted">
        Site-wide and competition-specific notices, published by administrators.
      </p>
      <div className="mt-6">
        <AnnouncementsList announcements={announcements} />
      </div>
    </div>
  );
}
