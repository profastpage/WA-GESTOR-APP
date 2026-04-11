import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, name } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId es requerido' },
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

    const updateData: Record<string, string> = {}
    if (name !== undefined) updateData.name = name

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
    })

    const { password: _, ...userWithoutPassword } = updatedUser
    return NextResponse.json({ success: true, user: userWithoutPassword })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
