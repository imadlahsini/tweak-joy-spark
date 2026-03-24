import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CalendarDays,
  CircleAlert,
  ExternalLink,
  Loader2,
  MapPinned,
  Phone,
  Settings2,
  SlidersHorizontal,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import AddOpticianDialog from "@/components/admin/AddOpticianDialog";
import AdminShell from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAdminSessionGuard } from "@/hooks/use-admin-session-guard";
import { useOpticians } from "@/hooks/use-opticians";
import { cn } from "@/lib/utils";
import type { Optician } from "@/types/queue";

const SETTINGS_CATEGORIES = [
  {
    id: "opticians",
    label: "Opticians",
    status: "live",
    description: "Manage the roster used by the Queue optician selector.",
    plannedCopy: null,
    icon: Users,
  },
  {
    id: "queue-options",
    label: "Queue Options",
    status: "planned",
    description: "Future home for editable Procedure and Follow-up settings.",
    plannedCopy:
      "Procedure and Follow-up values will move here so queue staff can update them without touching code.",
    icon: SlidersHorizontal,
  },
  {
    id: "scheduling",
    label: "Scheduling",
    status: "planned",
    description: "Future home for appointment timing and availability controls.",
    plannedCopy:
      "Appointment timing, slot availability, and related clinic scheduling rules will live here later.",
    icon: CalendarDays,
  },
] as const;

type SettingsCategory = (typeof SETTINGS_CATEGORIES)[number];
type SettingsCategoryId = SettingsCategory["id"];

const AdminSettings = () => {
  const navigate = useNavigate();
  const { isSessionReady } = useAdminSessionGuard();
  const { opticians, isLoading, error, refresh, addOptician, toggleOptician, deleteOptician } = useOpticians({
    enabled: isSessionReady,
  });

  const [activeCategory, setActiveCategory] = useState<SettingsCategoryId>("opticians");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [pendingToggleId, setPendingToggleId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Optician | null>(null);

  const orderedOpticians = useMemo(
    () =>
      [...opticians].sort(
        (a, b) =>
          Number(b.isActive) - Number(a.isActive) || a.name.localeCompare(b.name),
      ),
    [opticians],
  );

  const activeCount = orderedOpticians.filter((optician) => optician.isActive).length;
  const inactiveCount = orderedOpticians.length - activeCount;
  const totalCount = orderedOpticians.length;

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    await supabase.auth.signOut();
    setIsSigningOut(false);
    navigate("/admin/login", { replace: true });
  };

  const handleToggleOptician = async (optician: Optician, nextIsActive: boolean) => {
    setPendingToggleId(optician.id);

    try {
      await toggleOptician(optician.id, nextIsActive);
      toast.success(
        nextIsActive
          ? `${optician.name} is now available in Queue`
          : `${optician.name} is now hidden from Queue`,
      );
    } catch {
      toast.error("Failed to update optician");
    } finally {
      setPendingToggleId(null);
    }
  };

  const handleRetry = async () => {
    try {
      await refresh();
    } catch {
      // The inline alert remains visible with the current error state.
    }
  };

  const handleDeleteOptician = async () => {
    if (!deleteTarget || pendingDeleteId) return;

    setPendingDeleteId(deleteTarget.id);

    try {
      await deleteOptician(deleteTarget.id);
      toast.success(`${deleteTarget.name} was deleted`);
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete optician");
    } finally {
      setPendingDeleteId(null);
    }
  };

  const renderOpticianRow = (optician: Optician) => {
    const isTogglePending = pendingToggleId === optician.id;
    const isDeletePending = pendingDeleteId === optician.id;
    const isRowBusy = isTogglePending || isDeletePending;

    return (
      <div
        key={optician.id}
        className={cn(
          "settings-optician-row",
          !optician.isActive && "settings-optician-row-inactive",
        )}
      >
        <div className="settings-optician-copy">
          <p className="settings-optician-name">{optician.name}</p>
          <div className="settings-optician-meta-row">
            <span className="settings-optician-meta-item">
              <Phone className="h-3.5 w-3.5" />
              <span>{optician.phone || "No phone number yet"}</span>
            </span>
            <span className="settings-optician-meta-item settings-optician-meta-item-address">
              <MapPinned className="h-3.5 w-3.5" />
              <span>{optician.address || "No address yet"}</span>
            </span>
          </div>
          <div className="settings-optician-actions-row">
            {optician.mapLink ? (
              <a
                href={optician.mapLink}
                target="_blank"
                rel="noreferrer"
                className="settings-optician-link"
              >
                Open Maps
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : (
              <span className="settings-optician-link-placeholder">No Google Maps link yet</span>
            )}
            <button
              type="button"
              onClick={() => setDeleteTarget(optician)}
              disabled={isRowBusy}
              className="settings-optician-delete"
            >
              {isDeletePending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>

        <div className="settings-optician-controls">
          <span
            className={cn(
              "settings-status-pill",
              optician.isActive
                ? "settings-status-pill-active"
                : "settings-status-pill-inactive",
            )}
          >
            {optician.isActive ? "Active" : "Inactive"}
          </span>

          <Switch
            checked={optician.isActive}
            onCheckedChange={(checked) => void handleToggleOptician(optician, checked)}
            disabled={isRowBusy}
            aria-label={`Toggle ${optician.name}`}
            className="settings-optician-switch"
          />
        </div>
      </div>
    );
  };

  const renderPlannedPanel = (category: SettingsCategory) => {
    const Icon = category.icon;

    return (
      <section
        id={`settings-panel-${category.id}`}
        className="settings-panel settings-planned-panel"
      >
        <div className="settings-planned-icon">
          <Icon className="h-4 w-4" />
        </div>
        <div className="settings-planned-copy-wrap">
          <span className="settings-planned-badge">Planned</span>
          <h3 className="settings-planned-title">{category.label}</h3>
          <p className="settings-planned-copy">{category.plannedCopy}</p>
        </div>
      </section>
    );
  };

  if (!isSessionReady) {
    return (
      <div className="admin-theme admin-v2-shell admin-v2-canvas min-h-screen text-white">
        <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/70">
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking session...
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminShell isSigningOut={isSigningOut} onLogout={handleSignOut}>
      <div className="settings-shell">
        <AddOpticianDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          opticians={opticians}
          onAdd={addOptician}
        />
        <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent className="settings-optician-delete-dialog">
            <AlertDialogHeader className="settings-optician-delete-header">
              <AlertDialogTitle className="settings-optician-delete-title">
                Delete {deleteTarget?.name ?? "this optician"}?
              </AlertDialogTitle>
              <AlertDialogDescription className="settings-optician-delete-description">
                This removes the optician from Settings and Queue selection. Any current patient assignment
                to this optician will be cleared automatically.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="settings-optician-delete-footer">
              <AlertDialogCancel
                disabled={Boolean(pendingDeleteId)}
                className="settings-optician-delete-action settings-optician-delete-cancel"
              >
                Cancel
              </AlertDialogCancel>
              <button
                type="button"
                onClick={() => void handleDeleteOptician()}
                disabled={Boolean(pendingDeleteId)}
                className="settings-optician-delete-action settings-optician-delete-confirm"
              >
                {pendingDeleteId ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete Optician
                  </>
                )}
              </button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <section className="settings-panel settings-page-header">
          <div className="settings-header-copy">
            <p className="settings-eyebrow">Admin Settings</p>
            <h2 className="settings-title">Clinic settings</h2>
            <p className="settings-description">
              Keep today&apos;s queue settings organized in one place, with clear category slots for
              the admin tools we&apos;ll add next.
            </p>
          </div>
        </section>

        {error && (
          <div className="settings-alert">
            <div className="settings-alert-copy">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleRetry()}
              disabled={isLoading}
              className="settings-alert-action"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Retrying...
                </>
              ) : (
                "Retry"
              )}
            </Button>
          </div>
        )}

        <div className="settings-tabs-shell">
          <div className="settings-tabs-list" role="group" aria-label="Settings categories">
            {SETTINGS_CATEGORIES.map((category) => {
              const isActive = category.id === activeCategory;
              return (
                <button
                  key={category.id}
                  type="button"
                  id={`settings-tab-${category.id}`}
                  aria-pressed={isActive}
                  className={cn(
                    "settings-tab-button",
                    isActive && "settings-tab-button-active",
                  )}
                  onClick={() => setActiveCategory(category.id)}
                >
                  <span className="settings-tab-label">{category.label}</span>
                  <span
                    className={cn(
                      "settings-tab-status",
                      category.status === "live"
                        ? "settings-tab-status-live"
                        : "settings-tab-status-planned",
                    )}
                  >
                    {category.status === "live" ? "Live" : "Planned"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {activeCategory === "opticians" ? (
          <section id="settings-panel-opticians" className="settings-content-stack">
            <section className="settings-panel settings-roster-panel">
              <div className="settings-panel-heading settings-panel-heading-inline">
                <div>
                  <p className="settings-panel-label">Roster</p>
                  <h3 className="settings-panel-title">Optician roster</h3>
                  <p className="settings-panel-copy">
                    Active opticians stay available for new Queue assignments. Inactive opticians
                    remain visible here so you can reactivate them anytime.
                  </p>
                </div>
                <div className="settings-roster-toolbar">
                  <span className="settings-roster-count">{totalCount} total</span>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(true)}
                    className="settings-summary-action"
                  >
                    Add Optician
                  </Button>
                </div>
              </div>

              {isLoading && totalCount === 0 ? (
                <div className="settings-empty-state">
                  <Loader2 className="h-4 w-4 animate-spin text-white/55" />
                  <p>Loading opticians...</p>
                </div>
              ) : totalCount === 0 ? (
                <div className="settings-empty-state">
                  <Settings2 className="h-5 w-5 text-white/35" />
                  <div>
                    <p className="settings-empty-title">No opticians yet</p>
                    <p className="settings-empty-copy">
                      Use Add Optician in the roster header and they will appear in Queue while
                      active.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="settings-roster-stack">
                  <section className="settings-roster-group">
                    <div className="settings-roster-group-header">
                      <div>
                        <p className="settings-panel-label">Opticians</p>
                        <p className="settings-group-copy">
                          Active entries appear first. Inactive entries stay muted below until
                          reactivated.
                        </p>
                      </div>
                      <span className="settings-roster-count">
                        {activeCount} active / {inactiveCount} inactive
                      </span>
                    </div>

                    <div className="settings-roster-list">
                      {orderedOpticians.map((optician) => renderOpticianRow(optician))}
                    </div>
                  </section>
                </div>
              )}
            </section>
          </section>
        ) : (
          renderPlannedPanel(
            SETTINGS_CATEGORIES.find((category) => category.id === activeCategory) ??
              SETTINGS_CATEGORIES[0],
          )
        )}
      </div>
    </AdminShell>
  );
};

export default AdminSettings;
