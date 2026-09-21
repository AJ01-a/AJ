'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

type Cue = 'tap' | 'swoosh' | 'confirm';

const FILES: Record<Cue, string> = {
  tap: '/audio/tap.wav',
  swoosh: '/audio/swoosh.wav',
  confirm: '/audio/powerup.wav',
};

interface SoundApi {
  enabled: boolean;
  toggle: () => void;
  play: (cue: Cue) => void;
}

const SoundContext = createContext<SoundApi>({
  enabled: false,
  toggle: () => {},
  play: () => {},
});

export function useSound(): SoundApi {
  return useContext(SoundContext);
}

/**
 * Optional interface sound.
 *
 * Off by default and never started without a click, which keeps it on the
 * right side of every browser's autoplay policy and, more importantly, of
 * common courtesy. Audio files are fetched only after the visitor opts in, so
 * nobody who leaves it off pays for them.
 *
 * The cues are the app's own generated sound effects — the same files the
 * game ships — so the site sounds like the product.
 */
export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const cache = useRef<Partial<Record<Cue, HTMLAudioElement>>>({});

  const play = useCallback(
    (cue: Cue) => {
      if (!enabled) return;
      try {
        let audio = cache.current[cue];
        if (!audio) {
          audio = new Audio(FILES[cue]);
          audio.volume = 0.32;
          cache.current[cue] = audio;
        }
        audio.currentTime = 0;
        // Playback can still be refused; a failed cue is not worth surfacing.
        void audio.play().catch(() => {});
      } catch {
        /* no audio support: stay silent */
      }
    },
    [enabled],
  );

  const toggle = useCallback(() => {
    setEnabled((on) => {
      const next = !on;
      if (next) {
        // Warm the cache inside the click, while the gesture still counts.
        (Object.keys(FILES) as Cue[]).forEach((cue) => {
          if (!cache.current[cue]) {
            const audio = new Audio(FILES[cue]);
            audio.volume = 0.32;
            cache.current[cue] = audio;
          }
        });
        void cache.current.tap?.play().catch(() => {});
      }
      return next;
    });
  }, []);

  const value = useMemo<SoundApi>(
    () => ({ enabled, toggle, play }),
    [enabled, toggle, play],
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

/** The control itself, for the navigation bar. */
export default function SoundToggle({ className = '' }: { className?: string }) {
  const { enabled, toggle } = useSound();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? 'Turn interface sound off' : 'Turn interface sound on'}
      title={enabled ? 'Sound on' : 'Sound off'}
      className={`grid h-10 w-10 place-items-center rounded-lg border border-[var(--edge-strong)] text-ink-dim transition-colors hover:bg-white/5 hover:text-ink ${className}`}
    >
      <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M4 8v4h3l4 3V5L7 8H4z"
          fill="currentColor"
        />
        {enabled ? (
          <path
            d="M14 7.2a4 4 0 010 5.6M16.4 5a7 7 0 010 10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M14 8l4 4m0-4l-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        )}
      </svg>
    </button>
  );
}
