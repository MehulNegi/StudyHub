import type { ReactNode } from "react";

const TONES = {
  info: "border-line text-muted",
  error: "border-struggling/40 text-struggling",
} as const;

/** Inline data-status message (RLS-hidden data, request errors). */
export default function Notice({
  tone = "info",
  title,
  children,
}: {
  tone?: keyof typeof TONES;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`rounded-[6px] border bg-surface px-4 py-3 ${TONES[tone]}`}>
      <p className="text-[12px] font-semibold">{title}</p>
      {children && <div className="mt-1 text-[12px] leading-[1.5] text-subtle">{children}</div>}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 px-6 py-10 text-center">
      <p className="text-[13px] font-semibold text-fg">{title}</p>
      {children && <div className="max-w-[320px] text-[12px] leading-[1.5] text-subtle">{children}</div>}
    </div>
  );
}

export const RLS_HINT =
  "Supabase returned no rows. Row Level Security hides records from signed-out requests, so they may exist and appear once sign-in is added.";
