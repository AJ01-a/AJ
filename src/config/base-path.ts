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
 * Only for paths Next does not rewrite itself. Passing a `next/image` src or
 * a `next/link` href through this would prefix it twice.
 */
export function asset(path: string): string {
  return `${BASE_PATH}${path}`;
}
