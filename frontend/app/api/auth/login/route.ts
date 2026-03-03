import { NextResponse } from 'next/server'

// HARDCODED CREDENTIALS (for MVP phase)
const VALID_EMAIL = 'admin@bis.com'
const VALID_PASSWORD = 'password123'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email, password } = body

        if (email === VALID_EMAIL && password === VALID_PASSWORD) {
            // Create response indicating success
            const response = NextResponse.json({ success: true })

            // Set the session cookie. In a real app, this would be a secure JWT.
            const oneMonth = 30 * 24 * 60 * 60 * 1000
            response.cookies.set('bis_session', 'authenticated_user', {
                httpOnly: true, // Prevents JavaScript from reading the cookie
                secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
                sameSite: 'lax',
                path: '/',
                maxAge: 30 * 24 * 60 * 60, // 30 days
            })

            return response
        }

        return NextResponse.json(
            { success: false, message: 'Invalid email or password' },
            { status: 401 }
        )
    } catch {
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        )
    }
}
