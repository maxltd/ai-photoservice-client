"use client";

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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SortableListProps<
  TItem extends { id: string; sortOrder: number },
> {
  items: TItem[];
  onReorder: (items: Array<{ id: string; sortOrder: number }>) => void;
  renderItem: (item: TItem, isDragging: boolean) => React.ReactNode;
  isLoading?: boolean;
}

interface SortableRowProps<TItem extends { id: string; sortOrder: number }> {
  item: TItem;
  renderItem: (item: TItem, isDragging: boolean) => React.ReactNode;
}

function SortableRow<TItem extends { id: string; sortOrder: number }>({
  item,
  renderItem,
}: SortableRowProps<TItem>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-md border border-border bg-surface",
        isDragging ? "opacity-80 ring-1 ring-primary" : "",
      )}
    >
      <div className="flex items-center gap-3 p-3">
        <button
          type="button"
          className={cn(
            "cursor-grab text-foreground-muted active:cursor-grabbing",
            isDragging ? "cursor-grabbing" : "",
          )}
          aria-label="Перетащить"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">{renderItem(item, isDragging)}</div>
      </div>
    </div>
  );
}

export function SortableList<TItem extends { id: string; sortOrder: number }>({
  items,
  onReorder,
  renderItem,
  isLoading = false,
}: SortableListProps<TItem>) {
  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragEnd(event: DragEndEvent): void {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const reordered = arrayMove(items, oldIndex, newIndex).map(
      (item, index) => ({
        id: item.id,
        sortOrder: index,
      }),
    );

    onReorder(reordered);
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-surface p-4 text-sm text-foreground-muted">
        Загрузка...
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {items.map((item) => (
            <SortableRow key={item.id} item={item} renderItem={renderItem} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
