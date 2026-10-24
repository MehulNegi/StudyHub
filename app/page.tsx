import { connection } from "next/server";
import OverallProgress from "@/components/dashboard/OverallProgress";
import SubjectGrid from "@/components/dashboard/SubjectGrid";
import { getDashboardData } from "@/lib/data/studyhub";

export default async function DashboardPage() {
  // Per-request data: results will depend on the signed-in user once auth is added.
  await connection();
  const data = await getDashboardData();

  return (
    <div className="flex w-full flex-col gap-8 px-4 pt-10 pb-16 sm:px-6 lg:px-12 lg:pt-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-[28px] text-fg sm:text-[32px]">Welcome to StudyHub</h1>
        <p className="text-[14px] text-muted">
          Quick notes, lecture documents and unit mastery for each of your subjects.
        </p>
      </header>
      <SubjectGrid data={data} />
      <OverallProgress data={data} />
    </div>
  );
}
