"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { MenuScroll } from "@/ui/components/MenuScroll";

export type StudentSelectOption = {
  id: string;
  name: string;
  grade: string | null;
  /** Extra status, such as already being on another team. */
  note?: string;
  disabled?: boolean;
};

function gradeLabel(grade: string | null): string {
  return grade ? `Grade ${grade}` : "";
}

function StudentColumns({ name, grade, note }: { name: string; grade: string | null; note?: string }) {
  return (
    <span className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_5.5rem] items-center gap-3 text-left">
      <span className="min-w-0">
        <span className="block truncate">{name}</span>
        {note ? <span className="block truncate text-xs font-normal text-muted">{note}</span> : null}
      </span>
      <span className="text-muted">{gradeLabel(grade)}</span>
    </span>
  );
}

const triggerClass =
  "relative box-border flex h-[38px] w-full cursor-pointer items-center rounded-lg border border-border bg-background pl-3 pr-10 text-left text-sm text-foreground outline-none focus:border-accent";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className={`pointer-events-none absolute top-0 right-3 bottom-0 my-auto h-3.5 w-3.5 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      fill="none"
    >
      <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-3.5 w-3.5">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function StudentOptions({
  visible,
  selectedIds,
  onToggle,
  onEdit,
}: {
  visible: StudentSelectOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onEdit?: (id: string) => void;
}) {
  if (visible.length === 0) {
    return <p className="px-3 py-2 text-sm text-muted">No matches</p>;
  }
  return (
    <ul>
      {visible.map((student) => {
        const checked = selectedIds.includes(student.id);
        return (
          <li key={student.id} role="presentation">
            <div className={`flex items-center gap-2 px-2 ${student.disabled ? "text-muted" : "text-foreground"}`}>
              <button
                type="button"
                role="option"
                aria-selected={checked}
                disabled={student.disabled}
                className={`menu-item flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-2 text-left text-sm ${
                  student.disabled ? "cursor-not-allowed" : "hover:bg-surface-muted"
                } ${checked ? "text-accent-strong" : ""}`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onToggle(student.id)}
              >
                <span
                  aria-hidden
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    checked ? "border-accent bg-accent text-accent-foreground" : "border-border bg-background"
                  }`}
                >
                  {checked ? (
                    <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none">
                      <path d="m3.5 8 3 3 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : null}
                </span>
                <StudentColumns name={student.name} grade={student.grade} note={student.note} />
              </button>
              {onEdit ? (
                <button
                  type="button"
                  aria-label={`Edit ${student.name}`}
                  className="menu-item inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted hover:bg-accent-soft hover:text-accent"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => onEdit(student.id)}
                >
                  <EditIcon />
                </button>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Searchable multi-select for students on a registration form.
 * `panel` keeps the list inline (modals). `dropdown` uses a compact trigger. */
export function StudentMultiSelect({
  students,
  selectedIds,
  onChange,
  ariaLabel,
  placeholder = "Search students",
  onEdit,
  variant = "dropdown",
}: {
  students: StudentSelectOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  ariaLabel: string;
  placeholder?: string;
  onEdit?: (id: string) => void;
  variant?: "dropdown" | "panel";
}) {
  const [open, setOpen] = useState(variant === "panel");
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const selected = students.filter((student) => selectedIds.includes(student.id));
  const triggerLabel = selected.length === 0 ? placeholder : selected.map((student) => student.name).join(", ");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return students;
    return students.filter((student) =>
      `${student.name} ${gradeLabel(student.grade)} ${student.note ?? ""}`.toLowerCase().includes(needle),
    );
  }, [students, query]);

  function closeMenu() {
    if (variant === "panel") {
      setQuery("");
      return;
    }
    setOpen(false);
    setQuery("");
  }

  useEffect(() => {
    if (!open || variant === "panel") return;
    searchRef.current?.focus();
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      setOpen(false);
      setQuery("");
    }
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      setQuery("");
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open, variant]);

  function toggle(id: string) {
    const option = students.find((student) => student.id === id);
    if (!option || option.disabled) return;
    onChange(selectedIds.includes(id) ? selectedIds.filter((item) => item !== id) : [...selectedIds, id]);
  }

  function editStudent(id: string) {
    closeMenu();
    onEdit?.(id);
  }

  const list = (
    <div
      id={listId}
      role="listbox"
      aria-multiselectable="true"
      aria-label={ariaLabel}
      className={
        variant === "panel"
          ? "flex max-h-52 flex-col overflow-hidden rounded-lg border border-border bg-background"
          : "absolute top-full right-0 left-0 z-20 mt-1.5 flex max-h-56 flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-[0_16px_40px_-20px_rgba(31,32,65,0.45)]"
      }
    >
      <div className="shrink-0 border-b border-border p-2">
        <input
          ref={searchRef}
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search students"
          aria-label="Search students"
          autoComplete="off"
          className="box-border h-[38px] w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-accent"
        />
      </div>
      <MenuScroll className="min-h-0 flex-1 py-1">
        <StudentOptions visible={visible} selectedIds={selectedIds} onToggle={toggle} onEdit={onEdit ? editStudent : undefined} />
      </MenuScroll>
      {variant === "dropdown" ? (
        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border px-3 py-2">
          <p className="text-xs text-muted">
            {selected.length === 0 ? "None selected" : `${selected.length} selected`}
          </p>
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={closeMenu}
            className="cursor-pointer rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground transition-colors duration-200 hover:bg-accent-strong hover:text-white"
          >
            Done
          </button>
        </div>
      ) : null}
    </div>
  );

  if (variant === "panel") {
    return (
      <div ref={rootRef} className="relative">
        {list}
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        onMouseDown={(event) => {
          event.preventDefault();
          if (open) closeMenu();
          else setOpen(true);
        }}
        className={triggerClass}
      >
        <span className={`block w-full min-w-0 truncate text-left ${selected.length === 0 ? "text-muted" : "text-foreground"}`}>
          {triggerLabel}
        </span>
        <Chevron open={open} />
      </button>
      {open ? list : null}
    </div>
  );
}
