import Link from "next/link";

export const metadata = { title: "Register | Future Competence Series" };

export default function RegisterChoicePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Register</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Choose how you want to register for the Future Competence Series.
      </p>

      <div className="mt-6 space-y-3">
        <Link
          href="/register/student"
          className="block rounded-xl border border-black/10 p-4 hover:border-teal-500 dark:border-white/10"
        >
          <p className="font-semibold text-zinc-900 dark:text-zinc-50">I&apos;m a Student</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Create your own account and register individually for competitions.
          </p>
        </Link>
        <Link
          href="/register/school"
          className="block rounded-xl border border-black/10 p-4 hover:border-teal-500 dark:border-white/10"
        >
          <p className="font-semibold text-zinc-900 dark:text-zinc-50">I&apos;m a School Coordinator</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Register your school and manage individual and team entries for your students.
          </p>
        </Link>
      </div>

      <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Already have an account? <Link href="/login" className="font-semibold text-teal-700 dark:text-teal-400">Log in</Link>
      </p>
    </div>
  );
}
