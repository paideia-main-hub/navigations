import { redirect } from "next/navigation";

/** Deep links land on the list; the form opens in a modal there. */
export default async function SubmitWorkPage({
  params,
}: {
  params: Promise<{ registrationId: string }>;
}) {
  const { registrationId } = await params;
  redirect(`/dashboard/submissions?open=${encodeURIComponent(registrationId)}`);
}
