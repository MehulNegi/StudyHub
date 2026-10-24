export default function Loading() {
  return (
    <div role="status" aria-label="Loading" className="flex w-full flex-col gap-8 px-4 pt-10 pb-16 sm:px-6 lg:px-12 lg:pt-12">
      <div className="flex flex-col gap-3">
        <div className="h-8 w-72 animate-pulse rounded-[6px] bg-raised" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded-[6px] bg-raised" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4].map((item) => (
          <div key={item} className="h-[250px] animate-pulse rounded-[8px] border border-line bg-surface" />
        ))}
      </div>
    </div>
  );
}
