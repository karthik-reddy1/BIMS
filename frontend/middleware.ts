import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that don't require authentication
const publicRoutes = ['/login', '/api/auth/login']

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Allow public routes and static assets
    if (
        publicRoutes.includes(pathname) ||
        pathname.startsWith('/_next') ||
        pathname.includes('favicon.ico') ||
        pathname.includes('.png') ||
        pathname.includes('.svg')
    ) {
        return NextResponse.next()
    }

    // Check for the persistent session cookie
    const sessionToken = request.cookies.get('bis_session')?.value

    if (!sessionToken) {
        // Force redirect to login if no cookie is found
        const loginUrl = new URL('/login', request.url)
        return NextResponse.redirect(loginUrl)
    }

    // Otherwise, user is authenticated, proceed normally
    return NextResponse.next()
}

// Apply middleware to all routes except api/auth ones to prevent redirect loops on auth API calls
export const config = {
    matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
}
