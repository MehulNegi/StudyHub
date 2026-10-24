import Image from "next/image";
import Link from "next/link";
import ProgressBar from "@/components/ui/ProgressBar";
import { accentArrowIcon } from "@/lib/subjects";
import { completionPercent, hasMasteryData } from "@/lib/data/mastery";
import type { DashboardSubject } from "@/lib/types";

function Metric({ value, label, className }: { value: number; label: string; className: string }) {
  return (
    <div className="flex flex-1 flex-col gap-1">
      <span className={`font-mono text-[14px] font-semibold ${className}`}>{value}</span>
      <span className="text-[10px] text-subtle">{label}</span>
    </div>
  );
}

export default function SubjectCard({ subject, counts }: DashboardSubject) {
  const rated = hasMasteryData(counts);
  const percent = rated ? completionPercent(counts) : null;

  return (
    <Link
      href={`/subjects/${subject.slug}`}
      className="group flex min-h-[250px] flex-col gap-4 rounded-[8px] border border-line bg-surface p-6 transition-colors hover:border-line-strong hover:bg-inset"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex items-center gap-2">
            <span aria-hidden className="h-4 w-[3px] rounded-[4px]" style={{ backgroundColor: subject.accent }} />
            <span className="font-mono text-[12px] font-semibold" style={{ color: subject.accent }}>
              {subject.code}
            </span>
          </span>
          <h3 className="text-[18px] leading-[1.3] font-semibold text-fg">{subject.name}</h3>
          <p className="text-[12px] leading-[1.45] text-subtle">{subject.description}</p>
        </div>
        {percent !== null && (
          <span className="font-mono text-[13px] font-semibold text-fg">{percent}%</span>
        )}
      </div>

      {rated ? (
        <>
          <ProgressBar percent={percent ?? 0} color={subject.accent} label={`${subject.name} units completed`} />
          <div className="flex gap-6">
            <Metric value={counts.completed} label="Units completed" className="text-fg" />
            <Metric value={counts.review} label="Require review" className="text-review" />
          </div>
        </>
      ) : (
        <p className="text-[12px] leading-[1.45] text-subtle">No mastery recorded yet.</p>
      )}

      <div className="mt-auto flex flex-col gap-4">
        <div className="h-px bg-line" />
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[10px] text-subtle">Units</span>
            <span className="truncate text-[12px] text-muted">
              {counts ? `${counts.total} ${counts.total === 1 ? "unit" : "units"}` : "None visible"}
            </span>
          </div>
          <span className="flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: subject.accent }}>
            {rated ? "Continue" : "Open"}
            <Image
              src={accentArrowIcon(subject.slug)}
              width={12}
              height={12}
              alt=""
              aria-hidden
              className="transition-transform group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
