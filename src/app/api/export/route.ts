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

    // Build CSV
    const headers = ['Nombre', 'Teléfono', 'Email', 'Empresa', 'Etiquetas', 'Total Mensajes']

    const escapeCsv = (value: string) => {
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    }

    const rows = clients.map((client) => {
      let tagsStr = client.tags
      try {
        const parsed = JSON.parse(client.tags)
        tagsStr = Array.isArray(parsed) ? parsed.join(', ') : client.tags
      } catch {
        // keep original
      }

      return [
        escapeCsv(client.name),
        escapeCsv(client.phone),
        escapeCsv(client.email),
        escapeCsv(client.company),
        escapeCsv(tagsStr),
        String(client.totalMessages),
      ].join(',')
    })

    const csvContent = [
      headers.join(','),
      ...rows,
    ].join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="clientes_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
