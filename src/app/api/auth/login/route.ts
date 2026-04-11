import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email es requerido' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Session check mode
    if (password === '__check__') {
      const { password: _, ...userWithoutPassword } = user
      return NextResponse.json({ success: true, user: userWithoutPassword })
    }

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Contraseña es requerida' },
        { status: 400 }
      )
    }

    // Simple password comparison (MVP - no hashing)
    if (user.password !== password) {
      return NextResponse.json(
        { success: false, error: 'Contraseña incorrecta' },
        { status: 401 }
      )
    }

    // Auto-approve and set admin role for admin email
    let updatedUser = user
    if (email === 'admin@wamanager.com') {
      updatedUser = await db.user.update({
        where: { id: user.id },
        data: { approved: true, role: 'admin' },
      })
    }

    const { password: _, ...userWithoutPassword } = updatedUser
    return NextResponse.json({ success: true, user: userWithoutPassword })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
