import type { MasteryCounts, MasteryStatus } from "@/lib/types";

export const MASTERY_STATUSES: readonly MasteryStatus[] = ["completed", "review", "struggling"];

export function normalizeStatus(value: string | null | undefined): MasteryStatus | null {
  const status = value?.trim().toLowerCase();
  return MASTERY_STATUSES.find((known) => known === status) ?? null;
}

export function countMastery(statuses: (MasteryStatus | null)[]): MasteryCounts {
  const counts: MasteryCounts = { completed: 0, review: 0, struggling: 0, unrated: 0, total: 0 };
  for (const status of statuses) {
    counts.total += 1;
    if (status) counts[status] += 1;
    else counts.unrated += 1;
  }
  return counts;
}

/** True when at least one unit has a recorded mastery status. */
export function hasMasteryData(counts: MasteryCounts | null): counts is MasteryCounts {
  return !!counts && counts.completed + counts.review + counts.struggling > 0;
}

export function completionPercent(counts: MasteryCounts): number {
  return counts.total === 0 ? 0 : Math.round((counts.completed / counts.total) * 100);
}
