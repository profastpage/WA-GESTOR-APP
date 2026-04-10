import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, phone, email, company, tags, notes } = body

    const existingClient = await db.client.findUnique({ where: { id } })
    if (!existingClient) {
      return NextResponse.json(
        { success: false, error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    const updateData: Record<string, string> = {}

    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone
    if (email !== undefined) updateData.email = email
    if (company !== undefined) updateData.company = company

    if (tags !== undefined) {
      if (typeof tags === 'string') {
        try {
          JSON.parse(tags) // validate
          updateData.tags = tags
        } catch {
          updateData.tags = JSON.stringify(tags.split(',').map((t: string) => t.trim()))
        }
      } else if (Array.isArray(tags)) {
        updateData.tags = JSON.stringify(tags)
      }
    }

    if (notes !== undefined) {
      if (typeof notes === 'string') {
        try {
          JSON.parse(notes) // validate
          updateData.notes = notes
        } catch {
          updateData.notes = JSON.stringify([{ text: notes, date: new Date().toISOString() }])
        }
      } else if (Array.isArray(notes)) {
        updateData.notes = JSON.stringify(notes)
      }
    }

    const client = await db.client.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true, client })
  } catch (error) {
    console.error('PUT client error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existingClient = await db.client.findUnique({ where: { id } })
    if (!existingClient) {
      return NextResponse.json(
        { success: false, error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    await db.client.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE client error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
