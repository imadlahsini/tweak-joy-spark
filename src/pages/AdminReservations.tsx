import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarClock,
  CircleAlert,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import AdminShell from "@/components/admin/AdminShell";
import ReservationsFilters from "@/components/admin/ReservationsFilters";
import ReservationsTable from "@/components/admin/ReservationsTable";
import ReservationCard from "@/components/admin/ReservationCard";
import ReservationDetailSheet from "@/components/admin/ReservationDetailSheet";
import EmptyState from "@/components/admin/EmptyState";
import ReservationsLoadingSkeleton from "@/components/admin/ReservationsLoadingSkeleton";
import { useReservations } from "@/hooks/use-reservations";
import { formatRelativeFromNow } from "@/lib/admin-constants";
import { findPatientProfileByPhone } from "@/lib/patient-profiles";
import type { ReservationRow } from "@/types/reservations";

const AdminReservations = () => {
  const navigate = useNavigate();
  const r = useReservations();

  const [isSigningOut, setIsSigningOut] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<ReservationRow | null>(null);
  const [selectedReservationProfileId, setSelectedReservationProfileId] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    await supabase.auth.signOut();
    setIsSigningOut(false);
    navigate("/admin/login", { replace: true });
  };

  const lastUpdatedLabel = useMemo(
    () => formatRelativeFromNow(r.lastRefreshedAt, nowMs),
    [nowMs, r.lastRefreshedAt],
  );

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!selectedReservation) {
      setSelectedReservationProfileId(null);
      return;
    }

    let cancelled = false;
    setSelectedReservationProfileId(null);

    findPatientProfileByPhone(selectedReservation.clientPhone)
      .then((profile) => {
        if (cancelled) return;
        setSelectedReservationProfileId(profile?.id ?? null);
      })
      .catch(() => {
        if (cancelled) return;
        setSelectedReservationProfileId(null);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedReservation]);

  // Session loading
  if (!r.isSessionReady) {
    return (
      <div className="admin-theme admin-shell-bg min-h-screen text-foreground">
        <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6">
          <div className="admin-glass-panel-soft inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking session...
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminShell
      isSigningOut={isSigningOut}
      onLogout={handleSignOut}
      topBarContent={
        <ReservationsFilters
          dateFrom={r.dateFrom}
          onDateFromChange={r.setDateFrom}
          dateTo={r.dateTo}
          onDateToChange={r.setDateTo}
          hasActiveFilters={r.hasActiveFilters}
          onClearFilters={r.clearFilters}
          variant="topbar"
        />
      }
      sidebarStats={{
        todayCount: r.stats.todayCount,
        newCount: r.stats.byStatus.new,
      }}
    >
      {r.accessDenied ? (
        <section className="admin-glass-panel mx-auto max-w-3xl rounded-[28px] p-8 text-center">
          <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-rose-300/45 bg-rose-400/10 text-rose-500">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Admin access required</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Your account is signed in but does not have admin permissions for the reservations
            console.
          </p>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="admin-control mt-6 h-10 rounded-xl px-4 text-foreground hover:bg-background/70"
          >
            {isSigningOut ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing out...
              </>
            ) : (
              "Sign Out"
            )}
          </Button>
        </section>
      ) : (
        <>
          <div className="reservations-shell">
            <section className="reservations-layout reservations-layout-single">
              <section className="reservations-main admin-glass-panel rounded-[24px] p-4 sm:p-5">
                <header className="reservations-header mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="reservations-eyebrow">Reservations Desk</p>
                    <h1 className="reservations-title">Booking Operations</h1>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Triage appointments, update status, and monitor reminder delivery.
                    </p>
                  </div>
                  <div className="reservations-last-updated">
                    <p className="reservations-eyebrow">Last Updated</p>
                    <p className="reservations-last-updated-value">
                      {r.isRefreshing ? "Refreshing now..." : lastUpdatedLabel}
                    </p>
                  </div>
                </header>

                <div className="mb-4 flex items-center justify-between border-y border-border/65 py-2 text-xs text-muted-foreground">
                  <p>{r.total} reservation(s)</p>
                  <p>{r.hasActiveFilters ? "Filtered range" : "All reservations in range"}</p>
                </div>

                {r.fatalError && (
                  <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-300/55 bg-rose-100/85 p-3 text-sm text-rose-700">
                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{r.fatalError}</p>
                  </div>
                )}

                {r.isLoading ? (
                  <ReservationsLoadingSkeleton />
                ) : r.reservations.length === 0 ? (
                  <EmptyState
                    icon={CalendarClock}
                    title="No reservations match filters"
                    description="Try clearing a filter or changing the date range."
                    action={
                      r.hasActiveFilters ? (
                        <Button
                          variant="outline"
                          onClick={r.clearFilters}
                          className="admin-control rounded-xl px-4 text-foreground hover:bg-background/70"
                        >
                          Clear Filters
                        </Button>
                      ) : undefined
                    }
                  />
                ) : (
                  <>
                    <div className="hidden md:block">
                      <ReservationsTable
                        reservations={r.reservations}
                        draftStatusById={r.draftStatusById}
                        savingById={r.savingById}
                        onDraftStatusChange={r.setDraftStatus}
                        onStatusSave={(reservation) => void r.handleStatusSave(reservation)}
                        onRowClick={setSelectedReservation}
                      />
                    </div>

                    <div className="reservations-mobile-list space-y-2 md:hidden">
                      {r.reservations.map((reservation, index) => (
                        <ReservationCard
                          key={reservation.id}
                          reservation={reservation}
                          draftStatus={r.draftStatusById[reservation.id] ?? reservation.status}
                          isSaving={Boolean(r.savingById[reservation.id])}
                          onDraftStatusChange={(status) => r.setDraftStatus(reservation.id, status)}
                          onStatusSave={() => void r.handleStatusSave(reservation)}
                          onCardClick={() => setSelectedReservation(reservation)}
                          index={index}
                        />
                      ))}
                    </div>
                  </>
                )}

                <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/65 pt-4">
                  <p className="text-xs text-muted-foreground">
                    Page {r.page + 1} of {Math.max(r.pageCount, 1)}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => r.setPage(Math.max(0, r.page - 1))}
                      disabled={r.page <= 0}
                      className="admin-control h-9 rounded-lg px-3 text-foreground hover:bg-background/70"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => r.setPage(Math.min(Math.max(r.pageCount - 1, 0), r.page + 1))}
                      disabled={r.page >= r.pageCount - 1}
                      className="admin-control h-9 rounded-lg px-3 text-foreground hover:bg-background/70"
                    >
                      Next
                    </Button>
                  </div>
                </footer>
              </section>
            </section>
          </div>

          {/* Detail sheet */}
          <ReservationDetailSheet
            reservation={selectedReservation}
            open={!!selectedReservation}
            onOpenChange={(open) => !open && setSelectedReservation(null)}
            draftStatus={
              selectedReservation
                ? r.draftStatusById[selectedReservation.id] ?? selectedReservation.status
                : undefined
            }
            onDraftStatusChange={(status) => {
              if (selectedReservation) r.setDraftStatus(selectedReservation.id, status);
            }}
            onStatusSave={() => {
              if (selectedReservation) void r.handleStatusSave(selectedReservation);
            }}
            isSaving={selectedReservation ? Boolean(r.savingById[selectedReservation.id]) : false}
            profileHref={
              selectedReservationProfileId
                ? `/admin/profiles/${selectedReservationProfileId}`
                : null
            }
          />
        </>
      )}
    </AdminShell>
  );
};

export default AdminReservations;
