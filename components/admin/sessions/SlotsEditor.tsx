"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/common/ImageUpload";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MediaEntityType } from "@/lib/api/contract";

export interface LocalSlot {
  localId: string;
  basePrompt: string;
  previewUrl?: string;
}

interface SlotsEditorProps {
  photoSessionId: string;
  slots: LocalSlot[];
  activeSlotIndex: number;
  onActiveSlotChange: (index: number) => void;
  onChange: (slots: LocalSlot[]) => void;
  onStructuralChange?: () => void;
}

interface SlotPillProps {
  slot: LocalSlot;
  index: number;
  isActive: boolean;
  hasError: boolean;
  onClick: () => void;
}

function createEmptySlot(): LocalSlot {
  return {
    localId: crypto.randomUUID(),
    basePrompt: "",
  };
}

function SortableSlotPill({
  slot,
  index,
  isActive,
  hasError,
  onClick,
}: SlotPillProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slot.localId });

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onClick}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group relative inline-flex items-center gap-2 rounded-[--radius-md] px-3 py-2 text-sm transition-colors ${
        isActive
          ? "border border-[--color-primary] bg-[--color-primary]/10 text-[--color-primary]"
          : "border border-[--color-border] bg-[--color-surface] text-[--color-foreground-muted] hover:text-foreground"
      } ${isDragging ? "opacity-70" : ""}`}
    >
      <span
        className="cursor-grab text-[--color-foreground-muted] opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </span>
      <span>{index + 1}</span>
      {hasError ? (
        <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[--color-danger]" />
      ) : null}
    </button>
  );
}

export function SlotsEditor({
  photoSessionId,
  slots,
  activeSlotIndex,
  onActiveSlotChange,
  onChange,
  onStructuralChange,
}: SlotsEditorProps) {
  const sensors = useSensors(useSensor(PointerSensor));
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (deleteTimerRef.current) {
        clearTimeout(deleteTimerRef.current);
      }
    };
  }, []);

  const slotErrors = useMemo(() => {
    return slots.map((slot) => slot.basePrompt.trim().length === 0);
  }, [slots]);

  const safeActiveIndex = Math.min(
    activeSlotIndex,
    Math.max(slots.length - 1, 0),
  );
  const activeSlot = slots[safeActiveIndex];

  function updateSlotById(
    slotId: string,
    update: (slot: LocalSlot) => LocalSlot,
  ): void {
    const next = slots.map((slot) =>
      slot.localId === slotId ? update(slot) : slot,
    );
    onChange(next);
  }

  function handleDragEnd(event: DragEndEvent): void {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = slots.findIndex((slot) => slot.localId === active.id);
    const newIndex = slots.findIndex((slot) => slot.localId === over.id);

    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    const next = arrayMove(slots, oldIndex, newIndex);
    onChange(next);

    if (safeActiveIndex === oldIndex) {
      onActiveSlotChange(newIndex);
    } else if (oldIndex < safeActiveIndex && newIndex >= safeActiveIndex) {
      onActiveSlotChange(safeActiveIndex - 1);
    } else if (oldIndex > safeActiveIndex && newIndex <= safeActiveIndex) {
      onActiveSlotChange(safeActiveIndex + 1);
    }

    onStructuralChange?.();
  }

  function addSlot(): void {
    if (slots.length >= 10) {
      return;
    }

    const next = [...slots, createEmptySlot()];
    onChange(next);
    onActiveSlotChange(next.length - 1);
    onStructuralChange?.();
  }

  function removeActiveSlot(): void {
    if (!activeSlot || slots.length <= 1) {
      return;
    }

    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
      deleteTimerRef.current = null;
    }

    setPendingDeleteId(activeSlot.localId);

    deleteTimerRef.current = setTimeout(() => {
      const removedIndex = slots.findIndex(
        (slot) => slot.localId === activeSlot.localId,
      );
      const next = slots.filter((slot) => slot.localId !== activeSlot.localId);
      onChange(next);

      if (removedIndex <= safeActiveIndex) {
        onActiveSlotChange(Math.max(0, safeActiveIndex - 1));
      }

      setPendingDeleteId(null);
      onStructuralChange?.();
    }, 3000);

    toast("Слот будет удалён", {
      duration: 3000,
      action: {
        label: "Отменить",
        onClick: () => {
          if (deleteTimerRef.current) {
            clearTimeout(deleteTimerRef.current);
            deleteTimerRef.current = null;
          }
          setPendingDeleteId(null);
        },
      },
    });
  }

  if (!activeSlot) {
    return null;
  }

  const isDeleteDisabled = slots.length <= 1;
  const isAddDisabled = slots.length >= 10;

  return (
    <div className="space-y-4">
      <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-4">
        <div className="mb-3 text-sm font-medium text-foreground">Слоты</div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={slots.map((slot) => slot.localId)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex flex-wrap items-center gap-2">
              {slots.map((slot, index) => (
                <SortableSlotPill
                  key={slot.localId}
                  slot={slot}
                  index={index}
                  isActive={index === safeActiveIndex}
                  hasError={slotErrors[index]}
                  onClick={() => onActiveSlotChange(index)}
                />
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSlot}
                disabled={isAddDisabled}
                title={isAddDisabled ? "Максимум 10 слотов" : undefined}
              >
                <Plus className="h-4 w-4" />
                Добавить слот
              </Button>
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div
        className={`space-y-4 rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-4 ${
          pendingDeleteId === activeSlot.localId ? "opacity-60" : ""
        }`}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">
            Слот {safeActiveIndex + 1}
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-[--color-foreground-muted] hover:text-[--color-danger]"
            onClick={removeActiveSlot}
            disabled={isDeleteDisabled}
            title={
              isDeleteDisabled
                ? "Фотосессия должна содержать минимум 1 слот"
                : undefined
            }
          >
            <Trash2 className="h-4 w-4" />
            Удалить слот
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
          <ImageUpload
            key={activeSlot.localId}
            label="Превью слота"
            value={activeSlot.previewUrl}
            entityType={MediaEntityType.SESSION}
            entityId={photoSessionId}
            previewSize="184x260"
            aspectRatio="4:3"
            onChange={(_, publicUrl) => {
              updateSlotById(activeSlot.localId, (slot) => ({
                ...slot,
                previewUrl: publicUrl ?? "",
              }));
              onStructuralChange?.();
            }}
            onClear={() => {
              updateSlotById(activeSlot.localId, (slot) => ({
                ...slot,
                previewUrl: "",
              }));
              onStructuralChange?.();
            }}
          />

          <div className="space-y-2">
            <Label>Промпт слота</Label>
            <Textarea
              className="min-h-32"
              value={activeSlot.basePrompt}
              onChange={(event) => {
                updateSlotById(activeSlot.localId, (slot) => ({
                  ...slot,
                  basePrompt: event.target.value,
                }));
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
