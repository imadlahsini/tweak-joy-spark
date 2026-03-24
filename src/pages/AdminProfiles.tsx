import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarClock,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  Loader2,
  Phone,
  RefreshCw,
  Search,
  ShieldAlert,
  Stethoscope,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminShell from "@/components/admin/AdminShell";
import EmptyState from "@/components/admin/EmptyState";
import {
  usePatientProfileDetail,
  usePatientProfilesDirectory,
} from "@/hooks/use-patient-profiles";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  formatDateTime,
  formatRelativeFromNow,
  formatRelativeTime,
} from "@/lib/admin-constants";
import { formatMoroccanPhoneDisplay } from "@/lib/moroccan-phone";
import { cn } from "@/lib/utils";
import type {
  PatientProfileActivityBadgeTone,
  PatientProfileActivityItem,
  PatientProfileDirectoryItem,
} from "@/types/patient-profiles";

const activityBadgeToneClass: Record<PatientProfileActivityBadgeTone, string> = {
  neutral: "profiles-activity-badge--neutral",
  info: "profiles-activity-badge--info",
  success: "profiles-activity-badge--success",
  warning: "profiles-activity-badge--warning",
  danger: "profiles-activity-badge--danger",
};

interface DirectoryRowProps {
  profile: PatientProfileDirectoryItem;
  isSelected: boolean;
  onSelect: (profileId: string) => void;
}

const DirectoryRow = ({ profile, isSelected, onSelect }: DirectoryRowProps) => (
  <button
    type="button"
    onClick={() => onSelect(profile.id)}
    className={cn(
      "profiles-directory-row",
      isSelected && "profiles-directory-row--selected",
    )}
  >
    <div className="profiles-directory-row-head">
      <div className="min-w-0">
        <h2 className="profiles-directory-row-title">{profile.name}</h2>
        <p className="profiles-directory-row-phone">
          {formatMoroccanPhoneDisplay(profile.phone)}
        </p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-white/28" />
    </div>
  </button>
);

const ActivityItem = ({ item }: { item: PatientProfileActivityItem }) => {
  const Icon = item.kind === "queue" ? Stethoscope : CalendarClock;
  const supportingCopy = [item.subtitle, ...item.meta]
    .filter((value) => value.trim() !== "")
    .join(" · ");
  const importantBadges = item.badges.filter(
    (badge) => badge.tone === "success" || badge.tone === "warning" || badge.tone === "danger",
  );

  return (
    <article className="profiles-activity-item">
      <div
        className={cn(
          "profiles-activity-item-icon",
          item.kind === "queue"
            ? "profiles-activity-item-icon--queue"
            : "profiles-activity-item-icon--appointment",
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="profiles-activity-item-copy">
        <div className="profiles-activity-item-topline">
          <h3 className="profiles-activity-item-title">{item.title}</h3>
          <time className="profiles-activity-item-time">{formatRelativeTime(item.occurredAt)}</time>
        </div>

        {supportingCopy !== "" && (
          <p className="profiles-activity-item-supporting">{supportingCopy}</p>
        )}

        {importantBadges.length > 0 && (
          <div className="profiles-activity-item-badges">
            {importantBadges.map((badge) => (
              <span
                key={`${item.id}-${badge.label}`}
                className={cn(
                  "profiles-activity-badge",
                  activityBadgeToneClass[badge.tone],
                )}
              >
                {badge.label}
              </span>
            ))}
          </div>
        )}

        {item.note && <p className="profiles-activity-item-note">{item.note}</p>}
      </div>
    </article>
  );
};

const AdminProfiles = () => {
  const navigate = useNavigate();
  const params = useParams<{ profileId: string }>();
  const selectedProfileId = params.profileId;
  const directory = usePatientProfilesDirectory(selectedProfileId);
  const detail = usePatientProfileDetail(selectedProfileId);
  const isMobile = useIsMobile();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    await supabase.auth.signOut();
    setIsSigningOut(false);
    navigate("/admin/login", { replace: true });
  };

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    if (selectedProfileId) return;
    if (directory.isLoading) return;
    if (directory.profiles.length === 0) return;

    navigate(`/admin/profiles/${directory.profiles[0].id}`, { replace: true });
  }, [directory.isLoading, directory.profiles, isMobile, navigate, selectedProfileId]);

  const handleRefreshWorkspace = () => {
    directory.refresh();
    if (selectedProfileId) {
      detail.refresh();
    }
  };

  const selectedInResults = useMemo(
    () =>
      selectedProfileId != null &&
      directory.profiles.some((profile) => profile.id === selectedProfileId),
    [directory.profiles, selectedProfileId],
  );

  const railProfiles = useMemo(() => {
    if (directory.selectedProfile == null || selectedInResults) {
      return directory.profiles;
    }

    return [
      directory.selectedProfile,
      ...directory.profiles.filter((profile) => profile.id !== directory.selectedProfile?.id),
    ];
  }, [directory.profiles, directory.selectedProfile, selectedInResults]);

  const showPinnedSelected = Boolean(directory.selectedProfile && !selectedInResults);
  const showDirectoryPane = !isMobile || selectedProfileId == null;
  const showDetailPane = !isMobile || selectedProfileId != null;
  const detailMetaLine = detail.detail
    ? [
        `Created ${formatDateTime(detail.detail.profile.createdAt)}`,
        `Updated ${formatRelativeFromNow(detail.detail.profile.updatedAt, nowMs)}`,
        `${detail.queueVisitCount} queue visits`,
        `${detail.appointmentCount} appointments`,
      ].join(" · ")
    : "";

  if (directory.isSessionReady === false) {
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
      <div className="profiles-workspace-shell">
        <div className="profiles-workspace-grid">
          {showDirectoryPane && (
            <aside className="profiles-directory-pane admin-glass-panel">
              <div className="profiles-directory-sticky-head">
                <div className="profiles-directory-pane-head">
                  <h1 className="profiles-directory-pane-title">Patient Profiles</h1>
                </div>

                <label className="profiles-search" htmlFor="admin-profiles-search">
                  <Search className="h-4 w-4" />
                  <Input
                    id="admin-profiles-search"
                    value={directory.search}
                    onChange={(event) => directory.setSearch(event.target.value)}
                    placeholder="Search by patient name or phone"
                    className="profiles-search-input"
                  />
                </label>

                <p className="profiles-directory-pane-meta">
                  {directory.total} patient{directory.total === 1 ? "" : "s"}
                </p>

                {directory.error && (
                  <div className="profiles-inline-error">
                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{directory.error}</p>
                  </div>
                )}

                {showPinnedSelected && (
                  <p className="profiles-directory-pinned-note">
                    {directory.search.trim() === ""
                      ? "The selected patient is pinned below while you browse this page."
                      : "The selected patient is pinned below while you browse these results."}
                  </p>
                )}
              </div>

              <div className="profiles-directory-scroll">
                {directory.isLoading ? (
                  <div className="profiles-loading-state">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading patient profiles...
                  </div>
                ) : railProfiles.length === 0 ? (
                  <EmptyState
                    icon={ShieldAlert}
                    title="No patient profiles found"
                    description={
                      directory.search.trim() === ""
                        ? "Profiles are created automatically from queue and booking flows."
                        : "Try a different name or phone search."
                    }
                  />
                ) : (
                  <div className="profiles-directory-list">
                    {railProfiles.map((profile) => (
                      <DirectoryRow
                        key={profile.id}
                        profile={profile}
                        isSelected={profile.id === selectedProfileId}
                        onSelect={(profileId) => navigate(`/admin/profiles/${profileId}`)}
                      />
                    ))}
                  </div>
                )}
              </div>

              <footer className="profiles-directory-pagination">
                <p>
                  Page {directory.page + 1} of {Math.max(directory.pageCount, 1)}
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => directory.setPage(Math.max(0, directory.page - 1))}
                    disabled={directory.page <= 0}
                    className="profiles-pagination-button"
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      directory.setPage(
                        Math.min(Math.max(directory.pageCount - 1, 0), directory.page + 1),
                      )
                    }
                    disabled={directory.page >= directory.pageCount - 1}
                    className="profiles-pagination-button"
                  >
                    Next
                  </Button>
                </div>
              </footer>
            </aside>
          )}

          {showDetailPane && (
            <section className="profiles-detail-pane admin-glass-panel">
              {selectedProfileId == null ? (
                <div className="profiles-detail-empty">
                  <EmptyState
                    icon={ClipboardList}
                    title="Select a patient"
                    description="Choose a patient from the directory to view their profile, upcoming bookings, and recent queue activity."
                  />
                </div>
              ) : detail.isLoading && detail.detail == null ? (
                <div className="profiles-loading-state profiles-loading-state--detail">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading patient profile...
                </div>
              ) : detail.error || detail.detail == null ? (
                <div className="profiles-detail-empty">
                  <div className="profiles-inline-error profiles-inline-error--detail">
                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{detail.error ?? "Patient profile unavailable."}</p>
                  </div>
                  <div className="profiles-detail-empty-actions">
                    {isMobile && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate("/admin/profiles")}
                        className="profile-detail-back-button"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Directory
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleRefreshWorkspace}
                      className="profiles-refresh-button"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Refresh
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <header className="profiles-detail-header-v2">
                    <div className="profiles-detail-toolbar">
                      {isMobile ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => navigate("/admin/profiles")}
                          className="profile-detail-back-button"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          All Patients
                        </Button>
                      ) : (
                        <div />
                      )}

                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRefreshWorkspace}
                        disabled={detail.isLoading || detail.isRefreshing}
                        className="profiles-refresh-button"
                      >
                        <RefreshCw
                          className={detail.isRefreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"}
                        />
                        Refresh
                      </Button>
                    </div>

                    <div className="profiles-detail-identity">
                      <div>
                        <h2 className="profiles-detail-title">{detail.detail.profile.name}</h2>
                        <a
                          href={`tel:${detail.detail.profile.phone}`}
                          className="profiles-detail-phone"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          {formatMoroccanPhoneDisplay(detail.detail.profile.phone)}
                        </a>
                        {detailMetaLine !== "" && (
                          <p className="profiles-detail-meta">{detailMetaLine}</p>
                        )}
                      </div>
                    </div>
                  </header>

                  <div className="profiles-detail-scroll">
                    <section className="profiles-activity-section">
                      <div className="profiles-activity-section-head">
                        <h3 className="profiles-activity-section-title">
                          Upcoming ({detail.detail.upcomingActivity.length})
                        </h3>
                      </div>

                      {detail.detail.upcomingActivity.length === 0 ? (
                        <p className="profiles-activity-empty-copy">No upcoming appointments.</p>
                      ) : (
                        <div className="profiles-activity-list">
                          {detail.detail.upcomingActivity.map((item) => (
                            <ActivityItem key={item.id} item={item} />
                          ))}
                        </div>
                      )}
                    </section>

                    <section className="profiles-activity-section">
                      <div className="profiles-activity-section-head">
                        <h3 className="profiles-activity-section-title">
                          Recent Activity ({detail.detail.recentActivity.length})
                        </h3>
                      </div>

                      {detail.detail.recentActivity.length === 0 ? (
                        <p className="profiles-activity-empty-copy">No recent patient activity yet.</p>
                      ) : (
                        <div className="profiles-activity-list">
                          {detail.detail.recentActivity.map((item) => (
                            <ActivityItem key={item.id} item={item} />
                          ))}
                        </div>
                      )}
                    </section>
                  </div>
                </>
              )}
            </section>
          )}
        </div>
      </div>
    </AdminShell>
  );
};

export default AdminProfiles;
