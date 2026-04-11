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

    const followUps = await db.followUp.findMany({
      where: {
        userId,
        completed: false,
      },
      orderBy: { dueDate: 'asc' },
    })

    return NextResponse.json({ success: true, followUps })
  } catch (error) {
    console.error('GET follow-ups error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, clientId, title, description, dueDate, priority } = body

    if (!userId || !clientId || !title || !dueDate) {
      return NextResponse.json(
        { success: false, error: 'userId, clientId, title y dueDate son requeridos' },
        { status: 400 }
      )
    }

    const followUp = await db.followUp.create({
      data: {
        userId,
        clientId,
        title,
        description: description || '',
        dueDate: new Date(dueDate),
        priority: priority || 'media',
      },
    })

    return NextResponse.json({ success: true, followUp }, { status: 201 })
  } catch (error) {
    console.error('POST follow-up error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
