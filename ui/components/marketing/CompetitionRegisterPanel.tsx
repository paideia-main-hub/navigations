"use client";

import { useState } from "react";
import Link from "next/link";
import { useLoginModal } from "@/ui/components/LoginModalContext";
import { RegisterFormModal, type RegisterModalKind } from "@/ui/components/marketing/RegisterFormModal";

/** Register tab CTAs — stay on this page and open login / signup modals. */
export function CompetitionRegisterPanel({
  slug,
  title,
  isLoggedIn,
}: {
  slug: string;
  title: string;
  isLoggedIn: boolean;
}) {
  const { openLogin } = useLoginModal();
  const [registerModal, setRegisterModal] = useState<Extract<RegisterModalKind, "student" | "school"> | null>(
    null,
  );
  const registerHref = `/dashboard/register/${slug}`;

  return (
    <div className="max-w-2xl space-y-4">
      <div className="rounded-xl border border-accent/30 bg-accent-soft px-5 py-4">
        <p className="text-xs font-bold tracking-[0.14em] text-accent-strong uppercase">
          {isLoggedIn ? "You are logged in" : "Have an account"}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-foreground">
          {isLoggedIn
            ? "Register straight from your dashboard"
            : "Already have an account? Register straight from your dashboard."}
        </p>
        {isLoggedIn ? (
          <Link
            href={registerHref}
            className="mt-4 inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors duration-300 hover:bg-accent-strong hover:text-white"
          >
            Register for {title}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => openLogin({ next: registerHref })}
            className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors duration-300 hover:bg-accent-strong hover:text-white"
          >
            Register for {title}
          </button>
        )}
      </div>
      {!isLoggedIn ? (
        <div className="rounded-xl border border-accent/30 bg-surface px-5 py-4">
          <p className="text-xs font-bold tracking-[0.14em] text-accent-strong uppercase">New here</p>
          <p className="mt-2 text-sm leading-relaxed text-foreground">New here? Create an account first.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setRegisterModal("student")}
              className="inline-flex cursor-pointer items-center justify-center rounded-full border border-accent/30 bg-background px-5 py-2.5 text-sm font-semibold text-foreground hover:border-accent"
            >
              Create Student Account
            </button>
            <button
              type="button"
              onClick={() => setRegisterModal("school")}
              className="inline-flex cursor-pointer items-center justify-center rounded-full border border-accent/30 bg-background px-5 py-2.5 text-sm font-semibold text-foreground hover:border-accent"
            >
              Create School Account
            </button>
          </div>
        </div>
      ) : null}

      {!isLoggedIn && registerModal ? (
        <RegisterFormModal key={registerModal} kind={registerModal} onClose={() => setRegisterModal(null)} />
      ) : null}
    </div>
  );
}
