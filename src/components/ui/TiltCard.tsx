'use client';

import { useRef, type ReactNode } from 'react';

import { useReducedMotion } from '@/hooks/useReducedMotion';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** Maximum rotation in degrees. Kept low; more reads as a gimmick. */
  max?: number;
  accent?: string;
}

/**
 * A card that tilts slightly under the pointer, with a light source that
 * follows it.
 *
 * The highlight is what sells the effect — a tilt on its own just looks like
 * the layout is broken.
 */
export default function TiltCard({
  children,
  className = '',
  max = 6,
  accent = 'var(--color-cyan)',
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const handleMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || event.pointerType !== 'mouse') return;
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;

    el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * max}deg) rotateY(${(px - 0.5) * max}deg) translateZ(0)`;
    el.style.setProperty('--mx', `${px * 100}%`);
    el.style.setProperty('--my', `${py * 100}%`);
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
  };

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      className={`relative transition-transform duration-300 ease-out will-change-transform ${className}`}
      style={{ ['--accent' as string]: accent }}
    >
      {/* Pointer-following sheen. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 [background:radial-gradient(420px_circle_at_var(--mx,50%)_var(--my,50%),color-mix(in_oklab,var(--accent)_22%,transparent),transparent_60%)] group-hover:opacity-100"
      />
      {children}
    </div>
  );
}
