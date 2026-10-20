import { redirect } from "next/navigation";

export default function AdminTeamsPage() {
  redirect("/admin/directory?tab=teams");
}
