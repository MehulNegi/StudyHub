import type { Ref } from "react";
import Icon from "@/components/ui/Icon";

const SIZES = {
  sidebar: { label: "h-9 px-2.5", input: "text-[12px]" },
  library: { label: "h-11 px-3.5", input: "text-[14px]" },
} as const;

export default function NoteSearchField({
  inputRef,
  value,
  onChange,
  label,
  placeholder,
  disabled,
  size = "sidebar",
}: {
  inputRef: Ref<HTMLInputElement>;
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
  disabled: boolean;
  size?: keyof typeof SIZES;
}) {
  return (
    <label
      className={`flex shrink-0 items-center gap-2 rounded-[6px] border border-line bg-canvas focus-within:border-primary ${SIZES[size].label}`}
    >
      <Icon name="search" />
      <span className="sr-only">{label}</span>
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`min-w-0 flex-1 bg-transparent text-fg outline-none placeholder:text-subtle disabled:cursor-not-allowed ${SIZES[size].input}`}
      />
      <kbd className="hidden font-mono text-[10px] text-subtle sm:inline">⌘K</kbd>
    </label>
  );
}
