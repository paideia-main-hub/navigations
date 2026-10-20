import { redirect } from "next/navigation";

export default function AdminSchoolsPage() {
  redirect("/admin/directory?tab=schools");
}
