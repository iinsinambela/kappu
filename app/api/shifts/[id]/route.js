import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

// PUT: edit shift
export async function PUT(req, context) {
  try {
    const params = await context.params
    const id = Number(params.id)
    const { name, startTime, endTime } = await req.json()

    const updated = await prisma.shift.update({
      where: { id },
      data: {
        name: name ?? undefined,
        startTime: startTime ?? undefined,
        endTime: endTime ?? undefined,
      },
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('❌ PUT /api/shifts/[id] error:', err)
    return NextResponse.json({ error: 'Gagal mengedit shift' }, { status: 500 })
  }
}

// DELETE: hapus shift
export async function DELETE(req, context) {
  try {
    const params = await context.params
    const id = Number(params.id)

    await prisma.shift.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('❌ DELETE /api/shifts/[id] error:', err)
    return NextResponse.json({ error: 'Gagal menghapus shift' }, { status: 500 })
  }
}
