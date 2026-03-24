import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  PopoverAnchor,
  Popover,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  formatQueueDate,
  formatWaitTime,
  getTodayStr,
  queueStatusDotClass,
  queueStatusLabel,
  queueTypeLabel,
} from "@/lib/queue-constants";
import { formatDateTime } from "@/lib/admin-constants";
import type { Optician, QueuePatient, QueuePatientStatus } from "@/types/queue";
import { FOLLOW_UPS, PROCEDURES } from "@/types/queue";

interface PatientDetailSheetProps {
  patient: QueuePatient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opticians: Optician[];
  onUpdate: (id: string, updates: Record<string, unknown>) => Promise<void>;
  onSetFollowUp: (id: string, followUp: string, followUpDate: string) => Promise<QueuePatient>;
  onComplete: (id: string) => void;
  profileHref?: string | null;
  isReadOnly?: boolean;
}

const queueDetailStatusClass: Record<QueuePatientStatus, string> = {
  waiting: "queue-detail-status-line--waiting",
  with_medecin: "queue-detail-status-line--medecin",
  completed: "queue-detail-status-line--completed",
  no_show: "queue-detail-status-line--no-show",
  cancelled: "queue-detail-status-line--cancelled",
};

const PROCEDURE_PRESENTATION: Record<
  (typeof PROCEDURES)[number],
  { label: string; iconPath: string; color: string; rgb: string }
> = {
  "Dilatation Viapen": {
    label: "Dilatation Viapen",
    iconPath: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8Z",
    color: "#A855F7",
    rgb: "168,85,247",
  },
  "Dilatation Mydria": {
    label: "Dilatation Mydria",
    iconPath: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8Z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z",
    color: "#6366F1",
    rgb: "99,102,241",
  },
  "Contrôle HTO": {
    label: "Contrôle HTO",
    iconPath: "M22 12h-4l-3 9L9 3l-3 9H2",
    color: "#F97316",
    rgb: "249,115,22",
  },
  Eidon: {
    label: "Eidon",
    iconPath: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z M2 12h20",
    color: "#3B82F6",
    rgb: "59,130,246",
  },
  "Eidon + Dilatation": {
    label: "Eidon + Dilat.",
    iconPath: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
    color: "#EC4899",
    rgb: "236,72,153",
  },
  "Préparation": {
    label: "Préparation",
    iconPath: "M9 12l2 2 4-4 M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z",
    color: "#22C55E",
    rgb: "34,197,94",
  },
};

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Africa/Casablanca",
});

const pickerHeaderMonthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  timeZone: "Africa/Casablanca",
});

const pickerHeaderYearFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  timeZone: "Africa/Casablanca",
});

const pickerFooterDateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  timeZone: "Africa/Casablanca",
});

const queueDateToCalendarDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
};

const calendarDateToQueueDateStr = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const queueDateToUtcDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
};

const utcDateToQueueDateStr = (date: Date) => date.toISOString().slice(0, 10);

const getUtcDaysInMonth = (year: number, monthIndex: number) =>
  new Date(Date.UTC(year, monthIndex + 1, 0, 12, 0, 0, 0)).getUTCDate();

const addUtcMonthsClamped = (date: Date, monthsToAdd: number) => {
  const currentDay = date.getUTCDate();
  const monthAnchor = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 12, 0, 0, 0),
  );
  monthAnchor.setUTCMonth(monthAnchor.getUTCMonth() + monthsToAdd);

  const targetYear = monthAnchor.getUTCFullYear();
  const targetMonth = monthAnchor.getUTCMonth();
  const clampedDay = Math.min(currentDay, getUtcDaysInMonth(targetYear, targetMonth));

  return new Date(Date.UTC(targetYear, targetMonth, clampedDay, 12, 0, 0, 0));
};

const getFollowUpPresetDate = (followUp: string, baseDateStr = getTodayStr()) => {
  const date = queueDateToUtcDate(baseDateStr);

  switch (followUp) {
    case "15 Days":
      date.setUTCDate(date.getUTCDate() + 15);
      break;
    case "1 month":
      return utcDateToQueueDateStr(addUtcMonthsClamped(date, 1));
    case "2 months":
      return utcDateToQueueDateStr(addUtcMonthsClamped(date, 2));
    case "3 months":
      return utcDateToQueueDateStr(addUtcMonthsClamped(date, 3));
    case "6 months":
      return utcDateToQueueDateStr(addUtcMonthsClamped(date, 6));
    case "1 year":
      return utcDateToQueueDateStr(addUtcMonthsClamped(date, 12));
    default:
      break;
  }

  return utcDateToQueueDateStr(date);
};

const formatStageTime = (value: string | null) =>
  value ? timeFormatter.format(new Date(value)) : null;

const getFollowUpParts = (value: string) => {
  const [amount, ...unitParts] = value.split(" ");
  return {
    amount,
    unit: unitParts.join(" ") || null,
  };
};

const getMobileFollowUpLabel = (value: string) => {
  switch (value) {
    case "15 Days":
      return "15D";
    case "1 month":
      return "1M";
    case "2 months":
      return "2M";
    case "3 months":
      return "3M";
    case "6 months":
      return "6M";
    case "1 year":
      return "12M";
    default:
      return value;
  }
};

const normalizeInlineWhitespace = (value: string) => value.replace(/\s{2,}/g, " ").trim();

const followUpWeekdayLabel = (date: Date) => {
  const day = date.getDay();
  const labels = ["S", "M", "T", "W", "T", "F", "S"];
  return labels[day] ?? "";
};

const PROCEDURE_DRAG_THRESHOLD_PX = 6;

const PatientDetailSheet = ({
  patient,
  open,
  onOpenChange,
  opticians,
  onUpdate,
  onSetFollowUp,
  onComplete,
  profileHref,
  isReadOnly,
}: PatientDetailSheetProps) => {
  const isMobile = useIsMobile();
  const [notes, setNotes] = useState(patient?.notes ?? "");
  const [procedureValue, setProcedureValue] = useState(patient?.procedure ?? null);
  const [procedureAtValue, setProcedureAtValue] = useState(patient?.procedureAt ?? null);
  const [followUpValue, setFollowUpValue] = useState(patient?.followUp ?? null);
  const [followUpDateValue, setFollowUpDateValue] = useState(patient?.followUpDate ?? null);
  const [opticianIdValue, setOpticianIdValue] = useState(patient?.opticianId ?? null);
  const [showDetails, setShowDetails] = useState(true);
  const [savingField, setSavingField] = useState<string | null>(null);
  const [followUpPickerOpen, setFollowUpPickerOpen] = useState(false);
  const [pendingFollowUpValue, setPendingFollowUpValue] = useState<string | null>(null);
  const [followUpDraftDate, setFollowUpDraftDate] = useState<string | null>(null);
  const [followUpPickerInitial, setFollowUpPickerInitial] = useState<{
    followUp: string;
    date: string | null;
  } | null>(null);
  const [followUpDiscardConfirmOpen, setFollowUpDiscardConfirmOpen] = useState(false);
  const [followUpCalendarMonth, setFollowUpCalendarMonth] = useState<Date | undefined>(() =>
    patient?.followUpDate
      ? queueDateToCalendarDate(patient.followUpDate)
      : queueDateToCalendarDate(getTodayStr()),
  );
  const [followUpAnimationOriginX, setFollowUpAnimationOriginX] = useState(50);
  const notesSaveInFlightRef = useRef(false);
  const notesTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const detailScrollRef = useRef<HTMLDivElement | null>(null);
  const followUpInlineRef = useRef<HTMLDivElement | null>(null);
  const followUpTrackRef = useRef<HTMLDivElement | null>(null);
  const procedureScrollRef = useRef<HTMLDivElement | null>(null);
  const suppressProcedureClickRef = useRef(false);
  const procedureScrollRafRef = useRef<number | null>(null);
  const procedurePendingScrollLeftRef = useRef<number | null>(null);
  const procedureDragRef = useRef({
    pointerId: -1,
    pointerType: "",
    startX: 0,
    startScrollLeft: 0,
    moved: false,
    active: false,
  });
  const [isProcedureDragging, setIsProcedureDragging] = useState(false);

  const cancelQueuedProcedureScroll = () => {
    if (procedureScrollRafRef.current !== null) {
      window.cancelAnimationFrame(procedureScrollRafRef.current);
      procedureScrollRafRef.current = null;
    }
    procedurePendingScrollLeftRef.current = null;
  };

  const queueProcedureScrollWrite = (nextScrollLeft: number) => {
    procedurePendingScrollLeftRef.current = nextScrollLeft;
    if (procedureScrollRafRef.current !== null) return;

    procedureScrollRafRef.current = window.requestAnimationFrame(() => {
      const scrollEl = procedureScrollRef.current;
      if (scrollEl && procedurePendingScrollLeftRef.current !== null) {
        scrollEl.scrollLeft = procedurePendingScrollLeftRef.current;
      }
      procedureScrollRafRef.current = null;
      procedurePendingScrollLeftRef.current = null;
    });
  };

  useEffect(() => {
    if (!open) return;
    setNotes(patient?.notes ?? "");
    setProcedureValue(patient?.procedure ?? null);
    setProcedureAtValue(patient?.procedureAt ?? null);
    setFollowUpValue(patient?.followUp ?? null);
    setFollowUpDateValue(patient?.followUpDate ?? null);
    setOpticianIdValue(patient?.opticianId ?? null);
    setShowDetails(true);
    setFollowUpPickerOpen(false);
    setPendingFollowUpValue(null);
    setFollowUpDraftDate(null);
    setFollowUpPickerInitial(null);
    setFollowUpDiscardConfirmOpen(false);
    setFollowUpAnimationOriginX(50);
    setFollowUpCalendarMonth(
      patient?.followUpDate
        ? queueDateToCalendarDate(patient.followUpDate)
        : queueDateToCalendarDate(getTodayStr()),
    );
  }, [
    open,
    patient?.id,
    patient?.notes,
    patient?.procedure,
    patient?.procedureAt,
    patient?.followUp,
    patient?.followUpDate,
    patient?.opticianId,
  ]);

  useEffect(() => {
    if (open) return;
    setFollowUpPickerOpen(false);
    setPendingFollowUpValue(null);
    setFollowUpDraftDate(null);
    setFollowUpPickerInitial(null);
    setFollowUpDiscardConfirmOpen(false);
    setFollowUpAnimationOriginX(50);
    setFollowUpCalendarMonth(undefined);
    setIsProcedureDragging(false);
    cancelQueuedProcedureScroll();
    suppressProcedureClickRef.current = false;
    procedureDragRef.current = {
      pointerId: -1,
      pointerType: "",
      startX: 0,
      startScrollLeft: 0,
      moved: false,
      active: false,
    };
  }, [open]);

  useEffect(() => {
    return () => {
      cancelQueuedProcedureScroll();
    };
  }, []);

  useEffect(() => {
    const textarea = notesTextareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.max(textarea.scrollHeight, 72)}px`;
  }, [notes, open, showDetails]);

  if (!patient) return null;

  const resetFollowUpPicker = () => {
    setFollowUpPickerOpen(false);
    setPendingFollowUpValue(null);
    setFollowUpDraftDate(null);
    setFollowUpPickerInitial(null);
    setFollowUpDiscardConfirmOpen(false);
    setFollowUpCalendarMonth(undefined);
  };

  const isFollowUpDraftDirty = () => {
    if (!followUpPickerInitial) return false;
    return (
      pendingFollowUpValue !== followUpPickerInitial.followUp ||
      followUpDraftDate !== followUpPickerInitial.date
    );
  };

  const requestCloseFollowUpPicker = () => {
    if (isFollowUpSaving) return;
    if (isFollowUpDraftDirty()) {
      setFollowUpDiscardConfirmOpen(true);
      return;
    }
    resetFollowUpPicker();
  };

  const handleDiscardFollowUpChanges = () => {
    setFollowUpDiscardConfirmOpen(false);
    resetFollowUpPicker();
  };

  const saveNotesIfChanged = async () => {
    if (notesSaveInFlightRef.current || notes === (patient.notes ?? "")) return;
    notesSaveInFlightRef.current = true;

    try {
      await onUpdate(patient.id, { notes: notes || null });
      toast.success("Notes updated");
    } catch {
      toast.error("Failed to update notes");
    } finally {
      notesSaveInFlightRef.current = false;
    }
  };

  const handleNotesBlur = async () => {
    if (notes !== (patient.notes ?? "")) {
      await saveNotesIfChanged();
    }
  };

  const handleFieldUpdate = async (field: string, value: unknown) => {
    const previousProcedure = procedureValue;
    const previousProcedureAt = procedureAtValue;
    const previousOpticianId = opticianIdValue;

    if (field === "procedure") {
      setProcedureValue((value as string | null) ?? null);
      setProcedureAtValue(value ? new Date().toISOString() : null);
    }

    if (field === "opticianId") {
      setOpticianIdValue((value as string | null) ?? null);
    }

    setSavingField(field);

    try {
      const updates: Record<string, unknown> = { [field]: value };
      if (field === "procedure" && value) {
        updates.procedureAt = new Date().toISOString();
      }
      await onUpdate(patient.id, updates);
      toast.success("Updated");
    } catch {
      if (field === "procedure") {
        setProcedureValue(previousProcedure);
        setProcedureAtValue(previousProcedureAt);
      }

      if (field === "opticianId") {
        setOpticianIdValue(previousOpticianId);
      }

      toast.error("Failed to update");
    } finally {
      setSavingField((current) => (current === field ? null : current));
    }
  };

  const captureFollowUpAnimationOrigin = (triggerEl?: HTMLElement | null) => {
    if (!triggerEl) {
      setFollowUpAnimationOriginX(50);
      return;
    }

    const triggerRect = triggerEl.getBoundingClientRect();
    const trackRect = followUpTrackRef.current?.getBoundingClientRect() ?? triggerRect;
    if (trackRect.width <= 0) {
      setFollowUpAnimationOriginX(50);
      return;
    }

    const centerX = triggerRect.left + triggerRect.width / 2;
    const ratio = ((centerX - trackRect.left) / trackRect.width) * 100;
    const normalized = Math.max(0, Math.min(100, ratio));
    setFollowUpAnimationOriginX(normalized);
  };

  const handleOpenFollowUpPicker = (
    followUp: string,
    isSelected: boolean,
    triggerEl?: HTMLElement | null,
  ) => {
    if (isReadOnly || isFollowUpSaving) return;
    captureFollowUpAnimationOrigin(triggerEl);

    if (followUpPickerOpen && pendingFollowUpValue === followUp) {
      if (followUpDraftDate) {
        setFollowUpCalendarMonth(queueDateToCalendarDate(followUpDraftDate));
      }

      return;
    }

    const nextDate = isSelected && followUpDateValue
      ? followUpDateValue
      : getFollowUpPresetDate(followUp);

    setPendingFollowUpValue(followUp);
    setFollowUpDraftDate(nextDate);
    setFollowUpPickerInitial({
      followUp,
      date: nextDate,
    });
    setFollowUpCalendarMonth(queueDateToCalendarDate(nextDate));
    setFollowUpPickerOpen(true);
  };

  const handleSaveFollowUp = async () => {
    if (!pendingFollowUpValue || !followUpDraftDate || !isFollowUpDraftDirty()) return;

    const previousFollowUp = followUpValue;
    const previousFollowUpDate = followUpDateValue;
    setFollowUpValue(pendingFollowUpValue);
    setFollowUpDateValue(followUpDraftDate);
    setFollowUpCalendarMonth(queueDateToCalendarDate(followUpDraftDate));
    setSavingField("followUp");

    try {
      const updatedPatient = await onSetFollowUp(
        patient.id,
        pendingFollowUpValue,
        followUpDraftDate,
      );
      setFollowUpValue(updatedPatient.followUp);
      setFollowUpDateValue(updatedPatient.followUpDate);
      setFollowUpCalendarMonth(
        updatedPatient.followUpDate
          ? queueDateToCalendarDate(updatedPatient.followUpDate)
          : queueDateToCalendarDate(getTodayStr()),
      );
      toast.success("Follow-up scheduled");
      resetFollowUpPicker();
    } catch {
      setFollowUpValue(previousFollowUp);
      setFollowUpDateValue(previousFollowUpDate);
      setFollowUpCalendarMonth(
        previousFollowUpDate
          ? queueDateToCalendarDate(previousFollowUpDate)
          : queueDateToCalendarDate(getTodayStr()),
      );
      toast.error("Failed to schedule follow-up");
    } finally {
      setSavingField((current) => (current === "followUp" ? null : current));
    }
  };

  const handleProcedurePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isMobile) return;
    const scrollEl = procedureScrollRef.current;
    if (!scrollEl) return;

    suppressProcedureClickRef.current = false;
    cancelQueuedProcedureScroll();

    procedureDragRef.current = {
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      startX: event.clientX,
      startScrollLeft: scrollEl.scrollLeft,
      moved: false,
      active: true,
    };
    setIsProcedureDragging(false);

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is best-effort across touch browsers.
    }
  };

  const handleProcedurePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isMobile) return;
    const scrollEl = procedureScrollRef.current;
    if (!scrollEl) return;

    const drag = procedureDragRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.startX;
    if (!drag.moved && Math.abs(deltaX) >= PROCEDURE_DRAG_THRESHOLD_PX) {
      drag.moved = true;
      suppressProcedureClickRef.current = true;
      setIsProcedureDragging(true);
    }

    if (!drag.moved) return;

    const nextScrollLeft = drag.startScrollLeft - deltaX;
    queueProcedureScrollWrite(nextScrollLeft);

    if (drag.pointerType === "touch") {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const handleProcedurePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = procedureDragRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;

    const scrollEl = procedureScrollRef.current;
    if (scrollEl && procedurePendingScrollLeftRef.current !== null) {
      scrollEl.scrollLeft = procedurePendingScrollLeftRef.current;
    }
    cancelQueuedProcedureScroll();

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may not be active on all devices.
    }

    drag.active = false;
    drag.pointerId = -1;
    drag.pointerType = "";
    setIsProcedureDragging(false);
  };

  const isMedecinQueue = patient.status === "with_medecin";
  const isProcedureSaving = savingField === "procedure";
  const isFollowUpSaving = savingField === "followUp";
  const isOpticianSaving = savingField === "opticianId";
  const today = getTodayStr();
  const selectedOptician =
    (opticianIdValue
      ? opticians.find((optician) => optician.id === opticianIdValue) ??
        (patient.optician?.id === opticianIdValue ? patient.optician : null)
      : null) ?? null;
  const activeOpticians = opticians.filter((optician) => optician.isActive);
  const assignedInactiveOptician =
    selectedOptician && !selectedOptician.isActive ? selectedOptician : null;
  const selectableOpticians = assignedInactiveOptician
    ? [
        assignedInactiveOptician,
        ...activeOpticians.filter((optician) => optician.id !== assignedInactiveOptician.id),
      ]
    : activeOpticians;
  const queueTypeDisplay = queueTypeLabel[patient.queueType] ?? patient.queueType;
  const headerStatusDetail =
    patient.status === "with_medecin" && patient.withDoctorAt
      ? formatWaitTime(patient.withDoctorAt)
      : patient.status === "waiting"
        ? formatWaitTime(patient.checkedInAt)
        : patient.status === "completed" && patient.completedAt
          ? formatStageTime(patient.completedAt)
          : patient.status === "no_show" && patient.noShowAt
            ? formatStageTime(patient.noShowAt)
            : patient.status === "cancelled" && patient.cancelledAt
              ? formatStageTime(patient.cancelledAt)
              : null;

  const progressLevel = patient.completedAt
    ? 3
    : patient.withDoctorAt
      ? 2
      : procedureAtValue
        ? 1
        : 0;

  const activeProgressStage = patient.status === "completed"
    ? "complete"
    : patient.status === "with_medecin"
      ? "medecin"
      : patient.status === "waiting"
        ? procedureAtValue
          ? "procedure"
          : "checkin"
        : null;

  const progressStages = [
    { key: "checkin", label: "Check-in", time: formatStageTime(patient.checkedInAt) },
    { key: "procedure", label: "Procedure", time: formatStageTime(procedureAtValue) },
    { key: "medecin", label: "Médecin", time: formatStageTime(patient.withDoctorAt) },
    { key: "complete", label: "Complete", time: formatStageTime(patient.completedAt) },
  ].map((stage, index) => ({
    ...stage,
    done: index <= progressLevel,
    active: activeProgressStage === stage.key,
  }));

  const showCompleteAction = !isReadOnly && isMedecinQueue;
  const procedureAssignedTime = procedureAtValue ? formatStageTime(procedureAtValue) : null;
  const followUpSummary = followUpValue && followUpDateValue
    ? `${followUpValue} selected · ${formatQueueDate(followUpDateValue)}`
    : followUpValue
      ? `${followUpValue} selected — pick date`
      : "Choose a follow-up to schedule the next RDV";
  const isOutsideFollowUpMonth = (date: Date) => {
    if (!followUpCalendarMonth) return false;
    return (
      date.getMonth() !== followUpCalendarMonth.getMonth() ||
      date.getFullYear() !== followUpCalendarMonth.getFullYear()
    );
  };
  const monthAnchorDate =
    followUpCalendarMonth ??
    (followUpDraftDate
      ? queueDateToCalendarDate(followUpDraftDate)
      : queueDateToCalendarDate(today));
  const pickerMonthLabel = pickerHeaderMonthFormatter.format(monthAnchorDate);
  const pickerYearLabel = pickerHeaderYearFormatter.format(monthAnchorDate);
  const pickerFooterLabel = followUpDraftDate
    ? normalizeInlineWhitespace(pickerFooterDateFormatter.format(queueDateToCalendarDate(followUpDraftDate)))
    : "Select date";
  const followUpAnimationStyle = {
    "--queue-detail-followup-origin-x": `${followUpAnimationOriginX.toFixed(2)}%`,
  } as CSSProperties;
  const desktopFollowUpPopoverOpen = !isMobile && followUpPickerOpen && Boolean(pendingFollowUpValue);
  const isFollowUpFocusActive = Boolean(
    followUpPickerOpen && pendingFollowUpValue && !followUpDiscardConfirmOpen,
  );
  const followUpFocusBackdrop =
    typeof document !== "undefined" && isFollowUpFocusActive
      ? createPortal(
          <button
            type="button"
            aria-label="Close follow-up calendar"
            className={cn(
              "queue-detail-followup-focus-backdrop",
              isMobile
                ? "queue-detail-followup-focus-backdrop--mobile"
                : "queue-detail-followup-focus-backdrop--desktop",
            )}
            onClick={requestCloseFollowUpPicker}
          />,
          document.body,
        )
      : null;
  const followUpPresetButtons = FOLLOW_UPS.map((followUp) => {
    const isSelected = followUpValue === followUp;
    const parts = getFollowUpParts(followUp);

    const segmentButton = (
      <button
        key={followUp}
        type="button"
        aria-pressed={isSelected}
        aria-label={followUp}
        disabled={isReadOnly || isFollowUpSaving}
        onClick={(event) => {
          handleOpenFollowUpPicker(followUp, isSelected, event.currentTarget);
        }}
        className={cn(
          "queue-detail-followup-segment",
          isSelected && "queue-detail-followup-segment--selected",
          (isReadOnly || isFollowUpSaving) &&
            "queue-detail-followup-segment--disabled",
        )}
        data-vaul-no-drag={isMobile ? "" : undefined}
      >
        {isMobile ? (
          <span className="queue-detail-followup-segment-mobile-label" aria-hidden="true">
            {getMobileFollowUpLabel(followUp)}
          </span>
        ) : (
          <>
            <span className="queue-detail-followup-segment-value">{parts.amount}</span>
            {parts.unit && (
              <span className="queue-detail-followup-segment-unit">{parts.unit}</span>
            )}
          </>
        )}
      </button>
    );

    if (isMobile) {
      return (
        <div key={followUp} data-vaul-no-drag={isMobile ? "" : undefined}>
          {segmentButton}
        </div>
      );
    }

    return segmentButton;
  });
  const handleFollowUpMonthNav = (direction: -1 | 1) => {
    const baseDate =
      followUpCalendarMonth ??
      (followUpDraftDate
        ? queueDateToCalendarDate(followUpDraftDate)
        : queueDateToCalendarDate(today));
    const nextDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + direction, 1, 12, 0, 0, 0);
    setFollowUpCalendarMonth(nextDate);
  };

  const followUpPickerPanel = pendingFollowUpValue ? (
    <div
      className="queue-detail-followup-picker-panel"
      data-vaul-no-drag={isMobile ? "" : undefined}
      style={followUpAnimationStyle}
    >
      <div className="queue-detail-followup-picker-card">
        <div className="queue-detail-followup-picker-head">
          <div className="queue-detail-followup-month">
            {pickerMonthLabel}
            <em>{pickerYearLabel}</em>
          </div>
          <div className="queue-detail-followup-navs">
            <button
              type="button"
              className="queue-detail-followup-nav"
              onClick={() => handleFollowUpMonthNav(-1)}
              aria-label="Previous month"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M10 3L5 8l5 5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              className="queue-detail-followup-nav"
              onClick={() => handleFollowUpMonthNav(1)}
              aria-label="Next month"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M6 3l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <Calendar
          key={`${monthAnchorDate.getFullYear()}-${monthAnchorDate.getMonth()}`}
          mode="single"
          fixedWeeks
          showOutsideDays
          selected={followUpDraftDate ? queueDateToCalendarDate(followUpDraftDate) : undefined}
          month={followUpCalendarMonth}
          onMonthChange={(nextMonth) => {
            setFollowUpCalendarMonth(nextMonth);
          }}
          formatters={{
            formatWeekdayName: followUpWeekdayLabel,
          }}
          onSelect={(date) => {
            if (!date) return;
            const nextDate = calendarDateToQueueDateStr(date);
            setFollowUpDraftDate(nextDate);
            setFollowUpCalendarMonth(queueDateToCalendarDate(nextDate));
          }}
          disabled={[
            { before: queueDateToCalendarDate(today) },
            isOutsideFollowUpMonth,
          ]}
          className="queue-detail-followup-calendar"
          data-vaul-no-drag={isMobile ? "" : undefined}
          classNames={{
            months: "queue-detail-followup-calendar-months",
            month: "queue-detail-followup-calendar-month",
            caption: "queue-detail-followup-calendar-caption",
            caption_label: "queue-detail-followup-calendar-caption-label",
            nav: "queue-detail-followup-calendar-nav-hidden",
            nav_button: "queue-detail-followup-calendar-nav-button",
            table: "queue-detail-followup-calendar-table",
            head_row: "queue-detail-followup-calendar-head-row",
            row: "queue-detail-followup-calendar-row",
            head_cell: "queue-detail-followup-calendar-head-cell",
            cell: "queue-detail-followup-calendar-cell",
            day: "queue-detail-followup-calendar-day",
            day_selected: "queue-detail-followup-calendar-day-selected",
            day_today: "queue-detail-followup-calendar-day-today",
            day_disabled: "queue-detail-followup-calendar-day-disabled",
            day_outside: "queue-detail-followup-calendar-day-outside",
          }}
        />

        <div className="queue-detail-followup-sep" />

        <div className="queue-detail-followup-picker-actions">
          <span className="queue-detail-followup-selected-label">
            {pickerFooterLabel}
          </span>
          <div className="queue-detail-followup-action-buttons">
            <Button
              type="button"
              variant="ghost"
              onClick={requestCloseFollowUpPicker}
              disabled={isFollowUpSaving}
              className="queue-detail-followup-picker-cancel"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                void handleSaveFollowUp();
              }}
              disabled={isFollowUpSaving || !followUpDraftDate || !isFollowUpDraftDirty()}
              className="queue-detail-followup-picker-save"
            >
              {isFollowUpSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  ) : null;
  const mobileFollowUpPopup =
    typeof document !== "undefined" && isMobile && isFollowUpFocusActive && followUpPickerPanel
      ? createPortal(
          <div
            key={pendingFollowUpValue ?? "followup-inline"}
            className={cn(
              "queue-detail-followup-inline queue-detail-followup-inline--animated queue-detail-followup-inline--portal",
              isFollowUpFocusActive && "queue-detail-followup-inline--focus-active",
            )}
            ref={followUpInlineRef}
            data-vaul-no-drag=""
            style={followUpAnimationStyle}
          >
            {followUpPickerPanel}
          </div>,
          document.body,
        )
      : null;

  const detailContent = (
    <>
      {followUpFocusBackdrop}
      {isMobile && isFollowUpFocusActive && (
        <button
          type="button"
          aria-label="Close follow-up calendar"
          className="queue-detail-followup-focus-surface"
          onClick={requestCloseFollowUpPicker}
        />
      )}
      {mobileFollowUpPopup}
      <div className="queue-detail-header">
        <div
          className={cn(
            "queue-detail-title-row",
            isMobile && "queue-detail-title-row--mobile",
          )}
        >
          <div className="queue-detail-title-block">
            <h2 className="queue-detail-title">{patient.clientName}</h2>
            <div className="queue-detail-status-row">
              <span
                className={cn(
                  "queue-detail-status-line",
                  queueDetailStatusClass[patient.status],
                )}
              >
                <span
                  className={cn(
                    "queue-detail-status-dot",
                    queueStatusDotClass[patient.status],
                  )}
                />
                {queueStatusLabel[patient.status]}
              </span>
              {headerStatusDetail && <span className="queue-detail-status-separator">·</span>}
              {headerStatusDetail && (
                <span className="queue-detail-status-detail">{headerStatusDetail}</span>
              )}
              <span className="queue-detail-status-separator">·</span>
              <span className="queue-detail-status-type">{queueTypeDisplay}</span>
            </div>
            {patient.clientPhone && (
              <a
                href={`tel:${patient.clientPhone}`}
                className="queue-detail-phone"
              >
                {patient.clientPhone}
              </a>
            )}
            {profileHref && (
              <Link to={profileHref} className="queue-detail-profile-link">
                Open Profile
              </Link>
            )}
          </div>
          {isMobile && (
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="queue-detail-close"
              aria-label="Close patient details"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="queue-detail-progress-section">
        <div className="queue-detail-progress-track" aria-hidden="true">
          {progressStages.map((stage) => (
            <div
              key={stage.key}
              className={cn(
                "queue-detail-progress-segment",
                stage.done && "queue-detail-progress-segment--done",
                stage.active && "queue-detail-progress-segment--active",
              )}
            >
              {stage.active && <span className="queue-detail-progress-pulse" />}
            </div>
          ))}
        </div>
        <div className="queue-detail-progress-labels">
          {progressStages.map((stage) => (
            <div key={stage.key} className="queue-detail-progress-label-col">
              <span
                className={cn(
                  "queue-detail-progress-name",
                  !stage.done && !stage.active && "queue-detail-progress-name--dim",
                )}
              >
                {stage.label}
              </span>
              <span className="queue-detail-progress-time">{stage.time ?? ""}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="queue-detail-scroll" ref={detailScrollRef}>
        {isMedecinQueue && (
          <>
            <section className="queue-detail-section">
              <div className="queue-detail-section-head">
                <span className="queue-detail-section-label">Procedure</span>
                <span className="queue-detail-section-aux">{procedureAssignedTime ?? ""}</span>
              </div>
              <div
                className={cn(
                  "queue-detail-procedure-scroll",
                  isProcedureDragging && "queue-detail-procedure-scroll--dragging",
                )}
                data-vaul-no-drag={isMobile ? "" : undefined}
                ref={procedureScrollRef}
                onPointerDown={handleProcedurePointerDown}
                onPointerMove={handleProcedurePointerMove}
                onPointerUp={handleProcedurePointerEnd}
                onPointerCancel={handleProcedurePointerEnd}
                onPointerLeave={handleProcedurePointerEnd}
              >
                <div
                  className="queue-detail-procedure-grid"
                  role="radiogroup"
                  aria-label="Procedure options"
                >
                  {PROCEDURES.map((procedure) => {
                    const isSelected = procedureValue === procedure;
                    const presentation = PROCEDURE_PRESENTATION[procedure];
                    const cardStyle = {
                      "--queue-detail-procedure-color": presentation.color,
                      "--queue-detail-procedure-rgb": presentation.rgb,
                    } as CSSProperties;

                    return (
                      <div
                        key={procedure}
                        className="queue-detail-procedure-item"
                        data-vaul-no-drag={isMobile ? "" : undefined}
                      >
                        <button
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          aria-label={procedure}
                          disabled={isReadOnly || isProcedureSaving}
                          onClick={() => {
                            if (isMobile && suppressProcedureClickRef.current) {
                              suppressProcedureClickRef.current = false;
                              return;
                            }
                            if (isSelected || isReadOnly || isProcedureSaving) return;
                            void handleFieldUpdate("procedure", procedure);
                          }}
                          className={cn(
                            "queue-detail-procedure-card",
                            isSelected && "queue-detail-procedure-card--selected",
                            (isReadOnly || isProcedureSaving) &&
                              "queue-detail-procedure-card--disabled",
                          )}
                          style={cardStyle}
                          data-vaul-no-drag={isMobile ? "" : undefined}
                        >
                          <svg
                            className="queue-detail-procedure-watermark"
                            width="56"
                            height="56"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d={presentation.iconPath} />
                          </svg>
                          {isSelected && <span className="queue-detail-procedure-accent" aria-hidden="true" />}
                          <span className="queue-detail-procedure-card-copy">
                            <span className="queue-detail-procedure-card-title">{presentation.label}</span>
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <section
              className={cn(
                "queue-detail-section queue-detail-section--follow-up",
                isMobile && isFollowUpFocusActive && "queue-detail-section--follow-up-focus-active",
              )}
            >
              <div className="queue-detail-section-head">
                <span className="queue-detail-section-label">Follow-up</span>
              </div>
              {isMobile ? (
                <div
                  className="queue-detail-followup-track"
                  aria-label="Follow-up options"
                  data-vaul-no-drag={isMobile ? "" : undefined}
                  ref={followUpTrackRef}
                >
                  {followUpPresetButtons}
                </div>
              ) : (
                <Popover
                  open={desktopFollowUpPopoverOpen}
                  onOpenChange={(nextOpen) => {
                    if (!nextOpen) {
                      requestCloseFollowUpPicker();
                    }
                  }}
                >
                  <PopoverAnchor asChild>
                    <div
                      className="queue-detail-followup-track"
                      aria-label="Follow-up options"
                      ref={followUpTrackRef}
                    >
                      {followUpPresetButtons}
                    </div>
                  </PopoverAnchor>
                  <PopoverContent
                    align="center"
                    sideOffset={10}
                    className={cn(
                      "queue-detail-followup-popover queue-detail-followup-popover--animated",
                      isFollowUpFocusActive && "queue-detail-followup-popover--focus-active",
                    )}
                    style={followUpAnimationStyle}
                  >
                    {followUpPickerPanel}
                  </PopoverContent>
                </Popover>
              )}
              {followUpValue ? (
                <button
                  type="button"
                  onClick={() => handleOpenFollowUpPicker(followUpValue, true)}
                  disabled={isReadOnly || isFollowUpSaving}
                  className="queue-detail-followup-hint queue-detail-followup-hint--action"
                >
                  {followUpSummary}
                  <span className="queue-detail-followup-hint-link">pick date</span>
                </button>
              ) : (
                <p className="queue-detail-followup-hint">{followUpSummary}</p>
              )}
            </section>
          </>
        )}

        <button
          type="button"
          className="queue-detail-details-toggle"
          aria-expanded={showDetails}
          onClick={() => setShowDetails((current) => !current)}
        >
          <span>Details</span>
          <ChevronDown
            className={cn(
              "queue-detail-details-chevron h-3.5 w-3.5",
              showDetails && "queue-detail-details-chevron--open",
            )}
          />
        </button>

        {showDetails && (
          <div className="queue-detail-details-body">
            {isMedecinQueue && (
              <section className="queue-detail-section queue-detail-section--details">
                <label className="queue-detail-field-label">Optician</label>
                <Select
                  value={opticianIdValue ?? ""}
                  onValueChange={(value) => void handleFieldUpdate("opticianId", value || null)}
                  disabled={isReadOnly || isOpticianSaving}
                >
                  <SelectTrigger
                    className={cn(
                      "queue-detail-select-trigger h-[40px] rounded-[10px]",
                      selectedOptician && "queue-detail-select-trigger--selected",
                    )}
                  >
                    <SelectValue placeholder="Assign optician..." />
                  </SelectTrigger>
                  <SelectContent className="queue-detail-select-content">
                    {selectableOpticians.map((optician) => (
                      <SelectItem key={optician.id} value={optician.id}>
                        {optician.name}
                        {!optician.isActive ? " (Inactive)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {assignedInactiveOptician && (
                  <p className="queue-detail-helper">
                    Current optician is inactive and shown only to preserve this assignment.
                  </p>
                )}
              </section>
            )}

            <section className="queue-detail-section queue-detail-section--details">
              <label className="queue-detail-field-label" htmlFor="queue-detail-notes">
                Notes
              </label>
              <Textarea
                ref={notesTextareaRef}
                id="queue-detail-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                onBlur={() => {
                  void handleNotesBlur();
                }}
                placeholder="Add notes..."
                className="queue-detail-textarea queue-detail-notes-input min-h-[72px] resize-none"
                disabled={isReadOnly}
                rows={2}
              />
            </section>
          </div>
        )}
      </div>

      <div
        className={cn(
          "queue-detail-footer",
          !showCompleteAction && "queue-detail-footer--meta-only",
        )}
      >
        <div className="queue-detail-footer-meta">
          <span className="queue-detail-footer-updated">
            {formatDateTime(patient.updatedAt)}
          </span>
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(patient.id);
              toast.success("ID copied");
            }}
            className="queue-detail-copy-id"
          >
            {patient.id.slice(0, 8)}
          </button>
        </div>

        {showCompleteAction && (
          <Button
            type="button"
            onClick={() => {
              onComplete(patient.id);
              onOpenChange(false);
            }}
            className="queue-detail-complete-action h-11 w-full rounded-[11px]"
          >
            Complete
          </Button>
        )}
      </div>

      <AlertDialog
        open={followUpDiscardConfirmOpen}
        onOpenChange={setFollowUpDiscardConfirmOpen}
      >
        <AlertDialogContent className="queue-detail-followup-discard-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="queue-detail-followup-discard-title">
              Discard follow-up changes?
            </AlertDialogTitle>
            <AlertDialogDescription className="queue-detail-followup-discard-description">
              Your selected follow-up date will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="queue-detail-followup-discard-actions">
            <AlertDialogCancel className="queue-detail-followup-discard-keep">
              Keep editing
            </AlertDialogCancel>
            <AlertDialogAction
              className="queue-detail-followup-discard-leave"
              onClick={handleDiscardFollowUpChanges}
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent
          overlayClassName="queue-detail-drawer-overlay"
          className={cn(
            "queue-detail-sheet queue-detail-drawer !fixed max-h-[min(92dvh,820px)] !overflow-hidden border-0 bg-transparent p-0 text-white",
            isFollowUpFocusActive && "queue-detail-drawer--followup-focus",
          )}
        >
          <DrawerTitle className="sr-only">{patient.clientName}</DrawerTitle>
          {detailContent}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="queue-detail-sheet !fixed w-full sm:max-w-[400px] p-0"
      >
        <SheetTitle className="sr-only">{patient.clientName}</SheetTitle>
        {detailContent}
      </SheetContent>
    </Sheet>
  );
};

export default PatientDetailSheet;
