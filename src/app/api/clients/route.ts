import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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

    const clients = await db.client.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, clients })
  } catch (error) {
    console.error('GET clients error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, name, phone, email, company, tags, notes } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId es requerido' },
        { status: 400 }
      )
    }

    // Parse tags - accept either string or array
    let tagsJson = '["Nuevo"]'
    if (tags) {
      if (typeof tags === 'string') {
        try {
          const parsed = JSON.parse(tags)
          tagsJson = JSON.stringify(parsed)
        } catch {
          // If not valid JSON, treat as comma-separated
          tagsJson = JSON.stringify(tags.split(',').map((t: string) => t.trim()))
        }
      } else if (Array.isArray(tags)) {
        tagsJson = JSON.stringify(tags)
      }
    }

    // Parse notes - accept either string or array
    let notesJson = '[]'
    if (notes) {
      if (typeof notes === 'string') {
        try {
          const parsed = JSON.parse(notes)
          notesJson = JSON.stringify(parsed)
        } catch {
          // If not valid JSON, wrap as text note
          notesJson = JSON.stringify([{ text: notes, date: new Date().toISOString() }])
        }
      } else if (Array.isArray(notes)) {
        notesJson = JSON.stringify(notes)
      }
    }

    const client = await db.client.create({
      data: {
        userId,
        name: name || '',
        phone: phone || '',
        email: email || '',
        company: company || '',
        tags: tagsJson,
        notes: notesJson,
      },
    })

    return NextResponse.json({ success: true, client }, { status: 201 })
  } catch (error) {
    console.error('POST clients error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
