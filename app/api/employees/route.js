import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

// ✅ Ambil semua pegawai + optional search, include shift
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q') || ''

    const employees = await prisma.employee.findMany({
      where: query
        ? { fullName: { contains: query, mode: 'insensitive' } }
        : {},
      orderBy: { createdAt: 'desc' },
      include: {
        shift: true,
      },
    })

    return NextResponse.json(employees)
  } catch (err) {
    console.error('❌ GET /api/employees error:', err)
    return NextResponse.json({ error: 'Gagal mengambil pegawai' }, { status: 500 })
  }
}

// ✅ Tambah pegawai + optional shiftId
export async function POST(req) {
  try {
    const { fullName, position, phone, salary, shiftId } = await req.json()

    if (!fullName || !position || !salary) {
      return NextResponse.json({ error: 'Data belum lengkap' }, { status: 400 })
    }

    const newEmp = await prisma.employee.create({
      data: {
        fullName,
        position,
        phone: phone || null,
        salary: Number(salary),
        ...(shiftId ? { shiftId: Number(shiftId) } : {}),
      },
      include: {
        shift: true,
      },
    })

    return NextResponse.json(newEmp, { status: 201 })
  } catch (err) {
    console.error('❌ POST /api/employees error:', err)
    return NextResponse.json({ error: 'Gagal menambah pegawai' }, { status: 500 })
  }
}
