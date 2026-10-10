import { redirect } from "next/navigation";
import { createClient } from "@/data/supabase/server";
import { listAllAnnouncements } from "@/domain/announcements/service";
import { getCurrentUser } from "@/domain/auth/session";
import { AnnouncementsList } from "@/app/(public)/announcements/AnnouncementsList";
import { DashboardHero } from "@/ui/components/dashboard/DashboardHero";
import { DashboardPage } from "@/ui/components/dashboard/DashboardShell";

export default async function DashboardAnnouncementsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role !== "school_coordinator") redirect("/dashboard");

  const announcements = await listAllAnnouncements(await createClient());

  return (
    <>
      <DashboardHero
        eyebrow="School"
        title="Announcement"
        subtitle="Site-wide and competition notices."
      />
      <DashboardPage title="Announcement">
        <AnnouncementsList announcements={announcements} />
      </DashboardPage>
    </>
  );
}
