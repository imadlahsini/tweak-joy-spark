import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import type { Language } from "@/contexts/LanguageContext";

type SelectorLanguage = Exclude<Language, null>;

interface LanguageFlagProps {
  code: SelectorLanguage;
  className?: string;
  variant?: "badge" | "embed" | "selector-circle";
}

const flagIconByLanguage: Partial<Record<SelectorLanguage, string>> = {
  ar: "flagpack:ma",
  en: "flagpack:us",
  fr: "flagpack:fr",
};

const FlagArtwork = ({ code, embed = false }: { code: SelectorLanguage; embed?: boolean }) => {
  if (code === "zgh") {
    const zghEmbedClass = embed ? "relative h-full aspect-[4/3] shrink-0" : "relative w-full h-full";

    return (
      <div className={zghEmbedClass}>
        <div className="absolute inset-y-0 left-0 w-1/3 bg-[#1f73b7]" />
        <div className="absolute inset-y-0 left-1/3 w-1/3 bg-[#2fa04b]" />
        <div className="absolute inset-y-0 right-0 w-1/3 bg-[#f2c230]" />
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center text-[#d7232f] font-bold leading-none font-sans",
            embed ? "text-[2.05rem] sm:text-[2.25rem]" : "text-[1.6rem] sm:text-[1.8rem]"
          )}
        >
          ⵣ
        </span>
      </div>
    );
  }

  return (
    <Icon
      icon={flagIconByLanguage[code] || "flagpack:un"}
      className={embed ? "block h-full w-auto max-w-none shrink-0" : "w-full h-full"}
    />
  );
};

const LanguageFlag = ({ code, className, variant = "badge" }: LanguageFlagProps) => {
  if (variant === "selector-circle") {
    return (
      <div
        className={cn("relative h-11 w-11 overflow-hidden rounded-full", className)}
        aria-hidden="true"
        dir="ltr"
      >
        {code === "zgh" ? (
          <FlagArtwork code={code} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon icon={flagIconByLanguage[code] || "flagpack:un"} className="block h-full w-auto max-w-none shrink-0" />
          </div>
        )}
      </div>
    );
  }

  if (variant === "embed") {
    return (
      <div className={cn("relative w-full h-full overflow-hidden", className)} aria-hidden="true">
        <div className="absolute inset-y-0 left-0 flex items-stretch">
          <FlagArtwork code={code} embed />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative w-[52px] h-[36px] sm:w-[58px] sm:h-[40px] rounded-md overflow-hidden border border-border/40 shadow-[0_2px_10px_hsl(var(--foreground)/0.08)] bg-background/70",
        className
      )}
      aria-hidden="true"
    >
      <FlagArtwork code={code} />
    </div>
  );
};

export default LanguageFlag;
