import type { Metadata } from "next";
import { connection } from "next/server";
import SubjectGrid from "@/components/dashboard/SubjectGrid";
import { getDashboardData } from "@/lib/data/studyhub";

export const metadata: Metadata = { title: "Subjects" };

export default async function SubjectsPage() {
  await connection();
  const data = await getDashboardData();

  return (
    <div className="flex w-full flex-col gap-8 px-4 pt-10 pb-16 sm:px-6 lg:px-12 lg:pt-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-[28px] text-fg sm:text-[32px]">Subjects</h1>
        <p className="text-[14px] text-muted">Open a subject to see its quick notes, lecture notes and contents.</p>
      </header>
      <SubjectGrid data={data} heading="All subjects" />
    </div>
  );
}
