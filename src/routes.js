export const privateRoutes = [
  '/dashboard',
  '/priv'
]

export const authRoutes = [
  '/login',
  '/api/auth/signin',
  '/api/auth/signout'
]

export const USER_ROUTES = ['/home', '/publicquiz', '/game', '/myquizzes', '/mygames', '/myutilities', '/dashboards', '/pages']
export const ADMIN_ROUTES = ['/home', '/publicquiz', '/game', '/myquizzes', '/mygames', '/myutilities', '/dashboards', '/pages', '/apps']


// When user is not logged in and tries to access protected routes redirect to login page
export const DEFAULT_REDIRECT_LOGIN_URL = '/login'

// When user is logged in and tries to access login page redirect to dashboard
export const DEFAULT_REDIRECT_HOME_URL = '/dashboard'
