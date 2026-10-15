"use client";

import { StudentRegisterForm } from "@/ui/components/registration/StudentRegisterForm";
import { SchoolRegisterForm } from "@/ui/components/registration/SchoolRegisterForm";
import { JudgeRegisterForm } from "@/ui/components/registration/JudgeRegisterForm";
import { NominatorRegisterForm } from "@/ui/components/registration/NominatorRegisterForm";
import { AnimatedModal, ModalCloseButton } from "@/ui/components/AnimatedModal";

export type RegisterModalKind = "student" | "school" | "judge" | "nominator";

const modalMeta: Record<
  RegisterModalKind,
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

function ModalForm({ kind }: { kind: RegisterModalKind }) {
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

export function RegisterFormModal({
  kind,
  onClose,
}: {
  kind: RegisterModalKind;
  onClose: () => void;
}) {
  const meta = modalMeta[kind];

  return (
    <AnimatedModal
      onClose={onClose}
      labelledBy="register-modal-title"
      panelClassName="max-h-[min(92vh,52rem)] max-w-lg"
    >
      <div className={`relative shrink-0 px-5 py-5 sm:px-7 sm:py-6 ${meta.headerClass}`}>
        <ModalCloseButton className="absolute top-4 right-4 bg-surface/80 shadow-sm hover:bg-surface sm:top-5 sm:right-5" />

        <p className={`pr-12 text-xs font-black tracking-[0.16em] uppercase ${meta.accentClass}`}>Register</p>
        <h2 id="register-modal-title" className="mt-2 pr-12 text-2xl font-black tracking-tight text-foreground">
          {meta.title}
        </h2>
        <p className="mt-2 max-w-sm pr-4 text-sm leading-relaxed text-muted">{meta.subtitle}</p>
      </div>

      <div className="overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
        <ModalForm kind={kind} />
      </div>
    </AnimatedModal>
  );
}
