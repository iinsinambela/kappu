import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// WAJIB: supaya file upload bisa berjalan dengan fs
export const runtime = "nodejs";

const prisma = new PrismaClient();

// ====================================================
//                   UPDATE PRODUK (PUT)
// ====================================================
export async function PUT(req, context) {
  try {
    // FIX: params harus diambil seperti ini
    const params = await context.params;
    const id = Number(params.id);

    if (!id) {
      return NextResponse.json(
        { error: "ID produk tidak ditemukan" },
        { status: 400 }
      );
    }

    const form = await req.formData();

    const name = form.get("name");
    const price = Number(form.get("price"));
    const stock = Number(form.get("stock"));
    const description = form.get("description") ?? "";
    const image = form.get("image");

    if (!name) {
      return NextResponse.json(
        { error: "Nama produk wajib diisi" },
        { status: 400 }
      );
    }

    let imageUrl = undefined;

    // Jika ada file baru, upload
    if (image && image.size > 0) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = path.join(process.cwd(), "public/uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filename =
        Date.now() + "-" + image.name.replace(/\s+/g, "_");

      const filepath = path.join(uploadDir, filename);
      fs.writeFileSync(filepath, buffer);

      imageUrl = "/uploads/" + filename;
    }

    // Update database
    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        price,
        stock,
        description,
        ...(imageUrl && { imageUrl }),
      },
    });

    return NextResponse.json(updated);

  } catch (err) {
    console.error("❌ ERROR PUT /api/products/[id]:", err);
    return NextResponse.json(
      { error: err.message || "Gagal update produk" },
      { status: 500 }
    );
  }
}

// ====================================================
//                   DELETE PRODUK
// ====================================================
export async function DELETE(req, context) {
  try {
    const params = await context.params;
    const id = Number(params.id);

    if (!id) {
      return NextResponse.json(
        { error: "ID produk tidak ditemukan" },
        { status: 400 }
      );
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ message: "Produk dihapus" });

  } catch (err) {
    console.error("❌ ERROR DELETE PRODUCT:", err);
    return NextResponse.json(
      { error: "Gagal menghapus produk" },
      { status: 500 }
    );
  }
}
