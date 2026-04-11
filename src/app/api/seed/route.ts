import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'edge';

export async function POST() {
  try {
    // Seed known license keys
    const keys = [
      { key: 'WA-PRO-2026-X7K9', plan: 'pro' },
      { key: 'WA-PRO-DEMO-FREE', plan: 'pro' },
      { key: 'WA-PRO-BETA-2024', plan: 'pro' },
    ]

    let created = 0
    for (const k of keys) {
      const exists = await db.licenseKey.findUnique({ where: { key: k.key } })
      if (!exists) {
        await db.licenseKey.create({ data: k })
        created++
      }
    }

    // Seed demo admin user if none exists
    const adminExists = await db.user.findFirst({ where: { role: 'admin' } })
    if (!adminExists) {
      await db.user.create({
        data: {
          email: 'admin@wamanager.com',
          name: 'Admin',
          password: 'admin123',
          role: 'admin',
          approved: true,
          isPro: true,
        },
      })
      created++
    }

    return NextResponse.json({
      success: true,
      message: `Database seeded successfully (${created} records created)`,
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al inicializar datos' },
      { status: 500 }
    )
  }
}
