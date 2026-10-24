export default function ProgressBar({
  percent,
  color,
  label,
  thick = false,
}: {
  percent: number;
  color: string;
  label: string;
  thick?: boolean;
}) {
  const value = Math.max(0, Math.min(100, percent));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      className={`w-full overflow-hidden rounded-[4px] bg-line ${thick ? "h-[5px]" : "h-1"}`}
    >
      <div className="h-full" style={{ width: `${value}%`, backgroundColor: color }} />
    </div>
  );
}
