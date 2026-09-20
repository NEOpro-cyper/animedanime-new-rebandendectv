import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromToken } from '@/lib/auth'

// Get threads
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const threadId = searchParams.get('threadId')
    const userId = searchParams.get('userId')

    // Get single thread
    if (threadId) {
      const thread = await prisma.thread.findUnique({
        where: { id: threadId },
        include: {
          replies: {
            orderBy: { createdAt: 'asc' }
          }
        }
      })

      // Increment views
      if (thread) {
        await prisma.thread.update({
          where: { id: threadId },
          data: { views: { increment: 1 } }
        })
      }

      return NextResponse.json({ thread })
    }

    // Get user's threads
    if (userId) {
      const threads = await prisma.thread.findMany({
        where: { authorId: userId },
        orderBy: { createdAt: 'desc' }
      })
      return NextResponse.json({ threads })
    }

    // Get all threads (with optional category filter)
    const where = { isHidden: false };
    if (category) where.category = category;
    const threads = await prisma.thread.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    return NextResponse.json({ threads })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Create thread
export async function POST(request) {
  try {
    const token = request.cookies.get('auth-token')?.value
    const user = await getUserFromToken(token)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, category } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content required' }, { status: 400 })
    }

    const thread = await prisma.thread.create({
      data: {
        authorId: user.id,
        authorName: user.name,
        authorPhoto: user.photo,
        title,
        content,
        category: category || 'general'
      }
    })

    // Update user stats
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        threadsCreated: { increment: 1 },
        xp: { increment: 20 }
      }
    })

    return NextResponse.json({ success: true, thread })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Update thread (like/unlike)
export async function PUT(request) {
  try {
    const token = request.cookies.get('auth-token')?.value
    const user = await getUserFromToken(token)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { threadId, replyId, content, action } = body

    // Like/unlike thread
    if (threadId && action) {
      const thread = await prisma.thread.findUnique({ where: { id: threadId } })
      if (!thread) {
        return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
      }

      const likesUsers = thread.likesUsers ? thread.likesUsers.split(',').filter(Boolean) : []
      const userIndex = likesUsers.indexOf(user.id)

      if (action === 'like' && userIndex === -1) {
        likesUsers.push(user.id)
        await prisma.thread.update({
          where: { id: threadId },
          data: { likes: { increment: 1 }, likesUsers: likesUsers.join(',') }
        })
      } else if (action === 'unlike' && userIndex > -1) {
        likesUsers.splice(userIndex, 1)
        await prisma.thread.update({
          where: { id: threadId },
          data: { likes: { decrement: 1 }, likesUsers: likesUsers.join(',') }
        })
      }

      return NextResponse.json({ success: true })
    }

    // Like/unlike reply
    if (replyId && action) {
      const reply = await prisma.threadReply.findUnique({ where: { id: replyId } })
      if (!reply) {
        return NextResponse.json({ error: 'Reply not found' }, { status: 404 })
      }

      const likesUsers = reply.likesUsers ? reply.likesUsers.split(',').filter(Boolean) : []
      const userIndex = likesUsers.indexOf(user.id)

      if (action === 'like' && userIndex === -1) {
        likesUsers.push(user.id)
        await prisma.threadReply.update({
          where: { id: replyId },
          data: { likes: { increment: 1 }, likesUsers: likesUsers.join(',') }
        })
      } else if (action === 'unlike' && userIndex > -1) {
        likesUsers.splice(userIndex, 1)
        await prisma.threadReply.update({
          where: { id: replyId },
          data: { likes: { decrement: 1 }, likesUsers: likesUsers.join(',') }
        })
      }

      return NextResponse.json({ success: true })
    }

    // Add reply
    if (threadId && content) {
      const reply = await prisma.threadReply.create({
        data: {
          threadId,
          authorId: user.id,
          authorName: user.name,
          authorPhoto: user.photo,
          content
        }
      })

      // Update reply count
      await prisma.thread.update({
        where: { id: threadId },
        data: { replyCount: { increment: 1 } }
      })

      // Update user XP
      await prisma.user.update({
        where: { id: user.id },
        data: { xp: { increment: 5 } }
      })

      return NextResponse.json({ success: true, reply })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Delete thread
export async function DELETE(request) {
  try {
    const token = request.cookies.get('auth-token')?.value
    const user = await getUserFromToken(token)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const threadId = searchParams.get('threadId')
    const replyId = searchParams.get('replyId')

    if (replyId) {
      const reply = await prisma.threadReply.findUnique({ where: { id: replyId } })
      if (reply?.authorId !== user.id) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
      }

      await prisma.threadReply.delete({ where: { id: replyId } })
      await prisma.thread.update({
        where: { id: reply.threadId },
        data: { replyCount: { decrement: 1 } }
      })

      return NextResponse.json({ success: true })
    }

    if (threadId) {
      const thread = await prisma.thread.findUnique({ where: { id: threadId } })
      if (thread?.authorId !== user.id) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
      }

      await prisma.thread.delete({ where: { id: threadId } })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
