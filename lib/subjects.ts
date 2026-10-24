import type { SubjectConfig } from "@/lib/types";

/**
 * The five StudyHub subjects. This is UI configuration (routing slug, accent colour from the
 * Figma file, note presentation) — not content. Names and descriptions are replaced by the
 * Supabase `subjects` row whenever it is visible.
 */
export const SUBJECTS: readonly SubjectConfig[] = [
  {
    slug: "snai",
    code: "SNAI",
    name: "Systems & Networking",
    description: "Operating systems, networking fundamentals and the command line.",
    accent: "#6f91c8",
    aliases: ["snai", "systems & networking", "systems and networking"],
    noteFormat: "command",
    notesNoun: "commands",
  },
  {
    slug: "physics",
    code: "PHY",
    name: "Physics",
    description: "Mechanics, electromagnetism and optics, with the formulas behind them.",
    accent: "#9a83c8",
    aliases: ["phy", "phys", "physics"],
    noteFormat: "formula",
    notesNoun: "formulas",
  },
  {
    slug: "psp",
    code: "PSP",
    name: "Programming",
    description: "Problem solving and programming — syntax, patterns and data structures.",
    accent: "#6fa58b",
    aliases: ["psp", "programming"],
    noteFormat: "code",
    notesNoun: "snippets",
  },
  {
    slug: "mathematics",
    code: "MATH",
    name: "Mathematics",
    description: "Calculus, differential equations and linear algebra.",
    accent: "#c58b5c",
    aliases: ["math", "maths", "mathematics"],
    noteFormat: "formula",
    notesNoun: "formulas",
  },
  {
    slug: "english",
    code: "ENG",
    name: "English",
    description: "Grammar, comprehension and clear technical writing.",
    accent: "#63a6b3",
    aliases: ["eng", "english"],
    noteFormat: "text",
    notesNoun: "notes",
  },
];

export function getSubjectConfig(slug: string): SubjectConfig | undefined {
  return SUBJECTS.find((subject) => subject.slug === slug);
}

/** Arrow icon exported from Figma in each subject's accent colour. */
export function accentArrowIcon(slug: string): string {
  const file: Record<string, string> = {
    snai: "arrow-right-snai",
    physics: "arrow-right-phy",
    psp: "arrow-right-psp",
    mathematics: "arrow-right-math",
    english: "arrow-right-eng",
  };
  return `/icons/${file[slug] ?? "arrow-right-snai"}.svg`;
}
