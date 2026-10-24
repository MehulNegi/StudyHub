"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import type { WorkspaceNote } from "@/lib/types";

export interface NoteCategory {
  key: string;
  label: string;
  count: number;
}

const UNCATEGORIZED = "";

function categoryKey(note: WorkspaceNote): string {
  return note.category?.trim().toLowerCase() ?? UNCATEGORIZED;
}

/** Categories derived from the notes themselves — no fixed list is assumed. */
export function noteCategories(notes: WorkspaceNote[]): NoteCategory[] {
  const byKey = new Map<string, NoteCategory>();
  for (const note of notes) {
    const key = categoryKey(note);
    const existing = byKey.get(key);
    if (existing) existing.count += 1;
    else byKey.set(key, { key, label: note.category?.trim() || "Uncategorized", count: 1 });
  }
  return [...byKey.values()].sort((a, b) =>
    a.key === UNCATEGORIZED ? 1 : b.key === UNCATEGORIZED ? -1 : a.label.localeCompare(b.label),
  );
}

export function filterNotes(notes: WorkspaceNote[], query: string, category: string | null): WorkspaceNote[] {
  const term = query.trim().toLowerCase();
  return notes.filter(
    (note) =>
      (category === null || categoryKey(note) === category) &&
      (!term || [note.title, note.content, note.category ?? ""].some((field) => field.toLowerCase().includes(term))),
  );
}

/**
 * Search state shared by the workspace sidebar and the Quick Notes library.
 * ⌘K / Ctrl+K focuses the attached input while it is on screen.
 */
export function useQuickNoteSearch(notes: WorkspaceNote[], category: string | null = null) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        // Only claim the shortcut while the input is actually on screen.
        if (!inputRef.current?.offsetParent) return;
        event.preventDefault();
        inputRef.current.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filtered = useMemo(() => filterNotes(notes, deferredQuery, category), [notes, deferredQuery, category]);

  return { query, setQuery, term: deferredQuery.trim(), filtered, inputRef };
}
