import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/domain/auth/session";
import { getOwnStudentProfile } from "@/domain/students/service";
import { ChangePasswordForm } from "@/ui/components/ChangePasswordForm";
import { ProfilePhotoCard } from "@/ui/components/dashboard/ProfilePhotoCard";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const student = user.role === "student" ? await getOwnStudentProfile(await createClient(), user.id) : null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Account</h1>
      <p className="mt-2 text-muted">
        {user.email}
        {student?.frlId ? ` · League ID ${student.frlId}` : ""}
      </p>

      {student && (
        <div className="mt-6 max-w-xl">
          <h2 className="mb-3 font-semibold text-foreground">Profile photo</h2>
          <ProfilePhotoCard name={student.fullName} photoUrl={student.photoUrl} />
        </div>
      )}

      <div className="mt-8 max-w-md">
        <h2 className="mb-3 font-semibold text-foreground">Change password</h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
