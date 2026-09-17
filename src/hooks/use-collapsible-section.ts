import { useCallback, useState } from "react";

const storageKey = (key: string) => `bb-collapse:${key}`;

/**
 * Collapsible section state that remembers open/closed between visits.
 * SSR-safe: defaults to `defaultOpen` when window is unavailable.
 */
export function useCollapsibleSection(key: string, defaultOpen = false) {
  const [open, setOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return defaultOpen;
    try {
      const stored = window.localStorage.getItem(storageKey(key));
      return stored === null ? defaultOpen : stored === "open";
    } catch {
      return defaultOpen;
    }
  });

  const setOpenPersisted = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      setOpen((prev) => {
        const next = typeof value === "function" ? value(prev) : value;
        try {
          window.localStorage.setItem(storageKey(key), next ? "open" : "closed");
        } catch {
          // storage unavailable (private mode etc.) — state still works in-session
        }
        return next;
      });
    },
    [key]
  );

  return [open, setOpenPersisted] as const;
}
