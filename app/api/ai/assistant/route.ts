import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getValidatedSchoolApiSession } from '@/lib/auth';
import {
  SchoolRealtimeSnapshot,
  buildDaftarKuMasterManual,
  generateDeepAdminAnswer,
} from '@/lib/daftarkuKnowledge';

const formatRp = (n: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n);

const rateMap = new Map<string, { count: number; resetAt: number }>();
function checkRate(ip: string) {
  const now = Date.now();
  const item = rateMap.get(ip);
  if (!item || now > item.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (item.count >= 30) return false;
  item.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const mode = body?.mode === 'ADMIN' ? 'ADMIN' : 'PUBLIC';
    const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';
    const slug = typeof body?.slug === 'string' ? body.slug.trim().toLowerCase() : '';
    const originUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof body?.originUrl === 'string' ? body.originUrl.trim() : 'http://localhost:3000');

    if (!prompt) {
      return NextResponse.json(
        { error: 'Tuliskan pertanyaan atau pilih prompt terlebih dahulu.' },
        { status: 400 }
      );
    }

    let schoolId = '';
    if (mode === 'ADMIN') {
      const auth = await getValidatedSchoolApiSession();
      if (!auth) {
        return NextResponse.json({ error: 'Sesi admin tidak valid.' }, { status: 401 });
      }
      schoolId = auth.session.schoolId;
    } else {
      const ip = request.headers.get('x-forwarded-for') || 'local';
      if (!checkRate(ip)) {
        return NextResponse.json(
          { error: 'Terlalu banyak pertanyaan dalam 1 menit. Silakan tunggu sebentar.' },
          { status: 429 }
        );
      }
      const sc = await prisma.school.findUnique({ where: { slug }, select: { id: true } });
      if (!sc) {
        return NextResponse.json({ error: 'Lembaga tidak ditemukan.' }, { status: 404 });
      }
      schoolId = sc.id;
    }

    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) {
      return NextResponse.json({ error: 'Data lembaga tidak ditemukan.' }, { status: 404 });
    }

    const [activePeriod, allApplicants] = await Promise.all([
      prisma.admissionPeriod.findFirst({
        where: { schoolId: school.id, isActive: true },
        include: { _count: { select: { applicants: true } } },
      }),
      prisma.applicant.findMany({
        where: { schoolId: school.id },
      }),
    ]);

    const totalApplicants = allApplicants.length;
    const pendingCount = allApplicants.filter((a) => a.status === 'SUBMITTED').length;
    const verifiedCount = allApplicants.filter((a) => a.status === 'VERIFIED').length;
    const acceptedCount = allApplicants.filter((a) => a.status === 'ACCEPTED').length;
    const reRegisteredCount = allApplicants.filter((a) =>
      Boolean((a as Record<string, unknown>).isReRegistered)
    ).length;

    const [paths, docs] = activePeriod
      ? await Promise.all([
          prisma.admissionPath.findMany({
            where: { schoolId: school.id, periodId: activePeriod.id, isActive: true },
            include: { _count: { select: { applicants: true } } },
          }),
          prisma.documentRequirement.findMany({
            where: { schoolId: school.id, periodId: activePeriod.id },
            orderBy: { sortOrder: 'asc' },
          }),
        ])
      : [[], []];

    const raw = school as Record<string, unknown>;
    const quotaBalance = Number(raw.quotaBalance ?? 30);
    const foundationBalance = Number(raw.foundationBalance ?? 0);
    const platformRegFee = Number(raw.platformRegFee ?? 5000);
    const platformReRegFee = Number(raw.platformReRegFee ?? 10000);
    const reRegMode = String(raw.reRegMode ?? 'MANUAL');

    const waveQuota = activePeriod?.quota ?? 0;
    const waveFilled = activePeriod?._count.applicants ?? totalApplicants;
    const waveRemaining = Math.max(0, waveQuota - waveFilled);
    const fillPercent = waveQuota > 0 ? Math.round((waveFilled / waveQuota) * 100) : 0;

    const baseFee =
      school.paymentMode === 'FREE'
        ? 0
        : school.paymentPerWave
        ? activePeriod?.registrationFee ?? 0
        : school.paymentAmount;

    const portalLink = `${originUrl}/daftar/${school.slug}`;
    const startStr = activePeriod
      ? new Date(activePeriod.startDate).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })
      : '-';
    const endStr = activePeriod
      ? new Date(activePeriod.endDate).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })
      : '-';

    const pathList = paths.length
      ? paths
          .map(
            (p) =>
              `• ${p.name} — Sisa ${Math.max(0, p.quota - p._count.applicants)} dari ${p.quota} kursi`
          )
          .join('\n')
      : '• Jalur Umum / Reguler';

    const docList = docs.length
      ? docs
          .map(
            (d, i) =>
              `${i + 1}. ${d.name} (${d.isRequired ? 'Wajib' : 'Opsional'}, maksimal ${
                d.maxSizeMb >= 1024 ? '1 GB' : `${d.maxSizeMb} MB`
              })`
          )
          .join('\n')
      : '1. Pas Foto Calon Peserta Didik\n2. Kartu Keluarga (KK) / Identitas';

    const currentPaymentModeLabel =
      school.paymentMode === 'FREE'
        ? 'Gratis (Rp 0 / Tanpa Biaya Pendaftaran)'
        : school.paymentMode === 'MANUAL_TRANSFER'
        ? 'Transfer Bank / QRIS Lembaga (Langsung ke Rekening Sekolah — 0% Potongan)'
        : 'Virtual Account (VA) / Link Pembayaran Otomatis';

    const feeInfo =
      school.paymentMode === 'FREE'
        ? 'GRATIS (Rp 0 / Tanpa Biaya Pendaftaran)'
        : `${formatRp(baseFee)}${
            school.useUniqueCode ? ' (+ kode unik 3 digit otomatis di akhir nominal)' : ''
          }${
            school.allowInstallment
              ? `. Mendukung cicilan/angsuran hingga ${school.maxInstallments}x dengan Uang Muka (DP) minimal ${formatRp(
                  school.minDownPayment
                )}`
              : ' (Pembayaran lunas sekaligus)'
          }`;

    const snapshot: SchoolRealtimeSnapshot = {
      schoolName: school.name,
      schoolSlug: school.slug,
      schoolLevel: school.level,
      address: school.address || '-',
      portalLink,
      waveLabel: activePeriod
        ? `Gelombang ${activePeriod.waveNumber} (${activePeriod.name}) TA ${activePeriod.academicYear}`
        : 'Belum ada gelombang aktif',
      waveStatusLabel: activePeriod?.isPublicOpen ? 'DIBUKA UNTUK UMUM' : 'DITUTUP SEMENTARA',
      startDateLabel: startStr,
      endDateLabel: endStr,
      benefits: activePeriod?.benefits || '-',
      waveQuota,
      waveFilled,
      waveRemaining,
      fillPercent,
      totalApplicants,
      pendingCount,
      verifiedCount,
      acceptedCount,
      reRegisteredCount,
      pathList,
      docList,
      currentPaymentModeLabel,
      feeInfo,
      quotaBalance,
      foundationBalanceLabel: formatRp(foundationBalance),
      platformRegFeeLabel: formatRp(platformRegFee),
      platformReRegFeeLabel: formatRp(platformReRegFee),
      reRegModeLabel:
        reRegMode === 'AUTOMATIC_VA'
          ? `Otomatis Virtual Account (Dana Kemitraan ${formatRp(platformReRegFee)}/transaksi)`
          : 'Manual / Tunai di Lembaga (Gratis / Rp 0 potongan)',
      registrationPrefix: school.registrationPrefix,
    };

    const masterManual = buildDaftarKuMasterManual(snapshot);

    // 1. Jika GEMINI_API_KEY tersedia di .env, gunakan Gemini 2.5 Flash dengan pengetahuan penuh DaftarKu
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const sysPrompt =
        mode === 'ADMIN'
          ? `Anda adalah Asisten AI Utama yang menguasai seluruh seluk-beluk, fitur, arsitektur, alur teknis, dan operasional aplikasi SPMB "DaftarKu" untuk lembaga "${school.name}".
Berikan jawaban yang LENGKAP, MENDALAM, TERSTRUKTUR, dan PRAKTIS.
Gunakan istilah "Kapasitas Penyimpanan Cloud" dan "Dana Kemitraan" (hindari istilah "Top-Up Kuota" atau "Limit Habis").
Gunakan basis pengetahuan lengkap aplikasi DaftarKu berikut:\n${masterManual}`
          : `Anda adalah Petugas Informasi (Customer Service) Pendaftaran Online resmi untuk "${school.name}" pada platform DaftarKu.
Berikan jawaban yang ramah, lengkap, terstruktur, dan mudah dipahami calon peserta didik maupun orang tua. Jawab HANYA berdasarkan data resmi lembaga berikut:
- Nama Lembaga: ${school.name} (${school.level})
- Alamat: ${school.address || '-'}
- Visi/Tagline: ${school.visionMission || '-'}
- Gelombang Aktif: ${snapshot.waveLabel} (${snapshot.waveStatusLabel})
- Jadwal: ${startStr} s/d ${endStr}
- Sisa Kuota: ${waveRemaining} dari ${waveQuota} kursi
- Benefit Gelombang: ${snapshot.benefits}
- Pilihan Jalur:\n${pathList}
- Syarat Berkas:\n${docList}
- Rincian Biaya: ${feeInfo}
- Cara Cek Status, Cetak Kartu & Pelunasan Angsuran: Klik tab "Cek Status & Cetak Kartu" di atas, lalu masukkan Nomor Registrasi beserta NIK atau No. WhatsApp Wali.`;

      const gRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
          apiKey
        )}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: sysPrompt }] },
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.6, maxOutputTokens: 2048 },
          }),
        }
      );
      if (gRes.ok) {
        const gData = await gRes.json();
        const text = gData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) return NextResponse.json({ reply: text });
      }
    }

    // 2. Mesin Penjawab Mendalam Lokal (Menguasai seluruh seluk-beluk DaftarKu)
    if (mode === 'ADMIN') {
      const reply = generateDeepAdminAnswer(prompt, snapshot);
      return NextResponse.json({ reply });
    }

    const q = prompt.toLowerCase();
    let publicReply = '';

    if (q.includes('syarat') || q.includes('berkas') || q.includes('dokumen')) {
      publicReply =
        `Berikut adalah daftar lengkap *Berkas Persyaratan Pendaftaran* di *${school.name}*:\n\n` +
        `${docList}\n\n` +
        `*Cara Mengunggah Berkas (Sangat Mudah Lewat HP):*\n` +
        `• Pada *Langkah 3* formulir pendaftaran di halaman ini, tekan tombol *Scan Kamera Langsung* untuk memotret dokumen fisik secara langsung, atau pilih file PDF/foto dari galeri HP Anda.`;
    } else if (q.includes('biaya') || q.includes('bayar') || q.includes('cicil') || q.includes('angsur')) {
      publicReply =
        `Berikut rincian *Biaya & Tata Cara Pembayaran Pendaftaran* di *${school.name}*:\n\n` +
        `• *Ketentuan Biaya:* ${feeInfo}.\n` +
        `${
          school.paymentMode === 'MANUAL_TRANSFER'
            ? '• *Metode Pembayaran:* Transfer ke rekening resmi lembaga atau scan QRIS yang tampil pada *Langkah 4* formulir (pastikan nominal transfer sesuai hingga 3 digit kode unik terakhir), lalu unggah foto/screenshot bukti transfernya.\n'
            : ''
        }` +
        `• Setelah formulir dikirim, *Kartu Tanda Bukti Pendaftaran* akan diterbitkan oleh sistem.`;
    } else if (q.includes('jadwal') || q.includes('kuota') || q.includes('tutup') || q.includes('kapan')) {
      publicReply =
        `Informasi *Jadwal Pendaftaran & Ketersediaan Kuota* di *${school.name}*:\n\n` +
        `• *Gelombang Berjalan:* ${snapshot.waveLabel}\n` +
        `• *Periode Pendaftaran:* ${startStr} s/d ${endStr}\n` +
        `• *Sisa Kuota Tersedia:* *${waveRemaining} kursi* dari total ${waveQuota} kursi\n` +
        `${activePeriod?.benefits ? `• *Keuntungan Gelombang Ini:* ${activePeriod.benefits}\n` : ''}` +
        `\n*Pilihan Jalur yang Dibuka:*\n${pathList}`;
    } else if (q.includes('status') || q.includes('kartu') || q.includes('cetak') || q.includes('nik')) {
      publicReply =
        `Panduan *Mengecek Status Seleksi, NIK Pendaftar & Mencetak Kartu Peserta* di *${school.name}*:\n\n` +
        `1. *Pengisian NIK Pendaftar:* Masukkan 16 digit NIK pribadi pendaftar sesuai KTP, KIA, atau baris nama pendaftar di Kartu Keluarga (bukan Nomor KK di bagian atas).\n` +
        `2. *Cek Status & Cetak Kartu:* Klik tab *Cek Status & Cetak Kartu* di bagian atas halaman ini, lalu masukkan *Nomor Registrasi* (contoh: \`${school.registrationPrefix}-2026-0001\`) beserta *NIK* atau *Nomor WhatsApp Wali*.\n` +
        `3. Hasil verifikasi panitia, tombol cetak kartu PDF, serta menu unggah pelunasan angsuran (jika memilih cicilan DP) akan langsung tampil.`;
    } else {
      publicReply =
        `Selamat datang di Layanan Informasi Pendaftaran Online *${school.name}*!\n\n` +
        `• *Status Portal:* ${snapshot.waveStatusLabel} (${snapshot.waveLabel})\n` +
        `• *Batas Pendaftaran:* ${endStr} (tersisa *${waveRemaining} kursi*)\n` +
        `• *Biaya Pendaftaran:* ${feeInfo}\n\n` +
        `Silakan pilih pertanyaan cepat di tab *Pustaka Prompt* atau ketik pertanyaan Anda mengenai *syarat berkas*, *rincian biaya & cicilan*, *pilihan jalur*, maupun *cara mencetak kartu peserta*.`;
    }

    return NextResponse.json({ reply: publicReply });
  } catch (error) {
    console.error('AI assistant error:', error);
    return NextResponse.json(
      { error: 'Asisten AI sedang sibuk. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}