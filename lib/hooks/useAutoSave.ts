'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ApiError } from '@/lib/api/contract';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutoSaveOptions<T> {
  value: T;
  onSave: (value: T) => Promise<unknown>;
  delay?: number;
  enabled?: boolean;
  isEqual?: (a: T, b: T) => boolean;
}

interface UseAutoSaveResult {
  status: SaveStatus;
  errorMessage?: string;
  flush: () => void;
  retry: () => void;
  hasPending: boolean;
}

function defaultIsEqual<T>(a: T, b: T): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function useAutoSave<T>({
  value,
  onSave,
  delay = 800,
  enabled = true,
  isEqual = defaultIsEqual,
}: UseAutoSaveOptions<T>): UseAutoSaveResult {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedValueRef = useRef<T>(value);
  const lastFailedValueRef = useRef<T | null>(null);
  const currentValueRef = useRef<T>(value);
  const hasPendingRef = useRef(false);

  const [status, setStatus] = useState<SaveStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [hasPending, setHasPending] = useState(false);

  currentValueRef.current = value;

  const clearDebounceTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    hasPendingRef.current = false;
    setHasPending(false);
  }, []);

  const clearSavedResetTimer = useCallback(() => {
    if (savedResetTimerRef.current) {
      clearTimeout(savedResetTimerRef.current);
      savedResetTimerRef.current = null;
    }
  }, []);

  const executeSave = useCallback(
    async (nextValue: T) => {
      if (!enabled) {
        return;
      }

      if (isEqual(lastSavedValueRef.current, nextValue)) {
        setStatus('idle');
        setErrorMessage(undefined);
        return;
      }

      clearSavedResetTimer();
      setStatus('saving');
      setErrorMessage(undefined);

      try {
        await onSave(nextValue);
        lastSavedValueRef.current = nextValue;
        lastFailedValueRef.current = null;
        setStatus('saved');
        savedResetTimerRef.current = setTimeout(() => {
          setStatus('idle');
        }, 2000);
      } catch (error) {
        lastFailedValueRef.current = nextValue;
        const message =
          error instanceof ApiError
            ? error.message
            : error instanceof Error
              ? error.message
              : 'Ошибка сохранения';
        setStatus('error');
        setErrorMessage(message);
      }
    },
    [clearSavedResetTimer, enabled, isEqual, onSave],
  );

  const flush = useCallback(() => {
    clearDebounceTimer();
    void executeSave(currentValueRef.current);
  }, [clearDebounceTimer, executeSave]);

  const retry = useCallback(() => {
    if (!lastFailedValueRef.current) {
      return;
    }
    void executeSave(lastFailedValueRef.current);
  }, [executeSave]);

  useEffect(() => {
    if (!enabled) {
      clearDebounceTimer();
      return;
    }

    if (isEqual(lastSavedValueRef.current, value)) {
      return;
    }

    clearDebounceTimer();
    hasPendingRef.current = true;
    setHasPending(true);

    if (delay <= 0) {
      flush();
      return;
    }

    timerRef.current = setTimeout(() => {
      hasPendingRef.current = false;
      setHasPending(false);
      void executeSave(value);
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [clearDebounceTimer, delay, enabled, executeSave, flush, isEqual, value]);

  useEffect(() => {
    return () => {
      clearDebounceTimer();
      clearSavedResetTimer();
    };
  }, [clearDebounceTimer, clearSavedResetTimer]);

  return useMemo(
    () => ({
      status,
      errorMessage,
      flush,
      retry,
      hasPending,
    }),
    [status, errorMessage, flush, retry, hasPending],
  );
}
