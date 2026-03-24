import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface QueueSearchProps {
  value: string;
  onChange: (value: string) => void;
  inputId?: string;
  showShortcutHint?: boolean;
  className?: string;
}

const QueueSearch = ({
  value,
  onChange,
  inputId,
  showShortcutHint = false,
  className,
}: QueueSearchProps) => {
  const [local, setLocal] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(
    () => () => {
      clearTimeout(debounceRef.current);
    },
    [],
  );

  const handleChange = (nextValue: string) => {
    setLocal(nextValue);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onChange(nextValue), 220);
  };

  const handleClear = () => {
    clearTimeout(debounceRef.current);
    setLocal("");
    onChange("");
    inputRef.current?.focus();
  };

  return (
    <div
      className={cn(
        "queue-search-group flex h-[34px] w-full items-center gap-2 rounded-[10px] border border-white/10 bg-white/[0.04] px-3 text-white/80 transition-all duration-300",
        isFocused &&
          "border-[#6DB5FF]/35 bg-white/[0.07] shadow-[0_0_0_3px_rgba(109,181,255,0.06)]",
        className,
      )}
    >
      <Search
        className={cn(
          "h-3.5 w-3.5 shrink-0 text-white/35 transition-colors",
          isFocused && "text-[#6DB5FF]",
        )}
      />

      <input
        id={inputId}
        ref={inputRef}
        type="text"
        value={local}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Search patients..."
        className={cn(
          "queue-search-input min-w-0 flex-1 bg-transparent text-[0.78rem] font-normal text-white placeholder:text-white/30 outline-none",
        )}
      />

      {showShortcutHint && (
        <kbd
          className={cn(
            "hidden shrink-0 rounded-[4px] border border-white/10 bg-white/[0.04] px-1.5 py-[1px] font-mono text-[0.52rem] font-semibold text-white/30 sm:inline-flex",
            isFocused && "opacity-0",
          )}
        >
          ⌘K
        </kbd>
      )}

      <button
        type="button"
        onClick={handleClear}
        className={cn(
          "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] text-white/35 transition-colors",
          local.length > 0
            ? "hover:bg-white/[0.06] hover:text-white/75"
            : "pointer-events-none opacity-0",
        )}
        aria-label="Clear search"
        tabIndex={local.length > 0 ? 0 : -1}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
};

export default QueueSearch;
