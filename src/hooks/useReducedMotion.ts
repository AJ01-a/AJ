'use client';

import { useSyncExternalStore } from 'react';

/**
 * Tracks `prefers-reduced-motion`, and keeps tracking it — people change the
 * setting mid-session, often because something on the page is making them
 * uncomfortable.
 *
 * A media query is an external store, so this subscribes to it directly
 * rather than mirroring it into state from an effect. That avoids the extra
 * render on mount and gives React a correct server snapshot to hydrate from.
 */
const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia(QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

/** The server cannot know the preference; assume motion is allowed. */
function getServerSnapshot(): boolean {
  return false;
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
