import { notFound } from "next/navigation";
import { createAdminClient } from "@/data/supabase/admin";
import { adminGetCategoryById } from "@/domain/awards/service";
import { listAllJudges, listJudgeAssignmentsForCategory } from "@/domain/award-judging/service";
import { isJudgedLayer } from "@/domain/awards/types";
import { EditAwardCategoryForm } from "@/ui/components/admin/EditAwardCategoryForm";
import { AssignAwardJudgeForm } from "@/ui/components/admin/AssignAwardJudgeForm";

export default async function EditAwardCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();
  const category = await adminGetCategoryById(admin, id);
  if (!category) notFound();

  const judged = isJudgedLayer(category.layer);
  const [judges, assigned] = judged
    ? await Promise.all([listAllJudges(admin), listJudgeAssignmentsForCategory(admin, category.id)])
    : [[], []];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">{category.title || "Untitled category"}</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Editing the public criteria page, evidence rules and (where scored) rubric for this award category.
      </p>

      <div className="mt-8">
        <EditAwardCategoryForm category={category} />
      </div>

      {judged && (
        <div className="mt-8 max-w-2xl">
          <AssignAwardJudgeForm categoryId={category.id} judges={judges} assigned={assigned} />
        </div>
      )}
    </div>
  );
}
