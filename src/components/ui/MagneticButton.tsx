'use client';

import { useRef, type ReactNode } from 'react';

import { useReducedMotion } from '@/hooks/useReducedMotion';

interface MagneticButtonProps {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  download?: string;
  className?: string;
  ariaLabel?: string;
  /** How far the button may drift toward the pointer, in pixels. */
  strength?: number;
  type?: 'button' | 'submit';
}

/**
 * A button that leans slightly toward the cursor.
 *
 * The movement is small on purpose — enough to feel responsive, never enough
 * to make the target hard to hit. It is disabled entirely for reduced-motion
 * users and on touch devices, where there is no hover to respond to.
 */
export default function MagneticButton({
  children,
  onClick,
  href,
  download,
  className = '',
  ariaLabel,
  strength = 6,
  type = 'button',
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  const handleMove = (event: React.PointerEvent) => {
    if (reducedMotion || event.pointerType !== 'mouse') return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const dy = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
  };

  const reset = () => {
    const el = ref.current;
    if (el) el.style.transform = 'translate(0px, 0px)';
  };

  const shared = {
    ref: ref as React.RefObject<never>,
    onPointerMove: handleMove,
    onPointerLeave: reset,
    onBlur: reset,
    className: `inline-flex items-center justify-center gap-2 transition-[transform,box-shadow,background-color] duration-200 ease-out will-change-transform ${className}`,
    'aria-label': ariaLabel,
  };

  if (href) {
    return (
      <a {...shared} href={href} download={download}>
        {children}
      </a>
    );
  }

  return (
    <button {...shared} type={type} onClick={onClick}>
      {children}
    </button>
  );
}
