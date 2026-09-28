"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
import { CopyPlus, GripVertical, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/common/ImageUpload";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { MediaEntityType } from "@/lib/api/contract";
import {
  cloneGroup,
  cloneOption,
  createEmptyGroup,
  createEmptyOption,
  type LocalParameterGroup,
} from "@/lib/parameter-groups";

interface ParameterGroupsEditorProps {
  value: LocalParameterGroup[];
  entityId: string;
  onChange: (groups: LocalParameterGroup[]) => void;
  onStructuralChange?: () => void;
}

interface SortableRowProps {
  id: string;
  children: ReactNode;
}

function SortableRow({ id, children }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? "opacity-85" : ""}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-2 cursor-grab text-[--color-foreground-muted] active:cursor-grabbing"
          aria-label="Перетащить"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

export function ParameterGroupsEditor({
  value,
  entityId,
  onChange,
  onStructuralChange,
}: ParameterGroupsEditorProps) {
  const sensors = useSensors(useSensor(PointerSensor));
  const [openItems, setOpenItems] = useState<string[]>(() =>
    value.map((group) => group.localId),
  );
  const [pendingDeleteIds, setPendingDeleteIds] = useState<Set<string>>(
    () => new Set(),
  );

  const deleteTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  const questionInputRefs = useRef<Map<string, HTMLInputElement | null>>(
    new Map(),
  );

  const hasInvalidGroups = useMemo(
    () => value.some((group) => group.options.length === 0),
    [value],
  );

  useEffect(() => {
    const timers = deleteTimersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  function focusGroupQuestion(localId: string): void {
    setTimeout(() => {
      const input = questionInputRefs.current.get(localId);
      input?.focus();
    }, 0);
  }

  function commit(next: LocalParameterGroup[], structural = false): void {
    onChange(next);
    if (structural) {
      onStructuralChange?.();
    }
  }

  function scheduleDelete(
    id: string,
    removeAction: () => void,
    message: string,
  ): void {
    const existingTimer = deleteTimersRef.current.get(id);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    setPendingDeleteIds((prev) => new Set(prev).add(id));

    const timer = setTimeout(() => {
      removeAction();
      setPendingDeleteIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      deleteTimersRef.current.delete(id);
      onStructuralChange?.();
    }, 3000);

    deleteTimersRef.current.set(id, timer);

    toast(message, {
      duration: 3000,
      action: {
        label: "Отменить",
        onClick: () => {
          clearTimeout(timer);
          deleteTimersRef.current.delete(id);
          setPendingDeleteIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        },
      },
    });
  }

  function duplicateGroup(groupIndex: number): void {
    const source = value[groupIndex];
    const copy = cloneGroup(source);

    const next = [...value];
    next.splice(groupIndex + 1, 0, copy);
    commit(next, true);
    setOpenItems((prev) => Array.from(new Set([...prev, copy.localId])));
  }

  function duplicateOption(groupIndex: number, optionIndex: number): void {
    const group = value[groupIndex];
    const source = group.options[optionIndex];
    const copy = cloneOption(source);

    const next = [...value];
    const options = [...group.options];
    options.splice(optionIndex + 1, 0, copy);
    next[groupIndex] = { ...group, options };
    commit(next, true);
  }

  function onDragEnd(event: DragEndEvent): void {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId.startsWith("group:") && overId.startsWith("group:")) {
      const activeGroupId = activeId.replace("group:", "");
      const overGroupId = overId.replace("group:", "");

      const oldIndex = value.findIndex(
        (group) => group.localId === activeGroupId,
      );
      const newIndex = value.findIndex(
        (group) => group.localId === overGroupId,
      );
      if (oldIndex < 0 || newIndex < 0) {
        return;
      }

      commit(arrayMove(value, oldIndex, newIndex), true);
      return;
    }

    if (activeId.startsWith("option:") && overId.startsWith("option:")) {
      const [activePrefix, activeGroupId, activeOptionId] = activeId.split(":");
      const [overPrefix, overGroupId, overOptionId] = overId.split(":");
      if (activePrefix !== "option" || overPrefix !== "option") {
        return;
      }
      if (activeGroupId !== overGroupId) {
        return;
      }

      const groupIndex = value.findIndex(
        (group) => group.localId === activeGroupId,
      );
      if (groupIndex < 0) {
        return;
      }

      const options = value[groupIndex].options;
      const oldIndex = options.findIndex(
        (option) => option.localId === activeOptionId,
      );
      const newIndex = options.findIndex(
        (option) => option.localId === overOptionId,
      );
      if (oldIndex < 0 || newIndex < 0) {
        return;
      }

      const next = [...value];
      next[groupIndex] = {
        ...next[groupIndex],
        options: arrayMove(options, oldIndex, newIndex),
      };

      commit(next, true);
    }
  }

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={value.map((group) => `group:${group.localId}`)}
          strategy={verticalListSortingStrategy}
        >
          <Accordion
            type="multiple"
            value={openItems}
            onValueChange={setOpenItems}
            className="space-y-3"
          >
            {value.map((group, groupIndex) => {
              const groupDeleteKey = `group:${group.localId}`;
              const isGroupPendingDelete = pendingDeleteIds.has(groupDeleteKey);

              return (
                <SortableRow key={group.localId} id={`group:${group.localId}`}>
                  <AccordionItem
                    value={group.localId}
                    className={isGroupPendingDelete ? "opacity-50" : ""}
                  >
                    <div className="grid gap-3 border border-[--color-border] px-3 py-3 md:grid-cols-[auto_minmax(0,1fr)_auto_auto_auto] md:items-center">
                      <AccordionTrigger className="flex-none! justify-start! gap-2! px-0! py-0! hover:bg-transparent!">
                        <span>Группа {groupIndex + 1}</span>
                      </AccordionTrigger>

                      <Input
                        ref={(el) => {
                          questionInputRefs.current.set(group.localId, el);
                        }}
                        value={group.question}
                        onChange={(event) => {
                          const next = [...value];
                          next[groupIndex] = {
                            ...group,
                            question: event.target.value,
                          };
                          commit(next, false);
                        }}
                        placeholder="Вопрос для пользователя"
                      />

                      <div className="flex items-center gap-2">
                        <Label htmlFor={`group-required-${group.localId}`}>
                          Обязательная
                        </Label>
                        <Switch
                          id={`group-required-${group.localId}`}
                          checked={group.isRequired}
                          onCheckedChange={(checked) => {
                            const next = [...value];
                            next[groupIndex] = {
                              ...group,
                              isRequired: checked,
                            };
                            commit(next, false);
                          }}
                        />
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          duplicateGroup(groupIndex);
                        }}
                      >
                        <CopyPlus className="h-4 w-4" />
                        Дублировать
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-foreground-muted hover:text-danger"
                        onClick={() => {
                          scheduleDelete(
                            groupDeleteKey,
                            () => {
                              const next = value.filter(
                                (item) => item.localId !== group.localId,
                              );
                              commit(next, false);
                            },
                            "Группа будет удалена",
                          );
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        Удалить
                      </Button>
                    </div>

                    <AccordionContent>
                      <div className="space-y-3 pt-3">
                        <SortableContext
                          items={group.options.map(
                            (option) =>
                              `option:${group.localId}:${option.localId}`,
                          )}
                          strategy={verticalListSortingStrategy}
                        >
                          {group.options.map((option, optionIndex) => {
                            const optionDeleteKey = `option:${group.localId}:${option.localId}`;
                            const isOptionPendingDelete =
                              pendingDeleteIds.has(optionDeleteKey);

                            return (
                              <SortableRow
                                key={option.localId}
                                id={`option:${group.localId}:${option.localId}`}
                              >
                                <div
                                  className={`rounded-md border border-border p-3 ${
                                    isOptionPendingDelete ? "opacity-50" : ""
                                  }`}
                                >
                                  <div className="mb-3 flex items-center justify-between">
                                    <p className="text-sm text-foreground">
                                      Вариант {optionIndex + 1}
                                    </p>
                                    <div className="flex items-center gap-1">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          duplicateOption(
                                            groupIndex,
                                            optionIndex,
                                          )
                                        }
                                      >
                                        <CopyPlus className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-foreground-muted hover:text-danger"
                                        onClick={() => {
                                          scheduleDelete(
                                            optionDeleteKey,
                                            () => {
                                              const next = [...value];
                                              next[groupIndex] = {
                                                ...group,
                                                options: group.options.filter(
                                                  (entry) =>
                                                    entry.localId !==
                                                    option.localId,
                                                ),
                                              };
                                              commit(next, false);
                                            },
                                            "Вариант будет удалён",
                                          );
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <div className="space-y-1">
                                      <Label>Метка</Label>
                                      <Input
                                        value={option.label}
                                        onChange={(event) => {
                                          const next = [...value];
                                          const options = [...group.options];
                                          options[optionIndex] = {
                                            ...option,
                                            label: event.target.value,
                                          };
                                          next[groupIndex] = {
                                            ...group,
                                            options,
                                          };
                                          commit(next, false);
                                        }}
                                      />
                                    </div>

                                    <div className="space-y-1">
                                      <Label>Prompt snippet</Label>
                                      <Textarea
                                        value={option.promptSnippet}
                                        onChange={(event) => {
                                          const next = [...value];
                                          const options = [...group.options];
                                          options[optionIndex] = {
                                            ...option,
                                            promptSnippet: event.target.value,
                                          };
                                          next[groupIndex] = {
                                            ...group,
                                            options,
                                          };
                                          commit(next, false);
                                        }}
                                      />
                                    </div>

                                    <ImageUpload
                                      label="Превью"
                                      value={option.imageUrl}
                                      entityType={MediaEntityType.PRESET}
                                      entityId={entityId}
                                      previewSize="184x260"
                                      aspectRatio="1:1"
                                      onChange={(_, publicUrl) => {
                                        const next = [...value];
                                        const options = [...group.options];
                                        options[optionIndex] = {
                                          ...option,
                                          imageUrl: publicUrl ?? "",
                                        };
                                        next[groupIndex] = {
                                          ...group,
                                          options,
                                        };
                                        commit(next, false);
                                        onStructuralChange?.();
                                      }}
                                      onClear={() => {
                                        const next = [...value];
                                        const options = [...group.options];
                                        options[optionIndex] = {
                                          ...option,
                                          imageUrl: "",
                                        };
                                        next[groupIndex] = {
                                          ...group,
                                          options,
                                        };
                                        commit(next, false);
                                        onStructuralChange?.();
                                      }}
                                    />
                                  </div>
                                </div>
                              </SortableRow>
                            );
                          })}
                        </SortableContext>

                        {group.options.length === 0 ? (
                          <p className="text-xs text-danger">
                            Добавьте хотя бы один вариант
                          </p>
                        ) : null}

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const next = [...value];
                            next[groupIndex] = {
                              ...group,
                              options: [...group.options, createEmptyOption()],
                            };
                            commit(next, true);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                          Добавить вариант
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </SortableRow>
              );
            })}
          </Accordion>
        </SortableContext>
      </DndContext>

      <Button
        type="button"
        variant="outline"
        onClick={() => {
          const newGroup = createEmptyGroup();
          const next = [...value, newGroup];
          commit(next, true);
          setOpenItems((prev) =>
            Array.from(new Set([...prev, newGroup.localId])),
          );
          focusGroupQuestion(newGroup.localId);
        }}
      >
        <Plus className="h-4 w-4" />
        Добавить группу параметров
      </Button>

      {hasInvalidGroups ? (
        <p className="text-xs text-danger">
          Есть группы без вариантов. Сохранение параметров временно отключено.
        </p>
      ) : null}
    </div>
  );
}
