'use client';

import { useEffect, useRef } from 'react';
// Named imports rather than a namespace import: three is a large ESM
// package and this lets the bundler drop the loaders, controls, geometry
// helpers and post-processing this scene never touches.
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Clock,
  Color,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Sphere,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';

import { nanoFragmentShader, nanoVertexShader } from './nanoShader';
import {
  drawBolt,
  drawText,
  resolveFontFamily,
  sampleShape,
} from '@/lib/sampleShape';

interface NanoSceneProps {
  /** 0 → "AJ" intact, 1 → fully reassembled into the bolt. */
  progressRef: React.RefObject<number>;
  /** Static frame only; no rAF loop, no pointer parallax. */
  reducedMotion: boolean;
  onReady?: () => void;
  onFailure?: () => void;
  /**
   * Reports where the "AJ" cloud lands on screen, in CSS pixels.
   *
   * The DOM headline is scaled to these numbers so that the crisp type and
   * the particle letterform occupy exactly the same box — without it the two
   * drift apart at different viewport sizes and the crossfade reads as two
   * separate logos rather than one dissolving.
   */
  onLayout?: (box: { width: number; height: number }) => void;
}

/** Particle budget, chosen from what the device can plausibly sustain. */
function particleBudget(): number {
  if (typeof window === 'undefined') return 12000;

  const cores = navigator.hardwareConcurrency ?? 4;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const narrow = window.innerWidth < 768;

  // Phones do far less work per frame than their core count suggests, and a
  // dropped frame is much more obvious on a touch scroll than on a wheel.
  if (narrow || coarse) return cores >= 8 ? 11000 : 7000;
  if (cores >= 12) return 30000;
  if (cores >= 8) return 22000;
  return 14000;
}

export default function NanoScene({
  progressRef,
  reducedMotion,
  onReady,
  onFailure,
  onLayout,
}: NanoSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        alpha: true,
        antialias: false, // points are round-masked in the shader already
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: false,
      });
    } catch {
      // No WebGL: the page has a full CSS fallback, so bow out quietly.
      onFailure?.();
      return;
    }

    const count = particleBudget();
    const scene = new Scene();
    const camera = new PerspectiveCamera(48, 1, 1, 2400);
    camera.position.z = 620;

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(pixelRatio);
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);
    renderer.domElement.style.cssText =
      'position:absolute;inset:0;width:100%;height:100%;display:block;';

    // ---- build the two point clouds -----------------------------------
    const displayFont = resolveFontFamily('--font-display', 'sans-serif');
    const AJ_WORLD_WIDTH = 440;

    const from = sampleShape(drawText('AJ', displayFont, 800), {
      count,
      worldWidth: AJ_WORLD_WIDTH,
      resolution: 620,
      depth: 14,
    });
    // The bolt is the app's own icon mark. It reassembles above the
    // wordmark so the two read as a logo lockup rather than overlapping —
    // and tighter and flatter than the AJ cloud, so it resolves into a
    // crisp shape instead of staying a haze.
    const to = sampleShape(drawBolt, {
      count,
      worldWidth: AJ_WORLD_WIDTH * 0.26,
      resolution: 620,
      depth: 8,
    });

    const BOLT_RISE = 150; // world units above centre
    for (let i = 0; i < count; i++) {
      to.positions[i * 3 + 1] += BOLT_RISE;
    }

    const seeds = new Float32Array(count * 3);
    const rands = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Direction biased outward from the glyph centre, so the burst looks
      // like it comes from the letters rather than from a point source.
      const px = from.positions[i * 3];
      const py = from.positions[i * 3 + 1];
      const len = Math.hypot(px, py) || 1;
      const jitterX = (Math.random() - 0.5) * 1.4;
      const jitterY = (Math.random() - 0.5) * 1.4;
      const jitterZ = (Math.random() - 0.5) * 2;

      seeds[i * 3] = px / len + jitterX;
      seeds[i * 3 + 1] = py / len + jitterY;
      seeds[i * 3 + 2] = jitterZ;
      rands[i] = Math.random();
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(from.positions, 3));
    geometry.setAttribute('aFrom', new BufferAttribute(from.positions, 3));
    geometry.setAttribute('aTo', new BufferAttribute(to.positions, 3));
    geometry.setAttribute('aSeed', new BufferAttribute(seeds, 3));
    geometry.setAttribute('aRand', new BufferAttribute(rands, 1));
    // The cloud moves far outside its initial bounds; without this Three
    // frustum-culls the whole thing mid-burst.
    geometry.boundingSphere = new Sphere(new Vector3(), 1600);

    const uniforms = {
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: 3.4 },
      uPixelRatio: { value: pixelRatio },
      uPointer: { value: new Vector2(0, 0) },
      uOpacity: { value: 1 },
      uColorCool: { value: new Color('#9fe9ff') },
      uColorHot: { value: new Color('#ff3dae') },
      uColorEdge: { value: new Color('#8b5cf6') },
    };

    const material = new ShaderMaterial({
      uniforms,
      vertexShader: nanoVertexShader,
      fragmentShader: nanoFragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: AdditiveBlending,
    });

    const points = new Points(geometry, material);
    scene.add(points);

    // ---- sizing ---------------------------------------------------------
    const resize = () => {
      const { clientWidth: w, clientHeight: h } = host;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;

      // Frame the letterforms to a share of the smaller viewport axis, so
      // the composition holds from a phone to an ultrawide monitor.
      const fovRad = (camera.fov * Math.PI) / 180;
      const targetWorldWidth = AJ_WORLD_WIDTH;
      const targetFraction = w / h < 0.9 ? 0.78 : 0.46; // of viewport width

      // Distance at which `targetWorldWidth` fills `targetFraction` of the
      // frame: derived from the vertical FOV and the viewport aspect.
      const visibleWidthAtZ = targetWorldWidth / targetFraction;
      const visibleHeightAtZ = visibleWidthAtZ / camera.aspect;
      camera.position.z = visibleHeightAtZ / (2 * Math.tan(fovRad / 2));

      uniforms.uSize.value = w / h < 0.9 ? 2.6 : 3.2;
      camera.updateProjectionMatrix();

      // Tell the DOM how large the cloud is, in CSS pixels.
      const pxPerWorld = h / visibleHeightAtZ;
      onLayout?.({
        width: from.size.width * pxPerWorld,
        height: from.size.height * pxPerWorld,
      });
    };
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    // ---- pointer parallax ----------------------------------------------
    const pointerTarget = new Vector2();
    const onPointerMove = (event: PointerEvent) => {
      pointerTarget.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -((event.clientY / window.innerHeight) * 2 - 1),
      );
    };
    if (!reducedMotion) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
    }

    // ---- render loop -----------------------------------------------------
    let frame = 0;
    let visible = true;
    const clock = new Clock();

    const renderOnce = () => {
      uniforms.uProgress.value = progressRef.current ?? 0;
      renderer.render(scene, camera);
    };

    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (!visible || document.hidden) return;

      uniforms.uTime.value = clock.getElapsedTime();
      uniforms.uProgress.value = progressRef.current ?? 0;
      uniforms.uPointer.value.lerp(pointerTarget, 0.045);

      renderer.render(scene, camera);
    };

    if (reducedMotion) {
      renderOnce();
    } else {
      frame = requestAnimationFrame(tick);
    }

    // Stop rendering entirely once the hero has scrolled away — there is no
    // reason to burn a GPU frame on something nobody can see.
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { rootMargin: '120px' },
    );
    observer.observe(host);

    // In reduced-motion mode there is no loop, so redraw on scroll instead.
    const onScroll = () => renderOnce();
    if (reducedMotion) {
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    onReady?.();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);

      // Explicit teardown: a leaked WebGL context survives navigation and
      // browsers cap how many may exist at once.
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentNode === host) {
        host.removeChild(renderer.domElement);
      }
    };
  }, [progressRef, reducedMotion, onReady, onFailure, onLayout]);

  return <div ref={hostRef} className="absolute inset-0" aria-hidden="true" />;
}
