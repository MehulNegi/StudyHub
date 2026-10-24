import Image from "next/image";

export type IconName =
  | "book-open"
  | "chevron-down"
  | "chevron-left"
  | "chevron-right"
  | "copy"
  | "file-text"
  | "minus"
  | "plus"
  | "search"
  | "search-toolbar"
  | "window-controls";

const SIZES: Record<IconName, [number, number]> = {
  "book-open": [16, 16],
  "chevron-down": [12, 12],
  "chevron-left": [13, 13],
  "chevron-right": [13, 13],
  copy: [12, 12],
  "file-text": [15, 15],
  minus: [13, 13],
  plus: [13, 13],
  search: [14, 14],
  "search-toolbar": [13, 13],
  "window-controls": [44, 10],
};

/** Decorative icon exported from the Figma file (public/icons). */
export default function Icon({ name, className }: { name: IconName; className?: string }) {
  const [width, height] = SIZES[name];
  return (
    <Image
      src={`/icons/${name}.svg`}
      width={width}
      height={height}
      alt=""
      aria-hidden
      className={`shrink-0 ${className ?? ""}`}
    />
  );
}
