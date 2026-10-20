import { redirect } from "next/navigation";

export default function AdminRegistrationsPage() {
  redirect("/admin/directory?tab=registrations");
}
