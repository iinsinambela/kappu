import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function PUT(req, context) {
  try {
    const params = await context.params   // ← WAJIB pakai await
    const body = await req.json()

    if (!params?.id) {
      return NextResponse.json({ error: "ID tidak ditemukan" }, { status: 400 })
    }

    const updated = await prisma.rawMaterial.update({
      where: { id: Number(params.id) },
      data: {
        name: body.name ?? "",
        unit: body.unit ?? "",
        stock: Number(body.stock) || 0,
        costPerUnit: Number(body.price) || 0,
      }
    })

    return NextResponse.json(updated)

  } catch (err) {
    console.error("❌ PUT materials error:", err)
    return NextResponse.json({ error: "Gagal mengedit bahan baku" }, { status: 500 })
  }
}

export async function DELETE(req, context) {
  try {
    const params = await context.params   // ← WAJIB pakai await

    if (!params?.id) {
      return NextResponse.json({ error: "ID tidak ditemukan" }, { status: 400 })
    }

    await prisma.rawMaterial.delete({
      where: { id: Number(params.id) }
    })

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error("❌ DELETE materials error:", err)
    return NextResponse.json({ error: "Gagal menghapus bahan baku" }, { status: 500 })
  }
}
