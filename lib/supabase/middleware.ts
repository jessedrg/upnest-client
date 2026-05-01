import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that require authentication
const PROTECTED_ROUTES = ['/overview', '/roles', '/candidates', '/recruiters', '/stats', '/billing', '/submit']
// Routes that are public
const PUBLIC_ROUTES = ['/login', '/signup', '/auth']

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  
  const pathname = request.nextUrl.pathname
  
  // Check if route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )
  
  // If trying to access protected route without being logged in
  if (isProtectedRoute && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // If logged in and trying to access protected route, verify organization status
  if (isProtectedRoute && user) {
    // Check if user belongs to an approved client organization
    const { data: clientUser } = await supabase
      .from('client_users')
      .select(`
        organization:client_organizations(id, name, status)
      `)
      .eq('user_id', user.id)
      .single()
    
    if (clientUser?.organization) {
      const org = clientUser.organization as { id: string; name: string; status: string }
      
      // If organization is not approved, redirect to login with pending state
      if (org.status !== 'approved') {
        // Sign out the user
        await supabase.auth.signOut()
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('pending', org.name)
        loginUrl.searchParams.set('status', org.status)
        return NextResponse.redirect(loginUrl)
      }
    }
  }
  
  // If logged in and accessing login page, redirect to overview
  if (isPublicRoute && user && pathname === '/login') {
    // But first check if they're approved
    const { data: clientUser } = await supabase
      .from('client_users')
      .select(`
        organization:client_organizations(id, name, status)
      `)
      .eq('user_id', user.id)
      .single()
    
    if (clientUser?.organization) {
      const org = clientUser.organization as { id: string; name: string; status: string }
      if (org.status === 'approved') {
        return NextResponse.redirect(new URL('/overview', request.url))
      }
    }
  }

  return supabaseResponse
}
