"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import Icon, { type IconName } from "@/components/ui/Icon";
import Notice, { EmptyState, RLS_HINT } from "@/components/ui/Notice";
import { unitNumber } from "@/components/subject/ContentsPanel";
import type { DataSource, Loaded, WorkspaceDocument, WorkspaceUnit } from "@/lib/types";

const PdfDocument = dynamic(() => import("@/components/subject/PdfDocument"), {
  ssr: false,
  loading: () => <p className="px-6 py-16 text-center text-[12px] text-subtle">Loading viewer…</p>,
});

const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const BASE_PAGE_WIDTH = 560;

function ToolButton({
  icon,
  label,
  onClick,
  disabled,
  bordered = false,
  pressed,
}: {
  icon: IconName;
  label: string;
  onClick: () => void;
  disabled: boolean;
  bordered?: boolean;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center rounded-[4px] hover:bg-raised disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent ${
        bordered ? `size-7 border ${pressed ? "border-primary bg-raised" : "border-line"}` : "size-[26px]"
      }`}
    >
      <Icon name={icon} />
    </button>
  );
}

function formatDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

async function findPages(pdf: PDFDocumentProxy, term: string): Promise<number[]> {
  const needle = term.toLowerCase();
  const pages: number[] = [];
  for (let number = 1; number <= pdf.numPages; number += 1) {
    const page = await pdf.getPage(number);
    const content = await page.getTextContent();
    const text = content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
    if (text.toLowerCase().includes(needle)) pages.push(number);
  }
  return pages;
}

export default function DocumentViewer({
  unit,
  unitIndex,
  units,
  source,
  documentsError,
  className = "",
}: {
  unit: WorkspaceUnit | null;
  unitIndex: number;
  units: Loaded<WorkspaceUnit[]>;
  source: DataSource;
  documentsError: string | null;
  className?: string;
}) {
  const documents = unit?.documents ?? [];
  const [documentKey, setDocumentKey] = useState(documents[0]?.key ?? null);
  const active: WorkspaceDocument | null = documents.find((doc) => doc.key === documentKey) ?? documents[0] ?? null;

  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [zoomIndex, setZoomIndex] = useState(ZOOM_STEPS.indexOf(1));
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [search, setSearch] = useState<{ term: string; pages: number[]; index: number } | null>(null);
  const [searching, setSearching] = useState(false);
  const [canvasRef, canvasWidth] = useElementWidth<HTMLDivElement>();

  const numPages = pdf?.numPages ?? active?.pageCount ?? null;
  const ready = !!pdf;
  const zoom = ZOOM_STEPS[zoomIndex];
  const pageWidth = Math.max(240, Math.min(BASE_PAGE_WIDTH, canvasWidth - 48)) * zoom;

  function selectDocument(key: string) {
    setDocumentKey(key);
    setPdf(null);
    setLoadError(null);
    setPage(1);
    setSearch(null);
  }

  async function runSearch(event: FormEvent) {
    event.preventDefault();
    const term = searchTerm.trim();
    if (!pdf || !term) return;
    if (search && search.term === term && search.pages.length > 0) {
      const index = (search.index + 1) % search.pages.length;
      setSearch({ ...search, index });
      setPage(search.pages[index]);
      return;
    }
    setSearching(true);
    try {
      const pages = await findPages(pdf, term);
      setSearch({ term, pages, index: 0 });
      if (pages.length) setPage(pages[0]);
    } finally {
      setSearching(false);
    }
  }

  let body: ReactNode;
  if (units.status === "error") {
    body = (
      <div className="w-full max-w-md p-6">
        <Notice tone="error" title="Lecture notes could not be loaded">
          {units.message}
        </Notice>
      </div>
    );
  } else if (!unit) {
    body = (
      <EmptyState title="No lecture notes yet">
        {source === "supabase" ? RLS_HINT : "Add units to this subject to attach lecture documents."}
      </EmptyState>
    );
  } else if (documentsError) {
    body = (
      <div className="w-full max-w-md p-6">
        <Notice tone="error" title="Documents could not be loaded">
          {documentsError}
        </Notice>
      </div>
    );
  } else if (!active) {
    body = (
      <EmptyState title={`No lecture notes for Unit ${unitNumber(unit, unitIndex)}`}>
        No PDF has been added to this unit. Uploading documents is not available in StudyHub yet.
      </EmptyState>
    );
  } else if (!active.url) {
    body = (
      <EmptyState title="This document could not be opened">
        Storage did not return a signed link{active.urlError ? `: ${active.urlError}.` : "."} Private documents
        may require signing in.
      </EmptyState>
    );
  } else if (loadError) {
    body = <EmptyState title="This document could not be displayed">{loadError}</EmptyState>;
  } else {
    body = (
      <PdfDocument
        url={active.url}
        pageNumber={page}
        width={pageWidth}
        highlight={search?.term ?? ""}
        onLoad={(loaded) => {
          setPdf(loaded);
          setPage((current) => Math.min(current, loaded.numPages));
        }}
        onError={setLoadError}
      />
    );
  }

  const meta = active
    ? [
        unit && `Unit ${unitNumber(unit, unitIndex)}`,
        numPages && `${numPages} ${numPages === 1 ? "page" : "pages"}`,
        formatDate(active.updatedAt) && `Updated ${formatDate(active.updatedAt)}`,
      ].filter(Boolean)
    : [];

  return (
    <section aria-label="Lecture notes" className={`min-h-[70vh] flex-col bg-canvas md:min-h-0 xl:border-r xl:border-line ${className}`}>
      <div className="flex min-h-[52px] shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line bg-surface px-4 py-2">
        <div className="flex min-w-0 flex-1 basis-48 items-center gap-2.5">
          <Icon name="file-text" />
          <div className="flex min-w-0 flex-col">
            {documents.length > 1 ? (
              <label className="min-w-0">
                <span className="sr-only">Lecture document</span>
                <select
                  value={active?.key}
                  onChange={(event) => selectDocument(event.target.value)}
                  className="w-full truncate rounded-[4px] border border-line bg-canvas py-0.5 pr-6 pl-1.5 text-[13px] text-fg"
                >
                  {documents.map((doc) => (
                    <option key={doc.key} value={doc.key}>
                      {doc.title}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <h2 className="truncate text-[13px] text-fg">{active?.title ?? "Lecture Notes"}</h2>
            )}
            {meta.length > 0 && <p className="truncate font-mono text-[10px] text-subtle">{meta.join(" · ")}</p>}
          </div>
        </div>

        <div className="flex items-center gap-1.5" role="group" aria-label="Page navigation">
          <ToolButton
            icon="chevron-left"
            label="Previous page"
            disabled={!ready || page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          />
          <span className="rounded-[4px] border border-line px-2 py-[5px] font-mono text-[10px] text-muted" aria-live="polite">
            {ready ? `${page} / ${numPages}` : "– / –"}
          </span>
          <ToolButton
            icon="chevron-right"
            label="Next page"
            disabled={!ready || page >= (numPages ?? 1)}
            onClick={() => setPage((current) => Math.min(numPages ?? current, current + 1))}
          />
        </div>

        <div className="flex flex-1 items-center justify-end gap-1.5" role="group" aria-label="View controls">
          <ToolButton
            icon="minus"
            label="Zoom out"
            disabled={!ready || zoomIndex === 0}
            onClick={() => setZoomIndex((index) => Math.max(0, index - 1))}
          />
          <span className="w-9 text-center font-mono text-[10px] text-muted">{Math.round(zoom * 100)}%</span>
          <ToolButton
            icon="plus"
            label="Zoom in"
            disabled={!ready || zoomIndex === ZOOM_STEPS.length - 1}
            onClick={() => setZoomIndex((index) => Math.min(ZOOM_STEPS.length - 1, index + 1))}
          />
          <ToolButton
            icon="search-toolbar"
            label="Search document"
            bordered
            pressed={searchOpen}
            disabled={!ready}
            onClick={() => setSearchOpen((open) => !open)}
          />
        </div>
      </div>

      {searchOpen && ready && (
        <form onSubmit={runSearch} className="flex shrink-0 items-center gap-2 border-b border-line bg-surface px-4 py-2">
          <label className="flex h-8 flex-1 items-center gap-2 rounded-[6px] border border-line bg-canvas px-2.5 focus-within:border-primary">
            <Icon name="search" />
            <span className="sr-only">Search in document</span>
            <input
              autoFocus
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Find in document…"
              className="min-w-0 flex-1 bg-transparent text-[12px] text-fg outline-none placeholder:text-subtle"
            />
          </label>
          <span className="min-w-28 text-right font-mono text-[10px] text-subtle" aria-live="polite">
            {searching
              ? "Searching…"
              : search
                ? search.pages.length
                  ? `Match ${search.index + 1} of ${search.pages.length} ${search.pages.length === 1 ? "page" : "pages"}`
                  : "No matches"
                : "Enter to search"}
          </span>
        </form>
      )}

      <div
        ref={canvasRef}
        className="flex min-h-0 flex-1 flex-col items-center overflow-auto bg-document px-6 py-7 [&>*]:my-auto"
      >
        {body}
      </div>
    </section>
  );
}
