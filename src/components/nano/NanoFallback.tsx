'use client';

/**
 * CSS-only stand-in for the particle scene.
 *
 * Used when WebGL is unavailable. It cannot reproduce the simulation, but it
 * keeps the same story beats — a solid mark, a dispersed field, a
 * reconstruction — so the page still reads as a transformation rather than as
 * a broken hero with a blank middle.
 *
 * Everything here is a gradient on two elements, so it costs nothing.
 */
export default function NanoFallback({
  progressRef,
}: {
  progressRef: React.RefObject<number>;
}) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      ref={(node) => {
        if (!node) return;
        // Driven from the same scroll progress as the real scene, read on a
        // rAF loop so it never blocks the scroll handler.
        let frame = 0;
        const tick = () => {
          frame = requestAnimationFrame(tick);
          const p = progressRef.current ?? 0;
          const disperse = Math.min(Math.max((p - 0.2) / 0.38, 0), 1);
          const regroup = Math.min(Math.max((p - 0.54) / 0.41, 0), 1);
          const spread = disperse * (1 - regroup);

          node.style.setProperty('--spread', String(spread));
          node.style.setProperty('--scale', String(1 + spread * 1.9));
          node.style.setProperty('--dots', String(0.18 + spread * 0.75));
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
      }}
      style={{ ['--spread' as string]: '0' }}
    >
      <div
        className="absolute left-1/2 top-1/2 h-[46vmin] w-[46vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          transform: 'translate(-50%, -50%) scale(var(--scale, 1))',
          opacity: 'var(--dots, 0.2)',
          background:
            'radial-gradient(circle at center, color-mix(in oklab, var(--color-magenta) 35%, transparent) 0%, transparent 62%)',
          filter: 'blur(14px)',
          transition: 'none',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          opacity: 'calc(var(--spread, 0) * 0.55)',
          backgroundImage:
            'radial-gradient(color-mix(in oklab, var(--color-violet) 70%, transparent) 1px, transparent 1.6px)',
          backgroundSize: '22px 22px',
          maskImage:
            'radial-gradient(ellipse 70% 60% at 50% 50%, #000 10%, transparent 72%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 70% 60% at 50% 50%, #000 10%, transparent 72%)',
        }}
      />
    </div>
  );
}
