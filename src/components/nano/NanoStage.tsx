'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';

import { APP_NAME, APP_TAGLINE, CREATOR_INITIALS } from '@/config/site';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useWebGLSupport } from '@/hooks/useWebGLSupport';

// The WebGL scene is the heaviest thing on the page and is useless during
// SSR, so it is split out and loaded only in the browser.
const NanoScene = dynamic(() => import('./NanoScene'), { ssr: false });
const NanoFallback = dynamic(() => import('./NanoFallback'), { ssr: false });

/** Labels shown against the scrub, so the sequence reads as a process. */
const PHASES: ReadonlyArray<{ at: number; label: string }> = [
  { at: 0.0, label: 'IDENTITY LOCKED' },
  { at: 0.18, label: 'LATTICE DESTABILISING' },
  { at: 0.32, label: 'FRACTURE PROPAGATING' },
  { at: 0.48, label: 'DISASSEMBLY' },
  { at: 0.62, label: 'NANITE DISPERSAL' },
  { at: 0.76, label: 'REASSEMBLY VECTOR FOUND' },
  { at: 0.88, label: 'RECONSTRUCTING' },
  { at: 0.97, label: 'SYSTEM ONLINE' },
];

function phaseFor(progress: number): string {
  let label = PHASES[0].label;
  for (const phase of PHASES) if (progress >= phase.at) label = phase.label;
  return label;
}

export default function NanoStage() {
  const reducedMotion = useReducedMotion();
  const webgl = useWebGLSupport();

  const sectionRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);

  // Overlay elements are written to directly from the scroll handler. Putting
  // scroll progress into React state would re-render the tree on every frame.
  const ajRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const meterRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLSpanElement>(null);

  const [sceneFailed, setSceneFailed] = useState(false);

  /**
   * Scales the DOM headline to sit exactly on top of the particle cloud.
   *
   * Measuring rather than guessing is what makes the opening read as one
   * object: the crisp letters dissolve into the particles that were already
   * occupying the same pixels.
   */
  const matchToCloud = useCallback((box: { width: number; height: number }) => {
    const el = ajRef.current?.firstElementChild as HTMLElement | null;
    if (!el || box.width <= 0) return;

    el.style.transform = 'none';
    const natural = el.getBoundingClientRect();
    if (!natural.width || !natural.height) return;

    const style = getComputedStyle(el);
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) return;

    ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const metrics = ctx.measureText(CREATOR_INITIALS);

    const fontSize = parseFloat(style.fontSize);
    const inkAscent = metrics.actualBoundingBoxAscent;
    const inkDescent = metrics.actualBoundingBoxDescent;
    const fontAscent = metrics.fontBoundingBoxAscent ?? inkAscent;
    const fontDescent = metrics.fontBoundingBoxDescent ?? inkDescent;

    // Where the ink actually sits inside the line box. Glyphs like "AJ" have
    // no descender, so the ink rides high in the box and centring the box
    // leaves the letters visibly above the particle cloud.
    const halfLeading = (fontSize - (fontAscent + fontDescent)) / 2;
    const baselineFromTop = halfLeading + fontAscent;
    const inkCentreFromTop = baselineFromTop - inkAscent + (inkAscent + inkDescent) / 2;
    const correction = fontSize / 2 - inkCentreFromTop;

    // Scale from the ink width, not the line box, for the same reason.
    const inkWidth =
      (metrics.actualBoundingBoxLeft ?? 0) + (metrics.actualBoundingBoxRight ?? natural.width);
    const scale = box.width / (inkWidth || natural.width);

    el.style.transform = `translateY(${correction * scale}px) scale(${scale})`;
  }, []);

  const paint = useCallback((progress: number) => {
    progressRef.current = progress;

    // "AJ" holds, then dissolves as the particles take over.
    const ajOpacity = 1 - smoothstep(0.015, 0.11, progress);
    if (ajRef.current) {
      ajRef.current.style.opacity = String(ajOpacity);
      ajRef.current.style.transform = `scale(${1 + progress * 0.12}) translateZ(0)`;
      ajRef.current.style.filter = `blur(${(1 - ajOpacity) * 7}px)`;
    }

    // The product name arrives only once the cloud has regrouped.
    const revealOpacity = smoothstep(0.82, 0.98, progress);
    if (revealRef.current) {
      revealRef.current.style.opacity = String(revealOpacity);
      revealRef.current.style.transform =
        `translate3d(0, ${(1 - revealOpacity) * 26}px, 0)`;
      revealRef.current.style.pointerEvents = revealOpacity > 0.6 ? 'auto' : 'none';
    }

    if (readoutRef.current) readoutRef.current.textContent = phaseFor(progress);
    if (hintRef.current) {
      // The prompt has done its job once the sequence is underway.
      hintRef.current.style.opacity = String(1 - smoothstep(0.02, 0.16, progress));
    }
    if (meterRef.current) {
      meterRef.current.style.transform = `scaleX(${Math.max(progress, 0.008)})`;
    }
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reducedMotion) return;

    let cleanup = () => {};
    let cancelled = false;

    (async () => {
      const { default: gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        pin: '[data-nano-viewport]',
        pinSpacing: false,
        // `scrub: true` maps progress straight to scroll position, so
        // dragging the scrollbar backwards runs the sequence in reverse.
        // A number here would add smoothing lag and break that feeling.
        scrub: true,
        onUpdate: (self) => paint(self.progress),
        onRefresh: (self) => paint(self.progress),
      });

      cleanup = () => trigger.kill();
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [paint, reducedMotion]);

  const showScene = webgl === 'available' && !sceneFailed;

  // ------------------------------------------------------------------
  // Reduced motion gets its own markup rather than a restyled overlay.
  // The animated version stacks three absolutely-positioned layers on a
  // pinned viewport; reusing that here only produced collisions. A plain
  // document flow says the same thing with no movement at all.
  // ------------------------------------------------------------------
  if (reducedMotion) {
    return (
      <section
        className="scanlines relative overflow-hidden"
        aria-label="Introduction"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_40%,#101a3a_0%,#05070f_62%,#04060f_100%)]" />
        <div className="grid-floor absolute inset-0 opacity-50" />

        <div className="shell relative flex min-h-[100svh] flex-col items-center justify-center gap-14 py-24 text-center">
          <div>
            <span
              className="display block select-none text-ink"
              style={{
                fontSize: 'clamp(5.5rem, 22vmin, 14rem)',
                lineHeight: 1,
                letterSpacing: '0.02em',
                textShadow:
                  '0 0 60px rgba(34,232,245,0.28), 0 0 160px rgba(139,92,246,0.20)',
              }}
            >
              {CREATOR_INITIALS}
            </span>
            <p className="eyebrow mt-6">A game collection by AJ Almachar</p>
          </div>

          <div className="hairline w-full max-w-md" />

          <div>
            <h1 className="display text-gradient text-[clamp(2rem,7vw,4.5rem)] leading-[0.95]">
              {APP_NAME.toUpperCase()}
            </h1>
            <p className="mt-5 text-[clamp(1rem,2.4vw,1.4rem)] text-ink-dim">
              {APP_TAGLINE}
            </p>
            <a
              href="#download"
              className="glow-cyan mt-9 inline-flex items-center gap-2 rounded-lg bg-cyan px-7 py-3.5 font-display text-sm font-bold tracking-widest text-deep"
            >
              DOWNLOAD
              <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      // 420vh gives the scrub room to breathe: shorter and the whole
      // transformation is over in one flick of a trackpad.
      className="relative h-[420vh]"
      aria-label="Introduction"
    >
      <div
        data-nano-viewport
        className="scanlines sticky top-0 h-screen w-full overflow-hidden"
      >
        {/* environment ------------------------------------------------- */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_45%,#101a3a_0%,#05070f_62%,#04060f_100%)]" />
        <div className="grid-floor absolute inset-0 opacity-60" />

        {/* particle system, or a CSS stand-in when WebGL is unavailable */}
        {!showScene && webgl !== 'checking' && (
          <NanoFallback progressRef={progressRef} />
        )}
        {showScene && (
          <NanoScene
            progressRef={progressRef}
            reducedMotion={false}
            onFailure={() => setSceneFailed(true)}
            onLayout={matchToCloud}
          />
        )}

        {/* stage 1: AJ -------------------------------------------------- */}
        <div
          ref={ajRef}
          className="pointer-events-none absolute inset-0 grid place-items-center will-change-transform"
        >
          <span
            className="display block origin-center select-none text-ink will-change-transform"
            style={{
              // A fixed natural size; the real size comes from the scale
              // factor the scene reports, so the type and the particles
              // always occupy the same box.
              fontSize: '12rem',
              lineHeight: 1,
              letterSpacing: '0.02em',
              textShadow:
                '0 0 60px rgba(34,232,245,0.28), 0 0 160px rgba(139,92,246,0.20)',
            }}
          >
            {CREATOR_INITIALS}
          </span>
        </div>

        {/* stage 5: the reveal ------------------------------------------ */}
        <div
          ref={revealRef}
          className="absolute inset-0 grid place-items-center px-6 opacity-0 will-change-transform"
        >
          {/* Pushed below centre so the reassembled bolt sits clear above. */}
          <div className="mt-[26vh] text-center sm:mt-[22vh]">
            <p className="eyebrow mb-5">A game collection by AJ Almachar</p>
            <h1 className="display text-gradient text-[clamp(2.1rem,7.4vw,5.5rem)] leading-[0.95]">
              {APP_NAME.toUpperCase()}
            </h1>
            <p className="mt-5 text-[clamp(1rem,2.4vw,1.5rem)] text-ink-dim">
              {APP_TAGLINE}
            </p>
            <a
              href="#download"
              className="glow-cyan mt-9 inline-flex items-center gap-2 rounded-lg bg-cyan px-7 py-3.5 font-display text-sm font-bold tracking-widest text-deep transition-transform duration-200 hover:scale-[1.03] active:scale-95"
            >
              DOWNLOAD
              <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>

        {/* telemetry ---------------------------------------------------- */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 sm:p-8">
          <div className="shell flex items-end justify-between gap-6">
            <div className="min-w-0 flex-1">
              <span
                ref={readoutRef}
                className="eyebrow block truncate !text-[0.6rem] !tracking-[0.3em] text-ink-faint"
              >
                IDENTITY LOCKED
              </span>
              <div className="mt-2 h-px w-full max-w-sm overflow-hidden bg-[var(--edge)]">
                <div
                  ref={meterRef}
                  className="h-full origin-left bg-gradient-to-r from-cyan to-magenta"
                  style={{ transform: 'scaleX(0.008)' }}
                />
              </div>
            </div>
            <span
              ref={hintRef}
              className="eyebrow shrink-0 animate-pulse !text-[0.6rem]"
            >
              SCROLL ↓
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/** GLSL-style smoothstep, for driving DOM opacity from scroll progress. */
function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
}
