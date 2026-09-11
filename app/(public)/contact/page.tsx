export const metadata = { title: "Contact | Future Competence Series" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold text-foreground">Contact</h1>
      <p className="mt-2 text-muted">
        Questions about registration, eligibility, or a specific competition? Reach the Future
        Competence Series team.
      </p>
      <dl className="mt-8 space-y-4 text-sm">
        <div>
          <dt className="font-medium text-foreground">Support email</dt>
          <dd className="text-muted">support@futurecompetence.example</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">School coordinator support</dt>
          <dd className="text-muted">schools@futurecompetence.example</dd>
        </div>
      </dl>
    </div>
  );
}
