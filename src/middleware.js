// Next Imports
import { NextResponse } from 'next/server'

// Third-party Imports
import Negotiator from 'negotiator'
import { match as matchLocale } from '@formatjs/intl-localematcher'

// Config Imports
import { i18n } from '@configs/i18n'

// Util Imports
import { getLocalizedUrl, isUrlMissingLocale } from '@/utils/i18n'
import { ensurePrefix, withoutSuffix } from '@/utils/string'
// Note: Auth removed from middleware to avoid Edge runtime eval() errors
// Authentication is now handled in route layouts and API route handlers

// const { auth } = NextAuth(authConfig)

// Constants
const HOME_PAGE_URL = '/home' // dashboards/myprogress

// the list of all allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://ec2-13-51-204-221.eu-north-1.compute.amazonaws.com:3000',
  'https://gurukulamhub-production.up.railway.app',
  'https://gurukulamhub.com'
]

export const getLocale = request => {
  // Try to get locale from URL
  const urlLocale = i18n.locales.find(locale => request.nextUrl.pathname.startsWith(`/${locale}`))

  if (urlLocale) return urlLocale

  // Negotiator expects plain object so we need to transform headers
  const negotiatorHeaders = {}

  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))

  // @ts-ignore locales are readonly
  const locales = i18n.locales

  // Use negotiator and intl-localematcher to get best locale
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages(locales)
  const locale = matchLocale(languages, locales, i18n.defaultLocale)

  return locale
}

const localizedRedirect = (url, locale, request) => {
  // console.log({ request, url })
  let _url = url
  const isLocaleMissing = isUrlMissingLocale(_url)

  if (isLocaleMissing) {
    _url = getLocalizedUrl(_url, locale ?? i18n.defaultLocale)
  }

  let _basePath = process.env.BASEPATH ?? ''

  _basePath = _basePath.replace('demo-1', request.headers.get('X-server-header') ?? 'demo-1')
  _url = ensurePrefix(_url, `${_basePath ?? ''}`)

  if (!_url.startsWith('http')) {
    _url = new URL(_url, request.url).toString()
  }

  // Preserve search params from the original request
  const originalUrl = new URL(request.url)
  const searchParams = originalUrl.searchParams.toString()

  const redirectUrl = new URL(_url) // originalUrl.origin
  // Append the search params if they exist
  if (searchParams) {
    redirectUrl.search = searchParams
  }

  //console.log({ _url, _basePath, requestUrl: request.url });
  //console.log({ redirectUrl: redirectUrl.toString() });

  return NextResponse.redirect(redirectUrl.toString())
}

export default async function middleware(request) {
  // export default auth(async request => {
  // Get locale from request headers
  const locale = getLocale(request)
  const pathname = request.nextUrl.pathname

  // Skip middleware for static files and PWA files - they should be served directly
  if (
    pathname.startsWith('/api/ws') ||
    pathname === '/manifest.json' ||
    pathname === '/sw.js' ||
    pathname === '/offline.html' ||
    pathname.startsWith('/icons/') ||
    pathname.startsWith('/workbox-') ||
    pathname.startsWith('/fallback-') ||
    pathname.startsWith('/_next/static/') ||
    pathname.startsWith('/_next/image/') ||
    pathname.startsWith('/_next/webpack-hmr') ||
    pathname.startsWith('/_next/webpack') ||
    pathname.startsWith('/_next/data/') ||
    pathname.startsWith('/api/') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js|woff|woff2|ttf|eot|map|json)$/)
  ) {
    return NextResponse.next()
  }

  // Middleware now only handles locale routing
  // Authentication is handled in route layouts (Node.js runtime)

  // If pathname already contains a locale, return next() else redirect with localized URL
  return isUrlMissingLocale(pathname) ? localizedRedirect(pathname, locale, request) : NextResponse.next()
  // })
}

// Middleware function with role-based access control
// export default async function middleware(request) {
//   const locale = getLocale(request)
//   const pathname = request.nextUrl.pathname
//   const session = await auth()

//   console.log('Session in middleware: ', session)

//   // Guest routes (Accessible by users who are not logged in)
//   const guestRoutes = [
//     'welcome', '-game', 'auth/login', 'auth/register', 'forgot-password', 'reset-password', 'termsofservice', 'privacypolicy'
//   ]

//   // Shared routes (Accessible by both guest and logged-in users)
//   const sharedRoutes = ['shared-route']

//   // Determine if the current route is private (requires authentication)
//   const privateRoute = ![...guestRoutes, ...sharedRoutes].some(route => pathname.endsWith(route))

//   // If the user is not logged in and is trying to access a private route, redirect to the login page
//   if (!session?.user && privateRoute) {
//     let redirectUrl = '/welcome'
//     return localizedRedirect(redirectUrl, locale, request)
//   }

//   // Define role-based route access
//   const userRoles = session?.user?.roles ?? [] // Assume roles is an array of uppercase strings

//   // Check if the user has access to the current route based on their role
//   const hasAccess = (allowedRoutes) => {
//     return allowedRoutes.some(route => pathname.startsWith(route))
//   }

//   // Admin route access
//   if (userRoles.includes('ADMIN') && hasAccess(ADMIN_ROUTES)) {
//     return NextResponse.next() // Admin has access, allow request
//   }

//   // User route access
//   if (userRoles.includes('USER') && hasAccess(USER_ROUTES)) {
//     return NextResponse.next() // Regular user has access, allow request
//   }

//   // If the user is logged in but doesn't have access to the route, redirect based on their role
//   if (session?.user) {
//     if (userRoles.includes('ADMIN')) {
//       return localizedRedirect(HOME_PAGE_URL, locale, request) // Redirect to admin dashboard
//     } else if (userRoles.includes('USER')) {
//       return localizedRedirect(HOME_PAGE_URL, locale, request) // Redirect to user home page
//     }
//   }

//   // If the user is trying to access a guest route and is logged in, redirect them to their appropriate home
//   const isRequestedRouteGuestRoute = guestRoutes.some(route => pathname.endsWith(route))
//   if (session?.user && isRequestedRouteGuestRoute) {
//     if (userRoles.includes('ADMIN')) {
//       return localizedRedirect(HOME_PAGE_URL, locale, request)
//     }
//     return localizedRedirect(HOME_PAGE_URL, locale, request)
//   }

//   // If the pathname already contains a locale, proceed to the next middleware/handler
//   return isUrlMissingLocale(pathname) ? localizedRedirect(pathname, locale, request) : NextResponse.next()
// }

// Matcher Config
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - all items inside the public folder
     *    - images (public images)
     *    - sounds (public audio files)
     *    - animations (public animations)
     *    - next.svg (Next.js logo)
     *    - vercel.svg (Vercel logo)
     *    - manifest.json (PWA manifest)
     *    - sw.js (service worker)
     *    - offline.html (offline fallback)
     *    - icons (PWA icons)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.+?/hook-examples|.+?/menu-examples|images|sounds|animations|next.svg|vercel.svg|sample_music.mp3|manifest.json|sw.js|offline|offline.html|icons|workbox-|fallback-).*)'
  ],
  // No need for unstable_allowDynamic since we removed auth() from middleware
}
