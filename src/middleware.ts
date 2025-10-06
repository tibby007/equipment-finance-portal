import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { session },
    error: sessionError
  } = await supabase.auth.getSession()

  if (sessionError) {
    console.error('Middleware: Error getting session:', sessionError)
  }

  console.log('Middleware: Session check', {
    path: req.nextUrl.pathname,
    hasSession: !!session,
    userId: session?.user?.id
  })

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/signup', '/contact', '/privacy', '/terms', '/auth/callback']
  const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith('/api/'))

  // Allow public routes
  if (isPublicRoute) {
    return res
  }

  // Redirect to login if not authenticated
  if (!session) {
    console.log('Middleware: No session, redirecting to login')
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Payment gates removed - all authenticated users can access the platform
  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
