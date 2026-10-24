-- NOT APPLIED — review before running.
--
-- Enforces: a quick note's unit must belong to the same subject as the note.
-- The applied FK (quick_notes.unit_id → units.id) only checks that the unit exists, so a
-- Physics note could currently point at an SNAI unit. A composite FK closes that gap.
--
-- Non-destructive: no rows are modified. The checks below abort the whole migration (nothing
-- is changed) if existing data would violate the new rules, so it can be fixed first.
-- No RLS policies are changed. Requires PostgreSQL 15+ for `ON DELETE SET NULL (unit_id)`.

-- 1. Abort if any existing note is linked to a unit from another subject, or has no subject.
do $$
begin
  if exists (
    select 1
    from public.quick_notes q
    join public.units u on u.id = q.unit_id
    where u.subject_id is distinct from q.subject_id
  ) then
    raise exception 'quick_notes contains notes linked to a unit of a different subject; fix them first';
  end if;

  if exists (select 1 from public.quick_notes where subject_id is null) then
    raise exception 'quick_notes contains notes without a subject_id; fix them first';
  end if;
end $$;

-- 2. Every note belongs to a subject.
alter table public.quick_notes
  alter column subject_id set not null;

-- 3. Allow (id, subject_id) to be referenced. id is already the primary key, so this cannot fail.
alter table public.units
  add constraint units_id_subject_id_key unique (id, subject_id);

-- 4. Replace the single-column FK with a composite one. It still allows NULL unit_id
--    (MATCH SIMPLE skips the check), and deleting a unit still sets only unit_id to NULL,
--    preserving the note's subject. Replacing (rather than adding alongside) the old FK keeps a
--    single quick_notes → units relationship for PostgREST.
alter table public.quick_notes
  drop constraint if exists quick_notes_unit_id_fkey;

alter table public.quick_notes
  add constraint quick_notes_unit_same_subject_fkey
  foreign key (unit_id, subject_id) references public.units (id, subject_id)
  on delete set null (unit_id);
