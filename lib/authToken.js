// Token-only auth helpers (no Prisma import).
// Middleware runs in the Edge runtime and must not drag the Prisma
// client along — importing it there poisons Turbopack's module graph
// and breaks the Node-runtime Prisma client. Keep this module lean.

import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'yourhentaitv-secret-key'

// Verify a JWT and return its payload (or null)
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}
