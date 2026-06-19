import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // turbopack: {} tells Next.js 16 that we have an explicit Turbopack config
  // (even if empty) so the production build does not error when it sees the
  // webpack() function below. The webpack() function only runs when the dev
  // server is started with --webpack; Turbopack builds ignore it entirely.
  turbopack: {},

  webpack(config, { dev }) {
    if (dev) {
      // Next.js regenerates .next/dev/types/routes.d.ts on every compilation.
      // next-env.d.ts imports that file, so webpack watches it and fires another
      // HMR cycle when it changes — causing the infinite Fast Refresh loop.
      // Ignoring .next/** breaks that cycle.
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          '**/.next/**',
          '**/node_modules/**',
          // AI tooling dirs — written frequently during dev sessions, not app source
          '**/.superpowers/**',
          '**/.claude/**',
          '**/skills-lock.json',
          '**/.agents/**',
          '**/.cursor/**',
          '**/.gemini/**',
          '**/.kiro/**',
          '**/.pi/**',
          '**/.qoder/**',
          '**/.playwright-mcp/**',
        ],
      }
    }
    return config
  },

  async redirects() {
    return [
      // Old query-param URLs (?tab=*) → new top-level routes
      // Note: ?tab=tracker is intentionally omitted — /job-tracker loads correctly
      // without a redirect (the page ignores the unused query param)
      {
        source: '/job-tracker',
        has: [{ type: 'query', key: 'tab', value: 'jobs' }],
        destination: '/find-jobs',
        permanent: false,
      },
      {
        source: '/job-tracker',
        has: [{ type: 'query', key: 'tab', value: 'emails' }],
        destination: '/hr-emails',
        permanent: false,
      },
      {
        source: '/job-tracker',
        has: [{ type: 'query', key: 'tab', value: 'dubai-hr' }],
        destination: '/dubai-hr',
        permanent: false,
      },
      {
        source: '/job-tracker',
        has: [{ type: 'query', key: 'tab', value: 'gulf-jobs' }],
        destination: '/gulf-jobs',
        permanent: false,
      },
      {
        source: '/job-tracker',
        has: [{ type: 'query', key: 'tab', value: 'au-nz' }],
        destination: '/au-nz',
        permanent: false,
      },
      // Old nested routes (/job-tracker/*) → new top-level routes
      {
        source: '/job-tracker/find-jobs',
        destination: '/find-jobs',
        permanent: false,
      },
      {
        source: '/job-tracker/hr-emails',
        destination: '/hr-emails',
        permanent: false,
      },
      {
        source: '/job-tracker/dubai-hr',
        destination: '/dubai-hr',
        permanent: false,
      },
      {
        source: '/job-tracker/gulf-jobs',
        destination: '/gulf-jobs',
        permanent: false,
      },
      {
        source: '/job-tracker/au-nz',
        destination: '/au-nz',
        permanent: false,
      },
    ]
  },

  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      // fallback: only fires when Next.js has no matching route handler.
      // This ensures app/api/jobs/route.ts (and any future Next.js API routes)
      // are served by Next.js directly, while all other /api/* calls are
      // proxied to the Express backend.
      fallback: [
        {
          source: '/api/:path*',
          destination: `${(process.env.NEXT_PUBLIC_JOBFILX_APIURL || 'http://localhost:9001/api').replace(/\/api\/?$/, '')}/api/:path*`,
        },
      ],
    }
  },
}

export default nextConfig
