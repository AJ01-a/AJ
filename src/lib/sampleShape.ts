/**
 * Turns 2-D artwork into a point cloud.
 *
 * The nano sequence needs two matched sets of particle positions — one
 * spelling "AJ", one forming the RetroMind bolt — so a particle can be given
 * a start and an end and simply interpolated between them. The cheapest
 * reliable way to get those is to draw the shape into an offscreen canvas and
 * read back the pixels that landed.
 *
 * Both clouds must contain exactly the same number of points, which is why
 * `sampleShape` always returns `count` points: it repeats or thins the raw
 * hits as needed rather than returning however many it happened to find.
 */

export interface SampleOptions {
  /** How many points to return. Always honoured exactly. */
  count: number;
  /** Offscreen raster width. Higher means finer detail, at sampling cost. */
  resolution?: number;
  /** Alpha above which a pixel counts as part of the shape. */
  threshold?: number;
  /**
   * Exact world-space width of the resulting cloud's bounding box.
   * The cloud is always centred on the origin.
   */
  worldWidth?: number;
  /** Random depth spread applied on Z, in world units. */
  depth?: number;
}

export interface PointCloud {
  /** Interleaved xyz, length `count * 3`. */
  positions: Float32Array;
  /** Aspect ratio (w/h) of the ink that was drawn. */
  aspect: number;
  /** World-space bounding box of the cloud, centred on the origin. */
  size: { width: number; height: number };
}

type DrawFn = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) => void;

/**
 * Rasterises `draw` and converts the opaque pixels into a point cloud.
 */
export function sampleShape(draw: DrawFn, options: SampleOptions): PointCloud {
  const {
    count,
    resolution = 520,
    threshold = 90,
    worldWidth = 520,
    depth = 10,
  } = options;

  const width = resolution;
  const height = Math.round(resolution * 0.62);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    // No 2-D context is a genuinely broken environment; hand back a cloud of
    // zeroes so the caller renders nothing rather than throwing.
    return {
      positions: new Float32Array(count * 3),
      aspect: 1,
      size: { width: 0, height: 0 },
    };
  }

  ctx.clearRect(0, 0, width, height);
  draw(ctx, width, height);

  const { data } = ctx.getImageData(0, 0, width, height);

  // Collect every hit, then thin down. Scanning every pixel and keeping all
  // hits gives an even distribution; picking random pixels would clump.
  const hits: number[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > threshold) {
        hits.push(x, y);
      }
    }
  }

  const positions = new Float32Array(count * 3);
  const found = hits.length / 2;
  if (found === 0) {
    return { positions, aspect: 1, size: { width: 0, height: 0 } };
  }

  // Measure what was actually drawn. Scaling to the raster would make the
  // cloud's size depend on the font's internal metrics; scaling to the ink's
  // own bounding box makes `worldWidth` mean exactly what it says, which is
  // what lets the DOM headline be matched to it precisely.
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < found; i++) {
    const x = hits[i * 2];
    const y = hits[i * 2 + 1];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  const inkWidth = Math.max(maxX - minX, 1);
  const inkHeight = Math.max(maxY - minY, 1);
  const scale = worldWidth / inkWidth;
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  for (let i = 0; i < count; i++) {
    // Walk the hit list on an irrational stride so repeated passes land on
    // different pixels instead of retracing the same ones.
    const index = Math.floor((i * 0.6180339887498949 * found) % found);
    const x = hits[index * 2];
    const y = hits[index * 2 + 1];

    // Sub-pixel jitter stops the cloud looking like a visible grid.
    const jx = (Math.random() - 0.5) * 1.15;
    const jy = (Math.random() - 0.5) * 1.15;

    positions[i * 3] = (x + jx - centerX) * scale;
    positions[i * 3 + 1] = -(y + jy - centerY) * scale;
    positions[i * 3 + 2] = (Math.random() - 0.5) * depth;
  }

  return {
    positions,
    aspect: inkWidth / inkHeight,
    size: { width: worldWidth, height: inkHeight * scale },
  };
}

/** Draws centred text, scaled to fill the raster with a small margin. */
export function drawText(text: string, fontFamily: string, weight = 800): DrawFn {
  return (ctx, width, height) => {
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Binary-search the size that fits the box, so the cloud fills the frame
    // regardless of how wide the string or the font happens to be.
    let lo = 10;
    let hi = height * 2;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      ctx.font = `${weight} ${mid}px ${fontFamily}`;
      const m = ctx.measureText(text);
      const w = m.width;
      const h =
        (m.actualBoundingBoxAscent || mid * 0.7) +
        (m.actualBoundingBoxDescent || mid * 0.2);
      if (w > width * 0.86 || h > height * 0.82) hi = mid;
      else lo = mid;
    }

    ctx.font = `${weight} ${lo}px ${fontFamily}`;
    const metrics = ctx.measureText(text);
    // Optical centring: sit on the glyph box, not the font's line box, or
    // letters without descenders drift upward.
    const ascent = metrics.actualBoundingBoxAscent || lo * 0.7;
    const descent = metrics.actualBoundingBoxDescent || 0;
    ctx.fillText(text, width / 2, height / 2 + (ascent - descent) / 2);
  };
}

/**
 * The RetroMind bolt, drawn from the same coarse pixel grid the app's icon
 * generator uses. Reusing the grid rather than an image keeps the site and
 * the app mark identical, and needs no asset to load before the scene starts.
 */
const BOLT_GRID = [
  '....####.',
  '...#####.',
  '..#####..',
  '.#####...',
  '#####....',
  '#########',
  '...#####.',
  '..#####..',
  '.#####...',
  '####.....',
  '##.......',
] as const;

export const drawBolt: DrawFn = (ctx, width, height) => {
  const cols = BOLT_GRID[0].length;
  const rows = BOLT_GRID.length;
  const cell = Math.min((width * 0.5) / cols, (height * 0.82) / rows);
  const ox = (width - cell * cols) / 2;
  const oy = (height - cell * rows) / 2;

  ctx.fillStyle = '#fff';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (BOLT_GRID[r][c] !== '#') continue;
      // A hair of inset keeps the blocks distinguishable in the cloud.
      ctx.fillRect(ox + c * cell + cell * 0.06, oy + r * cell + cell * 0.06, cell * 0.88, cell * 0.88);
    }
  }
};

/** Reads a CSS custom property holding a font stack, for canvas `font`. */
export function resolveFontFamily(variable: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();
  return value || fallback;
}
