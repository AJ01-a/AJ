'use client';

import Image from 'next/image';
import { useState } from 'react';

import Section from '@/components/ui/Section';
import { asset } from '@/config/base-path';
import { SCREENSHOTS } from '@/config/site';

/**
 * Screenshot gallery.
 *
 * These are renders of the real application, not mockups — the phone frame
 * around them is decoration, but the pixels inside are the shipped UI.
 */
export default function Screenshots() {
  const [active, setActive] = useState(0);
  const current = SCREENSHOTS[active];

  return (
    <Section
      eyebrow="Inside the app"
      title="What it actually looks like"
      lead="Real screens from the released build, not mockups."
    >
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
        {/* Phone */}
        <div className="flex justify-center">
          <div className="relative">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-12 rounded-full bg-[radial-gradient(closest-side,rgba(139,92,246,0.22),transparent)]"
            />
            <div className="float-slow relative w-[16rem] rounded-[2.2rem] border border-[var(--edge-strong)] bg-deep p-2.5 shadow-2xl sm:w-[17.5rem]">
              {/* Speaker slot, for the sense of a real device. */}
              <div
                aria-hidden="true"
                className="absolute left-1/2 top-4 z-10 h-1.5 w-16 -translate-x-1/2 rounded-full bg-black/60"
              />
              <div className="overflow-hidden rounded-[1.7rem]">
                <Image
                  key={current.src}
                  src={asset(current.src)}
                  alt={current.alt}
                  width={585}
                  height={1266}
                  className="h-auto w-full"
                  sizes="(max-width: 640px) 16rem, 17.5rem"
                  priority={active === 0}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Picker */}
        <div>
          <p className="eyebrow mb-4">Pick a screen</p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {SCREENSHOTS.map((shot, index) => (
              <li key={shot.src}>
                <button
                  type="button"
                  onClick={() => setActive(index)}
                  aria-pressed={index === active}
                  className={`w-full rounded-xl border p-3 text-left transition-colors ${
                    index === active
                      ? 'border-cyan/60 bg-cyan/10 text-ink'
                      : 'border-[var(--edge)] text-ink-dim hover:border-[var(--edge-strong)] hover:bg-white/[0.03]'
                  }`}
                >
                  <span className="block font-display text-xs font-bold tracking-wide">
                    {shot.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <p className="mt-6 min-h-[3.5rem] text-sm leading-relaxed text-ink-dim">
            {current.alt}
          </p>

          <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-[var(--edge)] pt-6">
            {(
              [
                ['50', 'games'],
                ['7', 'categories'],
                ['0', 'adverts'],
              ] as const
            ).map(([value, label]) => (
              <div key={label}>
                <dt className="display text-2xl text-ink">{value}</dt>
                <dd className="mt-0.5 font-body text-xs text-ink-faint">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Section>
  );
}
