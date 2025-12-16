import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { id: 'desc' }
    })
    return NextResponse.json(products)
  } catch (err) {
    console.error('GET /api/products error', err)
    return NextResponse.json({ error: 'Gagal mengambil produk' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    // use native formData on Next.js server
    const form = await req.formData()
    const name = form.get('name')
    const price = Number(form.get('price'))
    const stock = Number(form.get('stock'))
    const description = form.get('description') ?? null
    const image = form.get('image')

    let imageUrl = null

    if (image && image.size > 0) {
      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

      const filename = Date.now() + '-' + (image.name ?? 'upload').replace(/\s+/g, '_')
      const filepath = path.join(uploadDir, filename)
      fs.writeFileSync(filepath, buffer)
      imageUrl = '/uploads/' + filename
    }

    const created = await prisma.product.create({
      data: {
        name,
        price,
        stock,
        description,
        ...(imageUrl && { imageUrl })
      }
    })

    return NextResponse.json(created, { status: 201 })
  } catch (err) {
    console.error('POST /api/products error', err)
    return NextResponse.json({ error: 'Gagal menambahkan produk' }, { status: 500 })
  }
}
