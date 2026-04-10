import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, currentPassword, newPassword } = body

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    if (newPassword.length < 4) {
      return NextResponse.json(
        { success: false, error: 'La nueva contraseña debe tener al menos 4 caracteres' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({ where: { id: userId } })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Simple password comparison (MVP - no hashing, consistent with login route)
    if (user.password !== currentPassword) {
      return NextResponse.json(
        { success: false, error: 'Contraseña actual incorrecta' },
        { status: 401 }
      )
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { password: newPassword },
    })

    const { password: _, ...userWithoutPassword } = updatedUser
    return NextResponse.json({ success: true, user: userWithoutPassword })
  } catch (error) {
    console.error('Password change error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
