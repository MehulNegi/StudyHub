"use client";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-20 text-center">
      <p className="font-mono text-[10px] text-struggling uppercase">Something went wrong</p>
      <h1 className="text-[18px] font-semibold text-fg">This page could not be displayed</h1>
      <p className="max-w-md text-[12px] leading-[1.5] text-subtle">{error.message || "An unexpected error occurred."}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 rounded-[6px] border border-line-strong bg-raised px-3.5 py-2 text-[12px] font-semibold text-fg hover:border-primary"
      >
        Try again
      </button>
    </div>
  );
}
