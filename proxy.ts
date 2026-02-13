import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth.config'
import { isRouteAllowed } from '@/lib/auth/route-permissions'

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const userRole = req.auth?.user?.role as string

  // Define public routes
  const isPublicRoute = nextUrl.pathname === '/login' || nextUrl.pathname === '/api/auth' || nextUrl.pathname.startsWith('/api/auth/')
  const isDashboardRoute = nextUrl.pathname.startsWith('/dashboard') || 
                           nextUrl.pathname.startsWith('/employees') || 
                           nextUrl.pathname.startsWith('/projects') || 
                           nextUrl.pathname.startsWith('/clients') || 
                           nextUrl.pathname.startsWith('/time-tracking') || 
                           nextUrl.pathname.startsWith('/finance') || 
                           nextUrl.pathname.startsWith('/meetings') || 
                           nextUrl.pathname.startsWith('/interviews') || 
                           nextUrl.pathname.startsWith('/profile') ||
                           nextUrl.pathname.startsWith('/settings')

  // 1. If not logged in and trying to access a dashboard route, redirect to login
  if (!isLoggedIn && isDashboardRoute) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  // 2. If logged in and trying to access login page, redirect to dashboard
  if (isLoggedIn && nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  // 3. If logged in and on a dashboard route, check role permissions
  if (isLoggedIn && isDashboardRoute) {
    if (!isRouteAllowed(nextUrl.pathname, userRole)) {
      // Redirect to dashboard if trying to access unauthorized route
      return NextResponse.redirect(new URL('/dashboard', nextUrl))
    }
  }

  return NextResponse.next()
})

// Optionally, don't run middleware on some paths
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
