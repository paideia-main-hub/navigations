"use client";

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatedModal, ModalCloseButton, useAnimatedModalClose } from "@/ui/components/AnimatedModal";
import { LoginForm } from "@/ui/components/LoginForm";
import { ForgotPasswordForm } from "@/ui/components/ForgotPasswordForm";

export type OpenLoginOptions = {
  /** After login, redirect here (same-origin relative path). */
  next?: string;
};

type LoginModalContextValue = {
  openLogin: (options?: OpenLoginOptions) => void;
  closeLogin: () => void;
};

const LoginModalContext = createContext<LoginModalContextValue | null>(null);

export function useLoginModal() {
  const ctx = useContext(LoginModalContext);
  if (!ctx) {
    throw new Error("useLoginModal must be used within LoginModalProvider");
  }
  return ctx;
}

/** Dispatched by SupportChatFloat (outside the provider tree) to open login in place. */
export const OPEN_LOGIN_EVENT = "navigations:open-login";

export function LoginModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [nextPath, setNextPath] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);

  const openLogin = useCallback((options?: OpenLoginOptions) => {
    setNextPath(options?.next ?? null);
    setLinkError(null);
    setOpen(true);
  }, []);

  const closeLogin = useCallback(() => {
    setOpen(false);
    setNextPath(null);
    setLinkError(null);
  }, []);

  const openFromQuery = useCallback((next?: string | null, error?: string | null) => {
    setNextPath(next ?? null);
    setLinkError(error ?? null);
    setOpen(true);
  }, []);

  useEffect(() => {
    function onOpenLogin(event: Event) {
      const detail = (event as CustomEvent<OpenLoginOptions | undefined>).detail;
      openLogin(detail);
    }
    window.addEventListener(OPEN_LOGIN_EVENT, onOpenLogin);
    return () => window.removeEventListener(OPEN_LOGIN_EVENT, onOpenLogin);
  }, [openLogin]);

  const value = useMemo(() => ({ openLogin, closeLogin }), [openLogin, closeLogin]);

  return (
    <LoginModalContext.Provider value={value}>
      {children}
      <Suspense fallback={null}>
        <LoginQueryBridge onOpen={openFromQuery} />
      </Suspense>
      {open ? (
        <LoginModal
          key="login-modal"
          onClose={closeLogin}
          nextPath={nextPath}
          linkError={linkError}
        />
      ) : null}
    </LoginModalContext.Provider>
  );
}

/** Opens the login modal when landing on ?login=1 (used by /login redirects). */
function LoginQueryBridge({
  onOpen,
}: {
  onOpen: (next?: string | null, error?: string | null) => void;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("login") !== "1") return;
    onOpen(searchParams.get("next"), searchParams.get("error"));

    const params = new URLSearchParams(searchParams.toString());
    params.delete("login");
    params.delete("next");
    params.delete("error");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [searchParams, pathname, router, onOpen]);

  return null;
}

type ModalView = "login" | "forgot";

function LoginModal({
  onClose,
  nextPath,
  linkError,
}: {
  onClose: () => void;
  nextPath: string | null;
  linkError: string | null;
}) {
  const [view, setView] = useState<ModalView>("login");

  return (
    <AnimatedModal
      onClose={onClose}
      labelledBy="login-modal-title"
      panelClassName="max-h-[min(92vh,40rem)] max-w-md"
    >
      <LoginModalBody
        isForgot={view === "forgot"}
        onViewChange={setView}
        nextPath={nextPath}
        linkError={linkError}
      />
    </AnimatedModal>
  );
}

function LoginModalBody({
  isForgot,
  onViewChange,
  nextPath,
  linkError,
}: {
  isForgot: boolean;
  onViewChange: (view: ModalView) => void;
  nextPath: string | null;
  linkError: string | null;
}) {
  const requestClose = useAnimatedModalClose();

  return (
    <>
      <div className="relative shrink-0 bg-brand-deep px-5 py-5 sm:px-7 sm:py-6">
        <ModalCloseButton className="absolute top-4 right-4 bg-white/10 text-brand-deep-foreground hover:bg-white/20 hover:text-brand-deep-foreground sm:top-5 sm:right-5" />

        <p className="pr-12 text-xs font-black tracking-[0.16em] text-accent uppercase">
          {isForgot ? "Account recovery" : "Welcome back"}
        </p>
        <h2 id="login-modal-title" className="mt-2 pr-12 text-2xl font-black tracking-tight text-brand-deep-foreground">
          {isForgot ? "Forgot your password?" : "Log in"}
        </h2>
        <p className="mt-2 max-w-sm pr-4 text-sm leading-relaxed text-brand-deep-muted">
          {isForgot
            ? "Enter the email on your account and we will send you a link to set a new password."
            : "Students, school coordinators and judges sign in here."}
        </p>
      </div>

      <div className="overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
        <div key={isForgot ? "forgot" : "login"} className="animate-modal-swap-in">
          {isForgot ? (
            <>
              <ForgotPasswordForm />
              <p className="mt-6 text-center text-sm text-muted">
                <button
                  type="button"
                  onClick={() => onViewChange("login")}
                  className="cursor-pointer font-semibold text-accent transition-colors hover:text-accent-strong"
                >
                  Back to log in
                </button>
              </p>
            </>
          ) : (
            <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
              <LoginForm
                hideIntro
                nextPath={nextPath}
                linkError={linkError}
                onRegisterClick={requestClose}
                onForgotPasswordClick={() => onViewChange("forgot")}
              />
            </Suspense>
          )}
        </div>
      </div>
    </>
  );
}
