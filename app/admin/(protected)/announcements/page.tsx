import { createAdminClient } from "@/data/supabase/admin";
import { adminListAnnouncements } from "@/domain/announcements/service";
import { adminListCompetitions } from "@/domain/competitions/service";
import { AdminAnnouncementsList } from "@/ui/components/admin/AdminAnnouncementsList";

export default async function AdminAnnouncementsPage() {
  const admin = createAdminClient();
  const [announcements, competitions] = await Promise.all([adminListAnnouncements(admin), adminListCompetitions(admin)]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Announcements</h1>
      <p className="mt-2 max-w-xl text-muted">
        Publish site-wide or competition-specific notices. Published notices appear on the site.
        Expired ones stay in this list and can be published again. The date on the notice is the
        one entered here.
      </p>
      <div className="mt-6">
        <AdminAnnouncementsList announcements={announcements} competitions={competitions} />
      </div>
    </div>
  );
}
