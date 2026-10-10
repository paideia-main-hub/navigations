"use client";

import { useActionState, useCallback, useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { addStudentAction, updateSchoolStudentAction, type ActionState } from "@/domain/students/actions";
import type { StudentProfile } from "@/domain/students/types";
import { AnimatedModal, useAnimatedModalClose } from "@/ui/components/AnimatedModal";
import { FormField } from "@/ui/components/FormField";
import { SelectField } from "@/ui/components/SelectField";
import { UploadProgress, useFileFormProgress } from "@/ui/components/UploadProgress";

const initialState: ActionState = { error: null };
const today = new Date().toISOString().slice(0, 10);

export function AddStudentForm({
  student,
  onClose,
}: {
  student?: StudentProfile;
  onClose?: () => void;
} = {}) {
  const editing = Boolean(student);
  const [open, setOpen] = useState(editing);
  const [state, formAction, pending] = useActionState(editing ? updateSchoolStudentAction : addStudentAction, initialState);
  const { onSubmitCapture, progress } = useFileFormProgress(pending);
  const formRef = useRef<HTMLFormElement>(null);
  const readerRef = useRef<FileReader | null>(null);
  const [photoProgress, setPhotoProgress] = useState<number | null>(null);
  const [gender, setGender] = useState(student?.gender === "male" || student?.gender === "female" ? student.gender : "");
  const titleId = useId();
  const closeModal = useRef<() => void>(() => {});

  function clearPhotoProgress() {
    readerRef.current?.abort();
    readerRef.current = null;
    setPhotoProgress(null);
  }

  const dismiss = useCallback(() => {
    readerRef.current?.abort();
    readerRef.current = null;
    setPhotoProgress(null);
    if (editing) {
      onClose?.();
      return;
    }
    setGender("");
    setOpen(false);
    formRef.current?.reset();
  }, [editing, onClose]);

  function onPhotoChange(event: ChangeEvent<HTMLInputElement>) {
    clearPhotoProgress();
    const file = event.target.files?.[0];
    if (!file || file.size === 0) return;

    const reader = new FileReader();
    readerRef.current = reader;
    setPhotoProgress(0);
    reader.onprogress = (progressEvent) => {
      if (!progressEvent.lengthComputable || progressEvent.total === 0) return;
      setPhotoProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
    };
    reader.onload = () => setPhotoProgress(100);
    reader.onerror = () => setPhotoProgress(null);
    reader.readAsArrayBuffer(file);
  }

  useEffect(() => {
    if (!state.success) return;
    closeModal.current();
  }, [state.success]);

  useEffect(() => () => readerRef.current?.abort(), []);

  return (
    <>
      {editing ? null : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="cursor-pointer rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
        >
          + Add student
        </button>
      )}

      {open
        ? createPortal(
            <AnimatedModal
              onClose={dismiss}
              labelledBy={titleId}
              panelClassName="max-h-[min(92vh,860px)] max-w-2xl"
            >
              <form
                ref={formRef}
                action={formAction}
                onSubmitCapture={onSubmitCapture}
                className="max-h-[min(92vh,860px)] space-y-3 overflow-y-auto p-5 text-left"
              >
            <h3 id={titleId} className="text-lg font-extrabold tracking-tight text-foreground">
              {editing ? "Edit student" : "Add student"}
            </h3>
            {editing ? <input type="hidden" name="student_id" value={student?.id} /> : null}
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Full name" name="full_name" required defaultValue={student?.fullName ?? ""} />
              <FormField label="Grade / class" name="grade" defaultValue={student?.grade ?? ""} />
              <FormField label="Date of birth" name="date_of_birth" type="date" max={today} defaultValue={student?.dateOfBirth?.slice(0, 10) ?? ""} />
              <div>
                <label className="text-sm font-medium text-foreground">Gender</label>
                <SelectField
                  name="gender"
                  label="Gender"
                  placeholder="Select gender"
                  className="mt-1"
                  value={gender}
                  onValueChange={setGender}
                  options={[
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                  ]}
                />
              </div>
              <FormField label="Guardian name" name="guardian_name" defaultValue={student?.guardianName ?? ""} />
              <FormField label="Guardian relationship" name="guardian_relationship" defaultValue={student?.guardianRelationship ?? ""} />
              <FormField label="Guardian email" name="guardian_email" type="email" defaultValue={student?.guardianEmail ?? ""} />
              <FormField label="Guardian mobile" name="guardian_mobile" type="tel" defaultValue={student?.guardianMobile ?? ""} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Profile photo</label>
              <input
                type="file"
                name="photo"
                accept="image/*"
                onChange={onPhotoChange}
                className="student-photo-file mt-1 block w-full cursor-pointer rounded-lg border border-border bg-background px-1.5 text-sm text-foreground outline-none file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-accent-soft file:px-3 file:text-sm file:font-semibold file:text-accent-strong hover:file:bg-accent-soft/80 focus:border-accent"
              />
              {progress ? (
                <div className="mt-2">
                  <UploadProgress phase={progress.phase} percent={progress.percent} uploadingLabel="Uploading photo…" savingLabel="Saving photo…" />
                </div>
              ) : photoProgress != null ? (
                <div className="mt-2">
                  <UploadProgress
                    phase="uploading"
                    percent={photoProgress}
                    uploadingLabel={photoProgress >= 100 ? "Photo ready" : "Preparing photo…"}
                  />
                </div>
              ) : null}
              <p className="mt-1 text-xs text-muted">Used on this student&apos;s certificate and, if they win, on the public results page.</p>
            </div>
            {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
            <div className="flex gap-3">
              <ModalCancel closeModal={closeModal} />
              <button
                type="submit"
                disabled={pending}
                className="cursor-pointer rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? "Saving…" : editing ? "Save changes" : "Add student"}
              </button>
            </div>
              </form>
            </AnimatedModal>,
            document.body,
          )
        : null}
    </>
  );
}

function ModalCancel({ closeModal }: { closeModal: { current: () => void } }) {
  const requestClose = useAnimatedModalClose();

  useEffect(() => {
    closeModal.current = requestClose;
  }, [closeModal, requestClose]);

  return (
    <button
      type="button"
      onClick={requestClose}
      className="cursor-pointer rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground"
    >
      Cancel
    </button>
  );
}
