import type { NextConfig } from 'next';

/**
 * Two deployment shapes are supported from the same source.
 *
 *  - Default: a normal Next.js build. Deploy to Vercel, or run `npm start`
 *    on any Node host. Images are optimised at request time.
 *
 *  - `STATIC_EXPORT=true`: a fully static `out/` directory, for GitHub
 *    Pages, Netlify, Cloudflare Pages or object storage. There is no image
 *    optimiser in that mode, so images are served as authored — which is
 *    why the screenshots are already WebP rather than relying on the
 *    optimiser to convert them.
 *
 * `BASE_PATH` covers GitHub Pages *project* sites, which are served from a
 * subdirectory (e.g. /AJ) rather than the domain root.
 */
const isStaticExport = process.env.STATIC_EXPORT === 'true';
const basePath = process.env.BASE_PATH ?? '';

const nextConfig: NextConfig = {
  ...(isStaticExport ? { output: 'export' as const } : {}),
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),

  images: {
    // A static export has no server to optimise on.
    unoptimized: isStaticExport,
    formats: ['image/avif', 'image/webp'],
  },

  // Trailing slashes make a static export behave predictably on hosts that
  // serve directories rather than rewriting extensionless paths.
  trailingSlash: isStaticExport,

  // `headers()` requires a server, so it is omitted from a static export —
  // Next fails the build outright if both are set. On a static host these
  // must be configured on the host instead; see README > Deploying.
  ...(isStaticExport
    ? {}
    : {
        async headers() {
          return [
            {
              source: '/:path*',
              headers: [
                { key: 'X-Content-Type-Options', value: 'nosniff' },
                {
                  key: 'Referrer-Policy',
                  value: 'strict-origin-when-cross-origin',
                },
                { key: 'X-Frame-Options', value: 'DENY' },
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=63072000; includeSubDomains',
                },
                {
                  key: 'Permissions-Policy',
                  value: 'geolocation=(), microphone=(), camera=()',
                },
              ],
            },
            {
              // Serve the package as a download, not as something to render.
              source: '/downloads/:file*.apk',
              headers: [
                {
                  key: 'Content-Type',
                  value: 'application/vnd.android.package-archive',
                },
                { key: 'Content-Disposition', value: 'attachment' },
                // Version is in the filename, so this can be cached hard.
                {
                  key: 'Cache-Control',
                  value: 'public, max-age=31536000, immutable',
                },
              ],
            },
          ];
        },
      }),
};

export default nextConfig;
