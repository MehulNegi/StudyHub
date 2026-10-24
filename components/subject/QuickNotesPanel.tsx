"use client";

import Link from "next/link";
import { useMemo } from "react";
import { unitNumber } from "@/components/subject/ContentsPanel";
import NoteSearchField from "@/components/subject/NoteSearchField";
import QuickNoteCard from "@/components/subject/QuickNoteCard";
import { useQuickNoteSearch } from "@/components/subject/useQuickNoteSearch";
import Icon from "@/components/ui/Icon";
import Notice, { EmptyState, RLS_HINT } from "@/components/ui/Notice";
import type { DataSource, Loaded, SubjectConfig, WorkspaceNote, WorkspaceUnit } from "@/lib/types";

function LibraryLink({ subject, children }: { subject: SubjectConfig; children: string }) {
  return (
    <Link
      href={`/subjects/${subject.slug}/quick-notes`}
      className="mt-3 inline-block text-[12px] font-semibold text-primary hover:underline"
    >
      {children} →
    </Link>
  );
}

/** Contextual Quick Notes: only the notes linked to the currently selected unit (chapter). */
export default function QuickNotesPanel({
  subject,
  notes,
  unit,
  unitIndex,
  unitLinks,
  hasUnits,
  source,
  className = "",
}: {
  subject: SubjectConfig;
  notes: Loaded<WorkspaceNote[]>;
  unit: WorkspaceUnit | null;
  unitIndex: number;
  /** False until `quick_notes.unit_id` exists — notes cannot be matched to chapters yet. */
  unitLinks: boolean;
  /** Whether the subject has any units to choose from. */
  hasUnits: boolean;
  source: DataSource;
  className?: string;
}) {
  const allNotes = useMemo(() => (notes.status === "ok" ? notes.data : []), [notes]);
  const chapterNotes = useMemo(
    () => (unit && unitLinks ? allNotes.filter((note) => note.unitKey === unit.key) : []),
    [allNotes, unit, unitLinks],
  );
  const { query, setQuery, term, filtered, inputRef } = useQuickNoteSearch(chapterNotes);
  const chapter = unit ? `Unit ${unitNumber(unit, unitIndex)}` : null;
  // notesNoun is plural ("commands", "formulas", …); use the singular for exactly one.
  const noun = (count: number) => (count === 1 ? subject.notesNoun.replace(/s$/, "") : subject.notesNoun);

  let body;
  if (notes.status === "error") {
    body = (
      <Notice tone="error" title="Quick notes could not be loaded">
        {notes.message}
      </Notice>
    );
  } else if (!unitLinks && allNotes.length > 0) {
    body = (
      <EmptyState title="Chapter notes are not set up yet">
        Quick notes are not linked to chapters yet (quick_notes has no unit_id column), so none are shown per
        chapter. All {allNotes.length} {subject.notesNoun} are in the library.
        <br />
        <LibraryLink subject={subject}>Open Quick Notes library</LibraryLink>
      </EmptyState>
    );
  } else if (!unit && hasUnits) {
    body = <EmptyState title="Select a chapter">Choose a unit in Contents to see its quick notes.</EmptyState>;
  } else if (!unit) {
    body = (
      <EmptyState title={`No ${subject.notesNoun} yet`}>
        {source === "supabase" ? RLS_HINT : "Chapter notes appear here once this subject has units."}
      </EmptyState>
    );
  } else if (unit && chapterNotes.length === 0) {
    const elsewhere = allNotes.length;
    body = (
      <EmptyState title={`No ${subject.notesNoun} for ${chapter}`}>
        Notes linked to {unit.title} will appear here.
        {elsewhere > 0 && (
          <>
            <br />
            <LibraryLink subject={subject}>{`Browse all ${elsewhere} in the library`}</LibraryLink>
          </>
        )}
      </EmptyState>
    );
  } else if (filtered.length === 0) {
    body = <EmptyState title="No matches">Nothing in {chapter} matches “{term}”.</EmptyState>;
  } else {
    body = (
      <ul className="flex flex-col gap-2">
        {filtered.map((note) => (
          <li key={note.key}>
            <QuickNoteCard note={note} format={subject.noteFormat} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section
      aria-label="Quick notes"
      className={`min-h-0 flex-col border-line bg-surface md:border-r ${className}`}
    >
      <div className="flex h-11 shrink-0 items-center gap-3 border-b border-line bg-raised px-3.5">
        <Icon name="window-controls" />
        <h2 className="flex-1 truncate text-center font-mono text-[10px] font-medium text-muted">
          {subject.code} — Quick Reference
        </h2>
        <span className="w-11" aria-hidden />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 p-4">
        <NoteSearchField
          inputRef={inputRef}
          value={query}
          onChange={setQuery}
          label={chapter ? `Search ${subject.notesNoun} in ${chapter}` : `Search ${subject.notesNoun}`}
          placeholder={`Search ${subject.notesNoun}...`}
          disabled={chapterNotes.length === 0}
        />

        <div className="-mr-2 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-2">{body}</div>

        <p className="flex shrink-0 items-center gap-2 font-mono text-[10px] text-subtle" aria-live="polite">
          <span className="text-prompt">$</span>
          {query.trim() && chapterNotes.length > 0
            ? `${filtered.length} of ${chapterNotes.length} ${noun(chapterNotes.length)}`
            : `${chapterNotes.length} ${noun(chapterNotes.length)}`}
          {chapter && ` · ${chapter.toLowerCase()}`}
          {" · "}
          {source === "preview" ? "preview data" : "supabase"}
        </p>
      </div>
    </section>
  );
}
