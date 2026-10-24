const pulse = "animate-pulse rounded-[6px] bg-raised";

export default function WorkspaceLoading() {
  return (
    <div
      role="status"
      aria-label="Loading subject workspace"
      className="grid flex-1 grid-cols-1 md:h-[calc(100dvh-var(--chrome-height))] md:flex-none md:overflow-hidden md:grid-rows-[minmax(0,1fr)] md:grid-cols-[340px_1fr] xl:grid-cols-[330px_1fr_360px]"
    >
      <div className="hidden flex-col gap-2 border-r border-line bg-surface p-4 md:flex">
        <div className={`h-9 ${pulse}`} />
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className={`h-24 ${pulse}`} />
        ))}
      </div>
      <div className="flex flex-col bg-document">
        <div className="h-[52px] border-b border-line bg-surface" />
        <div className="flex flex-1 items-center justify-center p-6 text-[12px] text-subtle">Loading workspace…</div>
      </div>
      <div className="hidden flex-col gap-2 bg-surface p-6 xl:flex">
        <div className={`h-6 w-32 ${pulse}`} />
        {[0, 1, 2, 3, 4].map((item) => (
          <div key={item} className={`h-10 ${pulse}`} />
        ))}
      </div>
    </div>
  );
}
