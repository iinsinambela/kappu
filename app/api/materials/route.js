import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

// GET semua bahan baku
export async function GET() {
  try {
    const materials = await prisma.rawMaterial.findMany({
      orderBy: { id: 'desc' },
    })
    return NextResponse.json(materials)
  } catch (error) {
    console.error("❌ GET materials error:", error)
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 })
  }
}

// Tambah bahan baku
export async function POST(req) {
  try {
    const body = await req.json()

    const created = await prisma.rawMaterial.create({
      data: {
        name: body.name,
        unit: body.unit,
        stock: Number(body.stock) || 0,
        costPerUnit: Number(body.price) || 0
      }
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error("❌ POST materials error:", error)
    return NextResponse.json({ error: "Gagal menambah bahan baku" }, { status: 500 })
  }
}
