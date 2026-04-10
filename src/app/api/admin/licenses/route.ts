import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function generateLicenseKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const random = (length: number) =>
    Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `WA-PRO-${random(4)}-${random(4)}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, count } = body

    if (action !== 'generate') {
      return NextResponse.json(
        { success: false, error: 'Acción no válida. Use: generate' },
        { status: 400 }
      )
    }

    const numKeys = Math.min(Math.max(parseInt(count) || 1, 1), 100)
    const keys: string[] = []

    for (let i = 0; i < numKeys; i++) {
      let key = generateLicenseKey()
      // Ensure uniqueness
      while (true) {
        const existing = await db.licenseKey.findUnique({ where: { key } })
        if (!existing) break
        key = generateLicenseKey()
      }

      await db.licenseKey.create({
        data: {
          key,
          plan: 'pro',
        },
      })
      keys.push(key)
    }

    return NextResponse.json({ success: true, keys }, { status: 201 })
  } catch (error) {
    console.error('POST admin licenses error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const licenses = await db.licenseKey.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, licenses })
  } catch (error) {
    console.error('GET admin licenses error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
