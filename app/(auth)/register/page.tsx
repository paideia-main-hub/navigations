import Link from "next/link";

export const metadata = { title: "Register | Future Competence Series" };

export default function RegisterChoicePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Register</h1>
      <p className="mt-1 text-sm text-muted">
        Choose how you want to register for the Future Competence Series.
      </p>

      <div className="mt-6 space-y-3">
        <Link
          href="/register/student"
          className="block rounded-xl border border-border bg-background p-4 hover:border-accent"
        >
          <p className="font-semibold text-foreground">I&apos;m a Student</p>
          <p className="text-sm text-muted">
            Create your own account and register individually for competitions.
          </p>
        </Link>
        <Link
          href="/register/school"
          className="block rounded-xl border border-border bg-background p-4 hover:border-accent"
        >
          <p className="font-semibold text-foreground">I&apos;m a School Coordinator</p>
          <p className="text-sm text-muted">
            Register your school and manage individual and team entries for your students.
          </p>
        </Link>
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account? <Link href="/login" className="font-semibold text-accent">Log in</Link>
      </p>
    </div>
  );
}
