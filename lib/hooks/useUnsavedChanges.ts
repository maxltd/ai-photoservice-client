"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseUnsavedChangesResult {
  dialogOpen: boolean;
  requestNavigation: (navigate: () => void) => void;
  closeDialog: () => void;
  confirmNavigation: () => void;
}

export function useUnsavedChanges(
  isDirty: boolean,
): UseUnsavedChangesResult {
  const allowNextNavigation = useRef(false);
  const pendingNavigation = useRef<(() => void) | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const requestNavigation = useCallback(
    (navigate: () => void): void => {
      if (!isDirty) {
        navigate();
        return;
      }

      pendingNavigation.current = navigate;
      setDialogOpen(true);
    },
    [isDirty],
  );

  const closeDialog = useCallback((): void => {
    pendingNavigation.current = null;
    setDialogOpen(false);
  }, []);

  const confirmNavigation = useCallback((): void => {
    const navigate = pendingNavigation.current;
    pendingNavigation.current = null;
    setDialogOpen(false);
    navigate?.();
  }, []);

  useEffect(() => {
    if (!isDirty) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    const onPopState = () => {
      if (allowNextNavigation.current) {
        allowNextNavigation.current = false;
        return;
      }
      window.history.pushState(null, "", window.location.href);
      if (window.confirm("Есть несохранённые изменения. Покинуть страницу без сохранения?")) {
        allowNextNavigation.current = true;
        window.history.go(-1);
      }
    };
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target as Element | null;
      const link = target?.closest("a[href]");
      if (!(link instanceof HTMLAnchorElement) || link.target === "_blank") return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.href === window.location.href) return;
      if (!window.confirm("Есть несохранённые изменения. Покинуть страницу без сохранения?")) {
        event.preventDefault();
      }
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("popstate", onPopState);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("popstate", onPopState);
      document.removeEventListener("click", onClick, true);
    };
  }, [isDirty]);

  return {
    dialogOpen,
    requestNavigation,
    closeDialog,
    confirmNavigation,
  };
}
