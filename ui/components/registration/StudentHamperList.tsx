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
import {
  isStudentHamperDraft,
  studentEntryEntrantNames,
  studentEntryFee,
  studentEntryMemberCount,
  type StudentHamperDraft,
} from "@/domain/registrations/studentEntries";
import { alreadyEnteredMessage } from "@/domain/registrations/types";
import { existingEntryStandingAction } from "@/domain/registrations/actions";
import { DialogCloseButton } from "@/ui/components/AnimatedModal";
import { MenuScroll } from "@/ui/components/MenuScroll";
import { StepMotion } from "@/ui/components/StepMotion";
import { StudentHamperPayment } from "@/ui/components/registration/StudentHamperPayment";

type DrawerView = "hamper" | "checkout";
type ViewDirection = "forward" | "back";

interface StudentHamperValue {
  entries: StudentHamperDraft[];
  open: boolean;
  drawerView: DrawerView;
  viewDirection: ViewDirection;
  openDrawer: () => void;
  openCheckout: () => void;
  backToHamper: () => void;
  closeDrawer: () => void;
  addEntry: (entry: StudentHamperDraft) => void;
  removeEntry: (slug: string) => void;
  replaceEntry: (slug: string, entry: StudentHamperDraft) => void;
  editing: StudentHamperDraft | null;
  beginEdit: (entry: StudentHamperDraft) => void;
  clearEditing: () => void;
  clearEntries: () => void;
  hasEntry: (slug: string) => boolean;
  paymentAccount: PaymentAccount;
  studentName: string;
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

export function StudentHamperProvider({
  storageKey,
  paymentAccount,
  studentName,
  children,
}: {
  storageKey: string;
  paymentAccount: PaymentAccount;
  studentName: string;
  children: ReactNode;
}) {
  const [entries, setEntries] = useState<StudentHamperDraft[]>([]);
  const [open, setOpen] = useState(false);
  const [drawerView, setDrawerView] = useState<DrawerView>("hamper");
  const [viewDirection, setViewDirection] = useState<ViewDirection>("forward");
  const [ready, setReady] = useState(false);
  const [editing, setEditing] = useState<StudentHamperDraft | null>(null);

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
  const addEntry = useCallback((entry: StudentHamperDraft) => {
    setEntries((current) => [...current.filter((item) => item.competitionSlug !== entry.competitionSlug), entry]);
    setEditing(null);
  }, []);
  const removeEntry = useCallback((slug: string) => {
    setEntries((current) => current.filter((item) => item.competitionSlug !== slug));
  }, []);
  const replaceEntry = useCallback((slug: string, entry: StudentHamperDraft) => {
    setEntries((current) => [
      ...current.filter((item) => item.competitionSlug !== slug && item.competitionSlug !== entry.competitionSlug),
      entry,
    ]);
    setEditing(null);
  }, []);
  const beginEdit = useCallback((entry: StudentHamperDraft) => {
    setEditing(entry);
    setOpen(false);
    setDrawerView("hamper");
  }, []);
  const clearEditing = useCallback(() => setEditing(null), []);
  const clearEntries = useCallback(() => setEntries([]), []);
  const hasEntry = useCallback((slug: string) => entries.some((item) => item.competitionSlug === slug), [entries]);

  const value = useMemo<StudentHamperValue>(
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
      editing,
      beginEdit,
      clearEditing,
      clearEntries,
      hasEntry,
      paymentAccount,
      studentName,
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
      editing,
      beginEdit,
      clearEditing,
      clearEntries,
      hasEntry,
      paymentAccount,
      studentName,
    ],
  );

  return (
    <StudentHamperContext.Provider value={value}>
      {children}
      <Suspense fallback={null}>
        <CheckoutQueryBridge onOpenCheckout={openCheckout} />
      </Suspense>
      <StudentHamperDrawer />
    </StudentHamperContext.Provider>
  );
}

/** Opens the checkout sheet when landing on ?checkout=1 (used by /register/pay). */
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

export function useStudentHamper() {
  const value = useContext(StudentHamperContext);
  if (!value) throw new Error("Student hamper is only available on the student dashboard.");
  return value;
}

function useStudentHamperOptional() {
  return useContext(StudentHamperContext);
}

function HamperIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
      <path d="M6 8h12l-1 11H7L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

/** Header trigger. Hidden until the hamper has at least one competition. */
export function StudentHamperHeaderButton() {
  const value = useStudentHamperOptional();
  if (!value || value.entries.length === 0) return null;
  const count = value.entries.length;
  const badge = count > 99 ? "99+" : String(count);
  return (
    <button
      type="button"
      onClick={value.openDrawer}
      aria-label={`Hamper, ${count}`}
      className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-surface text-foreground hover:border-accent/50"
    >
      <HamperIcon />
      <span className="absolute -top-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
        {badge}
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
  editing = false,
}: {
  disabled: boolean;
  onBack: () => void;
  onAdded?: () => void;
  buildDraft: () => StudentHamperDraft | null;
  studentId?: string;
  editing?: boolean;
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
        {editing
          ? "Update this competition in your hamper. You still pay once for every competition there with a single receipt."
          : "Nothing is saved yet. Add this competition to your hamper, then pay once for every competition there with a single receipt."}
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
          {pending ? "Checking…" : editing ? "Save changes" : "Add to hamper"}
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

function StudentHamperDrawer() {
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
    studentName,
  } = useStudentHamper();
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

  const fees = entries.map(studentEntryFee);
  const total = fees.every((fee) => fee != null) ? fees.reduce<number>((sum, fee) => sum + (fee ?? 0), 0) : null;
  const people = entries.reduce((sum, entry) => sum + studentEntryMemberCount(entry), 0);
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
          <DialogCloseButton
            onClick={closeDrawer}
            className="bg-white/10 text-brand-deep-foreground hover:bg-white/20 hover:text-brand-deep-foreground"
          />
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <StepMotion step={drawerView} direction={viewDirection} className="flex min-h-0 flex-1 flex-col">
            {checkout ? (
              <StudentHamperPayment paymentAccount={paymentAccount} variant="sheet" onBack={backToHamper} />
            ) : (
              <>
                <MenuScroll frameClassName="flex min-h-0 flex-1 flex-col" className="min-h-0 flex-1 space-y-2 px-5 py-4">
                  {entries.length === 0 ? (
                    <p className="text-sm text-muted">Complete a competition form to start a hamper.</p>
                  ) : (
                    entries.map((entry) => {
                      const fee = studentEntryFee(entry);
                      const names = studentEntryEntrantNames(entry, studentName);
                      return (
                        <article key={entry.competitionSlug} className="rounded-xl border border-accent/30 bg-background px-3 py-2.5">
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
                                {names.map((name) => (
                                  <li
                                    key={`${entry.competitionSlug}-${name}`}
                                    className="grid grid-cols-[minmax(0,1fr)_5.5rem] items-center gap-2 border-t border-border/70 py-1 first:border-t-0 first:pt-0"
                                  >
                                    <span className="truncate font-medium text-foreground">{name}</span>
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
                                onClick={() => removeEntry(entry.competitionSlug)}
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
                      className="block rounded-full border border-border bg-surface px-5 py-2.5 text-center text-sm font-semibold text-foreground hover:border-accent"
                    >
                      Add more
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
