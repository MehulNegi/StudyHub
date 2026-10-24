-- APPLIED (already run on the StudyHub project — recorded here for history).
--
-- Link quick notes to a chapter (unit).
--   unit_id IS NULL      → subject-wide ("General") note: shown in the Quick Notes library only.
--   unit_id IS NOT NULL  → chapter note: shown in the library AND in the workspace sidebar
--                          while that unit is selected.
-- Deleting a unit keeps its notes and turns them into subject-wide notes.

ALTER TABLE public.quick_notes
ADD COLUMN unit_id bigint
REFERENCES public.units(id)
ON DELETE SET NULL;

CREATE INDEX idx_quick_notes_unit_id
ON public.quick_notes(unit_id);
