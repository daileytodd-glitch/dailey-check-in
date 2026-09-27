"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Renders children only in the browser. Everything on these screens depends on the
 * viewer's clock and live data, so there is nothing useful to prerender on the server.
 */
export function ClientOnly({ children }: { children: React.ReactNode }) {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  return mounted ? <>{children}</> : null;
}
