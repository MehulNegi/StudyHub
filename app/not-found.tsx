import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-20 text-center">
      <p className="font-mono text-[10px] text-subtle uppercase">404</p>
      <h1 className="text-[18px] font-semibold text-fg">Page not found</h1>
      <p className="text-[12px] text-subtle">StudyHub has five subjects: SNAI, Physics, PSP, Mathematics and English.</p>
      <Link
        href="/"
        className="mt-2 rounded-[6px] bg-primary px-3.5 py-2 text-[12px] font-semibold text-canvas hover:bg-primary/90"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
