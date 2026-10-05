import type { AwardCategory, AwardLayer } from "@/domain/awards/types";
import { AWARD_DETAILS, type AwardDetail } from "@/ui/components/awards/awardDetails";

/** Static extras for preferred card order and criteria fallback only. */
const extrasBySlug = new Map(AWARD_DETAILS.map((a) => [a.slug, a]));

function formatCriteria(category: AwardCategory): AwardDetail["criteria"] {
  if (category.rubricCriteria.length > 0) {
    return category.rubricCriteria.map((c) => ({
      label: c.label,
      weight: `${c.weight}%`,
    }));
  }
  return extrasBySlug.get(category.slug)?.criteria;
}

/** Build a public award card from an admin `award_categories` row.
 * title → card title
 * description → line under the title
 * details → body under the divider
 */
export function categoryToAwardDetail(category: AwardCategory): AwardDetail {
  const extras = extrasBySlug.get(category.slug);
  return {
    slug: category.slug,
    title: category.title,
    layer: category.layer,
    awardedTo: category.description || extras?.awardedTo || "",
    description: category.details || extras?.description || "",
    criteria: formatCriteria(category),
    imageUrl: category.imageUrl,
  };
}

/** Public landing cards for one recognition band. Draft categories stay hidden. */
export function publicAwardsForLayer(layer: AwardLayer, categories: AwardCategory[]): AwardDetail[] {
  const layers: AwardLayer[] =
    layer === "teacher_parent" ? ["teacher_parent", "principal"] : [layer];

  const inLayer = categories.filter((c) => layers.includes(c.layer) && c.status !== "draft");

  const preferredOrder = AWARD_DETAILS.filter((a) => layers.includes(a.layer)).map((a) => a.slug);

  const sorted = [...inLayer].sort((a, b) => {
    const ai = preferredOrder.indexOf(a.slug);
    const bi = preferredOrder.indexOf(b.slug);
    if (ai === -1 && bi === -1) return a.title.localeCompare(b.title);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  return sorted.map(categoryToAwardDetail);
}
