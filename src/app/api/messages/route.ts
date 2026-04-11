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

    // Today's date range
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    const todayCount = await db.message.count({
      where: {
        userId,
        createdAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    })

    const totalCount = await db.message.count({
      where: { userId },
    })

    return NextResponse.json({
      success: true,
      todayCount,
      totalCount,
    })
  } catch (error) {
    console.error('GET messages error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, clientId, templateId, content } = body

    if (!userId || !clientId || !content) {
      return NextResponse.json(
        { success: false, error: 'userId, clientId y content son requeridos' },
        { status: 400 }
      )
    }

    // Create message log
    const message = await db.message.create({
      data: {
        userId,
        clientId,
        templateId: templateId || null,
        content,
      },
    })

    // Increment client's totalMessages and update lastContact
    await db.client.update({
      where: { id: clientId },
      data: {
        totalMessages: { increment: 1 },
        lastContact: new Date(),
      },
    })

    // Increment template usageCount if templateId provided
    if (templateId) {
      await db.template.update({
        where: { id: templateId },
        data: { usageCount: { increment: 1 } },
      })
    }

    return NextResponse.json({ success: true, message }, { status: 201 })
  } catch (error) {
    console.error('POST message error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
