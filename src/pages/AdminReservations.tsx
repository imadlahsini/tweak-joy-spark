import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarClock,
  CalendarRange,
  CircleAlert,
  Loader2,
  ShieldAlert,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AdminShell from "@/components/admin/AdminShell";
import ReservationsTable from "@/components/admin/ReservationsTable";
import ReservationCard from "@/components/admin/ReservationCard";
import ReservationDetailSheet from "@/components/admin/ReservationDetailSheet";
import EmptyState from "@/components/admin/EmptyState";
import ReservationsLoadingSkeleton from "@/components/admin/ReservationsLoadingSkeleton";
import { useReservations } from "@/hooks/use-reservations";
import { formatRelativeFromNow } from "@/lib/admin-constants";
import { findPatientProfileByPhone } from "@/lib/patient-profiles";
import type { ReservationRow } from "@/types/reservations";

/* ── date helpers ─────────────────────────────────────────── */

const formatDateInput = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getWeekStartMonday = (value: Date) => {
  const date = new Date(value);
  const offsetFromMonday = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - offsetFromMonday);
  return date;
};

const getWeekEndSunday = (value: Date) => {
  const start = getWeekStartMonday(value);
  start.setDate(start.getDate() + 6);
  return start;
};

/* ── component ────────────────────────────────────────────── */

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

  /* ── date filter logic ────────────────────────────────── */

  const applyDateFrom = (nextDateFrom: string) => {
    if (!nextDateFrom) {
      r.setDateFrom("");
      return;
    }
    r.setDateFrom(nextDateFrom);
    if (r.dateTo && nextDateFrom > r.dateTo) {
      r.setDateTo(nextDateFrom);
    }
  };

  const applyDateTo = (nextDateTo: string) => {
    if (!nextDateTo) {
      r.setDateTo("");
      return;
    }
    r.setDateTo(nextDateTo);
    if (r.dateFrom && nextDateTo < r.dateFrom) {
      r.setDateFrom(nextDateTo);
    }
  };

  const setQuickDate = (preset: string) => {
    const today = new Date();
    const set = (s: Date, e: Date) => {
      r.setDateFrom(formatDateInput(s));
      r.setDateTo(formatDateInput(e));
    };
    switch (preset) {
      case "today":
        set(today, today);
        break;
      case "week":
        set(getWeekStartMonday(today), getWeekEndSunday(today));
        break;
      case "month":
        set(new Date(today.getFullYear(), today.getMonth(), 1), new Date(today.getFullYear(), today.getMonth() + 1, 0));
        break;
      case "last7": {
        const s = new Date(today);
        s.setDate(today.getDate() - 6);
        set(s, today);
        break;
      }
      case "last30": {
        const s = new Date(today);
        s.setDate(today.getDate() - 29);
        set(s, today);
        break;
      }
    }
  };

  // Session loading
  if (!r.isSessionReady) {
    return (
      <div className="admin-theme admin-shell-bg min-h-screen text-white">
        <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/50">
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
      topBarContentInline
      topBarContent={
        <div className="reservations-topbar-tools">
          <Input
            type="date"
            value={r.dateFrom}
            onChange={(e) => applyDateFrom(e.target.value)}
            max={r.dateTo || undefined}
            className="reservations-topbar-date h-[34px] rounded-[10px] border-white/10 bg-white/[0.04] px-2.5 text-[12px] text-white/85 placeholder:text-white/30 focus:border-[#6DB5FF]/60 focus:shadow-[0_0_0_1px_rgba(109,181,255,0.25)] [color-scheme:dark]"
            aria-label="Filter from date"
          />
          <Input
            type="date"
            value={r.dateTo}
            onChange={(e) => applyDateTo(e.target.value)}
            min={r.dateFrom || undefined}
            className="reservations-topbar-date h-[34px] rounded-[10px] border-white/10 bg-white/[0.04] px-2.5 text-[12px] text-white/85 placeholder:text-white/30 focus:border-[#6DB5FF]/60 focus:shadow-[0_0_0_1px_rgba(109,181,255,0.25)] [color-scheme:dark]"
            aria-label="Filter to date"
          />

          <div className="reservations-topbar-spacer" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="reservations-topbar-quick h-[34px] gap-1.5 rounded-[10px] border-white/10 bg-white/[0.04] px-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-white/70 hover:bg-white/[0.07] hover:text-white"
              >
                <CalendarRange className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Quick Range</span>
                <span className="sm:hidden">Range</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="border-white/12 bg-[#1A1A1E] text-white/85"
            >
              <DropdownMenuItem onClick={() => setQuickDate("today")}>Today</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setQuickDate("week")}>This Week</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setQuickDate("month")}>This Month</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setQuickDate("last7")}>Last 7 Days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setQuickDate("last30")}>Last 30 Days</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AnimatePresence>
            {r.hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, width: 0 }}
                animate={{ opacity: 1, scale: 1, width: "auto" }}
                exit={{ opacity: 0, scale: 0.85, width: 0 }}
                transition={{ duration: 0.15 }}
                className="reservations-topbar-clear overflow-hidden"
              >
                <Button
                  variant="outline"
                  onClick={r.clearFilters}
                  className="h-[34px] gap-1.5 rounded-[10px] border-[#FF6B6B]/35 bg-[#FF6B6B]/12 px-3 text-[12px] font-semibold text-[#FF6B6B] hover:border-[#FF6B6B]/50 hover:bg-[#FF6B6B]/18"
                >
                  <X className="h-3 w-3" />
                  Clear
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="reservations-topbar-info hidden shrink-0 items-center gap-1.5 rounded-[10px] border border-white/8 bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-mono text-white/40 sm:inline-flex">
            <span>{r.total} results</span>
            <span className="text-white/15">·</span>
            <span>{r.isRefreshing ? "refreshing…" : lastUpdatedLabel}</span>
          </div>
        </div>
      }
      sidebarStats={{
        todayCount: r.stats.todayCount,
        newCount: r.stats.byStatus.new,
      }}
    >
      {r.accessDenied ? (
        <section className="mx-auto max-w-3xl rounded-[18px] border border-white/10 bg-white/[0.03] p-8 text-center shadow-[0_12px_36px_rgba(0,0,0,0.38)]">
          <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[#FF6B6B]/35 bg-[#FF6B6B]/10 text-[#FF6B6B]">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-semibold text-white">Admin access required</h1>
          <p className="mt-3 text-sm text-white/50">
            Your account is signed in but does not have admin permissions for the reservations
            console.
          </p>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="mt-6 h-10 rounded-xl border-white/15 bg-white/[0.04] px-4 text-white hover:bg-white/[0.08]"
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
              <section className="reservations-main p-4 sm:p-5">
                {r.fatalError && (
                  <div className="mb-4 flex items-start gap-2 rounded-xl border border-[#FF6B6B]/25 bg-[#FF6B6B]/10 p-3 text-sm text-[#FF6B6B]">
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
                          className="rounded-xl border-white/15 bg-white/[0.04] px-4 text-white hover:bg-white/[0.08]"
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
                        onRowClick={setSelectedReservation}
                      />
                    </div>

                    <div className="reservations-mobile-list space-y-2 md:hidden">
                      {r.reservations.map((reservation, index) => (
                        <ReservationCard
                          key={reservation.id}
                          reservation={reservation}
                          onCardClick={() => setSelectedReservation(reservation)}
                          index={index}
                        />
                      ))}
                    </div>
                  </>
                )}

                <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-4">
                  <p className="text-xs text-white/35">
                    Page {r.page + 1} of {Math.max(r.pageCount, 1)}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => r.setPage(Math.max(0, r.page - 1))}
                      disabled={r.page <= 0}
                      className="h-9 rounded-lg border-white/15 bg-white/[0.04] px-3 text-white hover:bg-white/[0.08] disabled:opacity-35"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => r.setPage(Math.min(Math.max(r.pageCount - 1, 0), r.page + 1))}
                      disabled={r.page >= r.pageCount - 1}
                      className="h-9 rounded-lg border-white/15 bg-white/[0.04] px-3 text-white hover:bg-white/[0.08] disabled:opacity-35"
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
            onSkipReminder={r.skipReminder}
            onResendReminder={r.resendReminder}
            onResendConfirmation={r.resendConfirmation}
          />
        </>
      )}
    </AdminShell>
  );
};

export default AdminReservations;
