import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Get leaderboard
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        photo: true,
        xp: true,
        moviesWatched: true,
        episodesWatched: true,
        commentsCount: true,
        threadsCreated: true,
      },
      orderBy: { xp: 'desc' },
      take: 100
    })

    const leaderboard = users.map((user, index) => ({
      ...user,
      rank: index + 1,
      level: Math.floor(user.xp / 100) + 1
    }))

    return NextResponse.json({ leaderboard })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
