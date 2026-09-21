/**
 * The subdirectory the site is served from, or '' when it is served from a
 * domain root.
 *
 * GitHub Pages *project* sites live at https://<user>.github.io/<repo>, so
 * everything the browser requests has to carry that prefix. Next.js applies
 * `basePath` automatically to `next/link` and `next/image`, but NOT to a
 * plain `<a href>`, a `fetch()`, `new Audio()`, or a path written into the
 * web app manifest. Those are exactly the cases this module exists for.
 *
 * `next.config.ts` copies the build-time `BASE_PATH` into
 * `NEXT_PUBLIC_BASE_PATH` so the value is inlined into the browser bundle
 * too - a bare `BASE_PATH` would be `undefined` on the client and every
 * asset would silently resolve to the wrong origin.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/**
 * Prefixes a root-relative path from `public/` with the base path.
 *
 * Use it for anything Next does not rewrite itself. What it does rewrite is
 * narrower than it looks, and was established by reading the deployed page
 * rather than by assumption:
 *
 *   rewritten by Next    next/link href, metadata `manifest`
 *   NOT rewritten        plain <a href>, fetch(), new Audio(),
 *                        metadata `icons`, manifest icon paths, and
 *                        next/image `src` when `images.unoptimized` is on -
 *                        which it always is in a static export, because the
 *                        default loader returns the src untouched instead of
 *                        routing it through /_next/image
 *
 * Passing a next/link href through this would prefix it twice.
 */
export function asset(path: string): string {
  return `${BASE_PATH}${path}`;
}
