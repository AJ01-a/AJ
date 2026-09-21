import type { MetadataRoute } from 'next';

/**
 * Required by `output: 'export'`: a static export has no server to evaluate
 * this route at request time, so Next needs to be told it can be produced
 * once at build time. Harmless in the server build, where the content is
 * static anyway.
 */
export const dynamic = 'force-static';

import { WEBSITE_URL } from '@/config/site-url';

/**
 * A static export sets `trailingSlash`, so `/privacy` is really served at
 * `/privacy/` and that is what Next writes into the canonical link. A
 * sitemap that lists the un-slashed form would disagree with the canonical
 * tag on the very page it points at, which is exactly the kind of
 * contradiction that gets a URL dropped from an index.
 */
const SLASH = process.env.STATIC_EXPORT === 'true' ? '/' : '';

const page = (path: string) => `${WEBSITE_URL}${path}${SLASH}`;

export default function sitemap(): MetadataRoute.Sitemap {
  const updated = new Date('2026-09-20');
  return [
    { url: page(''), lastModified: updated, changeFrequency: 'monthly', priority: 1 },
    { url: page('/privacy'), lastModified: updated, priority: 0.3 },
    { url: page('/terms'), lastModified: updated, priority: 0.3 },
    { url: page('/licenses'), lastModified: updated, priority: 0.3 },
  ];
}
