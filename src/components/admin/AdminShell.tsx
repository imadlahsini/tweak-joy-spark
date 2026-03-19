import { type CSSProperties, type FocusEvent, type ReactNode, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Compass, Loader2, LogOut, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { APP_LOGO_SRC, APP_NAME } from "@/lib/branding";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_ITEMS, type AdminNavItemId } from "@/components/admin/admin-nav";

interface AdminShellProps {
  activeNav: AdminNavItemId;
  isSigningOut?: boolean;
  onLogout: () => void | Promise<void>;
  onCommandOpen?: () => void;
  topBarBeforeSearch?: ReactNode;
  headerExtra?: ReactNode;
  children: ReactNode;
}

const sidebarVars = {
  "--sidebar-width": "17rem",
  "--sidebar-width-icon": "5.5rem",
} as CSSProperties;

const AdminShell = ({
  activeNav,
  isSigningOut = false,
  onLogout,
  onCommandOpen,
  topBarBeforeSearch,
  headerExtra,
  children,
}: AdminShellProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isSidebarFocusWithin, setIsSidebarFocusWithin] = useState(false);
  const isDesktopSidebarExpanded = !isMobile && (isSidebarHovered || isSidebarFocusWithin);

  const handleSidebarBlurCapture = (event: FocusEvent<HTMLDivElement>) => {
    if (isMobile) return;

    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && event.currentTarget.contains(nextTarget)) {
      return;
    }

    setIsSidebarFocusWithin(false);
  };

  return (
    <SidebarProvider defaultOpen={false} open={isMobile ? undefined : isDesktopSidebarExpanded} style={sidebarVars}>
      <div
        dir="ltr"
        className="admin-theme admin-shell-bg admin-shell-atmosphere relative min-h-screen overflow-hidden text-foreground"
      >
        <div className="pointer-events-none absolute inset-0 dot-grid opacity-[0.02]" />

        <div className="relative z-10 flex min-h-screen">
          {/* Sidebar */}
          <Sidebar
            variant="floating"
            collapsible="icon"
            disableFloatingChrome
            className="border-0 bg-transparent p-3 md:p-4"
            onMouseEnter={isMobile ? undefined : () => setIsSidebarHovered(true)}
            onMouseLeave={isMobile ? undefined : () => setIsSidebarHovered(false)}
            onFocusCapture={isMobile ? undefined : () => setIsSidebarFocusWithin(true)}
            onBlurCapture={isMobile ? undefined : handleSidebarBlurCapture}
          >
            <div className="admin-glass-panel relative flex h-full flex-col rounded-2xl">
              <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

              <SidebarHeader className="px-3 pb-2 pt-3 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:pb-1.5 group-data-[collapsible=icon]:pt-2.5">
                <div className="flex items-center gap-3 group-data-[collapsible=icon]:hidden">
                  <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                    <img src={APP_LOGO_SRC} alt="" aria-hidden="true" className="h-7 w-7 object-contain" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                      Operations
                    </p>
                    <p className="truncate text-sm font-semibold text-foreground">{APP_NAME} Admin</p>
                  </div>
                </div>
                <div className="hidden w-full items-center justify-center group-data-[collapsible=icon]:flex">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                    <img src={APP_LOGO_SRC} alt="" aria-hidden="true" className="h-7 w-7 object-contain" />
                  </div>
                </div>
              </SidebarHeader>

              <SidebarContent className="px-2 pb-2 pt-1 group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:pb-1.5 group-data-[collapsible=icon]:pt-1.5">
                <SidebarGroup className="p-1 group-data-[collapsible=icon]:p-0">
                  <SidebarGroupLabel className="px-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80 group-data-[collapsible=icon]:sr-only">
                    Navigation
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu className="gap-1.5 group-data-[collapsible=icon]:items-center">
                      {ADMIN_NAV_ITEMS.map((item) => {
                        const isActive =
                          item.id === activeNav ||
                          location.pathname === item.href ||
                          (item.href !== "/" && location.pathname.startsWith(`${item.href}/`));

                        return (
                          <SidebarMenuItem key={item.id} className="group-data-[collapsible=icon]:w-auto">
                            <SidebarMenuButton
                              asChild
                              isActive={isActive}
                              tooltip={item.label}
                              className={cn(
                                "h-12 rounded-xl border border-transparent px-3 text-foreground/80 transition-all [transition-duration:220ms]",
                                "hover:border-primary/30 hover:bg-primary/10 hover:text-foreground",
                                "data-[active=true]:border-primary/45 data-[active=true]:bg-gradient-to-r data-[active=true]:from-primary/24 data-[active=true]:via-primary/14 data-[active=true]:to-accent/14 data-[active=true]:text-foreground data-[active=true]:shadow-[0_0_0_1px_hsl(var(--primary)/0.22)]",
                                "group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:!h-10 group-data-[collapsible=icon]:!w-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-xl",
                              )}
                            >
                              <NavLink
                                to={item.href}
                                end
                                aria-label={item.label}
                                title={item.label}
                                className="flex w-full items-center gap-2 group-data-[collapsible=icon]:h-full group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
                              >
                                <item.icon className="h-[18px] w-[18px] shrink-0" />
                                <span className="min-w-0 group-data-[collapsible=icon]:hidden">
                                  <span className="block truncate text-sm font-medium">
                                    {item.label}
                                  </span>
                                  <span className="block truncate text-[11px] text-muted-foreground">
                                    {item.description}
                                  </span>
                                </span>
                                <Compass className="ml-auto h-3.5 w-3.5 text-muted-foreground/80 group-data-[collapsible=icon]:hidden" />
                              </NavLink>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>

              <SidebarFooter className="px-3 pb-3 pt-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:pb-1.5 group-data-[collapsible=icon]:pt-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => void onLogout()}
                  aria-label={isSigningOut ? "Signing out..." : "Logout"}
                  title={isSigningOut ? "Signing out..." : "Logout"}
                  className="h-11 w-full justify-start rounded-xl border border-border/60 bg-background/55 px-3 text-foreground hover:bg-background/75 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                >
                  {isSigningOut ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  <span className="group-data-[collapsible=icon]:hidden">
                    {isSigningOut ? "Signing out..." : "Logout"}
                  </span>
                </Button>
              </SidebarFooter>
            </div>
          </Sidebar>

          <SidebarInset className="bg-transparent">
            <div className="mx-auto w-full max-w-[1460px] px-3 pb-6 pt-3 sm:px-5 lg:px-8">
              {/* Sticky header bar */}
              <div className="relative mb-4 admin-glass-panel rounded-2xl px-4 py-2.5 sticky top-3 z-30">
                <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent rounded-full" />

                <div className="flex items-center gap-3">
                  {/* Mobile sidebar trigger */}
                  <SidebarTrigger className="h-9 w-9 rounded-xl border border-border/60 bg-background/60 text-foreground hover:bg-background/80 md:hidden" />

                  {/* Page name */}
                  <p className="text-sm font-medium text-foreground hidden md:block">
                    {ADMIN_NAV_ITEMS.find((item) => item.id === activeNav)?.label ?? "Admin"}
                  </p>
                  <p className="text-sm font-medium text-foreground md:hidden">
                    {ADMIN_NAV_ITEMS.find((item) => item.id === activeNav)?.label ?? "Admin"}
                  </p>

                  {/* Desktop center controls */}
                  {(topBarBeforeSearch || onCommandOpen) && (
                    <div className="ml-auto mr-auto hidden items-center gap-2 md:flex">
                      {topBarBeforeSearch}
                      {onCommandOpen && (
                        <button
                          type="button"
                          onClick={onCommandOpen}
                          className="flex items-center gap-2 admin-glass-panel-soft rounded-xl px-3 py-2 w-64 cursor-pointer hover:border-primary/30 transition-colors"
                        >
                          <Search className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Search...</span>
                          <kbd className="ml-auto inline-flex items-center rounded border border-border/60 bg-background/55 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                            ⌘K
                          </kbd>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Right side */}
                  <div className="flex items-center gap-2 ml-auto md:ml-0">
                    {headerExtra}

                    {/* Avatar */}
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/18 to-accent/16 border border-primary/25 flex items-center justify-center text-xs font-semibold text-primary">
                      A
                    </div>
                  </div>
                </div>
              </div>

              {children}
            </div>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminShell;
