import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'edge';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { completed, title, description, dueDate, priority } = body

    const existingFollowUp = await db.followUp.findUnique({ where: { id } })
    if (!existingFollowUp) {
      return NextResponse.json(
        { success: false, error: 'Seguimiento no encontrado' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {}

    if (completed === true) {
      updateData.completed = true
      updateData.completedAt = new Date()
    }

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (dueDate !== undefined) updateData.dueDate = new Date(dueDate)
    if (priority !== undefined) updateData.priority = priority

    const followUp = await db.followUp.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true, followUp })
  } catch (error) {
    console.error('PUT follow-up error:', error)
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

    const existingFollowUp = await db.followUp.findUnique({ where: { id } })
    if (!existingFollowUp) {
      return NextResponse.json(
        { success: false, error: 'Seguimiento no encontrado' },
        { status: 404 }
      )
    }

    await db.followUp.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE follow-up error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
