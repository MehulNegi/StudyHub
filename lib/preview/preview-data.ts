/**
 * ─── DEVELOPMENT PREVIEW DATA ────────────────────────────────────────────────────────────
 * Sample content used ONLY when `STUDYHUB_PREVIEW=1` in development (see lib/data/source.ts).
 * It is not production data, is never used as a fallback for failed Supabase requests, and
 * the UI shows a "Preview data" banner whenever it is rendered.
 *
 * To remove: delete this folder and the two `isPreviewMode()` branches in lib/data/studyhub.ts.
 * No lecture PDFs are included — the document viewer shows its real empty state.
 * ─────────────────────────────────────────────────────────────────────────────────────────
 */
import { SUBJECTS } from "@/lib/subjects";
import { countMastery } from "@/lib/data/mastery";
import type {
  DashboardData,
  MasteryStatus,
  QuickNotesData,
  WorkspaceData,
  WorkspaceNote,
  WorkspaceUnit,
} from "@/lib/types";

type PreviewUnit = [title: string, status: MasteryStatus | null];
type PreviewNote = [title: string, content: string, category: string, unit: number | null];

const PREVIEW_UNITS: Record<string, PreviewUnit[]> = {
  snai: [
    ["Introduction to Networks", "completed"],
    ["OSI Model", "completed"],
    ["TCP/IP Architecture", "review"],
    ["Routing", "completed"],
    ["Transport Layer", "review"],
    ["Network Security", "struggling"],
  ],
  physics: [
    ["Units & Measurement", "completed"],
    ["Kinematics", "completed"],
    ["Laws of Motion", "review"],
    ["Work, Energy & Power", "struggling"],
    ["Electromagnetism", null],
    ["Optics", null],
  ],
  psp: [
    ["Introduction to C", "completed"],
    ["Control Flow", "completed"],
    ["Functions", "completed"],
    ["Arrays & Strings", "review"],
    ["Pointers", "struggling"],
    ["Data Structures", null],
  ],
  mathematics: [
    ["Limits & Continuity", "completed"],
    ["Differentiation", "completed"],
    ["Integration", "review"],
    ["Differential Equations", null],
    ["Matrices & Determinants", null],
  ],
  english: [
    ["Grammar Foundations", "completed"],
    ["Reading Comprehension", "completed"],
    ["Paragraph Writing", "review"],
    ["Critical Writing", null],
    ["Presentations", null],
  ],
};

// `unit` is the 1-based unit number from PREVIEW_UNITS, or null for a subject-wide note
// (library only). Some units intentionally have no notes, to show the empty chapter state.
const PREVIEW_NOTES: Record<string, PreviewNote[]> = {
  snai: [
    ["Show interface addresses", "ip addr show", "inspection", 1],
    ["Test reachability", "ping -c 4 8.8.8.8", "diagnostics", 1],
    ["Capture TCP traffic", "sudo tcpdump -i any tcp port 80", "diagnostics", 3],
    ["Show routing table", "ip route show", "routing", 4],
    ["Trace the path to a host", "traceroute example.com", "routing", 4],
    ["List listening ports", "ss -tulpn", "inspection", 5],
    ["Check working tree", "git status", "git", null],
    ["Stage all changes", "git add .", "git", null],
  ],
  physics: [
    ["First equation of motion", "v = u + at", "kinematics", 2],
    ["Displacement", "s = ut + ½at²", "kinematics", 2],
    ["Newton's second law", "F = ma", "dynamics", 3],
    ["Kinetic energy", "KE = ½mv²", "energy", 4],
    ["Coulomb's law", "F = k · q₁q₂ / r²", "electrostatics", 5],
    ["Snell's law", "n₁ sin θ₁ = n₂ sin θ₂", "optics", 6],
    ["SI base units", "m · kg · s · A · K · mol · cd", "reference", null],
  ],
  psp: [
    ["Counting loop", "for (int i = 0; i < n; i++) {\n  /* ... */\n}", "loops", 2],
    [
      "Binary search",
      "int lo = 0, hi = n - 1;\nwhile (lo <= hi) {\n  int mid = lo + (hi - lo) / 2;\n  if (a[mid] == key) return mid;\n  if (a[mid] < key) lo = mid + 1;\n  else hi = mid - 1;\n}\nreturn -1;",
      "searching",
      4,
    ],
    ["Read a line safely", "fgets(buf, sizeof buf, stdin);", "input", 4],
    ["Swap with pointers", "void swap(int *a, int *b) {\n  int t = *a;\n  *a = *b;\n  *b = t;\n}", "pointers", 5],
    ["Compile with warnings", "gcc -Wall -Wextra -o main main.c", "toolchain", null],
  ],
  mathematics: [
    ["Derivative of sine", "d/dx (sin x) = cos x", "differentiation", 2],
    ["Product rule", "(uv)′ = u′v + uv′", "differentiation", 2],
    ["Power rule for integrals", "∫ xⁿ dx = xⁿ⁺¹ / (n + 1) + C,  n ≠ −1", "integration", 3],
    ["Determinant of a 2×2 matrix", "det [a b; c d] = ad − bc", "matrices", 5],
    ["Quadratic formula", "x = (−b ± √(b² − 4ac)) / 2a", "algebra", null],
  ],
  english: [
    ["Prefer active voice", "“The router drops the packet” reads faster than “The packet is dropped by the router.”", "style", 1],
    ["Topic sentence", "Open each paragraph with the one idea the paragraph develops.", "writing tip", 3],
    ["Transitions", "Use however, therefore and for example to make the relationship between ideas explicit.", "writing tip", 3],
    ["Thesis statement", "A single sentence that states the central claim an essay will support.", "definition", 4],
    ["Proofreading pass", "Read the text aloud once, slowly, before submitting it.", "writing tip", null],
  ],
};

const unitKey = (slug: string, number: number) => `preview-${slug}-unit-${number}`;

function previewUnits(slug: string): WorkspaceUnit[] {
  return (PREVIEW_UNITS[slug] ?? []).map(([title, status], index) => ({
    key: unitKey(slug, index + 1),
    number: index + 1,
    title,
    description: null,
    status,
    documents: [],
  }));
}

function previewNotes(slug: string): WorkspaceNote[] {
  return (PREVIEW_NOTES[slug] ?? []).map(([title, content, category, unit], index) => ({
    key: `preview-${slug}-note-${index + 1}`,
    unitKey: unit === null ? null : unitKey(slug, unit),
    title,
    content,
    category,
  }));
}

export function getPreviewDashboard(): DashboardData {
  return {
    source: "preview",
    statsError: null,
    subjects: {
      status: "ok",
      data: SUBJECTS.map((config) => ({
        subject: { ...config, record: null },
        counts: countMastery(previewUnits(config.slug).map((unit) => unit.status)),
      })),
    },
  };
}

export function getPreviewWorkspace(slug: string): WorkspaceData {
  return {
    source: "preview",
    subjectVisible: true,
    noteUnitLinks: true,
    documentsError: null,
    masteryError: null,
    units: { status: "ok", data: previewUnits(slug) },
    notes: { status: "ok", data: previewNotes(slug) },
  };
}

export function getPreviewQuickNotes(slug: string): QuickNotesData {
  return {
    source: "preview",
    subjectVisible: true,
    noteUnitLinks: true,
    notes: { status: "ok", data: previewNotes(slug) },
    units: previewUnits(slug).map((unit) => ({
      key: unit.key,
      label: `Unit ${String(unit.number).padStart(2, "0")} · ${unit.title}`,
    })),
  };
}
