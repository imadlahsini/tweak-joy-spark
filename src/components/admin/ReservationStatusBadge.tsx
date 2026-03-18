import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { statusBadgeClass, statusDotClass, statusLabel } from "@/lib/admin-constants";
import type { ReservationStatus } from "@/types/reservations";

interface ReservationStatusBadgeProps {
  status: ReservationStatus;
  size?: "sm" | "default";
}

const ReservationStatusBadge = ({ status, size = "default" }: ReservationStatusBadgeProps) => (
  <Badge
    className={cn(
      "admin-chip border inline-flex items-center gap-1.5",
      statusBadgeClass[status],
      size === "sm" ? "text-[10px] py-0.5 px-2" : "text-[11px] py-1 px-2.5",
    )}
  >
    <span
      className={cn(
        "inline-block rounded-full shrink-0",
        statusDotClass[status],
        size === "sm" ? "h-1.5 w-1.5" : "h-[6px] w-[6px]",
        status === "new" && "animate-pulse",
      )}
    />
    {statusLabel[status]}
  </Badge>
);

export default ReservationStatusBadge;
