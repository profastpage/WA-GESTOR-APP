import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, content, category, incrementUsage } = body

    const existingTemplate = await db.template.findUnique({ where: { id } })
    if (!existingTemplate) {
      return NextResponse.json(
        { success: false, error: 'Plantilla no encontrada' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {}

    if (name !== undefined) updateData.name = name
    if (content !== undefined) updateData.content = content
    if (category !== undefined) updateData.category = category

    if (incrementUsage) {
      updateData.usageCount = { increment: 1 }
    }

    const template = await db.template.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true, template })
  } catch (error) {
    console.error('PUT template error:', error)
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

    const existingTemplate = await db.template.findUnique({ where: { id } })
    if (!existingTemplate) {
      return NextResponse.json(
        { success: false, error: 'Plantilla no encontrada' },
        { status: 404 }
      )
    }

    await db.template.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE template error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
