"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { isGradeEligible } from "@/domain/competitions/service";
import {
  categoryLabels,
  formatFee,
  pathwayLabels,
  type CompetitionSummary,
} from "@/domain/competitions/types";
import { submitCompetitionBasketAction } from "@/domain/registrations/actions";
import type { BasketItemInput, BasketLine } from "@/domain/registrations/basket";
import type { PaymentAccount } from "@/domain/payments/types";
import { withFileUploadProgress, type UploadProgressState } from "@/ui/lib/fileUploadProgress";
import { PaymentInstructions } from "@/ui/components/PaymentInstructions";
import { RequiredMark } from "@/ui/components/RequiredMark";
import { StepMotion } from "@/ui/components/StepMotion";
import { UploadProgress } from "@/ui/components/UploadProgress";

type Step = "browse" | "details" | "teams" | "consent" | "payment" | "done";

interface StudentInfo {
  fullName: string;
  frlId: string | null;
  grade: string | null;
  schoolName: string | null;
}

interface TeamDraft {
  entryType: "individual" | "team";
  teamName: string;
  teammates: string[];
}

const btnPrimary =
  "form-action cursor-pointer rounded-full bg-accent px-5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";
const btnSecondary = "form-action cursor-pointer rounded-full border border-border px-5 text-sm font-semibold text-foreground hover:border-accent";
const input =
  "mt-1 h-[38px] w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-accent";

const STEP_LABELS: Record<Exclude<Step, "browse" | "done">, string> = {
  details: "Your details",
  teams: "Team details",
  consent: "Consent",
  payment: "Fee & payment",
};

function feeLabel(c: CompetitionSummary): string {
  return c.feeAmount == null ? "Fee not set" : formatFee(c.feeAmount);
}

function gradeRange(c: CompetitionSummary): string {
  const grades = c.eligibility.flatMap((e) => [Number(e.minGrade), Number(e.maxGrade)]).filter((n) => Number.isFinite(n) && n > 0);
  if (grades.length === 0) return "";
  const lo = Math.min(...grades);
  const hi = Math.max(...grades);
  return lo === hi ? `Grade ${lo}` : `Grades ${lo}–${hi}`;
}

/** The rule (category) the student's grade falls in for a competition, if any. */
function ruleFor(c: CompetitionSummary, grade: string) {
  return grade.trim() ? c.eligibility.find((r) => isGradeEligible(r.minGrade, r.maxGrade, grade.trim())) : undefined;
}

const storageKey = (frlId: string | null) => `frl-basket:${frlId ?? "student"}`;

/** "Pick your competitions, then check out once": the student adds any number
 * of open competitions, answers the questions once, sees an itemised fee
 * summary and uploads one receipt for the total. Everything is registered
 * under their one FRL student ID. The selection is remembered in this browser
 * until checkout, so leaving the page doesn't lose it. */
export function CompetitionBasket({
  competitions,
  registeredSlugs,
  student,
  paymentAccount,
}: {
  competitions: CompetitionSummary[];
  registeredSlugs: string[];
  student: StudentInfo;
  paymentAccount: PaymentAccount;
}) {
  const router = useRouter();
  const registered = useMemo(() => new Set(registeredSlugs), [registeredSlugs]);
  const bySlug = useMemo(() => new Map(competitions.map((c) => [c.slug, c])), [competitions]);

  const [step, setStep] = useState<Step>("browse");
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [selected, setSelected] = useState<string[]>([]);
  const [grade, setGrade] = useState(student.grade ?? "");
  const [detailsConfirmed, setDetailsConfirmed] = useState(false);
  const [teams, setTeams] = useState<Record<string, TeamDraft>>({});
  const [consent, setConsent] = useState({ terms: false, privacy: false, results: false, photo: false });
  const [receipt, setReceipt] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [transfer, setTransfer] = useState<UploadProgressState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ frlId: string | null; lines: BasketLine[]; total: number } | null>(null);

  // Restore / remember the selection in this browser (best effort).
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey(student.frlId)) ?? "[]") as string[];
      const valid = saved.filter((s) => bySlug.has(s) && !registered.has(s));
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore from browser storage after mount
      if (valid.length) setSelected(valid);
    } catch {
      /* storage unavailable — start empty */
    }
  }, [student.frlId, bySlug, registered]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey(student.frlId), JSON.stringify(selected));
    } catch {
      /* storage unavailable */
    }
  }, [selected, student.frlId]);

  const picks = selected.map((s) => bySlug.get(s)).filter((c): c is CompetitionSummary => Boolean(c));
  const feeMissing = picks.some((c) => c.feeAmount == null);
  const total = picks.reduce((sum, c) => sum + (c.feeAmount ?? 0), 0);
  const ineligible = picks.filter((c) => !ruleFor(c, grade));
  const teamPicks = picks.filter((c) => c.supportsTeam);
  const flowSteps: Exclude<Step, "browse" | "done">[] = teamPicks.length > 0 ? ["details", "teams", "consent", "payment"] : ["details", "consent", "payment"];

  function toggle(slug: string) {
    setSelected((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }

  function teamDraft(c: CompetitionSummary): TeamDraft {
    return teams[c.slug] ?? { entryType: c.supportsIndividual ? "individual" : "team", teamName: "", teammates: [""] };
  }

  function updateTeam(slug: string, patch: Partial<TeamDraft>, c: CompetitionSummary) {
    setTeams((prev) => ({ ...prev, [slug]: { ...teamDraft(c), ...prev[slug], ...patch } }));
  }

  function teamProblem(c: CompetitionSummary): string | null {
    const t = teamDraft(c);
    if (t.entryType !== "team") return null;
    const rule = ruleFor(c, grade);
    const min = rule?.teamMinSize ?? 2;
    const max = rule?.teamMaxSize ?? 10;
    const size = 1 + t.teammates.filter((n) => n.trim()).length;
    if (!t.teamName.trim()) return "Enter a team name.";
    if (size < min || size > max) return `Teams need ${min === max ? min : `${min}–${max}`} members including you (now ${size}).`;
    return null;
  }

  const consentComplete = consent.terms && consent.privacy && consent.results && consent.photo;

  async function submit() {
    if (!receipt) {
      setError("Please attach your fee payment receipt.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const items: BasketItemInput[] = picks.map((c) => {
      const t = teamDraft(c);
      return t.entryType === "team"
        ? { competitionSlug: c.slug, entryType: "team", teamName: t.teamName.trim(), teammateNames: t.teammates.filter((n) => n.trim()) }
        : { competitionSlug: c.slug, entryType: "individual" };
    });

    const fd = new FormData();
    fd.set("items", JSON.stringify(items));
    fd.set("grade", grade.trim());
    fd.set("consent", JSON.stringify(consent));
    fd.set("receipt", receipt);

    const res = await withFileUploadProgress(setTransfer, () => submitCompetitionBasketAction(fd));
    setTransfer(null);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setResult({ frlId: res.frlId, lines: res.lines, total: res.total });
    setSelected([]);
    setTeams({});
    setReceipt(null);
    setDirection("forward");
    setStep("done");
    router.refresh();
  }

  function goTo(next: Step) {
    const order: Step[] = ["browse", "details", "teams", "consent", "payment", "done"];
    setDirection(order.indexOf(next) < order.indexOf(step) ? "back" : "forward");
    setError(null);
    setStep(next);
    if (typeof window !== "undefined") document.getElementById("register")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const nextAfter = (s: Step) => flowSteps[flowSteps.indexOf(s as (typeof flowSteps)[number]) + 1] ?? "payment";
  const prevBefore = (s: Step) => flowSteps[flowSteps.indexOf(s as (typeof flowSteps)[number]) - 1] ?? "browse";

  // ---------------------------------------------------------------------------

  if (step === "done" && result) {
    return (
      <div className="rounded-2xl border border-emerald-300 bg-surface p-6 dark:border-emerald-800">
        <h3 className="text-xl font-bold text-foreground">You&apos;re registered 🎉</h3>
        <p className="mt-1 text-sm text-muted">
          {result.frlId ? (
            <>
              All registered under your League ID <span className="font-semibold text-foreground">{result.frlId}</span>.{" "}
            </>
          ) : null}
          Your payment receipt is with the admin team for review; each registration is confirmed once it&apos;s approved.
        </p>
        <FeeTable
          rows={result.lines.map((l) => ({
            title: l.competitionTitle,
            detail: `${l.registrationNumber} · ${l.categoryLabel}${l.entryType === "team" ? " · Team" : ""}`,
            fee: l.fee,
          }))}
          total={result.total}
        />
        <button onClick={() => goTo("browse")} className={`${btnSecondary} mt-5`}>
          Register for more competitions
        </button>
      </div>
    );
  }

  if (step !== "browse") {
    const currentIndex = flowSteps.indexOf(step as (typeof flowSteps)[number]);
    return (
      <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <ol className="mb-6 flex flex-wrap gap-2 text-xs font-medium">
          {flowSteps.map((s, i) => (
            <li
              key={s}
              className={`rounded-full px-3 py-1 ${
                s === step ? "bg-accent text-accent-foreground" : i < currentIndex ? "bg-accent-soft text-accent-strong" : "bg-surface-muted text-muted"
              }`}
            >
              {i + 1}. {STEP_LABELS[s]}
            </li>
          ))}
        </ol>

        <StepMotion step={step} direction={direction}>
        {step === "details" && (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-foreground">Confirm your details</h3>
              <p className="text-sm text-muted">Your grade decides which category you compete in for each competition.</p>
            </div>
            <dl className="grid gap-3 rounded-xl border border-border bg-background p-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-muted">Name</dt>
                <dd className="font-semibold text-foreground">{student.fullName}</dd>
              </div>
              <div>
                <dt className="text-muted">League ID</dt>
                <dd className="font-semibold text-foreground">{student.frlId ?? "Assigned shortly"}</dd>
              </div>
              <div>
                <dt className="text-muted">School</dt>
                <dd className="font-semibold text-foreground">{student.schoolName ?? "Independent"}</dd>
              </div>
            </dl>
            <label className="block max-w-xs text-sm font-medium text-foreground">
              Your current grade
              <RequiredMark />
              <input
                value={grade}
                onChange={(e) => {
                  setGrade(e.target.value);
                  setDetailsConfirmed(false);
                }}
                placeholder="e.g. 8 (O Level = 10, A Level = 12)"
                inputMode="numeric"
                className={input}
              />
            </label>

            <ul className="divide-y divide-border rounded-xl border border-border">
              {picks.map((c) => {
                const rule = ruleFor(c, grade);
                return (
                  <li key={c.slug} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                    <span className="font-medium text-foreground">{c.title}</span>
                    {rule ? (
                      <span className="text-emerald-700 dark:text-emerald-400">✓ {categoryLabels[rule.category]}</span>
                    ) : (
                      <span className="flex items-center gap-3">
                        <span className="text-amber-700 dark:text-amber-400">{grade.trim() ? `Not open to grade ${grade}` : "Enter your grade"}</span>
                        {grade.trim() && (
                          <button onClick={() => toggle(c.slug)} className="text-xs font-semibold text-red-600 hover:underline dark:text-red-400">
                            Remove
                          </button>
                        )}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>

            <label className="flex items-start gap-2 text-sm text-foreground">
              <input type="checkbox" checked={detailsConfirmed} onChange={(e) => setDetailsConfirmed(e.target.checked)} className="mt-0.5" />
              <span>
                My name, school and grade above are correct.
                <RequiredMark />
              </span>
            </label>

            <div className="flex flex-wrap gap-3">
              <button onClick={() => goTo("browse")} className={btnSecondary}>
                Back to competitions
              </button>
              <button
                onClick={() => goTo(nextAfter("details"))}
                disabled={!detailsConfirmed || !grade.trim() || ineligible.length > 0 || picks.length === 0}
                className={btnPrimary}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === "teams" && (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-foreground">Team details</h3>
              <p className="text-sm text-muted">For team competitions, name your team and list your teammates — you&apos;re added automatically.</p>
            </div>
            {teamPicks.map((c) => {
              const t = teamDraft(c);
              const rule = ruleFor(c, grade);
              const max = rule?.teamMaxSize ?? 10;
              const problem = teamProblem(c);
              return (
                <div key={c.slug} className="space-y-3 rounded-xl border border-border bg-background p-4">
                  <p className="font-semibold text-foreground">{c.title}</p>
                  {c.supportsIndividual && (
                    <div className="flex gap-2">
                      {(["individual", "team"] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => updateTeam(c.slug, { entryType: type }, c)}
                          className={`rounded-full border px-4 py-1.5 text-sm font-medium capitalize ${
                            t.entryType === type ? "border-accent bg-accent-soft text-accent-strong" : "border-border text-foreground"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  )}
                  {t.entryType === "team" && (
                    <>
                      <label className="block text-sm font-medium text-foreground">
                        Team name
                        <RequiredMark />
                        <input value={t.teamName} onChange={(e) => updateTeam(c.slug, { teamName: e.target.value }, c)} className={input} />
                      </label>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">
                          Teammates
                          <RequiredMark />
                        </p>
                        <input readOnly value={`${student.fullName} (you)`} className={`${input} bg-surface-muted text-muted`} />
                        {t.teammates.map((name, i) => (
                          <input
                            key={i}
                            value={name}
                            placeholder={`Teammate ${i + 1} name`}
                            onChange={(e) => updateTeam(c.slug, { teammates: t.teammates.map((n, idx) => (idx === i ? e.target.value : n)) }, c)}
                            className={input}
                          />
                        ))}
                        {t.teammates.length + 1 < max && (
                          <button onClick={() => updateTeam(c.slug, { teammates: [...t.teammates, ""] }, c)} className="text-sm font-semibold text-accent">
                            + Add teammate
                          </button>
                        )}
                      </div>
                      {problem && <p className="text-xs text-amber-700 dark:text-amber-400">{problem}</p>}
                    </>
                  )}
                </div>
              );
            })}
            <div className="flex flex-wrap gap-3">
              <button onClick={() => goTo(prevBefore("teams"))} className={btnSecondary}>
                Back
              </button>
              <button onClick={() => goTo(nextAfter("teams"))} disabled={teamPicks.some((c) => teamProblem(c))} className={btnPrimary}>
                Continue
              </button>
            </div>
          </div>
        )}

        {step === "consent" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-foreground">Consent</h3>
              <p className="text-sm text-muted">Given once, for every competition in this registration.</p>
            </div>
            {[
              { key: "terms" as const, label: "I accept the competition rules and code of conduct." },
              { key: "privacy" as const, label: "I consent to the site's data privacy policy." },
              { key: "results" as const, label: "I consent to result publication if qualified." },
              { key: "photo" as const, label: "I consent to photo publication for winners, where applicable." },
            ].map((item) => (
              <label key={item.key} className="flex items-start gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={consent[item.key]}
                  onChange={(e) => setConsent((prev) => ({ ...prev, [item.key]: e.target.checked }))}
                  className="mt-0.5"
                />
                <span>
                  {item.label}
                  <RequiredMark />
                </span>
              </label>
            ))}
            <div className="flex flex-wrap gap-3">
              <button onClick={() => goTo(prevBefore("consent"))} className={btnSecondary}>
                Back
              </button>
              <button onClick={() => goTo("payment")} disabled={!consentComplete} className={btnPrimary}>
                Continue
              </button>
            </div>
          </div>
        )}

        {step === "payment" && (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-foreground">Fee summary &amp; payment</h3>
              <p className="text-sm text-muted">One receipt covers every competition in this checkout.</p>
            </div>
            <PaymentInstructions account={paymentAccount} amount={feeMissing ? null : formatFee(total)} />
            <FeeTable
              rows={picks.map((c) => {
                const rule = ruleFor(c, grade);
                const team = teamDraft(c).entryType === "team" && c.supportsTeam;
                return {
                  title: c.title,
                  detail: `${rule ? categoryLabels[rule.category] : ""}${team ? ` · Team “${teamDraft(c).teamName}”` : " · Individual"}`,
                  fee: c.feeAmount ?? 0,
                };
              })}
              total={total}
            />
            {feeMissing && (
              <p className="text-sm text-red-600 dark:text-red-400">
                One of the selected competitions does not have a fee yet. Remove it, or ask an admin to set the fee, before you pay.
              </p>
            )}
            <label className="block text-sm font-medium text-foreground">
              Payment receipt
              <RequiredMark />{" "}
              <span className="font-normal text-muted">(photo or PDF of the transfer for {formatFee(total)})</span>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setReceipt(e.target.files?.[0] ?? null)}
                className="mt-1 block w-full text-sm text-foreground file:mr-3 file:rounded-full file:border-0 file:bg-accent-soft file:px-4 file:py-2 file:text-sm file:font-semibold file:text-accent-strong"
              />
            </label>
            {transfer ? <UploadProgress phase={transfer.phase} percent={transfer.percent} /> : null}
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <div className="flex flex-wrap gap-3">
              <button onClick={() => goTo("consent")} disabled={submitting} className={btnSecondary}>
                Back
              </button>
              <button onClick={submit} disabled={submitting || !receipt || feeMissing} className={btnPrimary}>
                {submitting ? "Registering…" : `Submit ${picks.length} registration${picks.length === 1 ? "" : "s"} · ${formatFee(total)}`}
              </button>
            </div>
          </div>
        )}
        </StepMotion>
      </div>
    );
  }

  // --- Browse ----------------------------------------------------------------
  return (
    <div>
      {competitions.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface p-6 text-center text-sm text-muted">
          No competitions are open for registration right now.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {competitions.map((c) => {
            const isRegistered = registered.has(c.slug);
            const isSelected = selected.includes(c.slug);
            const notForGrade = Boolean(grade.trim()) && !ruleFor(c, grade);
            return (
              <li
                key={c.slug}
                className={`flex flex-col rounded-xl border bg-surface p-4 transition-colors ${
                  isSelected ? "border-accent ring-1 ring-accent" : "border-border"
                }`}
              >
                {c.pathway && <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-accent-strong uppercase">{pathwayLabels[c.pathway]}</p>}
                <p className="mt-1 font-bold text-foreground">{c.title}</p>
                <p className="mt-1 text-xs text-muted">
                  {[gradeRange(c), c.supportsTeam && !c.supportsIndividual ? "Team" : c.supportsTeam ? "Individual or team" : "Individual"]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                  <span className="text-sm font-semibold text-foreground">{feeLabel(c)}</span>
                  {isRegistered ? (
                    <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                      Registered ✓
                    </span>
                  ) : (
                    <button
                      onClick={() => toggle(c.slug)}
                      disabled={notForGrade && !isSelected}
                      title={notForGrade ? `Not open to grade ${grade}` : undefined}
                      className={
                        isSelected
                          ? "cursor-pointer rounded-full border border-accent px-4 py-1.5 text-xs font-semibold text-accent-strong hover:bg-accent-soft"
                          : "cursor-pointer rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-accent-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                      }
                    >
                      {isSelected ? "Added ✓ · Remove" : notForGrade ? "Not for your grade" : "+ Add"}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {picks.length > 0 && (
        <div className="sticky bottom-4 z-20 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent bg-surface p-4 shadow-[0_18px_40px_-20px_rgba(31,32,65,0.5)]">
          <div className="text-sm">
            <p className="font-semibold text-foreground">
              {picks.length} competition{picks.length === 1 ? "" : "s"} selected · {feeMissing ? "Fee not set" : formatFee(total)}
            </p>
            <p className="line-clamp-1 text-xs text-muted">{picks.map((c) => c.title).join(", ")}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setSelected([])} className={btnSecondary}>
              Clear
            </button>
            <button onClick={() => goTo("details")} disabled={feeMissing} className={btnPrimary}>
              Continue to register
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FeeTable({ rows, total }: { rows: { title: string; detail: string; fee: number }[]; total: number }) {
  return (
    <table className="mt-4 w-full overflow-hidden rounded-xl border border-border text-sm">
      <tbody>
        {rows.map((r) => (
          <tr key={r.title} className="border-b border-border">
            <td className="px-4 py-3">
              <p className="font-medium text-foreground">{r.title}</p>
              {r.detail && <p className="text-xs text-muted">{r.detail}</p>}
            </td>
            <td className="px-4 py-3 text-right whitespace-nowrap text-foreground">{formatFee(r.fee)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="bg-surface-muted">
          <td className="px-4 py-3 font-bold text-foreground">
            Total · {rows.length} competition{rows.length === 1 ? "" : "s"}
          </td>
          <td className="px-4 py-3 text-right text-base font-black whitespace-nowrap text-foreground">{formatFee(total)}</td>
        </tr>
      </tfoot>
    </table>
  );
}
