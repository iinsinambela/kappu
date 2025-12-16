import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

// ✅ UPDATE pegawai (termasuk shiftId)
export async function PUT(req, context) {
  try {
    const params = await context.params
    const id = Number(params.id)
    const body = await req.json()

    const data = {
      fullName: body.fullName ?? undefined,
      position: body.position ?? undefined,
      phone: body.phone ?? undefined,
      salary: body.salary ? Number(body.salary) : undefined,
    }

    // shiftId boleh diubah / dikosongkan
    if (body.shiftId !== undefined) {
      data.shiftId = body.shiftId ? Number(body.shiftId) : null
    }

    const updated = await prisma.employee.update({
      where: { id },
      data,
      include: { shift: true },
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('❌ UPDATE /api/employees/[id] error:', err)
    return NextResponse.json({ error: 'Gagal update pegawai' }, { status: 500 })
  }
}

// ✅ HAPUS pegawai
export async function DELETE(req, context) {
  try {
    const params = await context.params
    const id = Number(params.id)

    await prisma.employee.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('❌ DELETE /api/employees/[id] error:', err)
    return NextResponse.json({ error: 'Gagal hapus pegawai' }, { status: 500 })
  }
}
