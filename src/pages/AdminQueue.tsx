import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CircleAlert,
  ExternalLink,
  Loader2,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import AdminShell from "@/components/admin/AdminShell";
import QueueDatePicker from "@/components/admin/queue/QueueDatePicker";
import QueueSearch from "@/components/admin/queue/QueueSearch";
import QueueStats from "@/components/admin/queue/QueueStats";
import QueueBoard from "@/components/admin/queue/QueueBoard";
import AddPatientDialog from "@/components/admin/queue/AddPatientDialog";
import PatientDetailSheet from "@/components/admin/queue/PatientDetailSheet";
import { useQueue } from "@/hooks/use-queue";
import { getTodayStr } from "@/lib/queue-constants";
import type { QueuePatient, QueueType } from "@/types/queue";

const AdminQueue = () => {
  const navigate = useNavigate();
  const q = useQueue();

  const [isSigningOut, setIsSigningOut] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<QueuePatient | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addDialogQueueType, setAddDialogQueueType] = useState<QueueType>("rdv");
  const [recentlyAddedPatientId, setRecentlyAddedPatientId] = useState<string | null>(null);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    await supabase.auth.signOut();
    setIsSigningOut(false);
    navigate("/admin/login", { replace: true });
  };

  const handleAddClick = useCallback((queueType: QueueType) => {
    setAddDialogQueueType(queueType);
    setAddDialogOpen(true);
  }, []);

  const handleCardClick = useCallback((patient: QueuePatient) => {
    setSelectedPatient(patient);
  }, []);

  const handleAddPatient = useCallback(
    async (data: Parameters<typeof q.addPatient>[0]) => {
      const addedPatient = await q.addPatient(data);
      setRecentlyAddedPatientId(addedPatient.id);
      return addedPatient;
    },
    [q.addPatient],
  );

  useEffect(() => {
    if (!recentlyAddedPatientId) return;
    const timer = window.setTimeout(() => {
      setRecentlyAddedPatientId(null);
    }, 2800);
    return () => window.clearTimeout(timer);
  }, [recentlyAddedPatientId]);

  useEffect(() => {
    if (!selectedPatient) return;
    void q.refreshOpticians().catch(() => {});
  }, [selectedPatient?.id, q.refreshOpticians]);

  useEffect(() => {
    if (!selectedPatient) return;
    const syncedPatient = q.patients.find((patient) => patient.id === selectedPatient.id);
    if (syncedPatient && syncedPatient !== selectedPatient) {
      setSelectedPatient(syncedPatient);
    }
  }, [q.patients, selectedPatient]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isModifier = event.metaKey || event.ctrlKey;
      if (!isModifier || event.key.toLowerCase() !== "k") return;
      event.preventDefault();
      const input = document.getElementById("admin-queue-search") as HTMLInputElement | null;
      input?.focus();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Session loading
  if (!q.isSessionReady) {
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

  const isReadOnly = q.selectedDate < getTodayStr();

  return (
    <AdminShell
      isSigningOut={isSigningOut}
      onLogout={handleSignOut}
      topBarContentInline
      topBarContent={
        <div className="queue-topbar-tools">
          <div className="queue-topbar-date">
            <QueueDatePicker
              selectedDate={q.selectedDate}
              onDateChange={q.setSelectedDate}
              isToday={q.isToday}
              showContextBanner={false}
            />
          </div>

          <div className="queue-topbar-search">
            <QueueSearch
              value={q.search}
              onChange={q.setSearch}
              inputId="admin-queue-search"
              showShortcutHint
              className="w-full"
            />
          </div>

          <a
            href="/queue-display"
            target="_blank"
            rel="noreferrer"
            className="queue-topbar-display inline-flex h-[34px] shrink-0 items-center justify-center gap-2 rounded-[10px] border border-white/10 bg-white/[0.04] px-3.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-white/72 transition-all hover:bg-white/[0.07] hover:text-white active:scale-[0.98]"
            title="Open queue display"
          >
            <span>Display</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          <button
            type="button"
            onClick={q.refresh}
            disabled={q.isLoading}
            className="queue-topbar-refresh inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] border border-white/10 bg-white/[0.04] text-white/40 transition-all hover:bg-white/[0.07] hover:text-white/75 active:scale-90 disabled:opacity-40"
            title="Refresh"
          >
            <RefreshCw
              className={`h-4 w-4 ${q.isLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      }
      sidebarStats={{
        todayCount: q.stats.waiting + q.stats.withDoctor,
        newCount: q.stats.waiting,
      }}
    >
      {q.error && !q.patients.length ? (
        <section className="queue-page-error mx-auto max-w-3xl rounded-[20px] border border-white/10 bg-white/[0.03] p-8 text-center shadow-[0_12px_36px_rgba(0,0,0,0.38)]">
          <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[#FF6B6B]/35 bg-[#FF6B6B]/10 text-[#FF6B6B]">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-semibold text-white">
            Unable to load queue
          </h1>
          <p className="mt-3 text-sm text-white/65">{q.error}</p>
          <Button
            onClick={q.refresh}
            variant="outline"
            className="mt-6 h-10 rounded-xl border-white/15 bg-white/[0.04] px-4 text-white hover:bg-white/[0.08]"
          >
            Try Again
          </Button>
        </section>
      ) : (
        <div className="queue-page-grid">
          {/* Error banner slot (stable row even when empty) */}
          <div className="queue-error-slot">
            {q.error && q.patients.length > 0 && (
              <div className="queue-inline-error flex items-start gap-2 rounded-xl border border-[#FF6B6B]/35 bg-[#FF6B6B]/10 p-3 text-sm text-[#FF6B6B]">
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{q.error}</p>
              </div>
            )}
          </div>

          {/* Stats row */}
          <QueueStats
            stats={q.stats}
            criticalWaitingCount={q.criticalWaitingCount}
            isLoading={q.isLoading}
          />

          {/* Queue Board */}
          <div className="queue-board-slot min-h-0">
            {q.isLoading ? (
              <div className="queue-board-loading flex h-full min-h-0 items-center justify-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/65">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading queue...
                </div>
              </div>
            ) : (
              <div className="queue-board-wrap">
                <QueueBoard
                  columns={q.columns}
                  onMovePatient={q.movePatient}
                  onAddClick={handleAddClick}
                  onCardClick={handleCardClick}
                  onComplete={q.completePatient}
                  isReadOnly={isReadOnly}
                  highlightedPatientId={recentlyAddedPatientId}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add patient dialog */}
      <AddPatientDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        defaultQueueType={addDialogQueueType}
        findPatientProfileByPhone={q.findPatientProfileByPhone}
        onAdd={handleAddPatient}
      />

      {/* Patient detail sheet */}
      <PatientDetailSheet
        patient={selectedPatient}
        open={!!selectedPatient}
        onOpenChange={(open) => !open && setSelectedPatient(null)}
        opticians={q.opticians}
        onUpdate={q.updatePatient}
        onSetFollowUp={q.setPatientFollowUp}
        onComplete={q.completePatient}
        profileHref={
          selectedPatient?.patientProfileId
            ? `/admin/profiles/${selectedPatient.patientProfileId}`
            : null
        }
        isReadOnly={isReadOnly}
      />
    </AdminShell>
  );
};

export default AdminQueue;
