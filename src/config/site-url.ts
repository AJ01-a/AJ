/**
 * The origin the site is served from, resolved at build time.
 *
 * Deliberately a separate module from `site.ts`. This value is read only by
 * server-rendered metadata — the layout, the sitemap and robots.txt — and
 * keeping it apart means the environment lookup and the placeholder string
 * never reach the browser bundle, where they would be dead weight and, worse,
 * would make a plain text search of the built output report a placeholder
 * origin that was never actually published.
 *
 * Resolution order:
 *
 *  1. `SITE_URL` — set this for a custom domain, or for GitHub Pages, where
 *     a project site lives in a subdirectory (https://user.github.io/REPO).
 *     It wins over everything.
 *  2. `VERCEL_PROJECT_PRODUCTION_URL` — set automatically by Vercel to the
 *     project's production host, so a Vercel deploy needs no configuration.
 *     Deliberately not `VERCEL_URL`, which is the per-deployment host and
 *     would make every preview build advertise its own canonical URL and
 *     compete with production in search results.
 *  3. A placeholder, which the build refuses to publish — see the
 *     "Confirm no placeholder origin was published" step in the Pages
 *     workflow.
 */
function resolveWebsiteUrl(): string {
  const explicit = process.env.SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, '');

  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelHost) return `https://${vercelHost}`;

  return 'https://YOURDOMAIN.com';
}

export const WEBSITE_URL = resolveWebsiteUrl();
export const WEBSITE_URL_IS_PLACEHOLDER = WEBSITE_URL.includes('YOURDOMAIN');
