import { redirect } from "next/navigation";

/** Legacy URL — Competency Vision now lives at /competency-vision. */
export default function AboutPage() {
  redirect("/competency-vision");
}
