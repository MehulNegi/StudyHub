import { supabase } from "@/lib/supabase";
import { SUBJECTS } from "@/lib/subjects";
import { countMastery, normalizeStatus } from "@/lib/data/mastery";
import { isPreviewMode } from "@/lib/data/source";
import { getPreviewDashboard, getPreviewQuickNotes, getPreviewWorkspace } from "@/lib/preview/preview-data";
import type {
  DashboardData,
  DocumentRow,
  Id,
  Loaded,
  MasteryRow,
  MasteryStatus,
  QuickNoteRow,
  QuickNotesData,
  Subject,
  SubjectConfig,
  SubjectRow,
  UnitRow,
  WorkspaceData,
  WorkspaceDocument,
  WorkspaceNote,
} from "@/lib/types";

const DOCUMENTS_BUCKET = "studyhub-documents";
const SIGNED_URL_TTL_SECONDS = 60 * 60;

function matchSubjects(rows: SubjectRow[]): Subject[] {
  return SUBJECTS.map((config) => {
    const record =
      rows.find((row) => {
        const code = row.code?.trim().toLowerCase();
        const name = row.name?.trim().toLowerCase();
        return config.aliases.includes(code) || config.aliases.includes(name);
      }) ?? null;

    return {
      ...config,
      name: record?.name?.trim() || config.name,
      description: record?.description?.trim() || config.description,
      record,
    };
  });
}

async function fetchSubjects() {
  return supabase.from("subjects").select("id, name, code, description, accent_color").order("id");
}

function latestStatusByUnit(rows: MasteryRow[]): Map<string, MasteryStatus | null> {
  const byUnit = new Map<string, MasteryStatus | null>();
  for (const row of rows) byUnit.set(String(row.unit_id), normalizeStatus(row.status));
  return byUnit;
}

export async function getDashboardData(): Promise<DashboardData> {
  if (isPreviewMode()) return getPreviewDashboard();

  const { data: subjectRows, error } = await fetchSubjects();
  if (error) {
    return { source: "supabase", subjects: { status: "error", message: error.message }, statsError: null };
  }

  const subjects = matchSubjects(subjectRows ?? []);
  const subjectIds = subjects.flatMap((subject) => (subject.record ? [subject.record.id] : []));
  const withoutCounts = subjects.map((subject) => ({ subject, counts: null }));

  if (subjectIds.length === 0) {
    return { source: "supabase", subjects: { status: "ok", data: withoutCounts }, statsError: null };
  }

  const units = await supabase.from("units").select("id, subject_id").in("subject_id", subjectIds);
  if (units.error) {
    return {
      source: "supabase",
      subjects: { status: "ok", data: withoutCounts },
      statsError: units.error.message,
    };
  }

  const unitIds = (units.data ?? []).map((unit) => unit.id as Id);
  const mastery =
    unitIds.length > 0
      ? await supabase.from("mastery").select("unit_id, status").in("unit_id", unitIds)
      : { data: [] as MasteryRow[], error: null };
  const statusByUnit = latestStatusByUnit(mastery.data ?? []);

  return {
    source: "supabase",
    statsError: mastery.error?.message ?? null,
    subjects: {
      status: "ok",
      data: subjects.map((subject) => {
        if (!subject.record) return { subject, counts: null };
        const subjectUnits = (units.data ?? []).filter(
          (unit) => String(unit.subject_id) === String(subject.record?.id),
        );
        if (subjectUnits.length === 0) return { subject, counts: null };
        return {
          subject,
          counts: countMastery(subjectUnits.map((unit) => statusByUnit.get(String(unit.id)) ?? null)),
        };
      }),
    },
  };
}

async function signDocuments(rows: DocumentRow[]): Promise<Map<string, WorkspaceDocument>> {
  const documents = new Map<string, WorkspaceDocument>();
  if (rows.length === 0) return documents;

  // The bucket is private: documents are only readable through short-lived signed URLs,
  // which Storage policies may refuse until the user is authenticated.
  const { data: signed, error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrls(
      rows.map((row) => row.file_path),
      SIGNED_URL_TTL_SECONDS,
    );

  for (const row of rows) {
    const entry = signed?.find((item) => item.path === row.file_path);
    documents.set(String(row.id), {
      key: String(row.id),
      title: row.title,
      pageCount: row.page_count,
      updatedAt: row.updated_at,
      url: entry?.signedUrl ?? null,
      urlError: entry?.signedUrl ? null : (entry?.error ?? error?.message ?? "No signed URL was returned."),
    });
  }
  return documents;
}

type SubjectLookup = { status: "ok"; record: SubjectRow | null } | { status: "error"; message: string };

/** Finds the Supabase row for one subject. `record: null` means missing or hidden by RLS. */
async function findSubjectRecord(config: SubjectConfig): Promise<SubjectLookup> {
  const { data: subjectRows, error } = await fetchSubjects();
  if (error) return { status: "error", message: error.message };
  const record = matchSubjects(subjectRows ?? []).find((subject) => subject.slug === config.slug)?.record;
  return { status: "ok", record: record ?? null };
}

const UNDEFINED_COLUMN = "42703";

type QuickNotesResult = { notes: Loaded<WorkspaceNote[]>; unitLinks: boolean };

/**
 * Every quick note for a subject, scoped by `quick_notes.subject_id` (never by unit — callers
 * narrow to a chapter themselves). `unit_id` links a note to a chapter (NULL = subject-wide).
 * If a database is missing the `unit_id` column (migration 20261018120000 not applied), notes are
 * returned without chapter links (`unitLinks: false`) — they are never guessed or assigned to a unit.
 */
async function fetchQuickNotes(subjectId: Id): Promise<QuickNotesResult> {
  const query = (columns: string) =>
    supabase
      .from("quick_notes")
      .select(columns)
      .eq("subject_id", subjectId)
      .order("created_at", { ascending: true })
      .overrideTypes<QuickNoteRow[], { merge: false }>();

  let unitLinks = true;
  let { data, error } = await query("id, subject_id, unit_id, title, category, content");
  if (error?.code === UNDEFINED_COLUMN) {
    unitLinks = false;
    ({ data, error } = await query("id, subject_id, title, category, content"));
  }

  if (error) return { notes: { status: "error", message: error.message }, unitLinks };
  return {
    unitLinks,
    notes: {
      status: "ok",
      data: (data ?? []).map((note) => ({
        key: String(note.id),
        unitKey: note.unit_id == null ? null : String(note.unit_id),
        title: note.title,
        category: note.category,
        content: note.content,
      })),
    },
  };
}

export function unitLabel(unit: { unit_number: number | null; title: string }, index: number): string {
  return `Unit ${String(unit.unit_number ?? index + 1).padStart(2, "0")} · ${unit.title}`;
}

export async function getQuickNotesData(config: SubjectConfig): Promise<QuickNotesData> {
  if (isPreviewMode()) return getPreviewQuickNotes(config.slug);

  const lookup = await findSubjectRecord(config);
  const empty = { source: "supabase" as const, subjectVisible: false, noteUnitLinks: false, units: [] };
  if (lookup.status === "error") return { ...empty, notes: lookup };
  if (!lookup.record) return { ...empty, notes: { status: "ok", data: [] } };

  const [{ notes, unitLinks }, units] = await Promise.all([
    fetchQuickNotes(lookup.record.id),
    supabase
      .from("units")
      .select("id, title, unit_number")
      .eq("subject_id", lookup.record.id)
      .order("unit_number", { ascending: true, nullsFirst: false }),
  ]);

  return {
    source: "supabase",
    subjectVisible: true,
    notes,
    noteUnitLinks: unitLinks,
    // Unit labels are optional context; if they fail to load, notes are still shown.
    units: (units.data ?? []).map((unit, index) => ({ key: String(unit.id), label: unitLabel(unit, index) })),
  };
}

export async function getWorkspaceData(config: SubjectConfig): Promise<WorkspaceData> {
  if (isPreviewMode()) return getPreviewWorkspace(config.slug);

  const base = { source: "supabase" as const, documentsError: null, masteryError: null, noteUnitLinks: false };

  const lookup = await findSubjectRecord(config);
  if (lookup.status === "error") {
    return { ...base, subjectVisible: false, units: lookup, notes: lookup };
  }

  const record = lookup.record;
  if (!record) {
    const none = { status: "ok" as const, data: [] };
    return { ...base, subjectVisible: false, units: none, notes: none };
  }

  const [unitsResult, { notes, unitLinks }] = await Promise.all([
    supabase
      .from("units")
      .select("id, subject_id, title, description, unit_number")
      .eq("subject_id", record.id)
      .order("unit_number", { ascending: true, nullsFirst: false })
      .overrideTypes<UnitRow[], { merge: false }>(),
    fetchQuickNotes(record.id),
  ]);

  if (unitsResult.error) {
    return {
      ...base,
      subjectVisible: true,
      units: { status: "error", message: unitsResult.error.message },
      notes,
      noteUnitLinks: unitLinks,
    };
  }

  const unitRows = unitsResult.data ?? [];
  const unitIds = unitRows.map((unit) => unit.id);

  const [documentsResult, masteryResult] =
    unitIds.length > 0
      ? await Promise.all([
          supabase
            .from("documents")
            .select("id, unit_id, title, file_path, page_count, updated_at")
            .in("unit_id", unitIds)
            .order("created_at", { ascending: true })
            .overrideTypes<DocumentRow[], { merge: false }>(),
          supabase.from("mastery").select("unit_id, status").in("unit_id", unitIds).overrideTypes<MasteryRow[], { merge: false }>(),
        ])
      : [
          { data: [] as DocumentRow[], error: null },
          { data: [] as MasteryRow[], error: null },
        ];

  const documentRows = documentsResult.data ?? [];
  const signed = await signDocuments(documentRows);
  const statusByUnit = latestStatusByUnit(masteryResult.data ?? []);

  return {
    source: "supabase",
    subjectVisible: true,
    noteUnitLinks: unitLinks,
    documentsError: documentsResult.error?.message ?? null,
    masteryError: masteryResult.error?.message ?? null,
    notes,
    units: {
      status: "ok",
      data: unitRows.map((unit) => ({
        key: String(unit.id),
        number: unit.unit_number,
        title: unit.title,
        description: unit.description,
        status: statusByUnit.get(String(unit.id)) ?? null,
        documents: documentRows
          .filter((doc) => String(doc.unit_id) === String(unit.id))
          .flatMap((doc) => signed.get(String(doc.id)) ?? []),
      })),
    },
  };
}
