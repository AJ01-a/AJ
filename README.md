# RetroMind Arcade — website

The marketing and download site for the **RetroMind Arcade** Android app.

Its defining feature is the opening sequence: the letters **AJ** hold the
screen, then break apart into a nanomachine particle field as you scroll, and
reassemble into the RetroMind Arcade mark. The whole transformation is bound
to scroll position, so it runs backwards when you scroll up.

Built by AJ Almachar with Claude Code.

---

## Contents

- [Project structure](#project-structure)
- [Technology stack](#technology-stack)
- [Running locally](#running-locally)
- [Building for production](#building-for-production)
- [Shipping a new APK](#shipping-a-new-apk)
- [Configuration reference](#configuration-reference)
- [Deploying](#deploying)
- [Placeholders you must replace](#placeholders-you-must-replace)
- [How the nano sequence works](#how-the-nano-sequence-works)
- [Testing performed](#testing-performed)
- [Performance findings](#performance-findings)
- [Known limitations](#known-limitations)
- [Future improvements](#future-improvements)

---

## Project structure

```
website/
├── src/
│   ├── app/
│   │   ├── layout.tsx            fonts, metadata, JSON-LD, skip link
│   │   ├── page.tsx              composes the whole home page
│   │   ├── globals.css           design tokens + shared surfaces
│   │   ├── error.tsx             error boundary (no stack traces shown)
│   │   ├── not-found.tsx         404
│   │   ├── manifest.ts           PWA manifest
│   │   ├── robots.ts  sitemap.ts
│   │   ├── privacy/  terms/  licenses/
│   ├── components/
│   │   ├── nano/                 ★ the signature sequence
│   │   │   ├── NanoStage.tsx     pinned section, ScrollTrigger, DOM overlays
│   │   │   ├── NanoScene.tsx     Three.js particle system
│   │   │   ├── nanoShader.ts     the GLSL that does the transformation
│   │   │   └── NanoFallback.tsx  CSS stand-in when WebGL is unavailable
│   │   ├── sections/             one file per band of the page
│   │   │   ├── GameLibrary.tsx   all 50 games, filterable by category
│   │   │   ├── Faq.tsx           sideloading questions, <details>-based
│   │   │   └── …
│   │   ├── download/             download panel + install dialog
│   │   ├── legal/                shared legal-page chrome
│   │   └── ui/                   Section, MagneticButton, TiltCard, SoundToggle
│   ├── config/site.ts            ★ everything configurable lives here
│   ├── data/
│   │   ├── games.ts              generated from the app's own catalog
│   │   └── install-steps.ts      shared by the dialog and the guide
│   ├── hooks/                    useReducedMotion, useWebGLSupport
│   └── lib/sampleShape.ts        turns glyphs into particle positions
├── public/
│   ├── downloads/                ← the APK goes here
│   ├── screenshots/              real screens from the app
│   ├── images/                   logo, app icon, OG card
│   ├── audio/                    three UI sounds (opt-in only)
│   └── icons/                    favicons and PWA icons
├── .github/workflows/
│   ├── ci.yml                    lint + types + build on every push
│   └── deploy-pages.yml          optional GitHub Pages deploy
└── scripts/
    ├── sync-apk.mjs              copy a built APK in and report its size
    ├── sync-games.mjs            regenerate games.ts from the app catalog
    ├── verify.mjs                functional + a11y + SEO checks
    ├── shoot.mjs                 screenshots at scroll positions/viewports
    ├── shoot-modes.mjs           reduced-motion and no-WebGL captures
    └── perf.mjs                  transfer weight, Web Vitals, frame times
```

---

## Technology stack

| Piece | Choice | Why |
| --- | --- | --- |
| Framework | **Next.js 16** (App Router) | Static output, first-class metadata, route-level code splitting. |
| Language | **TypeScript** | |
| UI | **React 19** | |
| Styling | **Tailwind CSS 4** | CSS-first `@theme` tokens; no JS config file. |
| Scroll | **GSAP + ScrollTrigger** | `scrub: true` maps scroll position directly onto animation progress, which is what makes the sequence reversible. |
| 3-D | **Three.js** | One `Points` mesh, one custom shader. No scene-graph framework on top. |
| Fonts | **Orbitron + Inter** via `next/font` | The app's own typefaces, self-hosted at build time. |

Five runtime dependencies in total. There is no analytics, tag manager,
cookie banner, animation library beyond GSAP, or UI kit.

---

## Running locally

```bash
npm install
npm run dev          # http://localhost:3000
```

Useful during development:

```bash
npm run lint         # ESLint, including the React hooks rules
npx tsc --noEmit     # type check
```

---

## Building for production

```bash
npm run build
npm start            # serves the production build on :3000
```

Every route is prerendered as static content — there is no server-side work at
request time.

---

## Shipping a new APK

The APK lives in `public/downloads/` and is named with its version, so a CDN
can never serve a stale build from cache.

```bash
# 1. Build the app (from the Flutter project root)
flutter build apk --release --split-per-abi

# 2. Copy it in and read back the numbers
npm run sync:apk
```

`sync:apk` copies `app-arm64-v8a-release.apk` into `public/downloads/` and
prints the exact values to set. Point it at a different file if you want the
universal APK instead:

```bash
node scripts/sync-apk.mjs ../build/app/outputs/flutter-apk/app-release.apk
```

Then update three lines in `src/config/site.ts`:

```ts
export const APP_VERSION    = '1.1.0';      // also renames the download path
export const APK_SIZE_LABEL = '23 MB';
export const APK_UPDATED    = '2026-11-02';
```

`APK_DOWNLOAD_URL` is derived from `APP_VERSION`, so changing the version
updates the filename, the download link, the displayed version and the
structured data together.

> The arm64 build is the right one to offer for a direct download: it covers
> essentially every Android phone of the last several years at a third the
> size of the universal APK. If you need to support 32-bit devices, ship
> `app-release.apk` instead and say so under `APK_ARCHITECTURE`.

---

## Configuration reference

Everything configurable is in **`src/config/site.ts`**.

| Constant | Purpose |
| --- | --- |
| `APP_VERSION` | Drives the APK filename, the download URL and the version shown everywhere. |
| `APK_DOWNLOAD_URL` | Derived from the version. Change here to host the APK elsewhere. |
| `APK_SIZE_LABEL` | Shown before download. `npm run sync:apk` prints the right value. |
| `APK_UPDATED` | ISO date shown in the download panel. |
| `ANDROID_REQUIREMENT`, `APK_ARCHITECTURE` | Compatibility text. |
| `APP_STORE_URL` | **Set this and the iOS button becomes a live link automatically.** While it is `null`, the button renders as a disabled "coming soon". |
| `SUPPORT_EMAIL` | Shown on the About section and both legal pages. |
| `WEBSITE_URL` | Canonical URL, Open Graph, sitemap, robots. |
| `NAV_LINKS`, `SCREENSHOTS` | Navigation and the screenshot gallery. |

### Turning on the iOS link

```ts
export const APP_STORE_URL: string | null =
  'https://apps.apple.com/app/id0000000000';
```

`IOS_AVAILABLE` is computed from it, and the download panel switches from the
disabled state to a working button. Nothing else needs touching.

### Keeping the game list honest

`src/data/games.ts` is generated from the app's `GAME_CATALOG.md`, which is
itself generated from the Flutter registry:

```bash
npm run sync:games
```

Do not hand-edit it. This chain is why the site can claim "50 games" and list
real names, taglines, descriptions and difficulty tiers without any risk of
advertising something the app does not contain.

---

## Deploying

The build is fully static, so almost anything will host it.

**Vercel** (zero config, and the recommended host — it is the only one of
these that can set the response headers below):

Import the repository at [vercel.com/new](https://vercel.com/new) and accept
the detected Next.js settings. Every push to `main` then redeploys. Or from
the CLI:

```bash
npx vercel --prod
```

`WEBSITE_URL` — the canonical link, the absolute Open Graph image URL and
the sitemap — resolves itself on Vercel from `VERCEL_PROJECT_PRODUCTION_URL`,
so there is nothing to configure. On any other host, or once a custom domain
is attached, set `SITE_URL` instead:

```bash
SITE_URL=https://retromindarcade.com npm run build
```

Without either, the site falls back to a placeholder origin and says so in
the UI rather than publishing a URL that does not resolve.

**Any Node host:**

```bash
npm run build && npm start      # listens on $PORT, default 3000
```

**A purely static host** (Netlify, Cloudflare Pages, S3, GitHub Pages) — no
config edit needed, it is built in:

```bash
STATIC_EXPORT=true npm run build     # writes ./out
```

For a GitHub Pages *project* site served from a subdirectory, also set the
base path:

```bash
STATIC_EXPORT=true BASE_PATH=/AJ npm run build
```

`.github/workflows/deploy-pages.yml` does exactly this and deploys `out/`.
It is **manual-trigger only** by default, because `actions/deploy-pages`
fails outright if Pages has not been enabled — and a workflow that goes red
on every push trains you to ignore the Actions tab.

To turn it on: **Settings → Pages → Build and deployment → Source: GitHub
Actions**, then run it once from the Actions tab. Uncomment the `push:`
trigger in the workflow to deploy automatically thereafter.

The workflow fails the build if the APK is missing from the export, because
a deploy that silently drops the download is worse than one that fails.

Two things a static export gives up: image optimisation at request time
(which is why the screenshots are pre-encoded as WebP), and the response
headers below — those must be set on the host instead.

### Serving the APK correctly

Most hosts get this right automatically, but confirm the file is served as a
download rather than rendered:

```
Content-Type: application/vnd.android.package-archive
```

The link already carries a `download` attribute, which is what actually
matters in the browser. Also check your host does not have a file-size cap
below ~25 MB on static assets.

### Security headers

Already configured in `next.config.ts` for the Node/Vercel build:
`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`,
`Strict-Transport-Security` and a restrictive `Permissions-Policy`. The APK
route additionally sets the Android package content type, a
`Content-Disposition: attachment`, and a one-year immutable cache (safe,
because the version is in the filename).

Next refuses to build a static export with `headers()` set, so they are
omitted in that mode — configure the equivalents on your host.

A Content-Security-Policy is worth adding too, but Next's inline hydration
script needs a nonce, so test it before shipping.

---

## Placeholders you must replace

These are deliberately obvious rather than plausible, so none of them can
reach production unnoticed. Two of them render a visible warning in the UI.

| Placeholder | Where | Notes |
| --- | --- | --- |
| `SUPPORT_EMAIL` = `support@YOURDOMAIN.com` | `src/config/site.ts` | Shows an amber warning box on the About section until changed. |
| `WEBSITE_URL` = `https://YOURDOMAIN.com` | `src/config/site.ts` | Canonical URL, OG tags and sitemap are wrong until this is real. |
| Hosting provider + log retention | `src/app/privacy/page.tsx` | Marked with a callout. Cannot be accurate until the site has a host. |
| Governing law, legal entity, consumer rights | `src/app/terms/page.tsx` | Marked with a callout. |
| `APP_STORE_URL` | `src/config/site.ts` | Stays `null` until the iOS app ships. |

The legal pages are **templates written for this site, not legal advice.**
They describe the site and app accurately, but they have not been reviewed by
a lawyer, and GDPR/UK GDPR/CCPA obligations are not covered.

---

## How the nano sequence works

Worth understanding before changing it.

1. **Two point clouds are sampled in the browser.** `sampleShape.ts` draws
   "AJ" (in Orbitron, the app's own display face) and the RetroMind bolt into
   offscreen canvases, reads back the opaque pixels, and normalises each cloud
   to an exact bounding box. Both clouds contain the same number of points, so
   point *n* has a start and an end and can simply be interpolated.

2. **One draw call.** All points live in a single `THREE.Points` with custom
   attributes (`aFrom`, `aTo`, `aSeed`, `aRand`). The CPU never touches a
   particle.

3. **The shader does the transformation** from one uniform, `uProgress`, using
   three overlapping phases — tremor, dispersal, reassembly — so the sequence
   eases between stages rather than stepping.

4. **ScrollTrigger writes that uniform** with `scrub: true`, which is what
   makes the animation reversible and directly controllable.

5. **The DOM headline is measured onto the particle cloud.** `NanoScene`
   reports the cloud's on-screen size and `NanoStage` scales the real `<span>`
   to match, correcting for the difference between a font's line box and its
   ink box. Without that the crisp letters and the particle letters sit at
   different sizes and the crossfade reads as two logos rather than one
   dissolving.

**Particle budget** adapts to the device: 30,000 on a high-core desktop down
to 7,000 on a phone, chosen in `particleBudget()`.

### Tuning it

- Timings: the three `smoothstep` ranges at the top of `nanoShader.ts`.
- Sequence length: the `h-[420vh]` on the section in `NanoStage.tsx`.
- Phase labels: the `PHASES` array in `NanoStage.tsx`.
- Colours: the `uColorCool` / `uColorHot` / `uColorEdge` uniforms.

---

## Testing performed

Automated, via the scripts in `scripts/`:

- **`verify.mjs` — 22 checks, all passing.** The APK is really served and is a
  plausible size; the download button opens the dialog; the dialog is modal,
  labelled, focus-trapped, closes on Escape and on Cancel, and its link points
  at the APK; the first tab stop is a skip link to the download; exactly one
  `h1`; every image has alt text; title, meta description, OG image, `lang`
  and JSON-LD are present; all three legal pages respond 200.
- **`shoot.mjs`** — the hero captured at 7 scroll positions on desktop (1440)
  and mobile (390), plus every content section, checking for console errors,
  failed requests and horizontal overflow. None found.
- **`shoot-modes.mjs`** — `prefers-reduced-motion` and a forced WebGL failure,
  confirming the download stays reachable and no errors are thrown in either.
- **`perf.mjs`** — transfer weight, Web Vitals and frame times while scrubbing.

Manually reviewed: every section at both viewports, the reduced-motion layout,
the no-WebGL fallback, the install dialog, the game library filters, the FAQ
disclosures, and all three legal pages.

One note on the test suite itself: `verify.mjs` was intermittently reporting
19/22 because it clicked the download button before hydration had finished.
It now waits for the button to exist before interacting, and reports 22/22
consistently. A flaky check is worse than no check — it teaches you to ignore
the result.

**Not tested:** real iOS Safari and Firefox (only Chromium via Puppeteer was
available here), real touch devices, and screen readers. See
[Known limitations](#known-limitations).

---

## Performance findings

Measured against the production build.

| Metric | Result |
| --- | --- |
| **CLS** | **0.000** |
| **FCP** | ~150 ms (median of repeated runs) |
| **Frame time while scrubbing** | 16.7 ms median — a solid 60 fps |
| TTFB | 4–7 ms (local) |
| Transfer, first load, uncompressed | ~1.45 MB |

**Where the bytes go.** The largest chunk is Three.js at 531 KB uncompressed
(~135 KB gzipped). Named imports were tried and do not help: the WebGL
renderer core is most of the library and is not separable. It is, however, in
its own chunk loaded only when the scene mounts — measured FCP is identical
with and without WebGL, so it does not block first paint. GSAP is likewise
`await import`-ed inside an effect.

**A measurement caution.** Early runs showed FCP around 2.8 s. Sampling
repeatedly showed the true median is ~150 ms with occasional multi-second
outliers — an artefact of headless software rasterisation, not the site.
Anyone re-measuring should take a median, not a single sample.

**Two real optimisations were made.** The screenshots were re-encoded from
PNG to WebP — 912 KB down to 198 KB, a 79% reduction, and the largest
non-JavaScript payload on the page. The OG card stays JPEG, because several
social scrapers still ignore WebP.

Second: `backdrop-filter: blur()` was removed from
the shared `.panel` surface. These panels sit on an almost flat dark field, so
the blur had very little to blur, but it forced the compositor to re-read the
backdrop for every panel on screen — one of the most expensive things a mobile
GPU can be asked to do. The glass effect is unchanged to the eye. The
navigation bar keeps its blur, because it genuinely sits over moving content.

---

## Known limitations

- **Browser coverage.** Only Chromium was testable in this environment. The
  code uses no Chromium-only APIs, and `<dialog>`, `backdrop-filter`,
  `color-mix()` and WebGL are all broadly supported, but **Safari and Firefox
  have not been opened.** Test both before launch, especially the pinned
  scroll on iOS Safari, which handles pinning differently from desktop.
- **No real-device testing.** Frame rates were measured under headless
  software rendering. A mid-range Android phone will behave differently, and
  the particle budget may need tuning.
- **No screen-reader testing.** Semantics, labels, focus order and the modal
  dialog are implemented and verified structurally, but not driven with
  VoiceOver or NVDA.
- **Three.js is a large dependency** for one effect. Justified here because
  that effect is the point of the site, but it is most of the JavaScript.
- **English only.** No localisation layer.
- **The scroll sequence needs roughly four viewport heights.** On a very short
  landscape viewport the pinned hero occupies a lot of scrolling before the
  content begins. The skip link and the navigation both bypass it.
- **The legal pages are templates.** See
  [Placeholders](#placeholders-you-must-replace).

---

## Future improvements

**Worth doing before launch**

- Open the site in Safari and Firefox, and on a real Android phone and iPhone.
- Run a screen reader over the hero and the download dialog.
- Add the security headers above, and a CSP once the nonce is handled.
- Replace both `YOURDOMAIN` placeholders and complete the legal callouts.

**Worth doing after**

- Convert the screenshots to AVIF/WebP — they are ~900 KB of PNG today, the
  largest non-JavaScript payload.
- A reduced-particle "lite" mode triggered by measuring the first few frames,
  rather than inferring from core count alone.
- Preload the Three.js chunk on pointer-intent so the scene is ready sooner
  on slow connections.
- A short looping video of real gameplay in the showcase.
- Open Graph images per page, generated with `next/og`.
- Move the APK to object storage with a CDN in front if traffic grows —
  `APK_DOWNLOAD_URL` is already the single place to change.

---

© 2026 AJ Almachar. All rights reserved.
