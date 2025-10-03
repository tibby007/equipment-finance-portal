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
  } = await supabase.auth.getSession()

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/signup', '/contact', '/privacy', '/terms', '/auth/callback']
  const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith('/api/'))

  // Allow public routes
  if (isPublicRoute) {
    return res
  }

  // Redirect to login if not authenticated
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Check payment status for protected routes
  const protectedRoutes = ['/dashboard', '/deals', '/application', '/settings', '/vendors']
  const isProtectedRoute = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route))

  if (isProtectedRoute && session) {
    // Fetch broker info to check payment status and admin flag
    const { data: broker } = await supabase
      .from('brokers')
      .select('payment_status, is_admin')
      .eq('id', session.user.id)
      .single()

    // Allow admin users to bypass payment
    if (broker?.is_admin) {
      return res
    }

    // Check if payment is required
    if (!broker?.payment_status || broker.payment_status === 'pending') {
      return NextResponse.redirect(new URL('/payment-required', req.url))
    }

    if (broker.payment_status === 'past_due' || broker.payment_status === 'cancelled') {
      return NextResponse.redirect(new URL('/payment-required', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
