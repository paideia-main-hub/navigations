export const metadata = { title: "Contact | Future Competence Series" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Contact</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Questions about registration, eligibility, or a specific competition? Reach the Future
        Competence Series team.
      </p>
      <dl className="mt-8 space-y-4 text-sm">
        <div>
          <dt className="font-medium text-zinc-900 dark:text-zinc-50">Support email</dt>
          <dd className="text-zinc-600 dark:text-zinc-400">support@futurecompetence.example</dd>
        </div>
        <div>
          <dt className="font-medium text-zinc-900 dark:text-zinc-50">School coordinator support</dt>
          <dd className="text-zinc-600 dark:text-zinc-400">schools@futurecompetence.example</dd>
        </div>
      </dl>
    </div>
  );
}
