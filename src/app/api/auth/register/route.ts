import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Email, contraseña y nombre son requeridos' },
        { status: 400 }
      )
    }

    const existingUser = await db.user.findUnique({ where: { email } })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'El email ya está registrado' },
        { status: 409 }
      )
    }

    const user = await db.user.create({
      data: {
        email,
        password,
        name,
        role: 'client',
        approved: false,
        isPro: false,
      },
    })

    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json({ success: true, user: userWithoutPassword }, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
