import SubjectCard from "@/components/dashboard/SubjectCard";
import Notice, { RLS_HINT } from "@/components/ui/Notice";
import type { DashboardData } from "@/lib/types";

export default function SubjectGrid({ data, heading = "Your subjects" }: { data: DashboardData; heading?: string }) {
  const { subjects } = data;

  return (
    <section aria-labelledby="subjects-heading" className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 id="subjects-heading" className="text-[16px] font-semibold text-fg">
          {heading}
        </h2>
        {subjects.status === "ok" && (
          <span className="font-mono text-[10px] text-subtle uppercase">
            {String(subjects.data.length).padStart(2, "0")} subjects
          </span>
        )}
      </div>

      {subjects.status === "error" ? (
        <Notice tone="error" title="Subjects could not be loaded">
          Supabase returned an error: {subjects.message}
        </Notice>
      ) : (
        <>
          {data.source === "supabase" && subjects.data.every((item) => !item.subject.record) && (
            <Notice title="Subject records are not visible yet">{RLS_HINT}</Notice>
          )}
          {data.statsError && (
            <Notice tone="error" title="Unit progress could not be loaded">
              {data.statsError}
            </Notice>
          )}
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {subjects.data.map((item) => (
              <li key={item.subject.slug} className="flex flex-col *:flex-1">
                <SubjectCard {...item} />
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
