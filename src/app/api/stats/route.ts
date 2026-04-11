import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId es requerido' },
        { status: 400 }
      )
    }

    // Total clients
    const totalClients = await db.client.count({
      where: { userId },
    })

    // VIP count
    const vipCount = await db.client.count({
      where: {
        userId,
        tags: { contains: 'VIP' },
      },
    })

    // Pending count (clients tagged as "Nuevo")
    const pendingCount = await db.client.count({
      where: {
        userId,
        tags: { contains: 'Nuevo' },
      },
    })

    // New count (clients created in the last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const newCount = await db.client.count({
      where: {
        userId,
        createdAt: { gte: sevenDaysAgo },
      },
    })

    // Messages today
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    const messagesToday = await db.message.count({
      where: {
        userId,
        createdAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    })

    // Messages this week
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    const messagesThisWeek = await db.message.count({
      where: {
        userId,
        createdAt: { gte: startOfWeek },
      },
    })

    // Total templates
    const totalTemplates = await db.template.count({
      where: { userId },
    })

    // Pending follow-ups
    const pendingFollowUps = await db.followUp.count({
      where: {
        userId,
        completed: false,
      },
    })

    return NextResponse.json({
      success: true,
      stats: {
        totalClients,
        vipCount,
        pendingCount,
        newCount,
        messagesToday,
        messagesThisWeek,
        totalTemplates,
        pendingFollowUps,
      },
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
