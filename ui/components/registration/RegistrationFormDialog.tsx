"use client";

import type { ReactNode } from "react";
import { AnimatedModal, ModalCloseButton } from "@/ui/components/AnimatedModal";
import { MenuScroll } from "@/ui/components/MenuScroll";

/** Register / edit competition modal: branded sticky header, scrollable body only. */
export function RegistrationFormDialog({
  titleId,
  title,
  onClose,
  children,
}: {
  titleId: string;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <AnimatedModal
      onClose={onClose}
      labelledBy={titleId}
      panelClassName="flex max-h-[min(92vh,900px)] max-w-3xl flex-col overflow-hidden"
    >
      <div className="flex shrink-0 items-start justify-between gap-3 bg-brand-deep px-5 py-5 sm:px-6">
        <h2 id={titleId} className="min-w-0 pr-2 text-xl font-extrabold tracking-tight text-brand-deep-foreground sm:text-2xl">
          {title}
        </h2>
        <ModalCloseButton className="bg-white/10 text-brand-deep-foreground hover:bg-white/20 hover:text-brand-deep-foreground" />
      </div>
      <MenuScroll frameClassName="flex min-h-0 flex-1 flex-col" className="min-h-0 flex-1 p-5 sm:p-6">
        {children}
      </MenuScroll>
    </AnimatedModal>
  );
}
