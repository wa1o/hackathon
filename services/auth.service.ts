// services/auth.service.ts
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { hash, compare } from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Role } from '@prisma/client'

const authCookieName = 'auth_token'

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET no está configurado')
  return secret
}

export class AuthService {
  static async register(data: {
    email: string
    password: string
    name: string
    role: Role
  }) {
    const hashedPassword = await hash(data.password, 10)
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: hashedPassword,
        name: data.name,
        role: data.role
      }
    })

    return user
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        managedCenter: true,
        centers: true
      }
    })

    if (!user || !(await compare(password, user.passwordHash))) {
      throw new Error('Credenciales inválidas')
    }

    const token = jwt.sign({ sub: user.id }, getJwtSecret(), { expiresIn: '7d' })
    const cookieStore = await cookies()
    cookieStore.set(authCookieName, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    })

    return { user, session: null }
  }

  static async logout() {
    const cookieStore = await cookies()
    cookieStore.delete(authCookieName)
  }

  static async getSession() {
    const token = (await cookies()).get(authCookieName)?.value
    if (!token) return null

    try {
      return jwt.verify(token, getJwtSecret()) as jwt.JwtPayload
    } catch {
      return null
    }
  }

  static async getCurrentUser() {
    const session = await this.getSession()
    if (!session) return null

    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      include: {
        managedCenter: true,
        centers: true
      }
    })

    return user
  }
}