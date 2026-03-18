import { CalendarClock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AdminNavItemId = "reservations";

export interface AdminNavItem {
  id: AdminNavItemId;
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

export const ADMIN_NAV_ITEMS: readonly AdminNavItem[] = [
  {
    id: "reservations",
    label: "Reservations",
    description: "Appointments and delivery status",
    href: "/admin/reservations",
    icon: CalendarClock,
  },
] as const;
