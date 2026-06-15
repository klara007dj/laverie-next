import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const SECRET = process.env.JWT_SECRET || 'fallback_secret'

export const hashPassword = (p: string) => bcrypt.hash(p, 12)
export const verifyPassword = (p: string, h: string) => bcrypt.compare(p, h)
export const signToken = (payload: object) => jwt.sign(payload, SECRET, { expiresIn: '7d' })
export const verifyToken = (t: string) =>
  jwt.verify(t, SECRET) as { userId: number; role: string; email: string }
