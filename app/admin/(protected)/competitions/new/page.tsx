import { CreateCompetitionForm } from "@/ui/components/admin/CreateCompetitionForm";

export default function NewCompetitionPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">New competition</h1>
      <p className="mt-2 max-w-lg text-muted">
        Create the basic record first, then fill in eligibility, stages, manuals, resources and
        the rest from its editor page.
      </p>
      <div className="mt-6">
        <CreateCompetitionForm />
      </div>
    </div>
  );
}
