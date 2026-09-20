import { NextResponse } from 'next/server'
import { registerUser, loginUser, getUserFromToken } from '@/lib/auth'

// Register
export async function POST(request) {
  try {
    const body = await request.json()
    const { action, email, password, name } = body

    if (action === 'register') {
      if (!email || !password || !name) {
        return NextResponse.json(
          { error: 'Email, password, and name are required' },
          { status: 400 }
        )
      }

      const { user, token } = await registerUser(email, password, name)
      
      const response = NextResponse.json({ 
        success: true, 
        user: { ...user, password: undefined },
        token 
      })
      
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })
      
      return response
    }

    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json(
          { error: 'Email and password are required' },
          { status: 400 }
        )
      }

      const { user, token } = await loginUser(email, password)
      
      const response = NextResponse.json({ 
        success: true, 
        user: { ...user, password: undefined },
        token 
      })
      
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })
      
      return response
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 400 }
    )
  }
}

// Get current user
export async function GET(request) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ user: null })
    }

    const user = await getUserFromToken(token)
    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ user: null })
  }
}

// Logout
export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('auth-token')
  return response
}
