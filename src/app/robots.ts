import type { MetadataRoute } from 'next';

/**
 * Required by `output: 'export'`: a static export has no server to evaluate
 * this route at request time, so Next needs to be told it can be produced
 * once at build time. Harmless in the server build, where the content is
 * static anyway.
 */
export const dynamic = 'force-static';

import { WEBSITE_URL } from '@/config/site-url';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${WEBSITE_URL}/sitemap.xml`,
  };
}
