"use client";

import { useState } from "react";
import { RegisterPathCard, type RegisterPath } from "@/ui/components/marketing/RegisterPathCard";
import { RegisterFormModal, type RegisterModalKind } from "@/ui/components/marketing/RegisterFormModal";
import { useLoginModal } from "@/ui/components/LoginModalContext";

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

function pathToModal(href: string): RegisterModalKind | null {
  if (href === "/register/student") return "student";
  if (href === "/register/school") return "school";
  if (href === "/register/judge") return "judge";
  if (href === "/register/nominator") return "nominator";
  return null;
}

export function RegisterPathsSection() {
  const [modal, setModal] = useState<RegisterModalKind | null>(null);
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
