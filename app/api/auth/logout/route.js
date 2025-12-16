// app/api/auth/logout/route.js
import { cookies } from 'next/headers'

export async function POST() {
  try {
    // Hapus cookie token agar user keluar dari sesi
    cookies().delete('token')

    return new Response(
      JSON.stringify({ message: 'Logout berhasil' }),
      { status: 200 }
    )
  } catch (err) {
    console.error('Logout error:', err)
    return new Response(
      JSON.stringify({ error: 'Gagal logout' }),
      { status: 500 }
    )
  }
}
