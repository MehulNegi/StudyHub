"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import type { NoteFormat, WorkspaceNote } from "@/lib/types";

type CopyState = "idle" | "copied" | "failed";

/** `sidebar`: the workspace's contextual list. `library`: the subject-wide Quick Notes page. */
export type QuickNoteCardVariant = "sidebar" | "library";

const CONTENT_STYLES: Record<Exclude<NoteFormat, "text">, string> = {
  command: "text-terminal font-semibold",
  formula: "text-fg",
  code: "text-fg",
};

// Library cards cap long content so one snippet cannot dominate the grid.
const LIBRARY_CLAMP = "max-h-[13.5rem] overflow-hidden";

export default function QuickNoteCard({
  note,
  format,
  variant = "sidebar",
  context,
}: {
  note: WorkspaceNote;
  format: NoteFormat;
  variant?: QuickNoteCardVariant;
  /** Optional chapter label shown beside the category (used by the library). */
  context?: string | null;
}) {
  const library = variant === "library";
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const contentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (copyState === "idle") return;
    const timer = setTimeout(() => setCopyState("idle"), 1800);
    return () => clearTimeout(timer);
  }, [copyState]);

  useLayoutEffect(() => {
    const element = contentRef.current;
    if (!library || !element || expanded) return;
    const measure = () => setOverflows(element.scrollHeight > element.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [library, expanded, note.content]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(note.content);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  const clamp = library && !expanded ? LIBRARY_CLAMP : "";

  return (
    <article className={`flex flex-col gap-2.5 rounded-[6px] border border-line bg-inset ${library ? "p-4" : "p-3"}`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 flex-1 pt-1 text-[13px] leading-[1.35] font-semibold text-fg">{note.title}</h3>
        <button
          type="button"
          onClick={copy}
          aria-label={`Copy “${note.title}”`}
          className={`flex shrink-0 items-center justify-center gap-1 rounded-[4px] border border-line px-1.5 hover:border-line-strong hover:bg-raised ${
            library ? "h-9 min-w-9 sm:h-7 sm:min-w-7" : "h-6 min-w-[26px]"
          }`}
        >
          {copyState === "idle" ? (
            <Icon name="copy" />
          ) : (
            <span className={`font-mono text-[10px] ${copyState === "copied" ? "text-completed" : "text-struggling"}`}>
              {copyState === "copied" ? "Copied" : "Failed"}
            </span>
          )}
        </button>
      </div>

      {format === "text" ? (
        <p
          ref={(element) => {
            contentRef.current = element;
          }}
          className={`text-[12px] leading-[1.45] whitespace-pre-line text-muted ${clamp}`}
        >
          {note.content}
        </p>
      ) : (
        <pre
          ref={(element) => {
            contentRef.current = element;
          }}
          className={`overflow-x-auto rounded-[4px] border border-line bg-canvas px-2.5 py-2 font-mono text-[12px] leading-[1.55] ${CONTENT_STYLES[format]} ${clamp}`}
        >
          <code>{note.content}</code>
        </pre>
      )}

      {library && (overflows || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          aria-expanded={expanded}
          className="self-start py-1 font-mono text-[10px] text-muted hover:text-fg"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}

      {(note.category || context) && (
        <p className="font-mono text-[10px] text-subtle uppercase">
          {[note.category, context].filter(Boolean).join(" · ")}
        </p>
      )}

      <span className="sr-only" aria-live="polite">
        {copyState === "copied" ? "Copied to clipboard" : copyState === "failed" ? "Copy failed" : ""}
      </span>
    </article>
  );
}
