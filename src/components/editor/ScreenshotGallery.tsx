"use client";

import { useRef } from "react";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ScreenshotThumbnail } from "@/components/editor/ScreenshotThumbnail";
import { ACCEPT_ATTR } from "@/lib/constants";
import { processImageFiles, rejectMessage } from "@/lib/image-processing";
import { useEditorStore } from "@/lib/store/editor-store";
import { toast } from "sonner";

interface ScreenshotGalleryProps {
  orientation?: "vertical" | "horizontal";
}

export function ScreenshotGallery({ orientation = "vertical" }: ScreenshotGalleryProps) {
  const screenshots = useEditorStore((state) => state.screenshots);
  const activeId = useEditorStore((state) => state.activeId);
  const reorder = useEditorStore((state) => state.reorder);
  const selectOnly = useEditorStore((state) => state.selectOnly);
  const toggleSelected = useEditorStore((state) => state.toggleSelected);
  const removeIds = useEditorStore((state) => state.removeIds);
  const addScreenshots = useEditorStore((state) => state.addScreenshots);
  const inputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = screenshots.map((item) => item.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const next = [...ids];
    next.splice(oldIndex, 1);
    next.splice(newIndex, 0, String(active.id));
    reorder(next);
  };

  const addMore = async (files: FileList | null) => {
    if (!files?.length) return;
    const { accepted, rejected } = await processImageFiles(Array.from(files));
    if (accepted.length) {
      addScreenshots(accepted);
      toast.success(
        accepted.length === 1 ? "Added 1 screenshot" : `Added ${accepted.length} screenshots`
      );
    }
    for (const item of rejected) toast.error(rejectMessage(item.reason));
    if (inputRef.current) inputRef.current.value = "";
  };

  const ids = screenshots.map((item) => item.id);
  const isHorizontal = orientation === "horizontal";

  return (
    <div className={isHorizontal ? "flex min-h-0 flex-col" : "flex h-full min-h-0 flex-col"}>
      {!isHorizontal ? (
        <div className="flex items-center justify-between px-3 pb-2 pt-3">
          <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Pages
          </h2>
          <span className="text-xs tabular-nums text-muted-foreground">{screenshots.length}</span>
        </div>
      ) : null}
      <ScrollArea className={isHorizontal ? "w-full" : "min-h-0 flex-1"}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext
            items={ids}
            strategy={isHorizontal ? horizontalListSortingStrategy : verticalListSortingStrategy}
          >
            <div className={isHorizontal ? "flex gap-2 px-3 py-2" : "flex flex-col gap-2 px-3 pb-3"}>
              {screenshots.map((item, index) => (
                <ScreenshotThumbnail
                  key={item.id}
                  item={item}
                  index={index}
                  active={item.id === activeId}
                  orientation={orientation}
                  onSelect={(event) => {
                    if (event.metaKey || event.ctrlKey || event.shiftKey) {
                      toggleSelected(item.id, true);
                    } else {
                      selectOnly(item.id);
                    }
                  }}
                  onDelete={() => {
                    removeIds([item.id]);
                    toast("Page removed");
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        {isHorizontal ? <ScrollBar orientation="horizontal" /> : null}
      </ScrollArea>
      <div className={isHorizontal ? "px-3 pb-2" : "border-t border-border/70 p-3"}>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_ATTR}
          multiple
          className="sr-only"
          onChange={(event) => void addMore(event.target.files)}
        />
        <Button
          variant="outline"
          className="w-full"
          onClick={() => inputRef.current?.click()}
        >
          <Plus />
          Add screenshots
        </Button>
      </div>
    </div>
  );
}
