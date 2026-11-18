import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getValidatedSchoolApiSession } from '@/lib/auth';

const STATUS_ID: Record<string, string> = {
  SUBMITTED: 'Menunggu Verifikasi',
  UNDER_REVIEW: 'Sedang Diperiksa',
  VERIFIED: 'Berkas Valid',
  ACCEPTED: 'Diterima',
  WAITLISTED: 'Cadangan',
  REJECTED: 'Tidak Diterima',
};

const PAY_ID: Record<string, string> = {
  UNPAID: 'Belum Bayar',
  DP_SUBMITTED: 'Bukti DP Diunggah',
  DP_VERIFIED: 'DP Terverifikasi (Angsuran)',
  PAID_SUBMITTED: 'Bukti Lunas Diunggah',
  PAID: 'Lunas Terverifikasi',
};

function escHtml(val: unknown): string {
  return String(val ?? '')
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"');
}

function escCsv(val: unknown): string {
  const s = String(val ?? '').replace(/"/g, '""');
  return `"${s}"`;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getValidatedSchoolApiSession();
    if (!auth) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') === 'csv' ? 'csv' : 'xls';
    const periodId = searchParams.get('periodId') || '';
    const pathId = searchParams.get('pathId') || '';
    const status = searchParams.get('status') || '';

    const where: Record<string, unknown> = { schoolId: auth.session.schoolId };
    if (periodId && periodId !== 'ALL') where.periodId = periodId;
    if (pathId && pathId !== 'ALL') where.pathId = pathId;
    if (status && status !== 'ALL') where.status = status;

    const applicants = await prisma.applicant.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: {
        period: true,
        path: true,
      },
    });

    const headers = [
      'No',
      'Nomor Registrasi',
      'Gelombang',
      'Tahun Ajaran',
      'Jalur Pendaftaran',
      'Status Seleksi',
      'Status Daftar Ulang',
      'Nama Lengkap Peserta Didik',
      'NIK (16 Digit)',
      'NISN',
      'Jenis Kelamin',
      'Tempat Lahir',
      'Tanggal Lahir',
      'Asal Lembaga / Sekolah',
      'Alamat Lengkap',
      'Nama Orang Tua / Wali',
      'No. WhatsApp Wali',
      'Biaya Pokok (Rp)',
      'Kode Unik',
      'Total Tagihan (Rp)',
      'Nominal Dibayar (Rp)',
      'Status Pembayaran',
      'Tanggal Pendaftaran',
    ];

    const rows = applicants.map((a, idx) => {
      const r = a as Record<string, unknown>;
      const fullName = String(r.fullName || r.name || '');
      const birthDateStr = r.birthDate
        ? new Date(String(r.birthDate)).toLocaleDateString('id-ID')
        : '';
      const createdStr = new Date(a.createdAt).toLocaleDateString('id-ID');
      const expected = Number(r.expectedAmount ?? 0);
      const unique = Number(r.uniqueCode ?? 0);
      const paid = Number(r.paidAmount ?? 0);
      const payStat = String(r.paymentStatus ?? 'UNPAID');

      return [
        String(idx + 1),
        a.registrationNumber,
        `Gelombang ${a.period.waveNumber} (${a.period.name})`,
        a.period.academicYear,
        a.path?.name ?? 'Reguler',
        STATUS_ID[a.status] ?? a.status,
        r.isReRegistered ? 'Sudah Daftar Ulang' : 'Belum Daftar Ulang',
        fullName,
        String(r.nik ?? ''),
        String(r.nisn ?? ''),
        String(r.gender ?? ''),
        String(r.birthPlace ?? ''),
        birthDateStr,
        String(r.originSchool ?? ''),
        String(r.address ?? ''),
        String(r.parentName ?? ''),
        String(r.parentPhone ?? ''),
        String(Math.max(0, expected - unique)),
        String(unique),
        String(expected),
        String(paid),
        PAY_ID[payStat] ?? payStat,
        createdStr,
      ];
    });

    const safeSlug = auth.school.slug.replace(/[^a-z0-9-]/gi, '-');

    if (format === 'csv') {
      const csvLines = [
        headers.map(escCsv).join(';'),
        ...rows.map((row) => row.map(escCsv).join(';')),
      ];
      const csvWithBom = '\uFEFF' + csvLines.join('\r\n');
      return new NextResponse(csvWithBom, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="Rekap-SPMB-Dapodik-EMIS-${safeSlug}.csv"`,
        },
      });
    }

    // Format Excel (.xls) dengan proteksi teks 16-digit NIK & No WA agar tidak berubah jadi 3.51E+15
    const htmlTable = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8" /></head>
<body>
  <table border="1">
    <thead>
      <tr style="background-color:#0F766E;color:#FFFFFF;font-weight:bold;">
        ${headers.map((h) => `<th>${escHtml(h)}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${rows
        .map(
          (row) =>
            `<tr>${row
              .map(
                (cell) =>
                  `<td style="mso-number-format:'\\@';">${escHtml(cell)}</td>`
              )
              .join('')}</tr>`
        )
        .join('')}
    </tbody>
  </table>
</body>
</html>`;

    return new NextResponse('\uFEFF' + htmlTable, {
      headers: {
        'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
        'Content-Disposition': `attachment; filename="Rekap-SPMB-Dapodik-EMIS-${safeSlug}.xls"`,
      },
    });
  } catch (error) {
    console.error('Export applicants error:', error);
    return NextResponse.json({ error: 'Gagal mengekspor data pendaftar.' }, { status: 500 });
  }
}