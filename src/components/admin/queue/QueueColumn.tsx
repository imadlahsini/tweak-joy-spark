import { useEffect, useRef } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QueueColumnDef } from "@/lib/queue-constants";
import type { QueueColumnId, QueuePatient } from "@/types/queue";
import QueuePatientCard from "./QueuePatientCard";

interface QueueColumnProps {
  column: QueueColumnDef;
  patients: QueuePatient[];
  onAddClick?: () => void;
  onCardClick: (patient: QueuePatient) => void;
  onComplete?: (id: string) => void;
  isReadOnly?: boolean;
  dragEnabled?: boolean;
  isDraggingAny?: boolean;
  canDropHere?: boolean;
  highlightedPatientId?: string | null;
}

const QueueColumn = ({
  column,
  patients,
  onAddClick,
  onCardClick,
  onComplete,
  isReadOnly,
  dragEnabled = false,
  isDraggingAny = false,
  canDropHere = false,
  highlightedPatientId,
}: QueueColumnProps) => {
  const { isOver, setNodeRef } = useDroppable({
    id: column.id,
    data: { type: "column", columnId: column.id },
    disabled: !dragEnabled || !canDropHere,
  });
  const bodyRef = useRef<HTMLDivElement | null>(null);

  const itemIds = patients.map((patient) => patient.id);

  useEffect(() => {
    if (!highlightedPatientId || !patients.some((patient) => patient.id === highlightedPatientId)) {
      return;
    }

    const container = bodyRef.current;
    if (!container) return;

    const frame = window.requestAnimationFrame(() => {
      const target = container.querySelector<HTMLElement>(
        `[data-queue-patient-id="${highlightedPatientId}"]`,
      );
      target?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [highlightedPatientId, patients]);

  const tone =
    column.id === "rdv"
      ? {
          className: "queue-col--rdv",
          title: "queue-col-title--rdv",
          add: "queue-col-add--rdv",
          empty: "queue-col-empty-add--rdv",
        }
      : column.id === "sans_rdv"
        ? {
            className: "queue-col--sans",
            title: "queue-col-title--sans",
            add: "queue-col-add--sans",
            empty: "queue-col-empty-add--sans",
          }
        : {
            className: "queue-col--medecin",
            title: "queue-col-title--medecin",
            add: "queue-col-add--medecin",
            empty: "queue-col-empty-add--medecin",
          };

  return (
    <section
      className={cn(
        "queue-col",
        tone.className,
        dragEnabled && !canDropHere && isDraggingAny && "queue-col--dimmed",
      )}
    >
      <div className="queue-col-wash" aria-hidden="true" />

      <header className="queue-col-head">
        <div className="queue-col-id">
          <span className="queue-col-dot" aria-hidden="true" />
          <h3 className={cn("queue-col-title", tone.title)}>{column.label}</h3>
          <span className="queue-col-count">{patients.length}</span>
        </div>

        <div className="queue-col-head-action" aria-hidden={!(column.canAdd && !isReadOnly && onAddClick)}>
          {column.canAdd && !isReadOnly && onAddClick ? (
            <button
              type="button"
              onClick={onAddClick}
              className={cn("queue-col-add", tone.add)}
              title={`Add patient to ${column.label}`}
              aria-label={`Add patient to ${column.label}`}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          ) : (
            <span className="queue-col-head-action-placeholder" />
          )}
        </div>
      </header>

      <div
        ref={(node) => {
          setNodeRef(node);
          bodyRef.current = node;
        }}
        className={cn(
          "queue-col-content",
          dragEnabled && canDropHere && isOver && "queue-col-content--drop-active",
        )}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {patients.length === 0 ? (
            <div className="queue-col-empty">
              <div className="queue-col-empty-visual">
                <Users className="h-5 w-5" />
              </div>
              <span className="queue-col-empty-text">No patients</span>
              {column.canAdd && !isReadOnly && onAddClick ? (
                <button
                  type="button"
                  onClick={onAddClick}
                  className={cn("queue-col-empty-add", tone.empty)}
                >
                  + Add a patient
                </button>
              ) : null}
            </div>
          ) : (
            <div className="queue-col-list">
              {patients.map((patient, index) => (
                <QueuePatientCard
                  key={patient.id}
                  patient={patient}
                  columnId={column.id as QueueColumnId}
                  index={index}
                  onCardClick={onCardClick}
                  onComplete={column.id === "with_medecin" ? onComplete : undefined}
                  draggable={
                    dragEnabled &&
                    !isReadOnly &&
                    column.id !== "with_medecin" &&
                    patient.status === "waiting"
                  }
                  isRecentlyAdded={patient.id === highlightedPatientId}
                />
              ))}
            </div>
          )}
        </SortableContext>
      </div>
    </section>
  );
};

export default QueueColumn;
