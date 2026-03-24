import { type ReactNode, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Loader2, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { APP_LOGO_SRC } from "@/lib/branding";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_ITEMS } from "@/components/admin/admin-nav";

interface AdminShellProps {
  isSigningOut?: boolean;
  onLogout: () => void | Promise<void>;
  onCommandOpen?: () => void;
  topBarContent?: ReactNode;
  topBarContentInline?: boolean;
  sidebarStats?: { todayCount: number; newCount: number };
  children: ReactNode;
}

const SIDEBAR_W = 64;

const isRouteMatch = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

const AdminShell = ({
  isSigningOut = false,
  onLogout,
  topBarContent,
  topBarContentInline = false,
  children,
}: AdminShellProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeNavItem = useMemo(
    () =>
      ADMIN_NAV_ITEMS.find((item) => isRouteMatch(location.pathname, item.href)) ??
      ADMIN_NAV_ITEMS[0],
    [location.pathname],
  );

  const renderTopBarContentInline = topBarContentInline && Boolean(topBarContent);
  const isQueueRoute = activeNavItem.id === "queue";

  const desktopRail = (
    <aside
      className="fixed inset-y-0 left-0 z-40 flex w-16 flex-col items-center border-r border-white/10 bg-white/[0.025] py-3"
      style={{ width: SIDEBAR_W }}
    >
      <div className="mb-5 mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-gradient-to-br from-[#6DB5FF] to-[#FF5DE7] shadow-[0_4px_16px_rgba(109,181,255,0.25),0_4px_16px_rgba(255,93,231,0.15)]">
        <img src={APP_LOGO_SRC} alt="" aria-hidden="true" className="h-6 w-6 object-contain" />
      </div>

      <nav className="flex flex-1 flex-col items-center gap-1.5 pt-1">
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive = item.id === activeNavItem.id;

          return (
            <NavLink
              key={item.id}
              to={item.href}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              data-tooltip={item.label}
              className={cn(
                "admin-v2-rail-btn group relative inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-transparent text-white/30 transition-all duration-200",
                "hover:border-white/10 hover:bg-white/[0.04] hover:text-white/55",
                isActive &&
                  "border-white/15 bg-white/[0.07] text-[#6DB5FF] shadow-[0_0_16px_rgba(109,181,255,0.18)]",
              )}
            >
              <span
                className={cn(
                  "absolute left-[-7px] h-0 w-[3px] rounded-r-md bg-[#6DB5FF] shadow-[0_0_12px_rgba(109,181,255,0.2)] transition-[height] duration-200",
                  isActive && "h-4",
                )}
                aria-hidden="true"
              />
              <item.icon className="h-[18px] w-[18px]" />
              <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 -translate-x-1 whitespace-nowrap rounded-md border border-white/12 bg-[#1A1A1E] px-2 py-1 text-[11px] font-medium text-white/80 opacity-0 shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>

      <Button
        type="button"
        variant="ghost"
        onClick={() => void onLogout()}
        aria-label={isSigningOut ? "Signing out..." : "Logout"}
        title={isSigningOut ? "Signing out..." : "Logout"}
        className="group relative mt-3 inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/10 bg-white/[0.03] px-0 text-white/40 transition-all duration-200 hover:bg-white/[0.06] hover:text-white/70"
      >
        {isSigningOut ? (
          <Loader2 className="h-[18px] w-[18px] animate-spin" />
        ) : (
          <LogOut className="h-[18px] w-[18px]" />
        )}
        <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 -translate-x-1 whitespace-nowrap rounded-md border border-white/12 bg-[#1A1A1E] px-2 py-1 text-[11px] font-medium text-white/80 opacity-0 shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100">
          {isSigningOut ? "Signing out..." : "Logout"}
        </span>
      </Button>
    </aside>
  );

  const mobileDrawer = (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetContent
        side="left"
        className="w-[248px] border-r border-white/12 bg-[#0C0C0F]/95 p-0 text-white backdrop-blur-xl"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Admin navigation</SheetTitle>
        </SheetHeader>

        <div className="flex h-full flex-col px-3 py-3">
          <div className="mb-5 mt-1 flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-gradient-to-br from-[#6DB5FF] to-[#FF5DE7] shadow-[0_4px_16px_rgba(109,181,255,0.25),0_4px_16px_rgba(255,93,231,0.15)]">
            <img src={APP_LOGO_SRC} alt="" aria-hidden="true" className="h-6 w-6 object-contain" />
          </div>

          <nav className="flex flex-1 flex-col gap-1.5">
            {ADMIN_NAV_ITEMS.map((item) => {
              const isActive = item.id === activeNavItem.id;
              return (
                <NavLink
                  key={item.id}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative flex h-11 items-center gap-3 rounded-xl border border-transparent px-3 text-sm text-white/70 transition-all",
                    "hover:border-white/12 hover:bg-white/[0.05] hover:text-white",
                    isActive &&
                      "border-white/15 bg-white/[0.07] text-white shadow-[0_0_0_1px_rgba(109,181,255,0.28)]",
                  )}
                >
                  <span
                    className={cn(
                      "absolute left-0 top-1/2 h-0 w-[3px] -translate-y-1/2 rounded-r-md bg-[#6DB5FF] transition-[height] duration-200",
                      isActive && "h-5",
                    )}
                    aria-hidden="true"
                  />
                  <item.icon className="h-[18px] w-[18px]" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setMobileOpen(false);
              void onLogout();
            }}
            className="mt-auto h-11 justify-start gap-2.5 rounded-xl border border-white/12 bg-white/[0.04] px-3 text-white/75 hover:bg-white/[0.08] hover:text-white"
          >
            {isSigningOut ? (
              <Loader2 className="h-[18px] w-[18px] animate-spin" />
            ) : (
              <LogOut className="h-[18px] w-[18px]" />
            )}
            <span>{isSigningOut ? "Signing out..." : "Logout"}</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <div
      dir="ltr"
      className={cn(
        "admin-theme admin-v2-shell admin-v2-canvas relative min-h-screen overflow-hidden text-white",
        isQueueRoute && "admin-v2-canvas--queue",
      )}
    >
      <div className="admin-v2-noise-layer" aria-hidden="true" />
      {!isMobile && desktopRail}
      {isMobile && mobileDrawer}

      <main className={cn("relative z-10 min-h-screen", !isMobile && "pl-16")}>
        <header className="admin-v2-topbar sticky top-0 z-30 border-b border-white/10 bg-white/[0.02] px-3 sm:px-5 lg:px-7">
          <div
            className={cn(
              "flex items-center gap-2.5",
              renderTopBarContentInline
                ? isMobile
                  ? "min-h-[58px] py-2"
                  : "h-[58px] flex-nowrap overflow-hidden"
                : "min-h-[58px]",
            )}
          >
            {isMobile && (
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-white/10 bg-white/[0.04] text-white/70 transition hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6DB5FF]/55"
                aria-label="Open sidebar"
              >
                <Menu className="h-4 w-4" />
              </button>
            )}

            <div className="flex min-w-0 items-center gap-2">
              <h1 className="truncate text-[1.35rem] font-bold leading-none tracking-[-0.03em] text-white">
                {activeNavItem.label}
              </h1>
              <span className="admin-v2-live-dot mt-[2px]" aria-hidden="true" />
            </div>

            {renderTopBarContentInline ? (
              <div className={cn("ml-auto min-w-0 flex-1", !isMobile && "overflow-hidden")}>
                {topBarContent}
              </div>
            ) : (
              <div className="ml-auto" />
            )}

            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full border-2 border-white/10 bg-gradient-to-br from-[#FEFA3D] to-[#FF5DE7] text-[0.78rem] font-bold text-[#0A0A0C] shadow-[0_2px_10px_rgba(255,93,231,0.2)]">
              A
            </div>
          </div>

          {topBarContent && !renderTopBarContentInline && (
            <div className="border-t border-white/10 pb-2.5 pt-2">{topBarContent}</div>
          )}
        </header>

        <div className="px-3 pb-3 pt-3 sm:px-5 lg:px-7">{children}</div>
      </main>
    </div>
  );
};

export default AdminShell;
