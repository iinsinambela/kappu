import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const PROTECTED_PATHS = ['/dashboard', '/produk', '/bahanbaku', '/laporan']

export async function proxy(req) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('token')?.value

  // ✅ Jangan intercept API route
  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // ✅ Cek halaman yang dilindungi
  if (PROTECTED_PATHS.some(path => pathname.startsWith(path))) {
    if (!token) {
      console.log('❌ No token, redirect to login')
      return NextResponse.redirect(new URL('/', req.url))
    }

    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET))
      return NextResponse.next()
    } catch (error) {
      console.error('❌ Invalid JWT:', error)
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return NextResponse.next()
}
