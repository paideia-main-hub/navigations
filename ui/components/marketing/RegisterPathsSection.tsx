"use client";

import { useState } from "react";
import { RegisterPathCard, type RegisterPath } from "@/ui/components/marketing/RegisterPathCard";
import { StudentRegisterForm } from "@/ui/components/registration/StudentRegisterForm";
import { SchoolRegisterForm } from "@/ui/components/registration/SchoolRegisterForm";
import { JudgeRegisterForm } from "@/ui/components/registration/JudgeRegisterForm";
import { NominatorRegisterForm } from "@/ui/components/registration/NominatorRegisterForm";
import { useLoginModal } from "@/ui/components/LoginModalContext";
import { AnimatedModal, useAnimatedModalClose } from "@/ui/components/AnimatedModal";

const paths: RegisterPath[] = [
  {
    href: "/register/student",
    code: "01",
    label: "Student",
    body: "Create your own account and register individually for competitions you are eligible for.",
    cta: "Register as a student",
    tone: "warm",
    icon: "id-badge",
  },
  {
    href: "/register/school",
    code: "02",
    label: "School Coordinator",
    body: "Register your school, manage your student roster, and enter individuals or teams.",
    cta: "Register your school",
    tone: "indigo",
    icon: "users",
  },
  {
    href: "/register/judge",
    code: "03",
    label: "Judge",
    body: "Apply to judge a competition. Applications are reviewed before access is granted.",
    cta: "Apply to judge",
    tone: "slate",
    icon: "scale",
  },
  {
    href: "/register/nominator",
    code: "04",
    label: "Independent Nominator",
    body: "Submit an Idea, Story or Young Changemaker nomination without a school account.",
    cta: "Register as a nominator",
    tone: "teal",
    icon: "megaphone",
  },
];

type ModalKey = "student" | "school" | "judge" | "nominator";

function pathToModal(href: string): ModalKey | null {
  if (href === "/register/student") return "student";
  if (href === "/register/school") return "school";
  if (href === "/register/judge") return "judge";
  if (href === "/register/nominator") return "nominator";
  return null;
}

const modalMeta: Record<
  ModalKey,
  { title: string; subtitle: string; headerClass: string; accentClass: string }
> = {
  student: {
    title: "Student Registration",
    subtitle: "Create your account, then select a competition from the directory to register.",
    headerClass: "bg-accent-soft",
    accentClass: "text-accent-strong",
  },
  school: {
    title: "School Registration",
    subtitle: "Register your school, then add students and teams from your school dashboard.",
    headerClass: "bg-[#e8eaf8]",
    accentClass: "text-brand-deep",
  },
  judge: {
    title: "Judge Registration",
    subtitle: "Create your account, then apply to judge competitions from your dashboard.",
    headerClass: "bg-surface-alt",
    accentClass: "text-foreground",
  },
  nominator: {
    title: "Independent Nominator",
    subtitle: "For Idea, Story and Young Changemaker nominations with no school involved.",
    headerClass: "bg-[#e6f4f2]",
    accentClass: "text-[#1f6b63]",
  },
};

function ModalForm({ kind }: { kind: ModalKey }) {
  switch (kind) {
    case "student":
      return <StudentRegisterForm hideIntro />;
    case "school":
      return <SchoolRegisterForm hideIntro />;
    case "judge":
      return <JudgeRegisterForm hideIntro />;
    case "nominator":
      return <NominatorRegisterForm hideIntro />;
  }
}

export function RegisterPathsSection() {
  const [modal, setModal] = useState<ModalKey | null>(null);
  const { openLogin } = useLoginModal();
  const topRow = paths.slice(0, 2);
  const bottomRow = paths.slice(2);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
        {topRow.map((path) => {
          const key = pathToModal(path.href);
          return (
            <RegisterPathCard
              key={path.href}
              path={path}
              onOpen={key ? () => setModal(key) : undefined}
            />
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 sm:gap-5">
        {bottomRow.map((path) => {
          const key = pathToModal(path.href);
          return (
            <RegisterPathCard
              key={path.href}
              path={path}
              onOpen={key ? () => setModal(key) : undefined}
            />
          );
        })}
      </div>

      <div className="mt-14 flex justify-center">
        <div className="inline-flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface px-6 py-5 shadow-[0_14px_36px_-28px_rgba(31,32,65,0.45)] sm:flex-row sm:gap-5 sm:px-7">
          <div className="text-center sm:text-left">
            <p className="text-sm font-bold text-foreground">Already have an account?</p>
            <p className="mt-0.5 text-xs text-muted">Pick up where you left off in your dashboard.</p>
          </div>
          <button
            type="button"
            onClick={() => openLogin()}
            className="group inline-flex cursor-pointer items-center gap-2 rounded-full bg-brand-deep px-5 py-2.5 text-sm font-bold text-brand-deep-foreground transition-[background-color,transform,box-shadow] duration-300 ease-out hover:bg-accent hover:text-accent-foreground hover:shadow-[0_0_0_6px_rgba(255,105,31,0.16)]"
          >
            Log in
            <span aria-hidden className="transition-transform duration-300 ease-out group-hover:translate-x-1">
              →
            </span>
          </button>
        </div>
      </div>

      {modal ? <RegisterFormModal key={modal} kind={modal} onClose={() => setModal(null)} /> : null}
    </>
  );
}

function RegisterFormModal({ kind, onClose }: { kind: ModalKey; onClose: () => void }) {
  return (
    <AnimatedModal
      onClose={onClose}
      labelledBy="register-modal-title"
      panelClassName="max-h-[min(92vh,52rem)] max-w-lg"
    >
      <RegisterFormModalBody kind={kind} />
    </AnimatedModal>
  );
}

function RegisterFormModalBody({ kind }: { kind: ModalKey }) {
  const meta = modalMeta[kind];
  const requestClose = useAnimatedModalClose();

  return (
    <>
      <div className={`relative shrink-0 px-5 py-5 sm:px-7 sm:py-6 ${meta.headerClass}`}>
        <button
          type="button"
          onClick={requestClose}
          aria-label="Close"
          className="absolute top-4 right-4 grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-surface/80 text-foreground shadow-sm transition-colors duration-300 hover:bg-surface hover:text-accent-strong sm:top-5 sm:right-5"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        <p className={`pr-12 text-xs font-black tracking-[0.16em] uppercase ${meta.accentClass}`}>Register</p>
        <h2 id="register-modal-title" className="mt-2 pr-12 text-2xl font-black tracking-tight text-foreground">
          {meta.title}
        </h2>
        <p className="mt-2 max-w-sm pr-4 text-sm leading-relaxed text-muted">{meta.subtitle}</p>
      </div>

      <div className="overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
        <ModalForm kind={kind} />
      </div>
    </>
  );
}
