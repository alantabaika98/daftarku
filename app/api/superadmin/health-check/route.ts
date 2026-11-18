import { NextResponse } from 'next/server';

/**
 * API Backend Otomatis: School Health Monitoring Engine
 * Prinsip: No School Left Behind
 * Mengevaluasi status kesehatan sekolah berdasarkan konfigurasi gelombang, 
 * status aktif portal, jumlah pendaftar, dan aktivitas admin.
 */
export async function GET(request: Request) {
  try {
    // Simulasi data dari database Prisma untuk dianalisis oleh engine kesehatan
    const tenantDataList = [
      {
        id: 'sch-1',
        name: 'MI Hidayatul Abidin',
        isPortalActive: true,
        applicantsCount: 42,
        hasActiveWave: true,
        lastAdminLoginDaysAgo: 0,
      },
      {
        id: 'sch-2',
        name: 'SMA Nusantara Unggul',
        isPortalActive: true,
        applicantsCount: 185,
        hasActiveWave: true,
        lastAdminLoginDaysAgo: 1,
      },
      {
        id: 'sch-3',
        name: 'SMP Islam Al-Hikmah',
        isPortalActive: true,
        applicantsCount: 2,
        hasActiveWave: false,
        lastAdminLoginDaysAgo: 4,
      },
      {
        id: 'sch-4',
        name: 'MTs Darul Ulum Terpadu',
        isPortalActive: false,
        applicantsCount: 0,
        hasActiveWave: false,
        lastAdminLoginDaysAgo: 12,
      },
    ];

    const evaluatedReport = tenantDataList.map((school) => {
      let healthStatus: 'SEHAT' | 'PERLU_PERHATIAN' | 'KRITIS' = 'SEHAT';
      let healthReason = 'Operasional normal, pendaftaran aktif dan gelombang terkonfigurasi.';

      if (!school.isPortalActive || school.applicantsCount === 0 || school.lastAdminLoginDaysAgo > 10) {
        healthStatus = 'KRITIS';
        healthReason = 'Portal ditutup/nonaktif, tidak ada pendaftar, atau admin lama tidak aktif.';
      } else if (!school.hasActiveWave || school.applicantsCount < 5 || school.lastAdminLoginDaysAgo > 3) {
        healthStatus = 'PERLU_PERHATIAN';
        healthReason = 'Gelombang pendaftaran belum dikonfigurasi dengan optimal atau pendaftar masih minim.';
      }

      return {
        id: school.id,
        name: school.name,
        healthStatus,
        healthReason,
      };
    });

    const summary = {
      total: evaluatedReport.length,
      sehat: evaluatedReport.filter((s) => s.healthStatus === 'SEHAT').length,
      perluPerhatian: evaluatedReport.filter((s) => s.healthStatus === 'PERLU_PERHATIAN').length,
      kritis: evaluatedReport.filter((s) => s.healthStatus === 'KRITIS').length,
    };

    return NextResponse.json({
      success: true,
      message: 'Evaluasi kesehatan ekosistem sekolah berhasil dijalankan.',
      summary,
      evaluations: evaluatedReport,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal menjalankan evaluasi kesehatan sekolah.' },
      { status: 500 }
    );
  }
}