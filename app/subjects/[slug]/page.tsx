import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import SubjectWorkspace from "@/components/subject/SubjectWorkspace";
import { getWorkspaceData } from "@/lib/data/studyhub";
import { getSubjectConfig } from "@/lib/subjects";

export async function generateMetadata({ params }: PageProps<"/subjects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const subject = getSubjectConfig(slug);
  return { title: subject ? `${subject.code} — ${subject.name}` : "Subject not found" };
}

export default async function SubjectPage({ params }: PageProps<"/subjects/[slug]">) {
  const { slug } = await params;
  const subject = getSubjectConfig(slug);
  if (!subject) notFound();

  await connection();
  const data = await getWorkspaceData(subject);

  return <SubjectWorkspace subject={subject} data={data} />;
}
