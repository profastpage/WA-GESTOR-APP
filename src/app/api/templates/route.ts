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

    const templates = await db.template.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, templates })
  } catch (error) {
    console.error('GET templates error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, name, content, category } = body

    if (!userId || !name) {
      return NextResponse.json(
        { success: false, error: 'userId y nombre son requeridos' },
        { status: 400 }
      )
    }

    const template = await db.template.create({
      data: {
        userId,
        name,
        content: content || '',
        category: category || 'general',
      },
    })

    return NextResponse.json({ success: true, template }, { status: 201 })
  } catch (error) {
    console.error('POST template error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
