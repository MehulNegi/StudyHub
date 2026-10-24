const pulse = "animate-pulse rounded-[6px] bg-raised";

export default function QuickNotesLoading() {
  return (
    <div
      role="status"
      aria-label="Loading quick notes"
      className="flex w-full flex-col gap-8 px-4 pt-8 pb-16 sm:px-6 lg:px-12 lg:pt-10"
    >
      <div className="flex flex-col gap-3">
        <div className={`h-3 w-48 ${pulse}`} />
        <div className={`h-8 w-56 ${pulse}`} />
        <div className={`h-4 w-96 max-w-full ${pulse}`} />
      </div>
      <div className={`h-11 max-w-2xl ${pulse}`} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="h-36 animate-pulse rounded-[6px] border border-line bg-inset" />
        ))}
      </div>
    </div>
  );
}
