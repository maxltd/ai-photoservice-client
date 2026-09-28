"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UnsavedChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeave: () => void;
}

export function UnsavedChangesDialog({
  open,
  onOpenChange,
  onLeave,
}: UnsavedChangesDialogProps): React.JSX.Element {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Есть несохранённые изменения</DialogTitle>
          <DialogDescription>
            Изменения могут быть потеряны. Покинуть страницу без сохранения?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Остаться
          </Button>
          <Button
            type="button"
            className="border-danger/40 bg-danger text-white hover:bg-danger/90"
            onClick={onLeave}
          >
            Покинуть страницу
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
