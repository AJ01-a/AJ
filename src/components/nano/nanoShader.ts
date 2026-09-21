/**
 * Shaders for the AJ → nanomachine → RetroMind transformation.
 *
 * Everything that moves is computed on the GPU from a single uniform,
 * `uProgress`. The CPU's only job per frame is to write that number, which is
 * what lets tens of thousands of particles stay locked to the scroll position
 * without the main thread doing any per-particle work.
 */

export const nanoVertexShader = /* glsl */ `
  uniform float uProgress;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec2  uPointer;

  attribute vec3  aFrom;    // position within the "AJ" glyphs
  attribute vec3  aTo;      // position within the bolt mark
  attribute vec3  aSeed;    // per-particle direction, roughly unit length
  attribute float aRand;    // 0..1, stable per particle

  varying float vHeat;      // 0 = settled, 1 = mid-explosion
  varying float vFade;
  varying float vRand;

  // Cheap value noise. Enough to break up regular motion; not worth the
  // cost of anything better at this particle count.
  float hash(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
  }

  void main() {
    // --- phase envelopes -------------------------------------------------
    // Overlapping ranges, so one stage is always easing into the next and
    // the sequence never visibly "steps".
    float tremor   = smoothstep(0.02, 0.26, uProgress);
    float disperse = smoothstep(0.20, 0.58, uProgress);
    float regroup  = smoothstep(0.54, 0.95, uProgress);

    // Staggering by aRand makes the fracture spread across the letterforms
    // instead of every particle leaving at once.
    float stagger = smoothstep(aRand * 0.30, aRand * 0.30 + 0.26, uProgress);

    // --- stage 1: the letters destabilise --------------------------------
    float breathe = sin(uTime * 0.8 + aRand * 6.2831) * 0.5 + 0.5;
    vec3 idle = aSeed * breathe * 0.9 * (1.0 - disperse);

    vec3 crack = aSeed * (3.0 + 9.0 * aRand) * tremor * stagger;

    // --- stage 2: dispersal ----------------------------------------------
    vec3 dir = normalize(aSeed + vec3(0.0001));
    float reach = 90.0 + 190.0 * aRand;

    // A slow rotation about the view axis reads as machinery rather than a
    // simple outward blast.
    float spin = uProgress * 2.6 + aRand * 6.2831;
    vec3 swirl = vec3(cos(spin), sin(spin), sin(spin * 0.6)) * (14.0 + 26.0 * aRand);

    float turbulence = hash(aFrom * 0.05 + aRand) - 0.5;

    vec3 burst = aFrom + dir * reach + swirl;
    burst.z += (aRand - 0.5) * 300.0 + turbulence * 40.0;

    // --- compose ----------------------------------------------------------
    vec3 pos = aFrom + idle + crack;
    pos = mix(pos, burst, disperse);
    pos = mix(pos, aTo, regroup);

    // Parallax: far particles trail the pointer more than near ones.
    pos.xy += uPointer * (6.0 + aRand * 14.0) * (1.0 - regroup);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Perspective size attenuation, with a floor so distant motes never
    // vanish into sub-pixel flicker.
    float size = uSize * (0.55 + 0.85 * aRand);
    size *= 1.0 + 1.6 * disperse * (1.0 - regroup);   // flare mid-burst
    // Landing on the mark, the motes shrink and tighten: a reassembled
    // logo should look machined, not like a cloud that stopped moving.
    size *= 1.0 - 0.28 * regroup;
    gl_PointSize = max(1.0, size * uPixelRatio * (260.0 / max(-mvPosition.z, 1.0)));

    // Heat drives colour: cool when assembled, hot while flying.
    vHeat = disperse * (1.0 - regroup);
    vFade = 1.0;
    vRand = aRand;
  }
`;

export const nanoFragmentShader = /* glsl */ `
  precision mediump float;

  uniform vec3 uColorCool;
  uniform vec3 uColorHot;
  uniform vec3 uColorEdge;
  uniform float uOpacity;

  varying float vHeat;
  varying float vFade;
  varying float vRand;

  void main() {
    // Round, soft-edged point. Discarding outside the disc keeps the
    // additive blend from stacking square corners into a haze.
    vec2 uv = gl_PointCoord - 0.5;
    float d = dot(uv, uv);
    if (d > 0.25) discard;

    float falloff = 1.0 - smoothstep(0.0, 0.25, d);
    falloff = pow(falloff, 1.7);

    vec3 color = mix(uColorCool, uColorHot, vHeat);
    // A minority of particles run toward the third accent, which stops the
    // cloud reading as a single flat gradient.
    color = mix(color, uColorEdge, step(0.82, vRand) * (0.35 + 0.5 * vHeat));

    // Hot core, coloured skirt.
    color += vec3(0.55) * pow(falloff, 4.0);

    gl_FragColor = vec4(color, falloff * uOpacity * vFade);
  }
`;
