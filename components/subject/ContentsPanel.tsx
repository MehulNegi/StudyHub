import MasteryStatus, { MASTERY_META } from "@/components/subject/MasteryStatus";
import Notice, { EmptyState, RLS_HINT } from "@/components/ui/Notice";
import { countMastery, MASTERY_STATUSES } from "@/lib/data/mastery";
import type { DataSource, Loaded, WorkspaceUnit } from "@/lib/types";

export function unitNumber(unit: WorkspaceUnit, index: number): string {
  return String(unit.number ?? index + 1).padStart(2, "0");
}

function joinTitles(units: WorkspaceUnit[]): string {
  const titles = units.map((unit) => unit.title);
  if (titles.length <= 1) return titles.join("");
  return `${titles.slice(0, -1).join(", ")} and ${titles.at(-1)}`;
}

function recommendation(units: WorkspaceUnit[]): string {
  const review = units.filter((unit) => unit.status === "review");
  const struggling = units.filter((unit) => unit.status === "struggling");
  const parts: string[] = [];
  if (review.length) parts.push(`Review ${joinTitles(review)}`);
  if (struggling.length) parts.push(`${review.length ? "then revisit" : "Revisit"} ${joinTitles(struggling)}`);
  if (parts.length) return `${parts.join(", ")}.`;
  if (units.some((unit) => unit.status === "completed")) return "Every rated unit is marked Completed.";
  return "No mastery has been recorded for these units yet.";
}

function MasteryOverview({ units }: { units: WorkspaceUnit[] }) {
  const counts = countMastery(units.map((unit) => unit.status));

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="h-px bg-line" />
      <div className="flex flex-col gap-4 rounded-[6px] border border-line bg-inset p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-fg">Mastery Overview</h3>
          <span className="font-mono text-[10px] text-subtle">
            {counts.total} {counts.total === 1 ? "unit" : "units"}
            {counts.unrated > 0 && ` · ${counts.unrated} not rated`}
          </span>
        </div>
        <div className="flex h-[5px] gap-0.5" aria-hidden>
          {MASTERY_STATUSES.map(
            (status) =>
              counts[status] > 0 && (
                <span
                  key={status}
                  className={`h-full rounded-[4px] ${MASTERY_META[status].bg}`}
                  style={{ flexGrow: counts[status] }}
                />
              ),
          )}
          {counts.unrated > 0 && <span className="h-full rounded-[4px] bg-line" style={{ flexGrow: counts.unrated }} />}
        </div>
        <dl className="flex justify-between text-[10px]">
          {MASTERY_STATUSES.map((status) => (
            <div key={status} className={`flex gap-2 ${MASTERY_META[status].text}`}>
              <dt>{MASTERY_META[status].label}</dt>
              <dd>{counts[status]}</dd>
            </div>
          ))}
        </dl>
      </div>
      <p className="text-[12px] leading-[1.5] text-subtle">{recommendation(units)}</p>
    </div>
  );
}

export default function ContentsPanel({
  units,
  selectedKey,
  onSelect,
  source,
  masteryError,
  className = "",
}: {
  units: Loaded<WorkspaceUnit[]>;
  selectedKey: string | null;
  onSelect: (key: string) => void;
  source: DataSource;
  masteryError: string | null;
  className?: string;
}) {
  const list = units.status === "ok" ? units.data : [];
  const selectedIndex = list.findIndex((unit) => unit.key === selectedKey);
  const selected = list[selectedIndex];

  return (
    <section aria-label="Contents and mastery" className={`min-h-0 flex-col overflow-y-auto bg-surface ${className}`}>
      <div className="flex flex-col gap-1.5 border-b border-line px-6 pt-6 pb-4">
        <h2 className="text-[18px] text-fg">Contents</h2>
        <p className="truncate text-[12px] text-subtle">
          {selected ? `Unit ${unitNumber(selected, selectedIndex)} · ${selected.title}` : "Units and chapters"}
        </p>
      </div>

      {units.status === "error" ? (
        <div className="p-4">
          <Notice tone="error" title="Units could not be loaded">
            {units.message}
          </Notice>
        </div>
      ) : list.length === 0 ? (
        <EmptyState title="No units yet">
          {source === "supabase"
            ? RLS_HINT
            : "Units and chapters for this subject will be listed here."}
        </EmptyState>
      ) : (
        <>
          {masteryError && (
            <div className="px-4 pt-4">
              <Notice tone="error" title="Mastery could not be loaded">
                {masteryError}
              </Notice>
            </div>
          )}
          <ol className="flex flex-col py-2">
            {list.map((unit, index) => {
              const active = unit.key === selectedKey;
              return (
                <li key={unit.key}>
                  <button
                    type="button"
                    onClick={() => onSelect(unit.key)}
                    aria-current={active ? "true" : undefined}
                    className={`flex min-h-12 w-full items-center gap-2 border-l-2 py-2.5 pr-3 pl-3.5 text-left ${
                      active ? "border-primary bg-raised" : "border-transparent hover:bg-inset"
                    }`}
                  >
                    <span
                      className={`flex-1 text-[12px] leading-[1.35] ${active ? "font-semibold text-fg" : "text-muted"}`}
                    >
                      {unitNumber(unit, index)} — {unit.title}
                    </span>
                    <MasteryStatus status={unit.status} />
                  </button>
                </li>
              );
            })}
          </ol>
          <MasteryOverview units={list} />
        </>
      )}
    </section>
  );
}
