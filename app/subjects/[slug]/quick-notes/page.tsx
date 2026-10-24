import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import QuickNotesLibrary from "@/components/subject/QuickNotesLibrary";
import { getQuickNotesData } from "@/lib/data/studyhub";
import { getSubjectConfig } from "@/lib/subjects";

export async function generateMetadata({ params }: PageProps<"/subjects/[slug]/quick-notes">): Promise<Metadata> {
  const { slug } = await params;
  const subject = getSubjectConfig(slug);
  return { title: subject ? `${subject.code} Quick Notes` : "Subject not found" };
}

export default async function QuickNotesPage({ params }: PageProps<"/subjects/[slug]/quick-notes">) {
  const { slug } = await params;
  const subject = getSubjectConfig(slug);
  if (!subject) notFound();

  await connection();
  const data = await getQuickNotesData(subject);

  return <QuickNotesLibrary subject={subject} data={data} />;
}
