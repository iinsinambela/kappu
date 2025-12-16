import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Menjalankan seed data awal...')

  // ====== ROLE ======
  const ownerRole = await prisma.role.upsert({
    where: { name: 'OWNER' },
    update: {},
    create: { name: 'OWNER' },
  })

  const employeeRole = await prisma.role.upsert({
    where: { name: 'PEGAWAI' },
    update: {},
    create: { name: 'PEGAWAI' },
  })

  // ====== USER ======
  const ownerPassword = await bcrypt.hash('kappuowner123', 10)
  const employeePassword = await bcrypt.hash('pegawai123', 10)

  const ownerUser = await prisma.user.upsert({
    where: { username: 'owner' },
    update: {},
    create: {
      username: 'owner',
      fullName: 'Owner Kappu',
      passwordHash: ownerPassword,
      roleId: ownerRole.id,
    },
  })

  const employeeUser = await prisma.user.upsert({
    where: { username: 'pegawai1' },
    update: {},
    create: {
      username: 'pegawai1',
      fullName: 'Pegawai Kappu',
      passwordHash: employeePassword,
      roleId: employeeRole.id,
    },
  })

  // ====== SHIFT DEFAULT ======
  const shiftPagi = await prisma.shift.upsert({
    where: { name: 'Shift Pagi' },
    update: {},
    create: {
      name: 'Shift Pagi',
      startTime: '09:00',
      endTime: '17:00',
    },
  })

  const shiftMalam = await prisma.shift.upsert({
    where: { name: 'Shift Malam' },
    update: {},
    create: {
      name: 'Shift Malam',
      startTime: '17:00',
      endTime: '22:00',
    },
  })

  // ====== EMPLOYEE RECORD (linked to User) ======
  await prisma.employee.create({
    data: {
      fullName: employeeUser.fullName,
      position: "Barista",
      phone: "08123456789",
      salary: 2500000,
      shiftId: shiftPagi.id
    }
  })

  // ====== PRODUK ======
  const sampleProducts = [
    { sku: 'P001', name: 'Kopi Latte', price: 25000, stock: 50, description: 'Kopi dengan susu segar' },
    { sku: 'P002', name: 'Kopi Hitam', price: 20000, stock: 60, description: 'Kopi robusta murni' },
    { sku: 'P003', name: 'Teh Tarik', price: 22000, stock: 70, description: 'Teh dicampur susu' },
  ]

  await prisma.product.createMany({ data: sampleProducts })

  // ====== BAHAN BAKU ======
  const sampleRawMaterials = [
    { code: 'B001', name: 'Biji Kopi Robusta', stock: 5000, unit: 'gram', costPerUnit: 0.5 },
    { code: 'B004', name: 'Gula Pasir', stock: 10000, unit: 'gram', costPerUnit: 0.1 },
  ]

  await prisma.rawMaterial.createMany({ data: sampleRawMaterials })

  console.log('✅ SEED SELESAI: Semua data awal berhasil dibuat!')
}

main()
  .catch((e) => {
    console.error('❌ SEED ERROR:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
