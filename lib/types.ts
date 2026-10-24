// Row shapes mirror the existing Supabase tables. Only the columns the UI reads are listed.

/** Primary keys may be uuid or bigint depending on the schema, so both are accepted. */
export type Id = string | number;

export interface SubjectRow {
  id: Id;
  name: string;
  code: string;
  description: string | null;
  accent_color: string | null;
}

export interface UnitRow {
  id: Id;
  subject_id: Id;
  title: string;
  description: string | null;
  unit_number: number | null;
}

export interface DocumentRow {
  id: Id;
  unit_id: Id;
  title: string;
  file_path: string;
  page_count: number | null;
  updated_at: string | null;
}

export interface MasteryRow {
  unit_id: Id;
  status: string;
}

export interface QuickNoteRow {
  id: Id;
  subject_id: Id;
  /** Chapter (units.id) this note belongs to; NULL = subject-wide ("General") note. */
  unit_id: Id | null;
  title: string;
  category: string | null;
  content: string;
}

export type MasteryStatus = "completed" | "review" | "struggling";

/** How quick-note content should be presented for a subject. */
export type NoteFormat = "command" | "formula" | "code" | "text";

/** Static UI configuration for one of the five subjects (identity, accent, copy). */
export interface SubjectConfig {
  slug: string;
  code: string;
  name: string;
  description: string;
  accent: string;
  /** Matches Supabase `subjects.code` / `subjects.name` values case-insensitively. */
  aliases: string[];
  noteFormat: NoteFormat;
  notesNoun: string;
}

/** Subject config merged with its Supabase record, when that record is visible. */
export interface Subject extends SubjectConfig {
  record: SubjectRow | null;
}

/** Result of a data request. An `ok` result with no rows is NOT proof that no rows exist (RLS). */
export type Loaded<T> = { status: "ok"; data: T } | { status: "error"; message: string };

export type DataSource = "supabase" | "preview";

export interface MasteryCounts {
  completed: number;
  review: number;
  struggling: number;
  unrated: number;
  total: number;
}

export interface DashboardSubject {
  subject: Subject;
  counts: MasteryCounts | null;
}

export interface DashboardData {
  source: DataSource;
  subjects: Loaded<DashboardSubject[]>;
  /** Set when subjects loaded but unit or mastery counts could not be read. */
  statsError: string | null;
}

export interface WorkspaceDocument {
  key: string;
  title: string;
  pageCount: number | null;
  updatedAt: string | null;
  url: string | null;
  urlError: string | null;
}

export interface WorkspaceUnit {
  key: string;
  number: number | null;
  title: string;
  description: string | null;
  status: MasteryStatus | null;
  documents: WorkspaceDocument[];
}

export interface WorkspaceNote {
  key: string;
  /** Unit (chapter) this note belongs to; `null` for subject-wide notes. */
  unitKey: string | null;
  title: string;
  category: string | null;
  content: string;
}

export interface WorkspaceData {
  source: DataSource;
  /** False when the subject's row was not returned (missing, or hidden by RLS). */
  subjectVisible: boolean;
  units: Loaded<WorkspaceUnit[]>;
  notes: Loaded<WorkspaceNote[]>;
  /** False until `quick_notes.unit_id` exists, i.e. notes cannot yet be matched to chapters. */
  noteUnitLinks: boolean;
  documentsError: string | null;
  masteryError: string | null;
}

export interface QuickNotesData {
  source: DataSource;
  /** False when the subject's row was not returned (missing, or hidden by RLS). */
  subjectVisible: boolean;
  notes: Loaded<WorkspaceNote[]>;
  /** False until `quick_notes.unit_id` exists, i.e. notes cannot yet be matched to chapters. */
  noteUnitLinks: boolean;
  /** The subject's units, used to label and filter notes by chapter. */
  units: NoteUnit[];
}

export interface NoteUnit {
  key: string;
  label: string;
}
