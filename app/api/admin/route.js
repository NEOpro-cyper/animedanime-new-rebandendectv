import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromToken } from '@/lib/auth'

// ─── Helper: Verify admin ───
async function verifyAdmin(request) {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return null

  const user = await getUserFromToken(token)
  if (!user || !user.isAdmin) return null

  return user
}

// ─── GET: Fetch admin data ───
export async function GET(request) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    // Dashboard stats
    if (action === 'stats') {
      const [userCount, threadCount, commentCount, watchlistCount] = await Promise.all([
        prisma.user.count(),
        prisma.thread.count(),
        prisma.comment.count(),
        prisma.watchlist.count(),
      ])

      return NextResponse.json({
        userCount,
        threadCount,
        commentCount,
        watchlistCount,
      })
    }

    // All users
    if (action === 'users') {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          photo: true,
          isAdmin: true,
          isBanned: true,
          banReason: true,
          createdAt: true,
          _count: {
            select: {
              watchlist: true,
              threads: true,
              comments: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json({ users })
    }

    // User's watchlist
    if (action === 'watchlist') {
      const userId = searchParams.get('userId')
      if (!userId) {
        return NextResponse.json({ error: 'userId is required' }, { status: 400 })
      }

      const watchlist = await prisma.watchlist.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json({ watchlist })
    }

    // All threads with author info and admin replies
    if (action === 'threads') {
      const threads = await prisma.thread.findMany({
        include: {
          author: {
            select: { id: true, name: true, photo: true, email: true }
          },
          adminReplies: {
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              adminId: true,
              adminName: true,
              content: true,
              createdAt: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json({ threads })
    }

    // All comments with author info
    if (action === 'comments') {
      const comments = await prisma.comment.findMany({
        include: {
          author: {
            select: { id: true, name: true, photo: true, email: true }
          },
          adminReplies: {
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              adminId: true,
              adminName: true,
              content: true,
              createdAt: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json({ comments })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Admin GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ─── PUT: Admin actions (ban/unban, hide/unhide, pin) ───
export async function PUT(request) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 })
    }

    const body = await request.json()
    const { action } = body

    // Ban user
    if (action === 'ban') {
      const { userId, reason } = body
      if (!userId) {
        return NextResponse.json({ error: 'userId is required' }, { status: 400 })
      }

      // Prevent banning admins
      const targetUser = await prisma.user.findUnique({ where: { id: userId } })
      if (!targetUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      if (targetUser.isAdmin) {
        return NextResponse.json({ error: 'Cannot ban an admin user' }, { status: 403 })
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          isBanned: true,
          banReason: reason || 'Violation of terms of service',
        }
      })

      return NextResponse.json({ success: true, message: 'User banned successfully' })
    }

    // Unban user
    if (action === 'unban') {
      const { userId } = body
      if (!userId) {
        return NextResponse.json({ error: 'userId is required' }, { status: 400 })
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          isBanned: false,
          banReason: null,
        }
      })

      return NextResponse.json({ success: true, message: 'User unbanned successfully' })
    }

    // Hide thread
    if (action === 'hideThread') {
      const { threadId } = body
      if (!threadId) {
        return NextResponse.json({ error: 'threadId is required' }, { status: 400 })
      }

      await prisma.thread.update({
        where: { id: threadId },
        data: { isHidden: true }
      })

      return NextResponse.json({ success: true, message: 'Thread hidden' })
    }

    // Unhide thread
    if (action === 'unhideThread') {
      const { threadId } = body
      if (!threadId) {
        return NextResponse.json({ error: 'threadId is required' }, { status: 400 })
      }

      await prisma.thread.update({
        where: { id: threadId },
        data: { isHidden: false }
      })

      return NextResponse.json({ success: true, message: 'Thread unhidden' })
    }

    // Pin thread
    if (action === 'pinThread') {
      const { threadId } = body
      if (!threadId) {
        return NextResponse.json({ error: 'threadId is required' }, { status: 400 })
      }

      const thread = await prisma.thread.findUnique({ where: { id: threadId } })
      if (!thread) {
        return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
      }

      await prisma.thread.update({
        where: { id: threadId },
        data: { pinned: !thread.pinned }
      })

      return NextResponse.json({ success: true, message: thread.pinned ? 'Thread unpinned' : 'Thread pinned' })
    }

    // Hide comment
    if (action === 'hideComment') {
      const { commentId } = body
      if (!commentId) {
        return NextResponse.json({ error: 'commentId is required' }, { status: 400 })
      }

      await prisma.comment.update({
        where: { id: commentId },
        data: { isHidden: true }
      })

      return NextResponse.json({ success: true, message: 'Comment hidden' })
    }

    // Unhide comment
    if (action === 'unhideComment') {
      const { commentId } = body
      if (!commentId) {
        return NextResponse.json({ error: 'commentId is required' }, { status: 400 })
      }

      await prisma.comment.update({
        where: { id: commentId },
        data: { isHidden: false }
      })

      return NextResponse.json({ success: true, message: 'Comment unhidden' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Admin PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ─── POST: Admin reply ───
export async function POST(request) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 })
    }

    const body = await request.json()
    const { action, targetId, targetType, content } = body

    if (action === 'reply') {
      if (!targetId || !targetType || !content) {
        return NextResponse.json(
          { error: 'targetId, targetType, and content are required' },
          { status: 400 }
        )
      }

      if (!['thread', 'comment'].includes(targetType)) {
        return NextResponse.json({ error: 'targetType must be "thread" or "comment"' }, { status: 400 })
      }

      const replyData = {
        adminId: admin.id,
        adminName: admin.name,
        content,
        targetType,
      }

      // Verify target exists and set the right field
      if (targetType === 'thread') {
        const thread = await prisma.thread.findUnique({ where: { id: targetId } })
        if (!thread) {
          return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
        }
        replyData.threadId = targetId
      } else {
        const comment = await prisma.comment.findUnique({ where: { id: targetId } })
        if (!comment) {
          return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
        }
        replyData.commentId = targetId
      }

      const reply = await prisma.adminReply.create({
        data: replyData
      })

      return NextResponse.json({ success: true, reply })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Admin POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
