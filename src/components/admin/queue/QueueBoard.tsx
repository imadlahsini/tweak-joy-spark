import { useCallback, useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  pointerWithin,
  PointerSensor,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragCancelEvent,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { queueColumns } from "@/lib/queue-constants";
import type { QueueColumnId, QueuePatient, QueueType } from "@/types/queue";
import QueueColumn from "./QueueColumn";
import QueuePatientCard from "./QueuePatientCard";

const isQueueColumnId = (value: unknown): value is QueueColumnId =>
  typeof value === "string" &&
  queueColumns.some((column) => column.id === value);

const canMoveToMedecin = (patient: QueuePatient, sourceColumnId: QueueColumnId) =>
  patient.status === "waiting" &&
  (sourceColumnId === "rdv" || sourceColumnId === "sans_rdv");

interface QueueBoardProps {
  columns: {
    rdv: QueuePatient[];
    sans_rdv: QueuePatient[];
    with_medecin: QueuePatient[];
  };
  onMovePatient: (patientId: string, targetColumn: QueueColumnId) => void;
  onAddClick: (queueType: QueueType) => void;
  onCardClick: (patient: QueuePatient) => void;
  onComplete: (id: string) => void;
  isReadOnly?: boolean;
  highlightedPatientId?: string | null;
}

const QueueBoard = ({
  columns,
  onMovePatient,
  onAddClick,
  onCardClick,
  onComplete,
  isReadOnly,
  highlightedPatientId,
}: QueueBoardProps) => {
  const isMobile = useIsMobile();
  const [activePatient, setActivePatient] = useState<QueuePatient | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<QueueColumnId | null>(null);
  const [activeCardSize, setActiveCardSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const isDesktopDragEnabled = !isMobile && !isReadOnly;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const collisionDetection = useCallback<CollisionDetection>((args) => {
    const pointerHits = pointerWithin(args);
    if (pointerHits.length > 0) {
      return pointerHits;
    }
    return closestCorners(args);
  }, []);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      if (!isDesktopDragEnabled || !event.active.data.current) return;

      const data = event.active.data.current as {
        patient: QueuePatient;
        columnId: QueueColumnId;
      };
      if (!canMoveToMedecin(data.patient, data.columnId)) return;

      const activeRect = event.active.rect.current.initial;
      if (activeRect?.width && activeRect?.height) {
        setActiveCardSize({ width: activeRect.width, height: activeRect.height });
      } else {
        setActiveCardSize(null);
      }

      setActivePatient(data.patient);
      setActiveColumnId(data.columnId);
    },
    [isDesktopDragEnabled],
  );

  const handleDragCancel = useCallback((_event: DragCancelEvent) => {
    setActivePatient(null);
    setActiveColumnId(null);
    setActiveCardSize(null);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActivePatient(null);
      setActiveColumnId(null);
      setActiveCardSize(null);
      if (!isDesktopDragEnabled) return;

      const { active, over } = event;
      if (!over || !active.data.current) return;

      const sourceData = active.data.current as {
        patient: QueuePatient;
        columnId: QueueColumnId;
      };
      if (!canMoveToMedecin(sourceData.patient, sourceData.columnId)) return;

      const targetColumnById = isQueueColumnId(over.id) ? over.id : null;
      const targetColumnByData =
        (over.data.current as { columnId?: QueueColumnId } | null)?.columnId ??
        null;
      const targetColumnId = targetColumnById ?? targetColumnByData;

      if (targetColumnId !== "with_medecin") return;
      onMovePatient(sourceData.patient.id, targetColumnId);
    },
    [isDesktopDragEnabled, onMovePatient],
  );

  const renderColumn = (colDef: (typeof queueColumns)[0]) => {
    const patients = columns[colDef.id];
    const canDropHere =
      isDesktopDragEnabled &&
      Boolean(activePatient) &&
      activePatient.status === "waiting" &&
      (activePatient.queueType === "rdv" || activePatient.queueType === "sans_rdv") &&
      colDef.id === "with_medecin";

    return (
      <QueueColumn
        key={colDef.id}
        column={colDef}
        patients={patients}
        onAddClick={
          colDef.canAdd
            ? () => onAddClick(colDef.id as QueueType)
            : undefined
        }
        onCardClick={onCardClick}
        onComplete={onComplete}
        isReadOnly={isReadOnly}
        dragEnabled={isDesktopDragEnabled}
        isDraggingAny={isDesktopDragEnabled && Boolean(activePatient)}
        canDropHere={canDropHere}
        highlightedPatientId={highlightedPatientId}
      />
    );
  };

  if (isMobile) {
    return (
      <Tabs defaultValue="rdv" className="queue-board-tabs w-full">
        <TabsList className="queue-board-tabs-list">
          {queueColumns.map((column) => (
            <TabsTrigger
              key={column.id}
              value={column.id}
              className="queue-board-tab"
            >
              <span>{column.label}</span>
              <span className="queue-board-tab-count">{columns[column.id].length}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {queueColumns.map((column) => (
          <TabsContent key={column.id} value={column.id} className="mt-3 min-h-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              className={cn(
                "queue-dashboard-segment",
                column.id === "rdv" && "queue-dashboard-segment--rdv",
                column.id === "sans_rdv" && "queue-dashboard-segment--sans",
                column.id === "with_medecin" && "queue-dashboard-segment--medecin",
              )}
            >
              {renderColumn(column)}
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
    >
      <section className="queue-dashboard-board min-h-0">
        {queueColumns.map((column, index) => (
          <motion.div
            key={column.id}
            className={cn(
              "queue-dashboard-segment",
              column.id === "rdv" && "queue-dashboard-segment--rdv",
              column.id === "sans_rdv" && "queue-dashboard-segment--sans",
              column.id === "with_medecin" && "queue-dashboard-segment--medecin",
            )}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.26,
              ease: "easeOut",
              delay: 0.08 + index * 0.07,
            }}
          >
            {renderColumn(column)}
          </motion.div>
        ))}
      </section>

      <DragOverlay
        dropAnimation={{
          duration: 180,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {activePatient && activeColumnId && (
          <div
            style={
              activeCardSize
                ? {
                    width: activeCardSize.width,
                    height: activeCardSize.height,
                  }
                : undefined
            }
            className="max-w-full"
          >
            <QueuePatientCard
              patient={activePatient}
              columnId={activeColumnId}
              index={0}
              onCardClick={() => {}}
              isDragOverlay
              draggable={false}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};

export default QueueBoard;
