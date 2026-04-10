import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const users = await db.user.findMany({
      where: {
        role: { not: 'deleted' },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        approved: true,
        isPro: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ success: true, users })
  } catch (error) {
    console.error('GET admin users error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, action } = body

    if (!userId || !action) {
      return NextResponse.json(
        { success: false, error: 'userId y action son requeridos' },
        { status: 400 }
      )
    }

    const existingUser = await db.user.findUnique({ where: { id: userId } })
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    let updatedUser

    switch (action) {
      case 'approve':
        updatedUser = await db.user.update({
          where: { id: userId },
          data: { approved: true },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            approved: true,
            isPro: true,
            createdAt: true,
            updatedAt: true,
          },
        })
        break

      case 'revoke':
        updatedUser = await db.user.update({
          where: { id: userId },
          data: { approved: false },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            approved: true,
            isPro: true,
            createdAt: true,
            updatedAt: true,
          },
        })
        break

      case 'delete':
        updatedUser = await db.user.update({
          where: { id: userId },
          data: { role: 'deleted' },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            approved: true,
            isPro: true,
            createdAt: true,
            updatedAt: true,
          },
        })
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Acción no válida. Use: approve, revoke, o delete' },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error('PUT admin user error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
