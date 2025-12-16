import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

// GET: semua shift
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || ''

    const shifts = await prisma.shift.findMany({
      where: q
        ? { name: { contains: q, mode: 'insensitive' } }
        : {},
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(shifts)
  } catch (err) {
    console.error('❌ GET /api/shifts error:', err)
    return NextResponse.json({ error: 'Gagal mengambil shift' }, { status: 500 })
  }
}

// POST: tambah shift baru
export async function POST(req) {
  try {
    const { name, startTime, endTime } = await req.json()

    if (!name || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Nama dan jam shift wajib diisi' },
        { status: 400 }
      )
    }

    const created = await prisma.shift.create({
      data: { name, startTime, endTime },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (err) {
    console.error('❌ POST /api/shifts error:', err)
    return NextResponse.json({ error: 'Gagal menambah shift' }, { status: 500 })
  }
}
