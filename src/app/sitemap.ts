import type { MetadataRoute } from 'next';

/**
 * Required by `output: 'export'`: a static export has no server to evaluate
 * this route at request time, so Next needs to be told it can be produced
 * once at build time. Harmless in the server build, where the content is
 * static anyway.
 */
export const dynamic = 'force-static';

import { WEBSITE_URL } from '@/config/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const updated = new Date('2026-09-20');
  return [
    { url: WEBSITE_URL, lastModified: updated, changeFrequency: 'monthly', priority: 1 },
    { url: `${WEBSITE_URL}/privacy`, lastModified: updated, priority: 0.3 },
    { url: `${WEBSITE_URL}/terms`, lastModified: updated, priority: 0.3 },
    { url: `${WEBSITE_URL}/licenses`, lastModified: updated, priority: 0.3 },
  ];
}
