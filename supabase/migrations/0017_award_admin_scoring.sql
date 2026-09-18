-- Direct admin scoring for award nominations, plus automatic winner
-- computation. The judge-assignment path from 0016 (award_judge_assignments
-- + award_scores) still works, but an admin can also score a nomination
-- directly against its category's fixed rubric_criteria — no judge
-- assignment required. Whichever total_score exists (admin's own, or the
-- average of judge scores, computed at read time) drives automatic
-- per-category ranking against pass_threshold/tie_break_order/max_winners.

alter table award_nominations
  add column admin_criteria_scores jsonb not null default '{}',
  add column admin_total_score numeric(6, 2),
  add column is_winner boolean not null default false,
  add column winner_photo_url text;
