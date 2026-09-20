import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromToken } from '@/lib/auth'

// Get watch progress for user
export async function GET(request) {
  try {
    const token = request.cookies.get('auth-token')?.value
    const user = await getUserFromToken(token)
    
    if (!user) {
      return NextResponse.json({ progress: [] })
    }

    const progress = await prisma.watchProgress.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      take: 50
    })

    return NextResponse.json({ progress })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Save/update watch progress
export async function POST(request) {
  try {
    const token = request.cookies.get('auth-token')?.value
    const user = await getUserFromToken(token)
    
    if (!user) {
      return NextResponse.json({ success: false })
    }

    const body = await request.json()
    const { movieId, movieTitle, moviePoster, movieType, season, episode, progress, duration } = body

    if (!movieId || !movieTitle) {
      return NextResponse.json({ error: 'Movie ID and title required' }, { status: 400 })
    }

    await prisma.watchProgress.upsert({
      where: {
        userId_movieId: {
          userId: user.id,
          movieId
        }
      },
      create: {
        userId: user.id,
        movieId,
        movieTitle,
        moviePoster,
        movieType,
        season,
        episode,
        progress,
        duration
      },
      update: {
        movieTitle,
        moviePoster,
        movieType,
        season,
        episode,
        progress,
        duration,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Delete watch progress
export async function DELETE(request) {
  try {
    const token = request.cookies.get('auth-token')?.value
    const user = await getUserFromToken(token)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const movieId = searchParams.get('movieId')
    const clearAll = searchParams.get('clearAll')

    if (clearAll === 'true') {
      await prisma.watchProgress.deleteMany({ where: { userId: user.id } })
      return NextResponse.json({ success: true })
    }

    if (movieId) {
      await prisma.watchProgress.deleteMany({
        where: { userId: user.id, movieId }
      })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
