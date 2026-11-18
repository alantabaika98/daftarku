import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { regNo, phoneSuffix } = body;

    if (!regNo || !phoneSuffix) {
      return NextResponse.json(
        { success: false, message: 'Nomor registrasi dan 4 digit No. WhatsApp wajib diisi.' },
        { status: 400 }
      );
    }

    // Simulasi pencarian data pendaftar secara aman (Tenant-isolated)
    // Di tahap produksi, ini akan mencocokkan ke database Prisma dengan sanitasi ketat.
    const cleanRegNo = regNo.trim().toUpperCase();

    if (cleanRegNo.includes('MIHA') || cleanRegNo.length > 3) {
      return NextResponse.json({
        success: true,
        data: {
          regNo: cleanRegNo,
          name: 'Ahmad Fauzan Al-Farizi',
          schoolName: 'MI Hidayatul Abidin',
          track: 'Jalur Prestasi',
          wave: 'Gelombang 1',
          status: 'Diverifikasi',
          paymentStatus: 'Lunas',
          registeredAt: '15 November 2026',
          docs: [
            { label: 'Kartu Keluarga (KK)', status: 'Diterima' },
            { label: 'Akta Kelahiran', status: 'Diterima' },
          ],
        },
      });
    }

    return NextResponse.json(
      { success: false, message: 'Data pendaftaran tidak ditemukan dengan kombinasi tersebut.' },
      { status: 404 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}