export default function PreviewBanner() {
  return (
    <div
      role="status"
      className="flex h-7 shrink-0 items-center justify-center gap-2 border-b border-review/30 bg-review/10 px-4 font-mono text-[10px] text-review"
    >
      <span className="shrink-0 font-semibold uppercase">Preview data</span>
      <span className="hidden truncate text-review/80 sm:inline">
        Sample content for local development — not read from Supabase. Unset STUDYHUB_PREVIEW to disable.
      </span>
    </div>
  );
}
