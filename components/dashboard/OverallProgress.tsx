import ProgressBar from "@/components/ui/ProgressBar";
import { completionPercent, countMastery, hasMasteryData } from "@/lib/data/mastery";
import type { DashboardData, MasteryCounts } from "@/lib/types";

const pad = (value: number) => String(value).padStart(2, "0");

function Metric({ value, label, className }: { value: string; label: string; className: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className={`font-mono text-[24px] font-semibold ${className}`}>{value}</span>
      <span className="text-[12px] text-subtle">{label}</span>
    </div>
  );
}

export default function OverallProgress({ data }: { data: DashboardData }) {
  const rows = data.subjects.status === "ok" ? data.subjects.data : [];
  const withCounts = rows.flatMap((row) => (row.counts ? [row.counts] : []));

  const totals: MasteryCounts = withCounts.reduce(
    (sum, counts) => ({
      completed: sum.completed + counts.completed,
      review: sum.review + counts.review,
      struggling: sum.struggling + counts.struggling,
      unrated: sum.unrated + counts.unrated,
      total: sum.total + counts.total,
    }),
    countMastery([]),
  );
  const percent = completionPercent(totals);

  return (
    <section
      id="progress"
      aria-labelledby="progress-heading"
      className="flex scroll-mt-24 flex-col gap-6 rounded-[8px] border border-line bg-surface p-6"
    >
      <div className="flex items-baseline justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="progress-heading" className="text-[16px] font-semibold text-fg">
            Overall Progress
          </h2>
          <p className="text-[12px] text-subtle">
            {hasMasteryData(totals)
              ? `Across ${withCounts.length} ${withCounts.length === 1 ? "subject" : "subjects"} with units`
              : "Completed, Review and Struggling units across all subjects"}
          </p>
        </div>
        {hasMasteryData(totals) && (
          <span className="font-mono text-[24px] font-semibold text-primary">{percent}%</span>
        )}
      </div>

      {hasMasteryData(totals) ? (
        <>
          <ProgressBar percent={percent} color="var(--color-primary)" label="Units completed across all subjects" thick />
          <div className="h-px bg-line" />
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-12">
            <Metric value={`${percent}%`} label="Units completed" className="text-fg" />
            <Metric value={pad(totals.completed)} label="Completed units" className="text-completed" />
            <Metric value={pad(totals.review)} label="Require review" className="text-review" />
            <Metric value={pad(totals.struggling)} label="Marked struggling" className="text-struggling" />
          </div>
        </>
      ) : (
        <p className="border-t border-line pt-6 text-[12px] leading-[1.5] text-subtle">
          No mastery has been recorded yet. Progress appears here once units are marked Completed, Review or
          Struggling.
        </p>
      )}
    </section>
  );
}
