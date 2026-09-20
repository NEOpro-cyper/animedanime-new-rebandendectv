import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromToken, updateUserProfile } from '@/lib/auth'

// Get user profile
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          photo: true,
          banner: true,
          description: true,
          xp: true,
          moviesWatched: true,
          episodesWatched: true,
          commentsCount: true,
          threadsCreated: true,
          createdAt: true,
        }
      })
      return NextResponse.json({ user })
    }

    // Get current user
    const token = request.cookies.get('auth-token')?.value
    const user = await getUserFromToken(token)
    
    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Update user profile
export async function PUT(request) {
  try {
    const token = request.cookies.get('auth-token')?.value
    const user = await getUserFromToken(token)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, photo, banner, description, theme, notifyEnabled, adsEnabled } = body

    const updatedUser = await updateUserProfile(user.id, {
      ...(name && { name }),
      ...(photo !== undefined && { photo }),
      ...(banner !== undefined && { banner }),
      ...(description !== undefined && { description }),
      ...(theme && { theme }),
      ...(notifyEnabled !== undefined && { notifyEnabled }),
      ...(adsEnabled !== undefined && { adsEnabled }),
    })

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
