import type { ComponentProps } from "react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

type IconSize = 16 | 18 | 20 | 22;
type IconTone = "primary" | "accent" | "muted" | "foreground" | "success" | "current";
type IconState = "default" | "active" | "completed";

interface UiIconProps extends Omit<ComponentProps<typeof Icon>, "icon"> {
  icon: string;
  size?: IconSize;
  tone?: IconTone;
  state?: IconState;
}

const sizeClasses: Record<IconSize, string> = {
  16: "w-4 h-4",
  18: "w-[18px] h-[18px]",
  20: "w-5 h-5",
  22: "w-[22px] h-[22px]",
};

const toneClasses: Record<IconTone, string> = {
  primary: "text-primary",
  accent: "text-accent",
  muted: "text-muted-foreground",
  foreground: "text-foreground",
  success: "text-green-500",
  current: "text-current",
};

const stateClasses: Record<IconState, string> = {
  default: "",
  active: "drop-shadow-[0_0_8px_hsl(var(--primary)/0.25)]",
  completed: "drop-shadow-[0_0_6px_hsl(var(--primary)/0.2)]",
};

const UiIcon = ({
  icon,
  size = 18,
  tone = "foreground",
  state = "default",
  className,
  ...props
}: UiIconProps) => {
  return (
    <Icon
      icon={icon}
      className={cn(sizeClasses[size], toneClasses[tone], stateClasses[state], className)}
      {...props}
    />
  );
};

export default UiIcon;
