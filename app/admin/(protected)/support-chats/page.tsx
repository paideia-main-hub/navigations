import { createAdminClient } from "@/data/supabase/admin";
import { adminListSupportChatMessages } from "@/domain/support/logs";
import { AdminSupportChatsList } from "@/ui/components/admin/AdminSupportChatsList";

export default async function AdminSupportChatsPage() {
  const rows = await adminListSupportChatMessages(createAdminClient(), 300);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Support chats</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Anonymous Ask Navigations conversations. Use this to see what visitors ask about — fees,
        registration, competitions, and where they needed login or WhatsApp.
      </p>
      <div className="mt-6">
        <AdminSupportChatsList rows={rows} />
      </div>
    </div>
  );
}
