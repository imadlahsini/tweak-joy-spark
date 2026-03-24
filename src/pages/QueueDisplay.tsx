import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarClock,
  Users2,
  Stethoscope,
  Clock,
  UserRound,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueueDisplay } from "@/hooks/use-queue-display";
import type { QueuePatient } from "@/types/queue";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** "Ahmed Benali" → "Ahmed B." */
function formatDisplayName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

/** Circled digit labels: ①②③…  falls back to #n+1 */
const CIRCLED = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩"];
function posLabel(i: number): string {
  return i < CIRCLED.length ? CIRCLED[i] : `#${i + 1}`;
}

/* ------------------------------------------------------------------ */
/*  Patient row                                                        */
/* ------------------------------------------------------------------ */

function PatientRow({
  patient,
  index,
  accentClass,
}: {
  patient: QueuePatient;
  index: number;
  accentClass: string;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{
        type: "spring",
        damping: 25,
        stiffness: 280,
        delay: index * 0.05,
      }}
      className="flex items-center gap-4 px-6 py-4 border-b border-border/30 last:border-0 min-h-[72px] group"
    >
      {/* Position pill */}
      <span
        className={`text-[22px] font-bold leading-none w-9 shrink-0 tabular-nums ${accentClass}`}
      >
        {posLabel(index)}
      </span>

      {/* Name */}
      <span className="flex-1 text-[21px] font-semibold text-foreground truncate leading-snug tracking-tight">
        {formatDisplayName(patient.clientName)}
      </span>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Column types                                                       */
/* ------------------------------------------------------------------ */

interface ColDef {
  id: string;
  label: string;
  sublabel: string;
  Icon: React.ElementType;
  topStripClass: string;
  headerBg: string;
  iconBg: string;
  iconColor: string;
  accentText: string;
  patients: QueuePatient[];
  footerLabel: string;
}

/* ------------------------------------------------------------------ */
/*  Single column panel                                                */
/* ------------------------------------------------------------------ */

function DisplayColumn({ col }: { col: ColDef }) {
  const { Icon } = col;
  return (
    <div className="flex flex-col h-full admin-glass-panel rounded-2xl overflow-hidden">
      {/* Colored top strip */}
      <div className={`h-1 w-full ${col.topStripClass}`} />

      {/* Header */}
      <div className={`flex items-center gap-4 px-6 py-5 ${col.headerBg} border-b border-border/30`}>
        <div
          className={`flex items-center justify-center w-12 h-12 rounded-xl ${col.iconBg} border border-white/60 shadow-sm shrink-0`}
        >
          <Icon className={`h-6 w-6 ${col.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-[22px] font-bold leading-none tracking-tight text-foreground">
            {col.label}
          </h2>
          <p className="text-[14px] text-muted-foreground mt-1">{col.sublabel}</p>
        </div>
        {/* Count badge */}
        <div
          className={`min-w-[44px] h-10 px-3 rounded-xl flex items-center justify-center ${col.iconBg} border border-white/60 shadow-sm`}
        >
          <span className={`text-[22px] font-bold tabular-nums ${col.iconColor}`}>
            {col.patients.length}
          </span>
        </div>
      </div>

      {/* Patient list */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {col.patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 py-16 text-muted-foreground">
            <UserRound className="h-16 w-16 opacity-20" />
            <p className="text-[18px] font-medium opacity-40">
              Aucun patient en attente
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {col.patients.map((p, i) => (
              <PatientRow
                key={p.id}
                patient={p}
                index={i}
                accentClass={col.accentText}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-border/25 bg-white/25 shrink-0">
        <p className="text-[14px] font-semibold text-muted-foreground uppercase tracking-widest">
          {col.footerLabel}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function QueueDisplay() {
  const { columns, isLoading } = useQueueDisplay();

  const colDefs: ColDef[] = [
    {
      id: "rdv",
      label: "Rendez-Vous",
      sublabel: "Patients avec rendez-vous",
      Icon: CalendarClock,
      topStripClass: "bg-gradient-to-r from-primary via-primary/70 to-accent/60",
      headerBg: "bg-gradient-to-br from-sky-50/70 to-blue-50/40",
      iconBg: "bg-sky-100/80",
      iconColor: "text-primary",
      accentText: "text-primary",
      patients: columns.rdv,
      footerLabel: `${columns.rdv.length} en attente`,
    },
    {
      id: "sans_rdv",
      label: "Sans Rendez-Vous",
      sublabel: "Patients sans rendez-vous",
      Icon: Users2,
      topStripClass: "bg-gradient-to-r from-amber-400 via-amber-300 to-orange-400/60",
      headerBg: "bg-gradient-to-br from-amber-50/70 to-orange-50/40",
      iconBg: "bg-amber-100/80",
      iconColor: "text-amber-600",
      accentText: "text-amber-600",
      patients: columns.sans_rdv,
      footerLabel: `${columns.sans_rdv.length} en attente`,
    },
    {
      id: "with_medecin",
      label: "Chez le Médecin",
      sublabel: "Patients en consultation",
      Icon: Stethoscope,
      topStripClass: "bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400/60",
      headerBg: "bg-gradient-to-br from-emerald-50/70 to-teal-50/40",
      iconBg: "bg-emerald-100/80",
      iconColor: "text-emerald-600",
      accentText: "text-emerald-600",
      patients: columns.with_medecin,
      footerLabel: `${columns.with_medecin.length} en consultation`,
    },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden admin-shell-bg admin-shell-atmosphere flex flex-col select-none">
      {/* ── Board ── */}
      <main className="flex-1 p-5 min-h-0 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full gap-4 text-muted-foreground">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            >
              <Clock className="h-9 w-9 opacity-35" />
            </motion.div>
            <p className="text-[20px] font-medium">
              Chargement de la file d'attente…
            </p>
          </div>
        ) : (
          <>
            {/* Desktop — 3 columns */}
            <div className="hidden md:grid md:grid-cols-3 gap-5 h-full">
              {colDefs.map((col) => (
                <DisplayColumn key={col.id} col={col} />
              ))}
            </div>

            {/* Mobile — tabs */}
            <div className="md:hidden h-full flex flex-col">
              <Tabs
                defaultValue="rdv"
                className="h-full flex flex-col"
              >
                <TabsList className="grid grid-cols-3 mb-4 h-12 shrink-0 admin-glass-panel-soft rounded-xl">
                  {colDefs.map((col) => {
                    const { Icon } = col;
                    return (
                      <TabsTrigger
                        key={col.id}
                        value={col.id}
                        className="flex items-center gap-2 text-[13px] font-semibold"
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{col.label}</span>
                        {col.patients.length > 0 && (
                          <span
                            className={`ml-1 min-w-[22px] h-5 px-1.5 rounded-full text-[12px] font-bold flex items-center justify-center ${col.iconBg} ${col.iconColor}`}
                          >
                            {col.patients.length}
                          </span>
                        )}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
                {colDefs.map((col) => (
                  <TabsContent
                    key={col.id}
                    value={col.id}
                    className="flex-1 min-h-0 mt-0 data-[state=active]:flex data-[state=active]:flex-col"
                  >
                    <DisplayColumn col={col} />
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
