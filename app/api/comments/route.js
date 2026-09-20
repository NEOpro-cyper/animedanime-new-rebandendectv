import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromToken } from '@/lib/auth'

// Get comments for a movie
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const movieId = searchParams.get('movieId')

    if (!movieId) {
      return NextResponse.json({ error: 'Movie ID required' }, { status: 400 })
    }

    const comments = await prisma.comment.findMany({
      where: { movieId, isHidden: false },
      include: {
        replies: {
          where: { isHidden: false },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ comments })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Add comment
export async function POST(request) {
  try {
    const token = request.cookies.get('auth-token')?.value
    const user = await getUserFromToken(token)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { movieId, content, parentId } = body

    if (!movieId || !content) {
      return NextResponse.json({ error: 'Movie ID and content required' }, { status: 400 })
    }

    // If replying to a comment
    if (parentId) {
      const reply = await prisma.commentReply.create({
        data: {
          commentId: parentId,
          authorId: user.id,
          authorName: user.name,
          authorPhoto: user.photo,
          content,
        }
      })

      // Update reply count
      await prisma.comment.update({
        where: { id: parentId },
        data: { replyCount: { increment: 1 } }
      })

      // Update user comment count
      await prisma.user.update({
        where: { id: user.id },
        data: { commentsCount: { increment: 1 }, xp: { increment: 5 } }
      })

      return NextResponse.json({ success: true, reply })
    }

    // New comment
    const comment = await prisma.comment.create({
      data: {
        movieId,
        authorId: user.id,
        authorName: user.name,
        authorPhoto: user.photo,
        content,
      }
    })

    // Update user comment count
    await prisma.user.update({
      where: { id: user.id },
      data: { commentsCount: { increment: 1 }, xp: { increment: 10 } }
    })

    return NextResponse.json({ success: true, comment })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Like/Unlike comment
export async function PUT(request) {
  try {
    const token = request.cookies.get('auth-token')?.value
    const user = await getUserFromToken(token)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { commentId, replyId, action } = body

    if (replyId) {
      const reply = await prisma.commentReply.findUnique({ where: { id: replyId } })
      if (!reply) {
        return NextResponse.json({ error: 'Reply not found' }, { status: 404 })
      }

      const likesUsers = reply.likesUsers ? reply.likesUsers.split(',').filter(Boolean) : []
      const userIndex = likesUsers.indexOf(user.id)

      if (action === 'like' && userIndex === -1) {
        likesUsers.push(user.id)
        await prisma.commentReply.update({
          where: { id: replyId },
          data: { likes: { increment: 1 }, likesUsers: likesUsers.join(',') }
        })
      } else if (action === 'unlike' && userIndex > -1) {
        likesUsers.splice(userIndex, 1)
        await prisma.commentReply.update({
          where: { id: replyId },
          data: { likes: { decrement: 1 }, likesUsers: likesUsers.join(',') }
        })
      }

      return NextResponse.json({ success: true })
    }

    if (commentId) {
      const comment = await prisma.comment.findUnique({ where: { id: commentId } })
      if (!comment) {
        return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
      }

      const likesUsers = comment.likesUsers ? comment.likesUsers.split(',').filter(Boolean) : []
      const userIndex = likesUsers.indexOf(user.id)

      if (action === 'like' && userIndex === -1) {
        likesUsers.push(user.id)
        await prisma.comment.update({
          where: { id: commentId },
          data: { likes: { increment: 1 }, likesUsers: likesUsers.join(',') }
        })
      } else if (action === 'unlike' && userIndex > -1) {
        likesUsers.splice(userIndex, 1)
        await prisma.comment.update({
          where: { id: commentId },
          data: { likes: { decrement: 1 }, likesUsers: likesUsers.join(',') }
        })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Delete comment
export async function DELETE(request) {
  try {
    const token = request.cookies.get('auth-token')?.value
    const user = await getUserFromToken(token)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('commentId')
    const replyId = searchParams.get('replyId')

    if (replyId) {
      const reply = await prisma.commentReply.findUnique({ where: { id: replyId } })
      if (reply?.authorId !== user.id) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
      }

      await prisma.commentReply.delete({ where: { id: replyId } })
      await prisma.comment.update({
        where: { id: reply.commentId },
        data: { replyCount: { decrement: 1 } }
      })

      return NextResponse.json({ success: true })
    }

    if (commentId) {
      const comment = await prisma.comment.findUnique({ where: { id: commentId } })
      if (comment?.authorId !== user.id) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
      }

      await prisma.comment.delete({ where: { id: commentId } })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
