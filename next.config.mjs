/** @type {import('next').NextConfig} */
import withPWA from '@ducanh2912/next-pwa'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const nextConfig = {
  staticPageGenerationTimeout: 180,
  transpilePackages: ['mui-file-input'],
  output: 'standalone', // Enable standalone output for Docker
  images: {
    domains: ['squizme-quiz.s3.ap-south-1.amazonaws.com'] // Add your S3 bucket domain here
  },
  basePath: process.env.BASEPATH,
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/en',
        permanent: true,
        locale: false
      }
    ]
  },
  // The use of '*' as an allowed origin is generally not recommended for security reasons,
  // especially in production, as it allows requests from any origin.
  // If you intend to allow all origins for development or testing, it is technically valid,
  // but you should avoid this in production environments.
  allowedDevOrigins: [
    'https://gurukulamhub.com',
    'https://gurukulamhub.org',
    'https://www.gurukulamhub.org',
    'https://localhost:3000',
    // '*' is allowed, but use with caution!
    '*'
  ],
  reactStrictMode: false,
  // Disable ESLint during builds (for Docker/production builds)
  eslint: {
    ignoreDuringBuilds: true
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    },
    // Enable instrumentation hook to run code once on server startup
    instrumentationHook: true
  },
  webpack: (config, { isServer, webpack }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'ws']
    }
    
    // Exclude instrumentation from Edge runtime compilation
    // This prevents the EvalError when Next.js tries to compile instrumentation for Edge runtime
    // Check if this is an Edge runtime build (middleware or edge routes)
    const isEdgeRuntime = config.name === 'edge-server' || 
                         config.name === 'middleware' ||
                         (config.target && config.target.includes('edge'))
    
    if (isEdgeRuntime) {
      // For Edge runtime builds, replace instrumentation with an empty stub
      // Use path.resolve to get absolute path to the stub file
      const stubPath = path.resolve(__dirname, 'src', 'instrumentation.edge-stub.js')
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /[\\/]instrumentation\.(ts|js|tsx|jsx)$/,
          stubPath
        )
      )
    }
    
    return config
  },
  // Temporarily ignore build errors to allow WebSocket routes with next-ws
  // The UPGRADE export from next-ws is not recognized by Next.js type checking
  typescript: {
    ignoreBuildErrors: true
  }
}

const pwaConfig = withPWA({
  dest: 'public',
  disable: false, // Keep PWA enabled
  register: true,
  skipWaiting: true,
  sw: 'sw.js',
  publicExcludes: ['!noprecache/**/*', '**/*.map'], // Exclude source maps from PWA
  buildExcludes: [/middleware-manifest\.json$/, /\.map$/], // Exclude .map files from build
  fallbacks: {
    document: '/offline.html'
  },
  workboxOptions: {
    disableDevLogs: false, // Enable dev logs to see PWA-related console messages
    // In development, use NetworkFirst for everything to avoid blocking
    mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
    // Import push notification handler
    importScripts: ['/push-handler.js'],
    // Override offline.html precache entry to use file content hash instead of static "development"
    // This ensures offline.html updates when file content changes
    additionalManifestEntries: (() => {
      try {
        const offlineHtmlPath = path.join(process.cwd(), 'public', 'offline.html')
        if (fs.existsSync(offlineHtmlPath)) {
          const fileContent = fs.readFileSync(offlineHtmlPath, 'utf8')
          const hash = crypto.createHash('md5').update(fileContent).digest('hex').substring(0, 8)
          return [
            {
              url: '/offline.html',
              revision: hash // Use file content hash - changes when file changes
            }
          ]
        }
      } catch (error) {
        console.warn('Failed to calculate offline.html hash:', error)
      }

      // Fallback to null (auto-calculate by workbox)
      return [
        {
          url: '/offline.html',
          revision: null
        }
      ]
    })(),
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts',
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 365 * 24 * 60 * 60 // 365 days
          }
        }
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'static-images',
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
          }
        }
      },
      {
        urlPattern: /\/_next\/static\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'next-static',
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 365 * 24 * 60 * 60 // 365 days
          }
        }
      },
      {
        urlPattern: /\/_next\/image.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'next-images',
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
          }
        }
      },
      {
        urlPattern: ({ request }) => request.destination === 'document',
        handler: 'NetworkFirst',
        options: {
          cacheName: 'pages',
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60 // 24 hours
          },
          networkTimeoutSeconds: 3
        }
      },
      {
        urlPattern: /.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'others',
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60 // 24 hours
          },
          networkTimeoutSeconds: 3
        }
      }
    ]
  }
})

export default pwaConfig(nextConfig)
