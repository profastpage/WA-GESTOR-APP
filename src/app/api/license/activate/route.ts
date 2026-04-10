import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, userId } = body

    if (!key || !userId) {
      return NextResponse.json(
        { success: false, error: 'key y userId son requeridos' },
        { status: 400 }
      )
    }

    const licenseKey = await db.licenseKey.findUnique({ where: { key } })

    if (!licenseKey) {
      return NextResponse.json(
        { success: false, error: 'Clave de licencia no encontrada' },
        { status: 404 }
      )
    }

    if (licenseKey.used) {
      return NextResponse.json(
        { success: false, error: 'Esta clave de licencia ya ha sido utilizada' },
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

    // Mark key as used
    const updatedKey = await db.licenseKey.update({
      where: { id: licenseKey.id },
      data: {
        used: true,
        usedBy: userId,
        usedByEmail: user.email,
        usedAt: new Date(),
      },
    })

    // Set user as Pro
    await db.user.update({
      where: { id: userId },
      data: { isPro: true },
    })

    return NextResponse.json({
      success: true,
      licenseKey: updatedKey,
    })
  } catch (error) {
    console.error('License activation error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
