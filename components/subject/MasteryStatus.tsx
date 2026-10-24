import Image from "next/image";
import type { MasteryStatus as Status } from "@/lib/types";

export const MASTERY_META: Record<Status, { label: string; text: string; bg: string; dot: string }> = {
  completed: { label: "Completed", text: "text-completed", bg: "bg-completed", dot: "/icons/status-completed.svg" },
  review: { label: "Review", text: "text-review", bg: "bg-review", dot: "/icons/status-review.svg" },
  struggling: {
    label: "Struggling",
    text: "text-struggling",
    bg: "bg-struggling",
    dot: "/icons/status-struggling.svg",
  },
};

/** Mastery badge from the Figma component library; `null` renders a neutral "Not rated" badge. */
export default function MasteryStatus({ status }: { status: Status | null }) {
  if (!status) {
    return (
      <span className="inline-flex shrink-0 items-center rounded-[4px] border border-line px-2 py-1 text-[10px] font-semibold text-subtle">
        Not rated
      </span>
    );
  }

  const meta = MASTERY_META[status];
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-[4px] border border-line px-2 py-1">
      <Image src={meta.dot} width={6} height={6} alt="" aria-hidden />
      <span className={`text-[10px] font-semibold ${meta.text}`}>{meta.label}</span>
    </span>
  );
}
