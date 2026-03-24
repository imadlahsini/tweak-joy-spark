import { memo, useEffect, useMemo, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatWaitTime,
  getWaitMinutes,
  getWaitSeverity,
  queueTypeLabel,
} from "@/lib/queue-constants";
import type { QueueColumnId, QueuePatient } from "@/types/queue";

interface QueuePatientCardProps {
  patient: QueuePatient;
  columnId: QueueColumnId;
  index: number;
  onCardClick: (patient: QueuePatient) => void;
  onComplete?: (id: string) => void;
  isDragOverlay?: boolean;
  draggable?: boolean;
  isRecentlyAdded?: boolean;
}

const getUrgencyTone = (checkedInAt: string) => {
  const severity = getWaitSeverity(checkedInAt);
  const waitMinutes = getWaitMinutes(checkedInAt);

  const progress =
    severity === "critical"
      ? 1
      : severity === "warning"
        ? Math.min(waitMinutes / (4 * 60), 1)
        : Math.min(waitMinutes / (2 * 60), 1);

  if (severity === "critical") {
    return {
      severity,
      progress,
      textClass: "queue-pt-time--critical",
      color: "#EF4444",
      rgb: "239,68,68",
    };
  }

  if (severity === "warning") {
    return {
      severity,
      progress,
      textClass: "queue-pt-time--warning",
      color: "#EAB308",
      rgb: "234,179,8",
    };
  }

  return {
    severity,
    progress,
    textClass: "queue-pt-time--normal",
    color: "#22C55E",
    rgb: "34,197,94",
  };
};

const QueuePatientCard = memo(
  ({
    patient,
    columnId,
    index,
    onCardClick,
    isDragOverlay,
    draggable = true,
    isRecentlyAdded = false,
  }: QueuePatientCardProps) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: patient.id,
      data: { patient, columnId },
      disabled: isDragOverlay || !draggable,
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    const [waitDisplay, setWaitDisplay] = useState(() =>
      formatWaitTime(patient.checkedInAt),
    );
    const [urgency, setUrgency] = useState(() => getUrgencyTone(patient.checkedInAt));

    useEffect(() => {
      const update = () => {
        setWaitDisplay(formatWaitTime(patient.checkedInAt));
        setUrgency(getUrgencyTone(patient.checkedInAt));
      };

      update();
      const interval = window.setInterval(update, 30_000);
      return () => window.clearInterval(interval);
    }, [patient.checkedInAt]);

    const waitFillStyle = useMemo(
      () => ({
        width: `${urgency.progress * 100}%`,
        background: `linear-gradient(90deg, rgba(${urgency.rgb}, 0.42), ${urgency.color})`,
        boxShadow: `0 0 12px rgba(${urgency.rgb}, 0.22)`,
      }),
      [urgency.color, urgency.progress, urgency.rgb],
    );

    const sourceLabel = queueTypeLabel[patient.queueType];
    const notesText = patient.notes?.trim() ?? "";
    const subline = patient.procedure
      ? notesText
        ? `${patient.procedure} · ${notesText}`
        : patient.procedure
      : notesText
        ? `No procedure · ${notesText}`
        : "No procedure";
    const detailsLabel = `Open details for ${patient.clientName}`;

    const openDetails = () => {
      onCardClick(patient);
    };

    const handleCardKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
      if (event.target !== event.currentTarget) return;
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openDetails();
    };

    const card = (
      <article
        data-queue-patient-id={patient.id}
        ref={isDragOverlay ? undefined : setNodeRef}
        style={isDragOverlay ? undefined : style}
        className={cn(
          "queue-pt group",
          `queue-pt--${urgency.severity}`,
          isRecentlyAdded && "queue-pt-recent",
          isDragging && "opacity-45",
          isDragOverlay && "shadow-[0_20px_54px_rgba(0,0,0,0.44)] opacity-95",
        )}
        onClick={isDragOverlay ? undefined : openDetails}
        onKeyDown={isDragOverlay ? undefined : handleCardKeyDown}
        tabIndex={isDragOverlay ? -1 : 0}
        role={isDragOverlay ? undefined : "button"}
        aria-label={isDragOverlay ? undefined : detailsLabel}
        data-draggable={!isDragOverlay && draggable ? "true" : undefined}
        {...(isDragOverlay || !draggable ? {} : attributes)}
        {...(isDragOverlay || !draggable ? {} : listeners)}
      >
        <div className="queue-pt-edge" aria-hidden="true" />
        <div
          className="queue-pt-wash"
          aria-hidden="true"
          style={{
            background: `linear-gradient(135deg, rgba(${urgency.rgb}, 0.085) 0%, transparent 62%)`,
          }}
        />

        <div className="queue-pt-body">
          <div className="queue-pt-top">
            <div className="queue-pt-main">
              <div className="queue-pt-copy">
                <div className="queue-pt-name-row">
                  <span className="queue-pt-name">{patient.clientName}</span>
                  <span
                    className={cn(
                      "queue-pt-type",
                      patient.queueType === "rdv"
                        ? "queue-pt-type--rdv"
                        : "queue-pt-type--sans",
                    )}
                  >
                    {sourceLabel}
                  </span>
                </div>
                <p
                  className={cn(
                    "queue-pt-subline",
                    !patient.procedure && "queue-pt-subline--dim",
                  )}
                >
                  {subline}
                </p>
              </div>
            </div>

            <div className="queue-pt-wait">
              <span className={cn("queue-pt-time", urgency.textClass)}>{waitDisplay}</span>
              <div className="queue-pt-wait-track" aria-hidden="true">
                <div className="queue-pt-wait-fill" style={waitFillStyle} />
              </div>
            </div>
          </div>

          <div className="queue-pt-pills">
            <span className="queue-pt-pill">
              <Phone className="h-3 w-3" />
              <span className="truncate">{patient.clientPhone || "—"}</span>
            </span>

            {notesText ? (
              <span className="queue-pt-pill queue-pt-pill--note">
                <MessageSquare className="h-3 w-3" />
                <span className="truncate">{notesText}</span>
              </span>
            ) : null}
          </div>
        </div>
      </article>
    );

    if (isDragOverlay) return card;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: index * 0.07,
          duration: 0.24,
          ease: "easeOut",
        }}
      >
        {card}
      </motion.div>
    );
  },
);

QueuePatientCard.displayName = "QueuePatientCard";

export default QueuePatientCard;
