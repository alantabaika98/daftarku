import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Simulasi data ekosistem tenant sekolah untuk Superadmin
    const schools = [
      {
        id: 'sch-1',
        name: 'MI Hidayatul Abidin',
        slug: 'mi-hidayatul-abidin',
        npsn: '20501234',
        status: 'active',
        plan: 'PRO',
        applicantsCount: 42,
      },
      {
        id: 'sch-2',
        name: 'SMA Nusantara Unggul',
        slug: 'sma-nusantara',
        npsn: '20509876',
        status: 'active',
        plan: 'VIP',
        applicantsCount: 185,
      },
    ];

    return NextResponse.json({ success: true, schools });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal mengambil data sekolah.' }, { status: 500 });
  }
}