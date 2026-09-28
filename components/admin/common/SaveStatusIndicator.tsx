"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SaveStatus } from "@/lib/hooks/useAutoSave";

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  errorMessage?: string;
  onRetry?: () => void;
}

export function SaveStatusIndicator({
  status,
  errorMessage,
  onRetry,
}: SaveStatusIndicatorProps) {
  if (status === "idle") {
    return <div className="h-6 min-w-36" />;
  }

  return (
    <div className="h-6 min-w-36">
      <AnimatePresence mode="wait">
        {status === "saving" ? (
          <motion.div
            key="saving"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-2 text-sm text-[--color-foreground-muted]"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Сохранение…</span>
          </motion.div>
        ) : null}

        {status === "saved" ? (
          <motion.div
            key="saved"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-2 text-sm text-[--color-success]"
          >
            <Check className="h-4 w-4" />
            <span>Сохранено</span>
          </motion.div>
        ) : null}

        {status === "error" ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-2 text-sm text-[--color-danger]"
            title={errorMessage}
          >
            <AlertCircle className="h-4 w-4" />
            <span>Ошибка сохранения</span>
            {onRetry ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-[--color-danger] hover:text-[--color-danger]"
                onClick={onRetry}
              >
                Повторить
              </Button>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
