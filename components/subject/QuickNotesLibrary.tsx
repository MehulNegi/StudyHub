"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import NoteSearchField from "@/components/subject/NoteSearchField";
import QuickNoteCard from "@/components/subject/QuickNoteCard";
import { noteCategories, useQuickNoteSearch } from "@/components/subject/useQuickNoteSearch";
import Notice, { EmptyState, RLS_HINT } from "@/components/ui/Notice";
import type { QuickNotesData, SubjectConfig, WorkspaceNote } from "@/lib/types";

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex h-8 shrink-0 items-center gap-2 rounded-[6px] border px-3 text-[12px] whitespace-nowrap ${
        active
          ? "border-primary bg-raised font-semibold text-fg"
          : "border-line text-muted hover:border-line-strong hover:text-fg"
      }`}
    >
      {label}
      <span className={`font-mono text-[10px] ${active ? "text-muted" : "text-subtle"}`}>{count}</span>
    </button>
  );
}

const ALL_CHAPTERS = "__all__";
const SUBJECT_WIDE = "__subject__";
/** ALL_CHAPTERS, SUBJECT_WIDE (notes with no unit), or a unit key. */
type Scope = string;

function filterByScope(notes: WorkspaceNote[], scope: Scope): WorkspaceNote[] {
  if (scope === ALL_CHAPTERS) return notes;
  if (scope === SUBJECT_WIDE) return notes.filter((note) => note.unitKey === null);
  return notes.filter((note) => note.unitKey === scope);
}

/** Subject-wide Quick Notes reference library (every note for the subject, regardless of unit). */
export default function QuickNotesLibrary({ subject, data }: { subject: SubjectConfig; data: QuickNotesData }) {
  const { notes, source, noteUnitLinks, units } = data;
  const allNotes = useMemo(() => (notes.status === "ok" ? notes.data : []), [notes]);
  const [scope, setScope] = useState<Scope>(ALL_CHAPTERS);
  const scopedNotes = useMemo(() => filterByScope(allNotes, scope), [allNotes, scope]);
  const categories = useMemo(() => noteCategories(scopedNotes), [scopedNotes]);
  const [selectedCategory, setCategory] = useState<string | null>(null);
  // A category chosen in another chapter may not exist in this one; fall back to "All".
  const category = categories.some((item) => item.key === selectedCategory) ? selectedCategory : null;
  const { query, setQuery, term, filtered, inputRef } = useQuickNoteSearch(scopedNotes, category);

  const unitLabels = useMemo(() => new Map(units.map((unit) => [unit.key, unit.label])), [units]);
  const noteContext = (note: WorkspaceNote) => {
    if (!noteUnitLinks) return null;
    if (!note.unitKey) return "General";
    // A unit_id that is not one of this subject's units is a data error, not a chapter of this subject.
    return unitLabels.get(note.unitKey) ?? (units.length > 0 ? "Chapter not in this subject" : "Chapter note");
  };
  const scopeOptions = useMemo(
    () => [
      { value: ALL_CHAPTERS, label: "All chapters", count: allNotes.length },
      { value: SUBJECT_WIDE, label: "General (subject-wide)", count: filterByScope(allNotes, SUBJECT_WIDE).length },
      ...units.map((unit) => ({ value: unit.key, label: unit.label, count: filterByScope(allNotes, unit.key).length })),
    ],
    [allNotes, units],
  );

  const activeCategory = categories.find((item) => item.key === category);
  const activeScope = scope === ALL_CHAPTERS ? null : scopeOptions.find((option) => option.value === scope);
  const filteredOut = allNotes.length > 0 && filtered.length === 0;

  return (
    <div className="flex w-full flex-col gap-8 px-4 pt-8 pb-16 sm:px-6 lg:px-12 lg:pt-10">
      <header className="flex flex-col gap-5">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-subtle">
            <li>
              <Link href="/subjects" className="hover:text-fg">
                Subjects
              </Link>
            </li>
            <li aria-hidden className="text-line-strong">
              /
            </li>
            <li>
              <Link href={`/subjects/${subject.slug}`} className="hover:text-fg">
                {subject.code} workspace
              </Link>
            </li>
            <li aria-hidden className="text-line-strong">
              /
            </li>
            <li aria-current="page" className="text-muted">
              Quick Notes
            </li>
          </ol>
        </nav>

        <div className="flex flex-col gap-2">
          <span className="flex items-center gap-2">
            <span aria-hidden className="h-4 w-[3px] rounded-[4px]" style={{ backgroundColor: subject.accent }} />
            <span className="font-mono text-[12px] font-semibold" style={{ color: subject.accent }}>
              {subject.code}
            </span>
            <span className="text-[12px] text-subtle">{subject.name}</span>
          </span>
          <h1 className="text-[28px] text-fg sm:text-[32px]">Quick Notes</h1>
          <p className="max-w-2xl text-[14px] leading-[1.5] text-muted">
            Formulas, commands, definitions, and useful references for this subject — from every unit.
          </p>
        </div>
      </header>

      {notes.status === "error" ? (
        <Notice tone="error" title="Quick notes could not be loaded">
          Supabase returned an error: {notes.message}
        </Notice>
      ) : allNotes.length === 0 ? (
        <div className="rounded-[8px] border border-line bg-surface">
          <EmptyState title="No quick notes yet">
            <p>Your formulas, commands, definitions, and references for this subject will appear here.</p>
            {source === "supabase" && <p className="mt-2">{RLS_HINT}</p>}
          </EmptyState>
        </div>
      ) : (
        <section aria-label={`${subject.code} quick notes`} className="flex flex-col gap-5">
          {source === "supabase" && !noteUnitLinks && (
            <Notice title="Notes are not linked to chapters yet">
              quick_notes has no unit_id column, so every note is shown as a subject-wide note and chapter
              filtering is unavailable.
            </Notice>
          )}
          <div className="sticky top-[65px] z-10 -mx-4 flex flex-col gap-3 border-b border-line bg-canvas px-4 pt-1 pb-4 sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0">
            <div className="flex max-w-4xl flex-col gap-3 sm:flex-row">
              <div className="min-w-0 flex-1">
                <NoteSearchField
                  size="library"
                  inputRef={inputRef}
                  value={query}
                  onChange={setQuery}
                  label="Search quick notes"
                  placeholder="Search quick notes..."
                  disabled={false}
                />
              </div>
              {noteUnitLinks && (
                <label className="flex h-11 shrink-0 items-center gap-2 rounded-[6px] border border-line bg-canvas pl-3.5 focus-within:border-primary sm:w-72">
                  <span className="font-mono text-[10px] text-subtle uppercase">Chapter</span>
                  <select
                    value={scope}
                    onChange={(event) => setScope(event.target.value)}
                    className="h-full min-w-0 flex-1 cursor-pointer truncate bg-transparent pr-2 text-[13px] text-fg outline-none"
                  >
                    {scopeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} ({option.count})
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
            {categories.length > 1 && (
              <div
                role="group"
                aria-label="Filter by category"
                className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0"
              >
                <FilterChip
                  label="All"
                  count={scopedNotes.length}
                  active={category === null}
                  onClick={() => setCategory(null)}
                />
                {categories.map((item) => (
                  <FilterChip
                    key={item.key}
                    label={item.label}
                    count={item.count}
                    active={category === item.key}
                    onClick={() => setCategory(category === item.key ? null : item.key)}
                  />
                ))}
              </div>
            )}
          </div>

          <p className="font-mono text-[10px] text-subtle" aria-live="polite">
            <span className="text-prompt">$ </span>
            {filtered.length === allNotes.length
              ? `${allNotes.length} ${allNotes.length === 1 ? "note" : "notes"}`
              : `${filtered.length} of ${allNotes.length} notes`}
            {activeScope && ` · ${activeScope.label}`}
            {activeCategory && ` · ${activeCategory.label}`}
            {term && ` · “${term}”`}
            {" · "}
            {source === "preview" ? "preview data" : "supabase"}
          </p>

          {filteredOut ? (
            <div className="rounded-[8px] border border-line bg-surface">
              <EmptyState title="No matching notes">
                <p>
                  {term || activeCategory
                    ? `Nothing matches${term ? ` “${term}”` : ""}${activeCategory ? ` in ${activeCategory.label}` : ""}${activeScope ? ` for ${activeScope.label}` : ""}.`
                    : `There are no notes for ${activeScope?.label ?? "this selection"} yet.`}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setCategory(null);
                    setScope(ALL_CHAPTERS);
                  }}
                  className="mt-3 rounded-[6px] border border-line-strong bg-raised px-3.5 py-2 text-[12px] font-semibold text-fg hover:border-primary"
                >
                  Clear search and filters
                </button>
              </EmptyState>
            </div>
          ) : (
            <ul className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((note) => (
                <li key={note.key}>
                  <QuickNoteCard note={note} format={subject.noteFormat} variant="library" context={noteContext(note)} />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
