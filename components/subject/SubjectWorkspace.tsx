"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ContentsPanel from "@/components/subject/ContentsPanel";
import DocumentViewer from "@/components/subject/DocumentViewer";
import QuickNotesPanel from "@/components/subject/QuickNotesPanel";
import { accentArrowIcon } from "@/lib/subjects";
import type { SubjectConfig, WorkspaceData, WorkspaceUnit } from "@/lib/types";

type Pane = "notes" | "lecture" | "contents";

const PANES: { id: Pane; label: string }[] = [
  { id: "notes", label: "Quick Notes" },
  { id: "lecture", label: "Lecture Notes" },
  { id: "contents", label: "Contents" },
];

function initialUnit(units: WorkspaceUnit[]): string | null {
  return (units.find((unit) => unit.documents.length > 0) ?? units[0])?.key ?? null;
}

/**
 * Three-pane subject workspace.
 * - xl and up: Quick Notes | Lecture Notes | Contents, side by side.
 * - md to xl: Lecture Notes stays visible; the side column switches between Quick Notes and Contents.
 * - below md: one pane at a time, chosen from the pane switcher.
 */
export default function SubjectWorkspace({ subject, data }: { subject: SubjectConfig; data: WorkspaceData }) {
  const units = data.units.status === "ok" ? data.units.data : [];
  const [selectedKey, setSelectedKey] = useState(() => initialUnit(units));
  const [pane, setPane] = useState<Pane>("lecture");

  const selectedIndex = units.findIndex((unit) => unit.key === selectedKey);
  const selectedUnit = units[selectedIndex] ?? null;
  // At md–xl the side column shows Contents only when chosen; otherwise Quick Notes.
  const sidePane: Pane = pane === "contents" ? "contents" : "notes";

  function selectUnit(key: string) {
    setSelectedKey(key);
    if (window.matchMedia("(max-width: 767px)").matches) setPane("lecture");
  }

  const isActiveTab = (id: Pane) =>
    `${pane === id ? "border-primary text-fg font-semibold" : "border-transparent text-subtle"} ${
      sidePane === id ? "md:border-primary md:text-fg md:font-semibold" : "md:border-transparent md:text-subtle md:font-normal"
    }`;

  return (
    <div className="flex flex-1 flex-col md:h-[calc(100dvh-var(--chrome-height))] md:flex-none md:overflow-hidden">
      <div className="flex shrink-0 border-b border-line bg-surface px-2 xl:hidden" aria-label="Workspace panes" role="group">
        {PANES.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setPane(id)}
            aria-pressed={pane === id}
            className={`h-11 border-b px-3 text-[12px] hover:text-muted ${id === "lecture" ? "md:hidden" : ""} ${isActiveTab(id)}`}
          >
            {label}
          </button>
        ))}
        <Link
          href={`/subjects/${subject.slug}/quick-notes`}
          className="ml-auto hidden h-11 items-center gap-1.5 px-3 text-[12px] whitespace-nowrap text-subtle hover:text-fg lg:flex"
        >
          All quick notes
          <Image src={accentArrowIcon(subject.slug)} width={12} height={12} alt="" aria-hidden />
        </Link>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-rows-[minmax(0,1fr)] md:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[330px_minmax(0,1fr)_360px]">
        <QuickNotesPanel
          subject={subject}
          notes={data.notes}
          unit={selectedUnit}
          unitIndex={selectedIndex}
          unitLinks={data.noteUnitLinks}
          hasUnits={units.length > 0}
          source={data.source}
          className={`${pane === "notes" ? "flex" : "hidden"} ${sidePane === "notes" ? "md:flex" : "md:hidden"} xl:flex`}
        />
        <DocumentViewer
          key={selectedKey ?? "none"}
          unit={selectedUnit}
          unitIndex={selectedIndex}
          units={data.units}
          source={data.source}
          documentsError={data.documentsError}
          className={`${pane === "lecture" ? "flex" : "hidden"} md:flex`}
        />
        <ContentsPanel
          units={data.units}
          selectedKey={selectedKey}
          onSelect={selectUnit}
          source={data.source}
          masteryError={data.masteryError}
          className={`${pane === "contents" ? "flex" : "hidden"} ${
            sidePane === "contents" ? "md:flex" : "md:hidden"
          } md:max-xl:order-first md:max-xl:border-r md:max-xl:border-line xl:flex`}
        />
      </div>
    </div>
  );
}
