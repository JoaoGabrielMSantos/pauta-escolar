import type { NextConfig } from 'next'

/**
 * Baseline security headers applied to every route.
 * The nonce-based Content-Security-Policy is added by `src/proxy.ts` in M2
 * (it needs a per-request nonce), see docs/PLAN.md §4 "Security baseline".
 */
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: true,
  // Next 16 defaults: static shell + streamed dynamic content, partial prefetching.
  cacheComponents: true,
  partialPrefetching: true,
  headers: () => Promise.resolve([{ source: '/:path*', headers: securityHeaders }]),
}

export default nextConfig
