import { NavLink, Outlet, Navigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { LayoutDashboard, ShoppingCart, CreditCard, Link2, LogOut, Loader2, Download, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { toast } from "sonner";

const links = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/subscriptions", label: "Subs", icon: CreditCard },
  { to: "/admin/links", label: "Links", icon: Link2 },
];

const AdminLayout = () => {
  const { isAdmin, isLoading, user, signOut } = useAdminAuth();
  const { canInstall, isIOS, isInstalled, install } = usePWAInstall();

  const handleInstall = async () => {
    if (isIOS) {
      toast("To install, tap the Share button in Safari, then 'Add to Home Screen'", {
        duration: 6000,
        icon: <Share className="w-4 h-4" />,
      });
      return;
    }
    if (canInstall) {
      await install();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col">
        <div className="p-6 border-b border-border">
          <h2 className="font-display text-lg font-bold text-foreground">Admin Panel</h2>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{user?.email}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-1">
          {!isInstalled && (canInstall || isIOS) && (
            <Button variant="ghost" size="sm" onClick={handleInstall} className="w-full justify-start gap-2 text-muted-foreground">
              <Download className="w-4 h-4" />
              Install App
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={signOut} className="w-full justify-start gap-2 text-muted-foreground">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile top bar (minimal) */}
      <div className="flex-1 flex flex-col">
        <header className="md:hidden border-b border-border bg-card px-4 py-2.5 flex items-center justify-between">
          <h2 className="font-display text-sm font-bold text-foreground">Admin</h2>
          <div className="flex items-center gap-1">
            {!isInstalled && (canInstall || isIOS) && (
              <Button variant="ghost" size="icon" onClick={handleInstall} className="text-muted-foreground h-8 w-8">
                <Download className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={signOut} className="text-muted-foreground h-8 w-8">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-pb">
        <div className="flex items-stretch">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1 rounded-md ${isActive ? "bg-primary/10" : ""}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default AdminLayout;
