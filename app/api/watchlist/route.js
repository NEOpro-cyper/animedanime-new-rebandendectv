import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromToken } from '@/lib/auth'

// Get user's watchlist
export async function GET(request) {
  try {
    const token = request.cookies.get('auth-token')?.value
    const user = await getUserFromToken(token)
    
    if (!user) {
      return NextResponse.json({ watchlist: [] })
    }

    const watchlist = await prisma.watchlist.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ watchlist })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Add to watchlist
export async function POST(request) {
  try {
    const token = request.cookies.get('auth-token')?.value
    const user = await getUserFromToken(token)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { movieId, movieTitle, moviePoster, movieType } = body

    if (!movieId || !movieTitle) {
      return NextResponse.json({ error: 'Movie ID and title required' }, { status: 400 })
    }

    // Check if already in watchlist
    const existing = await prisma.watchlist.findUnique({
      where: {
        userId_movieId: {
          userId: user.id,
          movieId
        }
      }
    })

    if (existing) {
      return NextResponse.json({ success: true, message: 'Already in watchlist' })
    }

    await prisma.watchlist.create({
      data: {
        userId: user.id,
        movieId,
        movieTitle,
        moviePoster,
        movieType
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Remove from watchlist
export async function DELETE(request) {
  try {
    const token = request.cookies.get('auth-token')?.value
    const user = await getUserFromToken(token)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const movieId = searchParams.get('movieId')

    if (!movieId) {
      return NextResponse.json({ error: 'Movie ID required' }, { status: 400 })
    }

    await prisma.watchlist.deleteMany({
      where: { userId: user.id, movieId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
