import { CalendarClock, ListOrdered, Settings2, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AdminNavItemId = "profiles" | "reservations" | "queue" | "settings";

export interface AdminNavItem {
  id: AdminNavItemId;
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

export const ADMIN_NAV_ITEMS: readonly AdminNavItem[] = [
  {
    id: "queue",
    label: "Queue",
    description: "Real-time patient queue",
    href: "/admin/queue",
    icon: ListOrdered,
  },
  {
    id: "reservations",
    label: "Reservations",
    description: "Appointments and delivery status",
    href: "/admin/reservations",
    icon: CalendarClock,
  },
  {
    id: "settings",
    label: "Settings",
    description: "Optician roster for queue assignments",
    href: "/admin/settings",
    icon: Settings2,
  },
  {
    id: "profiles",
    label: "Patients",
    description: "Profiles with queue and appointment history",
    href: "/admin/profiles",
    icon: Users,
  },
] as const;
