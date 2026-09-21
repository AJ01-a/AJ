'use client';

import { useSyncExternalStore } from 'react';

export type WebGLStatus = 'checking' | 'available' | 'unavailable';

/**
 * Reports whether WebGL can be used.
 *
 * The probe creates and immediately discards a context: browsers cap how many
 * may be live at once, and leaking one here would starve the real scene. The
 * result is cached, because the answer cannot change within a page load and
 * the probe is not free.
 */
let cached: WebGLStatus | null = null;

function probe(): WebGLStatus {
  if (cached) return cached;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ??
      canvas.getContext('webgl') ??
      canvas.getContext('experimental-webgl');

    if (!gl) {
      cached = 'unavailable';
      return cached;
    }

    (gl as WebGLRenderingContext)
      .getExtension('WEBGL_lose_context')
      ?.loseContext();
    cached = 'available';
  } catch {
    cached = 'unavailable';
  }
  return cached;
}

/** Capability detection is a one-shot read, so nothing to subscribe to. */
function subscribe(): () => void {
  return () => {};
}

/**
 * During SSR the answer is unknown. Returning 'checking' keeps the server and
 * the first client render identical, and the scene simply does not mount
 * until the real value arrives.
 */
function getServerSnapshot(): WebGLStatus {
  return 'checking';
}

export function useWebGLSupport(): WebGLStatus {
  return useSyncExternalStore(subscribe, probe, getServerSnapshot);
}
