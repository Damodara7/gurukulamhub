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
// import NextAuth from 'next-auth'
// import { authConfig } from './libs/authConfig'
import { auth } from './libs/auth'
import { ADMIN_ROUTES, USER_ROUTES } from './routes'

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

  // Debug logging for root path
  if (pathname === '/' || pathname === `/${locale}`) {
    console.log(`[Middleware] Processing root path: ${pathname}, locale: ${locale}`)
  }

  // console.log('pathname:', pathname)
  // retrieve the current response
  //const res = NextResponse.next()
  // if the origin is an allowed one,
  // add it to the 'Access-Control-Allow-Origin' header
  //if (allowedOrigins.includes(origin)) {
  // res.headers.append('Access-Control-Allow-Origin', origin);
  // }

  // Wrap auth() in try-catch with timeout to prevent blocking
  let session = null
  try {
    // Add timeout to prevent hanging - reduced to 1 second for faster response
    // This ensures the page loads quickly even if auth is slow
    const authPromise = auth()
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Auth timeout')), 1000))
    session = await Promise.race([authPromise, timeoutPromise])
  } catch (error) {
    // Silently continue without session if auth fails or times out
    // This prevents blocking the page load
    // Log only in development for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Middleware] Auth check skipped: ${error.message}`)
    }
    session = null
  }

  const searchParams = request.nextUrl.searchParams
  const redirectTo = searchParams.get('redirectTo')
  //console.log('Session in Middleware:', session)

  // If the user is logged in, `token` will be an object containing the user's details
  // const token = request.auth

  // Check if the user is logged in
  // const isUserLoggedIn = !!token

  // Guest routes (Routes that can be accessed by guest users who are not logged in)
  const guestRoutes = [
    'welcome',
    'join-game',
    'auth/login',
    'auth/register',
    'event-registration',
    'forgot-password',
    'reset-password',
    'termsofservice',
    'privacypolicy'
  ]

  // Shared routes (Routes that can be accessed by both guest and logged in users)
  const sharedRoutes = ['shared-route']

  // Private routes (All routes except guest and shared routes that can only be accessed by logged in users)
  const privateRoute = ![...guestRoutes, ...sharedRoutes].some(route => pathname.endsWith(route))

  // If the user is not logged in and is trying to access a private route, redirect to the login page
  // if (!isUserLoggedIn && privateRoute) {
  // if (!session?.user && privateRoute) {
  //   let redirectUrl = '/login'
  //   return NextResponse.redirect(redirectUrl)
  // }
  let isApiAuthRoute = pathname.startsWith('/api/auth')
  if (isApiAuthRoute) {
    // console.log('API Auth ROUTE')
    return NextResponse.next()
  }

  // Handle redirect after login
  if (session?.user && redirectTo) {
    console.log('redirect to ', redirectTo)

    // Create a new URL object to manipulate the search params
    const requestUrl = new URL(request.url)
    const searchParams = new URLSearchParams(requestUrl.search)

    // Remove the redirectTo parameter
    searchParams.delete('redirectTo')

    // Update the request URL without the redirectTo parameter
    requestUrl.search = searchParams.toString()
    const cleanedRequest = new Request(requestUrl.toString(), request)

    console.log('total data', localizedRedirect(redirectTo, locale, cleanedRequest))
    return localizedRedirect(redirectTo, locale, cleanedRequest)
  }

  // Check if the requested route is a guest route (accessible without login)
  const isRequestedRouteIsGuestRoute = guestRoutes.some(route => pathname.endsWith(route))
  const isRequestedRouteIsSharedRoute = sharedRoutes.some(route => pathname.endsWith(route))

  // If user is not logged in
  if (!session?.user) {
    // If trying to access a guest or shared route, allow it
    if (isRequestedRouteIsGuestRoute || isRequestedRouteIsSharedRoute) {
      // If pathname already contains a locale, return next() else redirect with localized URL
      if (isUrlMissingLocale(pathname)) {
        const redirectUrl = getLocalizedUrl(pathname, locale)
        console.log(`[Middleware] Adding locale: ${pathname} -> ${redirectUrl}`)
        return localizedRedirect(pathname, locale, request)
      }
      console.log(`[Middleware] Allowing guest/shared route: ${pathname}`)
      return NextResponse.next()
    }

    // If trying to access root or private route, redirect to welcome
    if (pathname === '/' || pathname === `/${locale}` || privateRoute) {
      let redirectUrl = '/welcome'
      console.log(`[Middleware] Not logged in, redirecting to: ${redirectUrl}`)
      return localizedRedirect(redirectUrl, locale, request)
    }
  }

  // If the user is logged in and is trying to access a guest route, redirect to home
  if (session?.user && isRequestedRouteIsGuestRoute) {
    // Check for corner cases, e.g., based on user roles or certain flags
    if (session?.user.role === 'admin') {
      const adminDashboardUrl = '/admin/dashboard'
      return localizedRedirect(adminDashboardUrl, locale, request) // Admin-specific redirect
    }
    console.log(`[Middleware] Logged in user accessing guest route, redirecting to: ${HOME_PAGE_URL}`)
    return localizedRedirect(HOME_PAGE_URL, locale, request)
  }

  // If the user is logged in and is trying to access root page, redirect to the home page
  if (session?.user && (pathname === '/' || pathname === `/${locale}`)) {
    console.log(`[Middleware] Root path detected, redirecting to ${HOME_PAGE_URL}`)
    return localizedRedirect(HOME_PAGE_URL, locale, request)
  }

  // If pathname already contains a locale, return next() else redirect with localized URL
  if (isUrlMissingLocale(pathname)) {
    const redirectUrl = getLocalizedUrl(pathname, locale)
    console.log(`[Middleware] Adding locale: ${pathname} -> ${redirectUrl}`)
    return localizedRedirect(pathname, locale, request)
  }

  // Allow the request to proceed
  console.log(`[Middleware] Allowing request: ${pathname}`)
  return NextResponse.next()
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
     *    - next.svg (Next.js logo)
     *    - vercel.svg (Vercel logo)
     *    - manifest.json (PWA manifest)
     *    - sw.js (service worker)
     *    - offline.html (offline fallback)
     *    - icons (PWA icons)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.+?/hook-examples|.+?/menu-examples|images|next.svg|vercel.svg|manifest.json|sw.js|offline.html|icons|workbox-|fallback-).*)'
  ]
}
