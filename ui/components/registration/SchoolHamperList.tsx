"use client";

import {
  createContext,
  Suspense,
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
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formatFee } from "@/domain/competitions/types";
import type { PaymentAccount } from "@/domain/payments/types";
import { HamperCloseButton } from "@/ui/components/AnimatedModal";
import { MenuScroll } from "@/ui/components/MenuScroll";
import { StepMotion } from "@/ui/components/StepMotion";
import { alreadyEnteredMessage } from "@/domain/registrations/types";
import { existingEntryStandingAction } from "@/domain/registrations/actions";
import { isSchoolEntryDraft, schoolEntryFee, type SchoolEntryDraft, type SchoolEntryStudent } from "@/domain/registrations/schoolEntries";
import { SchoolEntryPayment } from "@/ui/components/registration/SchoolEntryPayment";

type DrawerView = "hamper" | "checkout";
type ViewDirection = "forward" | "back";

interface SchoolEntryListValue {
  entries: SchoolEntryDraft[];
  open: boolean;
  drawerView: DrawerView;
  viewDirection: ViewDirection;
  openDrawer: () => void;
  openCheckout: () => void;
  backToHamper: () => void;
  closeDrawer: () => void;
  addEntry: (entry: SchoolEntryDraft) => void;
  removeEntry: (slug: string) => void;
  replaceEntry: (key: string, entry: SchoolEntryDraft) => void;
  updateListedTeam: (teamId: string, teamName: string, students: SchoolEntryStudent[]) => void;
  editing: SchoolEntryDraft | null;
  beginEdit: (entry: SchoolEntryDraft) => void;
  clearEditing: () => void;
  clearEntries: () => void;
  paymentAccount: PaymentAccount;
}

const SchoolEntryListContext = createContext<SchoolEntryListValue | null>(null);

function storageKeyFor(storageKey: string) {
  return `frl-school-entries:${storageKey}`;
}

function readEntries(storageKey: string): SchoolEntryDraft[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKeyFor(storageKey)) ?? "[]") as unknown;
    return Array.isArray(parsed) ? parsed.filter(isSchoolEntryDraft) : [];
  } catch {
    return [];
  }
}

export function SchoolEntryListProvider({
  storageKey,
  paymentAccount,
  children,
}: {
  storageKey: string;
  paymentAccount: PaymentAccount;
  children: ReactNode;
}) {
  const [entries, setEntries] = useState<SchoolEntryDraft[]>([]);
  const [open, setOpen] = useState(false);
  const [drawerView, setDrawerView] = useState<DrawerView>("hamper");
  const [viewDirection, setViewDirection] = useState<ViewDirection>("forward");
  const [ready, setReady] = useState(false);
  const [editing, setEditing] = useState<SchoolEntryDraft | null>(null);

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

  const openDrawer = useCallback(() => {
    setViewDirection("back");
    setDrawerView("hamper");
    setOpen(true);
  }, []);
  const openCheckout = useCallback(() => {
    setViewDirection("forward");
    setDrawerView("checkout");
    setOpen(true);
  }, []);
  const backToHamper = useCallback(() => {
    setViewDirection("back");
    setDrawerView("hamper");
  }, []);
  const closeDrawer = useCallback(() => {
    setOpen(false);
    setViewDirection("forward");
    setDrawerView("hamper");
  }, []);
  const addEntry = useCallback((entry: SchoolEntryDraft) => {
    setEntries((current) => {
      if (entry.entryType === "team") {
        return [...current, { ...entry, id: entry.id ?? crypto.randomUUID() }];
      }
      return [...current.filter((item) => item.competitionSlug !== entry.competitionSlug), entry];
    });
  }, []);
  const removeEntry = useCallback((key: string) => {
    setEntries((current) => current.filter((item) => (item.id ?? item.competitionSlug) !== key));
  }, []);
  const replaceEntry = useCallback((key: string, entry: SchoolEntryDraft) => {
    setEntries((current) =>
      current.map((item) => ((item.id ?? item.competitionSlug) === key ? { ...entry, id: item.id ?? entry.id } : item)),
    );
  }, []);
  const updateListedTeam = useCallback((teamId: string, teamName: string, students: SchoolEntryStudent[]) => {
    if (students.length === 0) return;
    setEntries((current) => current.map((item) => (item.teamId === teamId ? { ...item, teamName, students } : item)));
  }, []);
  const beginEdit = useCallback((entry: SchoolEntryDraft) => {
    setEditing(entry);
    setOpen(false);
    setDrawerView("hamper");
  }, []);
  const clearEditing = useCallback(() => setEditing(null), []);
  const clearEntries = useCallback(() => setEntries([]), []);
  const value = useMemo<SchoolEntryListValue>(
    () => ({
      entries,
      open,
      drawerView,
      viewDirection,
      openDrawer,
      openCheckout,
      backToHamper,
      closeDrawer,
      addEntry,
      removeEntry,
      replaceEntry,
      updateListedTeam,
      editing,
      beginEdit,
      clearEditing,
      clearEntries,
      paymentAccount,
    }),
    [
      entries,
      open,
      drawerView,
      viewDirection,
      openDrawer,
      openCheckout,
      backToHamper,
      closeDrawer,
      addEntry,
      removeEntry,
      replaceEntry,
      updateListedTeam,
      editing,
      beginEdit,
      clearEditing,
      clearEntries,
      paymentAccount,
    ],
  );

  return (
    <SchoolEntryListContext.Provider value={value}>
      {children}
      <Suspense fallback={null}>
        <CheckoutQueryBridge onOpenCheckout={openCheckout} />
      </Suspense>
      <SchoolEntryDrawer />
    </SchoolEntryListContext.Provider>
  );
}

function CheckoutQueryBridge({ onOpenCheckout }: { onOpenCheckout: () => void }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("checkout") !== "1") return;
    onOpenCheckout();
    const params = new URLSearchParams(searchParams.toString());
    params.delete("checkout");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [searchParams, pathname, router, onOpenCheckout]);

  return null;
}

export function useSchoolEntryList() {
  const value = useContext(SchoolEntryListContext);
  if (!value) throw new Error("School entry list is only available while registering.");
  return value;
}

function HamperIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
      <path d="M6 8h12l-1 11H7L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

/** Header trigger. Hidden until the list has at least one competition. */
export function EntryListHeaderButton() {
  const value = useContext(SchoolEntryListContext);
  if (!value || value.entries.length === 0) return null;
  const count = value.entries.length;
  const badge = count > 99 ? "99+" : String(count);
  return (
    <button
      type="button"
      onClick={value.openDrawer}
      aria-label={`Hamper, ${count}`}
      className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-surface text-foreground transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent-strong"
    >
      <HamperIcon />
      <span className="absolute -top-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
        {badge}
      </span>
    </button>
  );
}

export function AddToEntryListButton({
  disabled,
  onBack,
  onAdded,
  buildDrafts,
}: {
  disabled: boolean;
  onBack: () => void;
  onAdded?: () => void;
  buildDrafts: () => SchoolEntryDraft[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { entries, addEntry, openDrawer } = useSchoolEntryList();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add() {
    const drafts = buildDrafts();
    if (drafts.length === 0) return;
    if (drafts.some((draft) => draft.feeAmount == null)) {
      setError("This competition does not have a fee yet, so it cannot be added.");
      return;
    }
    setPending(true);
    setError(null);
    const { lines, error: standingError } = await existingEntryStandingAction(
      drafts.flatMap((draft) => draft.students.map((student) => student.id)),
      drafts[0].competitionSlug,
    );
    setPending(false);
    if (standingError) {
      setError(standingError);
      return;
    }
    if (lines.length > 0) {
      setError(alreadyEnteredMessage(drafts[0].competitionTitle, lines));
      return;
    }
    const listed = entries.filter((entry) => entry.competitionSlug === drafts[0].competitionSlug);
    const takenNames = new Set(listed.map((entry) => entry.teamName?.trim().toLowerCase()).filter(Boolean));
    const takenStudents = new Set(listed.flatMap((entry) => entry.students.map((student) => student.id)));
    for (const draft of drafts) {
      if (draft.entryType !== "team") continue;
      const name = draft.teamName?.trim().toLowerCase();
      if (name && takenNames.has(name)) {
        setError(`${draft.teamName?.trim()} is already in the hamper for ${draft.competitionTitle}.`);
        return;
      }
      const overlap = draft.students.find((student) => takenStudents.has(student.id));
      if (overlap) {
        setError(`${overlap.fullName} is already on a team for ${draft.competitionTitle}.`);
        return;
      }
      if (name) takenNames.add(name);
      for (const student of draft.students) takenStudents.add(student.id);
    }
    for (const draft of drafts) addEntry(draft);
    onAdded?.();
    window.setTimeout(openDrawer, 0);
    if (pathname !== "/dashboard/register") router.push("/dashboard/register");
  }

  return (
    <>
      <p className="text-xs text-muted">
        Nothing is saved yet. Everything selected here is added together, including every team for one competition, then one receipt covers the whole hamper.
      </p>
      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent-strong"
        >
          Back
        </button>
        <button
          type="button"
          onClick={add}
          disabled={disabled || pending}
          className="min-w-0 flex-1 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors duration-300 hover:bg-accent-strong hover:text-white disabled:opacity-50"
        >
          {pending ? "Checking…" : "Add to hamper"}
        </button>
      </div>
    </>
  );
}

const iconActionClass =
  "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted hover:bg-accent-soft hover:text-accent";
const iconDeleteClass =
  "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted hover:bg-red-500/10 hover:text-red-600";

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-4 w-4">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

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

function SchoolEntryDrawer() {
  const {
    entries,
    open,
    drawerView,
    viewDirection,
    openCheckout,
    backToHamper,
    closeDrawer,
    removeEntry,
    beginEdit,
    paymentAccount,
  } = useSchoolEntryList();
  const router = useRouter();
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const checkout = drawerView === "checkout";

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
      if (event.key !== "Escape") return;
      if (checkout) backToHamper();
      else closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, checkout, backToHamper, closeDrawer]);

  if (!mounted || !open) return null;

  const fees = entries.map(schoolEntryFee);
  const total = fees.every((fee) => fee != null) ? fees.reduce<number>((sum, fee) => sum + (fee ?? 0), 0) : null;
  const canCheckout = entries.length > 0 && total != null;

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
        <div className="flex items-start justify-between gap-3 bg-brand-deep px-5 py-5">
          <div key={drawerView} className="min-w-0 animate-modal-swap-in pr-2">
            <h2 id={titleId} className="text-lg font-extrabold tracking-tight text-brand-deep-foreground">
              {checkout ? "Checkout" : "Hamper"}
            </h2>
            <p className="mt-1 text-sm text-brand-deep-muted">
              {checkout ? "One receipt covers every competition in your hamper." : "One receipt covers every competition here."}
            </p>
          </div>
          <HamperCloseButton onClick={closeDrawer} />
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <StepMotion step={drawerView} direction={viewDirection} className="flex min-h-0 flex-1 flex-col">
            {checkout ? (
              <SchoolEntryPayment paymentAccount={paymentAccount} variant="sheet" onBack={backToHamper} />
            ) : (
              <>
                <MenuScroll frameClassName="flex min-h-0 flex-1 flex-col" className="min-h-0 flex-1 space-y-2 px-5 py-4">
                  {entries.length === 0 ? (
                    <p className="text-sm text-muted">Add a competition to start a hamper.</p>
                  ) : (
                    entries.map((entry) => {
                      const fee = schoolEntryFee(entry);
                      return (
                        <article key={entry.id ?? entry.competitionSlug} className="rounded-xl border border-border bg-background px-3 py-2.5">
                          <div className="flex items-start gap-2">
                            <div className="min-w-0 flex-1">
                              <h3 className="truncate text-sm font-extrabold tracking-tight text-foreground">
                                {entry.competitionTitle}
                              </h3>
                              {entry.entryType === "team" && entry.teamName ? (
                                <p className="mt-0.5 truncate text-xs font-semibold tracking-wide text-muted uppercase">
                                  {entry.teamName}
                                </p>
                              ) : null}
                              <ul className="mt-1.5 text-xs">
                                {entry.students.map((student) => (
                                  <li
                                    key={student.id}
                                    className="grid grid-cols-[minmax(0,1fr)_5.5rem] items-center gap-2 border-t border-border/70 py-1 first:border-t-0 first:pt-0"
                                  >
                                    <span className="truncate font-medium text-foreground">
                                      {student.fullName}
                                      {student.grade ? (
                                        <span className="font-normal text-muted"> · Grade {student.grade}</span>
                                      ) : null}
                                    </span>
                                    <span className="text-right text-foreground">
                                      {entry.feeAmount != null ? formatFee(entry.feeAmount) : "—"}
                                    </span>
                                  </li>
                                ))}
                                <li className="grid grid-cols-[minmax(0,1fr)_5.5rem] items-center gap-2 border-t border-border pt-1.5">
                                  <span className="text-muted" aria-hidden="true" />
                                  <span className="text-right text-sm font-semibold text-foreground">
                                    {fee != null ? formatFee(fee) : "Fee not set"}
                                  </span>
                                </li>
                              </ul>
                            </div>
                            <div className="flex shrink-0 items-center gap-0.5">
                              <button
                                type="button"
                                aria-label={`Edit ${entry.competitionTitle}`}
                                onClick={() => {
                                  beginEdit(entry);
                                  if (window.location.pathname !== "/dashboard/register") {
                                    router.push("/dashboard/register");
                                  }
                                }}
                                className={iconActionClass}
                              >
                                <EditIcon />
                              </button>
                              <button
                                type="button"
                                aria-label={`Remove ${entry.competitionTitle}`}
                                onClick={() => removeEntry(entry.id ?? entry.competitionSlug)}
                                className={iconDeleteClass}
                              >
                                <DeleteIcon />
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })
                  )}
                </MenuScroll>
                <div className="border-t border-border bg-accent-soft px-5 py-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold tracking-wide text-accent-strong uppercase">Total</p>
                    <p className="text-lg font-extrabold text-foreground">{total != null ? formatFee(total) : "To be confirmed"}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={openCheckout}
                      disabled={!canCheckout}
                      className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors duration-300 hover:bg-accent-strong hover:text-white disabled:pointer-events-none disabled:opacity-50"
                    >
                      Continue to register
                    </button>
                    <Link
                      href="/dashboard/register"
                      onClick={closeDrawer}
                      className="block rounded-full border border-border bg-surface px-5 py-2.5 text-center text-sm font-semibold text-foreground transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent-strong"
                    >
                      Add more competitions
                    </Link>
                  </div>
                </div>
              </>
            )}
          </StepMotion>
        </div>
      </aside>
    </div>,
    document.body,
  );
}
