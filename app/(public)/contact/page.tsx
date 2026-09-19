import { PageBanner } from "@/ui/components/marketing/PageBanner";

export const metadata = { title: "Contact | Future Competence Series" };

export default function ContactPage() {
  return (
    <div className="bg-background">
      <PageBanner
        eyebrow="Get in Touch"
        title="Contact"
        subtitle="Questions about registration, eligibility, or a specific competition? Reach the Future Competence Series team."
      />
      <div className="mx-auto max-w-3xl px-6 py-12">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface p-4">
            <dt className="text-xs font-semibold tracking-wide text-accent-strong uppercase">Support email</dt>
            <dd className="mt-1 text-foreground">support@futurecompetence.example</dd>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <dt className="text-xs font-semibold tracking-wide text-accent-strong uppercase">
              School coordinator support
            </dt>
            <dd className="mt-1 text-foreground">schools@futurecompetence.example</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
