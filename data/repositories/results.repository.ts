import type { SupabaseClient } from "@supabase/supabase-js";
import type { AwardType } from "@/domain/competitions/types";
import type { ComputedWinner, DraftResultRow, ResultInfo } from "@/domain/results/types";

/** Only published results are ever returned to non-admin callers — the
 * results table stays in draft (is_published = false) until an admin
 * approves & publishes via the Results review screen. */
export async function listPublishedResultsForRegistrations(
  supabase: SupabaseClient,
  registrationIds: string[],
): Promise<Map<string, ResultInfo>> {
  if (registrationIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from("results")
    .select("id, registration_id, award, custom_award_label, score")
    .in("registration_id", registrationIds)
    .eq("is_published", true);

  const map = new Map<string, ResultInfo>();
  if (error || !data) return map;

  const resultIds = data.map((r) => r.id as string);
  const { data: media } =
    resultIds.length > 0
      ? await supabase.from("winner_media").select("result_id, photo_url").in("result_id", resultIds)
      : { data: [] as { result_id: string; photo_url: string | null }[] };
  const photoByResult = new Map((media ?? []).map((m) => [m.result_id, m.photo_url]));

  for (const row of data) {
    map.set(row.registration_id, {
      registrationId: row.registration_id,
      award: row.award,
      customAwardLabel: row.custom_award_label,
      score: row.score,
      photoUrl: photoByResult.get(row.id) ?? null,
    });
  }
  return map;
}

/** Every judge_assignment for this competition, fanned out into the list of
 * submitted total_scores per registration — the raw input to ranking. */
async function fetchScoresByRegistration(supabase: SupabaseClient, competitionId: string): Promise<Map<string, number[]>> {
  const map = new Map<string, number[]>();

  const { data: assignments } = await supabase.from("judge_assignments").select("id").eq("competition_id", competitionId);
  const assignmentIds = (assignments ?? []).map((a: { id: string }) => a.id);
  if (assignmentIds.length === 0) return map;

  const { data: scores } = await supabase
    .from("scores")
    .select("registration_id, total_score")
    .in("judge_assignment_id", assignmentIds)
    .not("total_score", "is", null);

  for (const row of (scores ?? []) as { registration_id: string; total_score: number }[]) {
    const list = map.get(row.registration_id) ?? [];
    list.push(Number(row.total_score));
    map.set(row.registration_id, list);
  }
  return map;
}

/** Ranks registrations by their average submitted score (ties share a rank,
 * the next distinct score's rank skips accordingly) and assigns an award:
 * rank 1/2/3 -> gold/silver/bronze, everyone else who was scored -> finalist. */
function rankStandings(scoresByRegistration: Map<string, number[]>): { registrationId: string; score: number; award: AwardType }[] {
  const averaged = Array.from(scoresByRegistration.entries()).map(([registrationId, values]) => ({
    registrationId,
    score: Math.round((values.reduce((sum, v) => sum + v, 0) / values.length) * 100) / 100,
  }));

  return averaged
    .map((row) => {
      const rank = 1 + averaged.filter((other) => other.score > row.score).length;
      const award: AwardType = rank === 1 ? "gold" : rank === 2 ? "silver" : rank === 3 ? "bronze" : "finalist";
      return { ...row, award };
    })
    .sort((a, b) => b.score - a.score);
}

/** Computes/refreshes the draft standing for a competition from every judge's
 * submitted scores, and upserts it into `results` (award + score only —
 * is_published/approved_by/approved_at are left untouched, so re-running this
 * after a judge edits a score never silently republishes or unpublishes
 * anything). Safe to call repeatedly. */
export async function generateDraftResults(admin: SupabaseClient, competitionId: string): Promise<{ error: string | null; count: number }> {
  const { data: competition, error: competitionError } = await admin
    .from("competitions")
    .select("season")
    .eq("id", competitionId)
    .maybeSingle();
  if (competitionError) return { error: competitionError.message, count: 0 };
  if (!competition) return { error: "Competition not found.", count: 0 };

  const scoresByRegistration = await fetchScoresByRegistration(admin, competitionId);
  if (scoresByRegistration.size === 0) return { error: null, count: 0 };

  const standings = rankStandings(scoresByRegistration);
  const rows = standings.map((s) => ({
    registration_id: s.registrationId,
    competition_id: competitionId,
    season: competition.season,
    award: s.award,
    score: s.score,
  }));

  const { error } = await admin.from("results").upsert(rows, { onConflict: "registration_id" });
  return { error: error?.message ?? null, count: rows.length };
}

type AdminRegistrationRow = {
  id: string;
  entry_type: "individual" | "team";
  category: string;
  students: { full_name: string; photo_url: string | null } | null;
  teams: { team_name: string } | null;
  schools: { official_name: string } | null;
};

/** Every registration for this competition (whatever their scoring/publish
 * state), joined with its current draft/published result if one has been
 * generated — the full picture the admin review screen needs. */
export async function listResultsForAdmin(admin: SupabaseClient, competitionId: string): Promise<DraftResultRow[]> {
  const { data: competition } = await admin.from("competitions").select("slug").eq("id", competitionId).maybeSingle();
  if (!competition) return [];

  const { data: registrations } = await admin
    .from("registrations")
    .select("id, entry_type, category, students(full_name, photo_url), teams(team_name), schools(official_name)")
    .eq("competition_slug", competition.slug)
    .neq("status", "rejected");

  const regs = (registrations ?? []) as unknown as AdminRegistrationRow[];
  if (regs.length === 0) return [];
  const regIds = regs.map((r) => r.id);

  const [scoresByRegistration, { data: resultRows }, { data: consentRows }] = await Promise.all([
    fetchScoresByRegistration(admin, competitionId),
    admin
      .from("results")
      .select("id, registration_id, award, custom_award_label, score, is_published")
      .eq("competition_id", competitionId),
    admin.from("consent_records").select("registration_id, type, accepted").in("registration_id", regIds),
  ]);

  const results = (resultRows ?? []) as { id: string; registration_id: string; award: AwardType | null; custom_award_label: string | null; score: number | null; is_published: boolean }[];
  const resultByReg = new Map(results.map((r) => [r.registration_id, r]));

  const consentByReg = new Map<string, Set<string>>();
  for (const row of (consentRows ?? []) as { registration_id: string; type: string; accepted: boolean }[]) {
    if (!row.accepted) continue;
    const set = consentByReg.get(row.registration_id) ?? new Set<string>();
    set.add(row.type);
    consentByReg.set(row.registration_id, set);
  }

  const resultIds = results.map((r) => r.id);
  const { data: mediaRows } =
    resultIds.length > 0
      ? await admin.from("winner_media").select("result_id, photo_url").in("result_id", resultIds)
      : { data: [] as { result_id: string; photo_url: string | null }[] };
  const photoByResult = new Map((mediaRows ?? []).map((m) => [m.result_id, m.photo_url]));

  return regs
    .map((r) => {
      const result = resultByReg.get(r.id);
      const rawScores = scoresByRegistration.get(r.id) ?? [];
      const liveAverage = rawScores.length > 0 ? Math.round((rawScores.reduce((s, v) => s + v, 0) / rawScores.length) * 100) / 100 : null;
      const consents = consentByReg.get(r.id) ?? new Set<string>();

      return {
        resultId: result?.id ?? null,
        registrationId: r.id,
        entrantName: r.entry_type === "individual" ? (r.students?.full_name ?? "—") : (r.teams?.team_name ?? "—"),
        entryType: r.entry_type,
        category: r.category,
        schoolName: r.schools?.official_name ?? null,
        averageScore: result?.score ?? liveAverage,
        judgeCount: rawScores.length,
        award: result?.award ?? null,
        customAwardLabel: result?.custom_award_label ?? null,
        isPublished: result?.is_published ?? false,
        hasResultConsent: consents.has("result_publication"),
        hasPhotoConsent: consents.has("photo_publication"),
        photoUrl: (result ? photoByResult.get(result.id) : null) ?? r.students?.photo_url ?? null,
      } satisfies DraftResultRow;
    })
    .sort((a, b) => (b.averageScore ?? -1) - (a.averageScore ?? -1));
}

export async function updateResultAward(
  admin: SupabaseClient,
  resultId: string,
  award: AwardType,
  customAwardLabel: string | null,
): Promise<{ error: string | null }> {
  const { error } = await admin.from("results").update({ award, custom_award_label: customAwardLabel }).eq("id", resultId);
  return { error: error?.message ?? null };
}

/** Admin-supplied photo (e.g. a team photo, or overriding a student's profile
 * photo). Consent is re-checked from the registration's own consent record
 * rather than trusted from the caller, so a photo can never go out without
 * the guardian/school having actually accepted photo publication. */
export async function setWinnerPhoto(admin: SupabaseClient, resultId: string, photoUrl: string): Promise<{ error: string | null }> {
  const { data: result } = await admin.from("results").select("registration_id").eq("id", resultId).maybeSingle();
  if (!result) return { error: "Result not found." };

  const { data: consent } = await admin
    .from("consent_records")
    .select("accepted")
    .eq("registration_id", result.registration_id)
    .eq("type", "photo_publication")
    .maybeSingle();

  const { error } = await admin
    .from("winner_media")
    .upsert({ result_id: resultId, photo_url: photoUrl, consent_confirmed: consent?.accepted ?? false }, { onConflict: "result_id" });
  return { error: error?.message ?? null };
}

/** Publishes the selected draft results (FR-16: admin approval gate). A
 * result is skipped — left in draft — if its registration never captured
 * result-publication consent. Individual entries get their winner photo
 * auto-filled from the student's profile photo when the admin hasn't set one
 * (team entries have no single profile photo, so stay blank until the admin
 * uploads one via setWinnerPhoto). */
export async function publishResults(
  admin: SupabaseClient,
  resultIds: string[],
  approvedBy: string | null,
): Promise<{ published: string[]; skipped: { resultId: string; reason: string }[] }> {
  const published: string[] = [];
  const skipped: { resultId: string; reason: string }[] = [];
  if (resultIds.length === 0) return { published, skipped };

  const { data: results } = await admin.from("results").select("id, registration_id").in("id", resultIds);

  for (const result of (results ?? []) as { id: string; registration_id: string }[]) {
    const { data: consent } = await admin
      .from("consent_records")
      .select("type, accepted")
      .eq("registration_id", result.registration_id)
      .in("type", ["result_publication", "photo_publication"]);

    const hasResultConsent = (consent ?? []).some((c) => c.type === "result_publication" && c.accepted);
    const hasPhotoConsent = (consent ?? []).some((c) => c.type === "photo_publication" && c.accepted);

    if (!hasResultConsent) {
      skipped.push({ resultId: result.id, reason: "No result-publication consent on file." });
      continue;
    }

    const { error: publishError } = await admin
      .from("results")
      .update({ is_published: true, approved_by: approvedBy, approved_at: new Date().toISOString() })
      .eq("id", result.id);

    if (publishError) {
      skipped.push({ resultId: result.id, reason: publishError.message });
      continue;
    }

    const { data: existingMedia } = await admin.from("winner_media").select("photo_url").eq("result_id", result.id).maybeSingle();
    let photoUrl = existingMedia?.photo_url ?? null;
    if (!photoUrl) {
      const { data: registration } = await admin.from("registrations").select("student_id").eq("id", result.registration_id).maybeSingle();
      if (registration?.student_id) {
        const { data: student } = await admin.from("students").select("photo_url").eq("id", registration.student_id).maybeSingle();
        photoUrl = student?.photo_url ?? null;
      }
    }

    await admin.from("winner_media").upsert({ result_id: result.id, photo_url: photoUrl, consent_confirmed: hasPhotoConsent }, { onConflict: "result_id" });
    published.push(result.id);
  }

  return { published, skipped };
}

export async function unpublishResult(admin: SupabaseClient, resultId: string): Promise<{ error: string | null }> {
  const { error } = await admin.from("results").update({ is_published: false }).eq("id", resultId);
  return { error: error?.message ?? null };
}

type RegistrationForWinner = {
  id: string;
  entry_type: "individual" | "team";
  category: string;
  students: { full_name: string } | null;
  teams: { team_name: string; team_members: { students: { full_name: string } | null }[] } | null;
  schools: { official_name: string } | null;
};

/** Published, awarded results — the computed half of the public winners
 * gallery (the other half is the manually-entered `competition_winners`
 * table; see domain/competitions/service.ts#listPublishedWinners). */
export async function listPublishedComputedWinners(supabase: SupabaseClient): Promise<ComputedWinner[]> {
  const { data: results } = await supabase
    .from("results")
    .select("id, registration_id, competition_id, award, custom_award_label, season")
    .eq("is_published", true)
    .not("award", "is", null);

  const list = (results ?? []) as {
    id: string;
    registration_id: string;
    competition_id: string;
    award: AwardType;
    custom_award_label: string | null;
    season: string | null;
  }[];
  if (list.length === 0) return [];

  const competitionIds = Array.from(new Set(list.map((r) => r.competition_id)));
  const registrationIds = list.map((r) => r.registration_id);
  const resultIds = list.map((r) => r.id);

  const [{ data: competitions }, { data: registrations }, { data: media }] = await Promise.all([
    supabase.from("competitions").select("id, title, slug").in("id", competitionIds),
    supabase
      .from("registrations")
      .select("id, entry_type, category, students(full_name), teams(team_name, team_members(students(full_name))), schools(official_name)")
      .in("id", registrationIds),
    supabase.from("winner_media").select("result_id, photo_url").in("result_id", resultIds),
  ]);

  const competitionById = new Map((competitions ?? []).map((c) => [c.id as string, c as { id: string; title: string; slug: string }]));
  const registrationById = new Map(((registrations ?? []) as unknown as RegistrationForWinner[]).map((r) => [r.id, r]));
  const photoByResult = new Map((media ?? []).map((m) => [m.result_id as string, m.photo_url as string | null]));

  const winners: ComputedWinner[] = [];
  for (const r of list) {
    const competition = competitionById.get(r.competition_id);
    const registration = registrationById.get(r.registration_id);
    if (!competition || !registration) continue;

    winners.push({
      entrantName: registration.entry_type === "individual" ? (registration.students?.full_name ?? "—") : (registration.teams?.team_name ?? "—"),
      entryType: registration.entry_type,
      teamMembers:
        registration.entry_type === "team"
          ? (registration.teams?.team_members ?? []).map((m) => m.students?.full_name).filter((n): n is string => Boolean(n))
          : undefined,
      schoolName: registration.schools?.official_name ?? null,
      award: r.award,
      customAwardLabel: r.custom_award_label,
      photoUrl: photoByResult.get(r.id) ?? null,
      competitionTitle: competition.title,
      competitionSlug: competition.slug,
      season: r.season,
      category: registration.category,
    });
  }
  return winners;
}
