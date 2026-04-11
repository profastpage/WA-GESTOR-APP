import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Known license keys that should always work
const KNOWN_LICENSE_KEYS = [
  { key: 'WA-PRO-2026-X7K9', plan: 'pro' },
  { key: 'WA-PRO-DEMO-FREE', plan: 'pro' },
  { key: 'WA-PRO-BETA-2024', plan: 'pro' },
]

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

    const user = await db.user.findUnique({ where: { id: userId } })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // If user is already Pro, return early
    if (user.isPro) {
      return NextResponse.json({
        success: true,
        message: 'Ya tienes una licencia Pro activa',
        alreadyActive: true,
      })
    }

    // Look up license key - try DB first, then check known keys
    let licenseKey = await db.licenseKey.findUnique({ where: { key } })

    // If not found in DB but it's a known key, create it
    if (!licenseKey) {
      const knownKey = KNOWN_LICENSE_KEYS.find(k => k.key === key)
      if (knownKey) {
        licenseKey = await db.licenseKey.create({
          data: {
            key: knownKey.key,
            plan: knownKey.plan,
          },
        })
      }
    }

    if (!licenseKey) {
      return NextResponse.json(
        { success: false, error: 'Clave de licencia no encontrada' },
        { status: 404 }
      )
    }

    if (licenseKey.used) {
      // Allow re-activation for the same user
      if (licenseKey.usedBy === userId) {
        return NextResponse.json({
          success: true,
          message: 'Licencia ya activada en esta cuenta',
          alreadyActive: true,
        })
      }
      return NextResponse.json(
        { success: false, error: 'Esta clave de licencia ya ha sido utilizada por otra cuenta' },
        { status: 400 }
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
      message: 'Licencia Pro activada correctamente',
    })
  } catch (error) {
    console.error('License activation error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
