import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'yourhentaitv-secret-key'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@yourhentaitv.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'YourHentaiTV@Admin2024'

// Generate JWT token
export function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// Hash password
export async function hashPassword(password) {
  return bcrypt.hash(password, 10)
}

// Compare password
export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash)
}

// Register user
export async function registerUser(email, password, name) {
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    throw new Error('Email already registered')
  }

  const hashedPassword = await hashPassword(password)
  const isAdmin = email === ADMIN_EMAIL
  
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      isAdmin,
    }
  })

  const token = generateToken(user.id)
  return { user, token }
}

// Login user
export async function loginUser(email, password) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw new Error('Invalid email or password')
  }

  // Check if banned
  if (user.isBanned) {
    throw new Error(`Account suspended: ${user.banReason || 'Violation of terms'}`)
  }

  const isValid = await comparePassword(password, user.password)
  if (!isValid) {
    throw new Error('Invalid email or password')
  }

  const token = generateToken(user.id)
  return { user, token }
}

// Get user from token
export function getUserFromToken(token) {
  const decoded = verifyToken(token)
  if (!decoded) return null

  return prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      email: true,
      name: true,
      photo: true,
      banner: true,
      description: true,
      xp: true,
      moviesWatched: true,
      episodesWatched: true,
      commentsCount: true,
      threadsCreated: true,
      theme: true,
      notifyEnabled: true,
      adsEnabled: true,
      isAdmin: true,
      isBanned: true,
      createdAt: true,
    }
  })
}

// Update user profile
export function updateUserProfile(userId, data) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      photo: true,
      banner: true,
      description: true,
      xp: true,
      moviesWatched: true,
      episodesWatched: true,
      commentsCount: true,
      threadsCreated: true,
      theme: true,
      notifyEnabled: true,
      adsEnabled: true,
      isAdmin: true,
    }
  })
}

// ─── Admin helpers ───

// Check if user is admin
export async function isUserAdmin(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true }
  })
  return user?.isAdmin || false
}

// Ensure admin seed user exists
export async function ensureAdminUser() {
  const existingAdmin = await prisma.user.findFirst({ where: { isAdmin: true } })
  if (existingAdmin) return existingAdmin

  // Create admin user
  const hashedPassword = await hashPassword(ADMIN_PASSWORD)
  return prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      password: hashedPassword,
      name: 'Admin',
      isAdmin: true,
    }
  })
}
