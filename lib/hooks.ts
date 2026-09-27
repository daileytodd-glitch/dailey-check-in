"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { byMember, loadRecentCheckins, subscribeToCheckins, type Checkin } from "./checkins";
import { dayKey } from "./time";

/** A Date that ticks on an interval. Also re-renders when the tab comes back to the foreground. */
export function useNow(intervalMs = 15_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    const onVisible = () => document.visibilityState === "visible" && setNow(new Date());
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [intervalMs]);
  return now;
}

export type CheckinState = {
  rows: Checkin[];
  byMember: Map<string, Checkin[]>;
  today: string;
  loading: boolean;
  error: string | null;
  /** When data was last loaded successfully. */
  updatedAt: Date | null;
  refresh: () => Promise<void>;
};

/** Live check-in data: initial load, realtime updates, focus refresh, and a slow poll as a safety net. */
export function useCheckins(pollMs = 60_000): CheckinState {
  const [rows, setRows] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const now = useNow(30_000);
  const today = dayKey(now);
  const inflight = useRef<Promise<void> | null>(null);

  const refresh = useCallback(async () => {
    if (inflight.current) return inflight.current;
    inflight.current = (async () => {
      try {
        const data = await loadRecentCheckins(60);
        setRows(data);
        setError(null);
        setUpdatedAt(new Date());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load check-ins");
      } finally {
        setLoading(false);
        inflight.current = null;
      }
    })();
    return inflight.current;
  }, []);

  useEffect(() => {
    refresh();
    const unsubscribe = subscribeToCheckins(() => refresh());
    const poll = setInterval(refresh, pollMs);
    const onVisible = () => document.visibilityState === "visible" && refresh();
    const onOnline = () => refresh();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onOnline);
    return () => {
      unsubscribe();
      clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onOnline);
    };
  }, [refresh, pollMs]);

  return { rows, byMember: byMember(rows), today, loading, error, updatedAt, refresh };
}

/** Remember which family member this device belongs to. */
const MEMBER_KEY = "dci.member";
const memberListeners = new Set<() => void>();

function readMember(): string | null {
  try {
    return localStorage.getItem(MEMBER_KEY);
  } catch {
    return null;
  }
}

function subscribeMember(cb: () => void) {
  memberListeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    memberListeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function useRememberedMember(): [string | null, (id: string | null) => void] {
  const id = useSyncExternalStore(subscribeMember, readMember, () => null);
  const update = useCallback((next: string | null) => {
    try {
      if (next) localStorage.setItem(MEMBER_KEY, next);
      else localStorage.removeItem(MEMBER_KEY);
    } catch {}
    memberListeners.forEach((cb) => cb());
  }, []);
  return [id, update];
}
