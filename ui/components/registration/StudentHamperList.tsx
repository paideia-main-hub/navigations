"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { formatFee } from "@/domain/competitions/types";
import {
  isStudentHamperDraft,
  studentEntryFee,
  studentEntryMemberCount,
  type StudentHamperDraft,
} from "@/domain/registrations/studentEntries";
import { alreadyEnteredMessage } from "@/domain/registrations/types";
import { existingEntryStandingAction } from "@/domain/registrations/actions";
import { DialogCloseButton } from "@/ui/components/AnimatedModal";
import { MenuScroll } from "@/ui/components/MenuScroll";

interface StudentHamperValue {
  entries: StudentHamperDraft[];
  open: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addEntry: (entry: StudentHamperDraft) => void;
  removeEntry: (slug: string) => void;
  clearEntries: () => void;
  hasEntry: (slug: string) => boolean;
}

const StudentHamperContext = createContext<StudentHamperValue | null>(null);

function storageKeyFor(storageKey: string) {
  return `frl-student-hamper:${storageKey}`;
}

function readEntries(storageKey: string): StudentHamperDraft[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKeyFor(storageKey)) ?? "[]") as unknown;
    return Array.isArray(parsed) ? parsed.filter(isStudentHamperDraft) : [];
  } catch {
    return [];
  }
}

export function StudentHamperProvider({ storageKey, children }: { storageKey: string; children: ReactNode }) {
  const [entries, setEntries] = useState<StudentHamperDraft[]>([]);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setEntries(readEntries(storageKey));
    setReady(true);
  }, [storageKey]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(storageKeyFor(storageKey), JSON.stringify(entries));
    } catch {
      /* storage unavailable */
    }
  }, [entries, ready, storageKey]);

  const openDrawer = useCallback(() => setOpen(true), []);
  const closeDrawer = useCallback(() => setOpen(false), []);
  const addEntry = useCallback((entry: StudentHamperDraft) => {
    setEntries((current) => [...current.filter((item) => item.competitionSlug !== entry.competitionSlug), entry]);
  }, []);
  const removeEntry = useCallback((slug: string) => {
    setEntries((current) => current.filter((item) => item.competitionSlug !== slug));
  }, []);
  const clearEntries = useCallback(() => setEntries([]), []);
  const hasEntry = useCallback((slug: string) => entries.some((item) => item.competitionSlug === slug), [entries]);

  const value = useMemo<StudentHamperValue>(
    () => ({
      entries,
      open,
      openDrawer,
      closeDrawer,
      addEntry,
      removeEntry,
      clearEntries,
      hasEntry,
    }),
    [entries, open, openDrawer, closeDrawer, addEntry, removeEntry, clearEntries, hasEntry],
  );

  return (
    <StudentHamperContext.Provider value={value}>
      {children}
      <StudentHamperDrawer />
    </StudentHamperContext.Provider>
  );
}

export function useStudentHamper() {
  const value = useContext(StudentHamperContext);
  if (!value) throw new Error("Student hamper is only available on the student dashboard.");
  return value;
}

function useStudentHamperOptional() {
  return useContext(StudentHamperContext);
}

function EntryListIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-4 w-4 sm:hidden">
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <path d="M3 6h.01" />
      <path d="M3 12h.01" />
      <path d="M3 18h.01" />
    </svg>
  );
}

/** Header trigger. Hidden until the hamper has at least one competition. */
export function StudentHamperHeaderButton() {
  const value = useStudentHamperOptional();
  if (!value || value.entries.length === 0) return null;
  const count = value.entries.length;
  return (
    <button
      type="button"
      onClick={value.openDrawer}
      aria-label={`Hamper, ${count}`}
      className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-surface text-foreground hover:border-accent/50 sm:flex sm:h-auto sm:w-auto sm:items-center sm:gap-2 sm:px-3 sm:py-1.5"
    >
      <EntryListIcon />
      <span className="hidden text-sm font-semibold sm:inline">Hamper</span>
      <span className="absolute -top-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground sm:static sm:h-5 sm:min-w-5 sm:px-1.5 sm:text-xs">
        {count}
      </span>
    </button>
  );
}

export function AddToStudentHamperButton({
  disabled,
  onBack,
  onAdded,
  buildDraft,
  studentId,
}: {
  disabled: boolean;
  onBack: () => void;
  onAdded?: () => void;
  buildDraft: () => StudentHamperDraft | null;
  studentId?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { addEntry, openDrawer } = useStudentHamper();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add() {
    const draft = buildDraft();
    if (!draft) return;
    if (draft.feeAmount == null) {
      setError("This competition does not have a fee yet, so it cannot be added.");
      return;
    }
    setPending(true);
    setError(null);
    if (studentId) {
      const { lines, error: standingError } = await existingEntryStandingAction([studentId], draft.competitionSlug);
      setPending(false);
      if (standingError) {
        setError(standingError);
        return;
      }
      if (lines.length > 0) {
        setError(alreadyEnteredMessage(draft.competitionTitle, lines));
        return;
      }
    } else {
      setPending(false);
    }
    addEntry(draft);
    onAdded?.();
    window.setTimeout(openDrawer, 0);
    if (pathname !== "/dashboard/register") router.push("/dashboard/register");
  }

  return (
    <>
      <p className="text-xs text-muted">
        Nothing is saved yet. Add this competition to your hamper, then pay once for every competition there with a
        single receipt.
      </p>
      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground"
        >
          Back
        </button>
        <button
          type="button"
          onClick={add}
          disabled={disabled || pending}
          className="min-w-0 flex-1 cursor-pointer rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors duration-300 hover:bg-accent-strong hover:text-white disabled:opacity-50"
        >
          {pending ? "Checking…" : "Add to hamper"}
        </button>
      </div>
    </>
  );
}

const iconDeleteClass =
  "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted hover:bg-red-500/10 hover:text-red-600";

function DeleteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-4 w-4">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

function StudentHamperDrawer() {
  const { entries, open, closeDrawer, removeEntry } = useStudentHamper();
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setVisible(true);
      return;
    }
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, closeDrawer]);

  if (!mounted || !open) return null;

  const fees = entries.map(studentEntryFee);
  const total = fees.every((fee) => fee != null) ? fees.reduce<number>((sum, fee) => sum + (fee ?? 0), 0) : null;
  const people = entries.reduce((sum, entry) => sum + studentEntryMemberCount(entry), 0);

  return createPortal(
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        aria-label="Close hamper"
        className="absolute inset-0 bg-brand-deep/55 backdrop-blur-[2px] transition-opacity duration-200"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={closeDrawer}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-surface shadow-[0_24px_60px_-24px_rgba(31,32,65,0.55)] transition-transform duration-200 ease-out motion-reduce:transition-none"
        style={{ transform: visible ? "translateX(0)" : "translateX(100%)" }}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h2 id={titleId} className="text-lg font-extrabold tracking-tight text-foreground">
              Hamper
            </h2>
            <p className="mt-1 text-sm text-muted">One receipt covers every competition here.</p>
          </div>
          <DialogCloseButton onClick={closeDrawer} />
        </div>
        <MenuScroll frameClassName="flex min-h-0 flex-1 flex-col" className="min-h-0 flex-1 space-y-3 px-5 py-4">
          {entries.length === 0 ? (
            <p className="text-sm text-muted">Complete a competition form to start a hamper.</p>
          ) : (
            entries.map((entry) => {
              const fee = studentEntryFee(entry);
              const members = studentEntryMemberCount(entry);
              return (
                <article key={entry.competitionSlug} className="rounded-2xl border border-accent/30 bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-extrabold tracking-tight text-foreground">{entry.competitionTitle}</h3>
                      {entry.entryType === "team" && entry.teamName ? (
                        <p className="mt-1 text-xs font-semibold tracking-wide text-muted uppercase">{entry.teamName}</p>
                      ) : null}
                      <p className="mt-2 text-sm text-muted">
                        {members} {members === 1 ? "entrant" : "entrants"}
                        {entry.feeAmount != null ? ` · ${formatFee(entry.feeAmount)} each` : ""}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {fee != null ? formatFee(fee) : "Fee not set"}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove ${entry.competitionTitle}`}
                      onClick={() => removeEntry(entry.competitionSlug)}
                      className={iconDeleteClass}
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </MenuScroll>
        <div className="border-t border-border bg-accent-soft px-5 py-4">
          <div className="mb-1 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold tracking-wide text-accent-strong uppercase">Total</p>
            <p className="text-lg font-extrabold text-foreground">{total != null ? formatFee(total) : "To be confirmed"}</p>
          </div>
          {entries.length > 0 ? (
            <p className="mb-3 text-xs text-muted">
              {entries.length} competition{entries.length === 1 ? "" : "s"} · {people} paid place
              {people === 1 ? "" : "s"}
            </p>
          ) : null}
          <div className="flex flex-col gap-2">
            <Link
              href="/dashboard/register/pay"
              onClick={closeDrawer}
              aria-disabled={entries.length === 0 || total == null}
              className={`block rounded-full bg-accent px-5 py-2.5 text-center text-sm font-semibold text-accent-foreground transition-colors duration-300 hover:bg-accent-strong hover:text-white ${
                entries.length === 0 || total == null ? "pointer-events-none opacity-50" : ""
              }`}
            >
              Continue to register
            </Link>
            <Link
              href="/dashboard/register"
              onClick={closeDrawer}
              className="block rounded-full border border-border bg-surface px-5 py-2.5 text-center text-sm font-semibold text-foreground hover:border-accent"
            >
              Add more
            </Link>
          </div>
        </div>
      </aside>
    </div>,
    document.body,
  );
}
