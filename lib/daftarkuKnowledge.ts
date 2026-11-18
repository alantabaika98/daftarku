export interface SchoolRealtimeSnapshot {
  schoolName: string;
  schoolSlug: string;
  schoolLevel: string;
  address: string;
  portalLink: string;
  waveLabel: string;
  waveStatusLabel: string;
  startDateLabel: string;
  endDateLabel: string;
  benefits: string;
  waveQuota: number;
  waveFilled: number;
  waveRemaining: number;
  fillPercent: number;
  totalApplicants: number;
  pendingCount: number;
  verifiedCount: number;
  acceptedCount: number;
  reRegisteredCount: number;
  pathList: string;
  docList: string;
  currentPaymentModeLabel: string;
  feeInfo: string;
  quotaBalance: number;
  foundationBalanceLabel: string;
  platformRegFeeLabel: string;
  platformReRegFeeLabel: string;
  reRegModeLabel: string;
  registrationPrefix: string;
}

export function buildDaftarKuMasterManual(s: SchoolRealtimeSnapshot): string {
  return `
=== PANDUAN & SELUK-BELUK LENGKAP APLIKASI DAFTARKU ===

1. IDENTITAS & ARSITEKTUR PLATFORM DAFTARKU:
- DaftarKu adalah platform SaaS Sistem Penerimaan Murid Baru (SPMB / PPDB) online multi-lembaga (multi-tenant) yang melayani 19 jenjang satuan pendidikan secara terpisah: TK, RA, KB, TPA, SD, MI, SMP, MTs, SMA, MA, SMK, MAK, TPQ, SLB, Asrama, Pondok Pesantren, Pendidikan Diniyah, Boarding School, dan Perguruan Tinggi / Kampus.
- Setiap lembaga memiliki:
  a) Portal Pendaftaran Publik mandiri di alamat: ${s.portalLink}
  b) Halaman Publik Verifikasi & Cetak Kartu Peserta di alamat: /kartu/[nomor-registrasi]
  c) Dashboard Panel Admin Lembaga di alamat: /dashboard

2. DATA REAL-TIME LEMBAGA SAAT INI (${s.schoolName}):
- Nama Lembaga: ${s.schoolName} (Jenjang: ${s.schoolLevel})
- Alamat: ${s.address}
- Awalan Nomor Registrasi (Prefix): ${s.registrationPrefix} (contoh: ${s.registrationPrefix}-2026-0001)
- Gelombang Berjalan: ${s.waveLabel} (${s.waveStatusLabel})
- Periode Pendaftaran: ${s.startDateLabel} s/d ${s.endDateLabel}
- Benefit Gelombang: ${s.benefits}
- Statistik Keterisian Kuota: Terisi ${s.waveFilled} dari ${s.waveQuota} kursi (${s.fillPercent}%), tersisa ${s.waveRemaining} kursi.
- Rekap Pendaftar: Total ${s.totalApplicants} pendaftar (${s.pendingCount} menunggu verifikasi, ${s.verifiedCount} berkas valid, ${s.acceptedCount} diterima, ${s.reRegisteredCount} sudah daftar ulang).
- Mode Pembayaran Tersimpan: ${s.currentPaymentModeLabel}
- Rincian Tarif Saat Ini: ${s.feeInfo}
- Sisa Kapasitas Penyimpanan Cloud: ${s.quotaBalance} slot gratis.
- Saldo Yayasan: ${s.foundationBalanceLabel} | Mode Daftar Ulang: ${s.reRegModeLabel}.
- Daftar Jalur Aktif:\n${s.pathList}
- Daftar Syarat Berkas:\n${s.docList}

3. PETA LENGKAP 6 MENU UTAMA DASHBOARD ADMIN (/dashboard):
- Menu 1 — Pusat Kendali & Pendaftar:
  * Menampilkan Tautan Pendaftaran Publik beserta tombol Salin Link, Kirim WA, dan Lihat Kartu Bukti.
  * Sakelar Buka / Tutup Sementara Portal Pendaftaran secara instan.
  * 4 Kartu Ringkasan Statistik (Total Pendaftar, Menunggu Verifikasi, Berkas Terverifikasi, Dinyatakan Diterima).
  * Diagram Lingkaran (Donut Chart) & Grafik Batang Persentase Kuota per Gelombang yang menghitung otomatis rasio pendaftar dibanding kuota kursi.
  * Tabel Data Pendaftar lengkap dengan pencarian (nama, nomor registrasi, NIK, nama wali) dan filter (Gelombang, Jalur, Status Seleksi, Sudah Daftar Ulang).
  * Tombol "Periksa": Membuka laci pemeriksaan berkas unggahan (KK, Akta, Pas Foto, dll.), pencocokan nominal transfer + kode unik 3 digit dengan mutasi rekening, penetapan status kelulusan (Menunggu Verifikasi, Berkas Valid, Diterima, Cadangan, Tidak Diterima), centang konfirmasi Daftar Ulang, serta tombol "Simpan & Kirim Kartu Peserta ke WA Wali".
  * Tombol "Unduh Excel (.xls) Siap Dapodik / EMIS" & "Unduh CSV": Mengekspor seluruh biodata, NIK 16 digit, NISN, asal lembaga, jalur, dan riwayat pembayaran dengan proteksi format teks agar 16-digit NIK dan nomor WhatsApp tidak berubah menjadi format ilmiah di Excel.
- Menu 2 — Profil & Warna Lembaga:
  * Mengatur nama lembaga, 19 pilihan jenjang pendidikan, NPSN, kontak WA panitia, alamat, visi/misi/tagline, daftar keunggulan utama, catatan "PERHATIAN" pada kartu peserta, awalan nomor pendaftaran, serta warna tema lembaga (otomatis mewarnai portal publik, tombol, bilah progres, dan Kartu Bukti Pendaftaran).
  * Mengunggah Logo Lembaga, Banner Sampul Atas, dan Foto Kegiatan/Gedung.
- Menu 3 — Jadwal Gelombang:
  * Mengelola multi-gelombang (Gelombang 1, 2, 3, dst.), mengatur tanggal buka/tutup, kuota kursi per gelombang, tarif khusus per gelombang, dan benefit gelombang. Mendukung tambah, edit, aktifkan gelombang berjalan, dan hapus.
- Menu 4 — Jalur & Kuota:
  * Menyediakan Template Cepat Sekolah Negeri (Domisili, Afirmasi, Prestasi, Mutasi sesuai jenjang) dan Template Sekolah Swasta/Mandiri (Reguler, Prestasi/Beasiswa, Inden). Mendukung tambah jalur kustom, edit kuota, aktifkan/nonaktifkan, dan hapus.
- Menu 5 — Pembayaran SPMB:
  * Mode 1 — Gratis (Rp 0): Tanpa biaya pendaftaran; formulir publik melewati tahap pembayaran.
  * Mode 2 — Transfer Bank / QRIS Lembaga (0% Potongan): Dana masuk 100% langsung ke rekening bank atau QRIS milik lembaga/yayasan. Mendukung multi-rekening bank, gambar QRIS, Kode Unik 3 Digit otomatis di akhir nominal, opsi Bisa Diangsur / Cicilan (DP) beserta nominal minimal DP dan maksimal angsuran, serta aturan tahan cetak kartu sebelum pembayaran dikonfirmasi.
  * Mode 3 — Virtual Account (VA) Otomatis / Link Pembayaran: Pembayaran terverifikasi otomatis. Pendaftaran awal via VA dikenakan Dana Kemitraan ${s.platformRegFeeLabel}/transaksi lunas dan sisanya otomatis masuk ke Saldo Yayasan yang dapat ditarik (Withdraw) ke rekening lembaga.
- Menu 6 — Syarat Berkas & Formulir:
  * Mengatur dokumen persyaratan (KK, Akta, Ijazah/SKL, dll.), status Wajib/Opsional, metode unggah (Scan Kamera Langsung & Upload File, Hanya PDF, atau Hanya Kamera), dan batas kapasitas file hingga 500 MB / 1 GB.
  * Menambahkan pertanyaan formulir kustom (teks singkat, paragraf, angka).

4. ALUR PORTAL CALON PESERTA DIDIK (/daftar/[slug]):
- Terdiri dari 2 tab utama: "Formulir Pendaftaran Baru" dan "Cek Status & Cetak Kartu".
- Formulir dirancang eye-friendly fokus 1 kolom dalam 4 langkah ringkas:
  * Langkah 1: Pilih Jalur Pendaftaran (melihat deskripsi dan sisa kursi tiap jalur).
  * Langkah 2: Isi Biodata Calon Peserta Didik & Wali (dilengkapi panduan NIK 16 digit pribadi sesuai KTP, KIA, atau baris nama pendaftar di Kartu Keluarga).
  * Langkah 3: Unggah Pas Foto (otomatis terpasang ke Kartu Bukti Pendaftaran) & Berkas Persyaratan via tombol "Scan Kamera Langsung" atau "Pilih File (PDF / Galeri)".
  * Langkah 4: Konfirmasi Pembayaran (pilih Bayar Lunas Sekaligus atau Bayar DP/Angsuran jika diaktifkan, salin nominal + kode unik 3 digit, salin rekening/QRIS, dan unggah bukti transfer).
- Setelah dikirim, Kartu Tanda Bukti Pendaftaran resmi berlogo lembaga dan QR Code langsung diterbitkan dan dapat dicetak PDF atau dikirim ke WhatsApp.
- Melalui tab "Cek Status & Cetak Kartu", pendaftar lama dapat mengecek status seleksi memakai Nomor Registrasi + NIK/No. WA Wali, mencetak ulang kartu, atau mengunggah bukti pelunasan angsuran.

5. MODEL SAAS HIBRIDA (KAPASITAS PENYIMPANAN CLOUD, SALDO YAYASAN & DAFTAR ULANG):
- Kapasitas Penyimpanan Cloud (Jalur Gratis / Mandiri): Setiap lembaga memperoleh 30 slot gratis di awal. Jika pendaftar ke-31 dst masuk saat kapasitas penuh, calon siswa tetap bisa mendaftar normal (data tidak hilang), namun tampilan biodata & PDF-nya terkunci sementara di dashboard admin sampai lembaga menambah Paket Kapasitas Penyimpanan Cloud (Paket Starter 50 Kuota Rp 250.000, Paket Standar 200 Kuota Rp 600.000, dan Paket Jumbo 500 Kuota Rp 1.000.000 — berlaku selamanya tanpa masa kedaluwarsa).
- Fase Daftar Ulang (Opt-In): Lembaga dapat memilih Opsi Manual (Gratis, verifikasi tunai/transfer langsung tanpa potongan Rp 0) atau Opsi Otomatis Virtual Account (Dana Kemitraan ${s.platformReRegFeeLabel}/transaksi lunas, sisanya masuk ke Saldo Yayasan).
`;
}

export function generateDeepAdminAnswer(prompt: string, s: SchoolRealtimeSnapshot): string {
  const q = prompt.toLowerCase();

  // 1. Pertanyaan menyeluruh tentang "seluk beluk", "fitur", "cara kerja", atau "apa saja" di DaftarKu
  if (
    q.includes('seluk beluk') ||
    q.includes('semua fitur') ||
    q.includes('fitur apa') ||
    q.includes('cara kerja aplikasi') ||
    q.includes('tentang daftarku') ||
    q.includes('panduan lengkap') ||
    q.includes('menu apa')
  ) {
    return (
      `Berikut adalah panduan menyeluruh mengenai *seluk-beluk fitur dan alur kerja aplikasi DaftarKu* yang saat ini mengelola SPMB *${s.schoolName}*:\n\n` +
      `*1. Arsitektur 3 Pintu Akses Terintegrasi*\n` +
      `• *Portal Pendaftaran Publik (${s.portalLink}):* Halaman khusus calon peserta didik & wali murid yang ramah HP, eye-friendly, dan menyesuaikan warna identitas serta jenjang lembaga (*${s.schoolLevel}*).\n` +
      `• *Kartu Peserta Digital (/kartu/[nomor]):* Halaman resmi berlogo lembaga lengkap dengan pas foto siswa, strip warna identitas, dan QR Code verifikasi yang dapat dicetak PDF atau dikirim langsung ke WhatsApp wali murid.\n` +
      `• *Dashboard Admin Lembaga (/dashboard):* Pusat kendali panitia yang tersusun dalam *6 menu utama*.\n\n` +
      `*2. Fungsi Lengkap 6 Menu Dashboard Admin*\n` +
      `• *Pusat Kendali & Pendaftar:* Bagikan link daftar, buka/tutup portal instan, pantau *Diagram Lingkaran & Grafik Batang Persentase Kuota per Gelombang*, periksa file berkas unggahan, cocokkan mutasi transfer + *kode unik 3 digit*, tetapkan kelulusan (*Berkas Valid, Diterima, Cadangan, Tidak Diterima*), catat *Daftar Ulang*, kirim kartu ke *WhatsApp Wali*, serta *Unduh Excel (.xls) / CSV Siap Dapodik & EMIS*.\n` +
      `• *Profil & Warna Lembaga:* Atur identitas untuk *19 jenjang pendidikan* (TK/RA/KB/TPA, SD/MI, SMP/MTs, SMA/MA/SMK/MAK, TPQ, SLB, Asrama, Pondok Pesantren, Pendidikan Diniyah, Boarding School, hingga Perguruan Tinggi/Kampus), unggah Logo, Banner, Foto Lembaga, Visi/Misi, Keunggulan, dan Warna Tema.\n` +
      `• *Jadwal Gelombang:* Kelola Gelombang 1, 2, 3, dst. lengkap dengan kuota kursi, tanggal, tarif gelombang, dan benefit khusus.\n` +
      `• *Jalur & Kuota:* Tersedia template 1 klik untuk *Sekolah Negeri* (Domisili, Afirmasi, Prestasi, Mutasi) maupun *Sekolah Swasta/Mandiri* (Reguler, Beasiswa, Inden).\n` +
      `• *Pembayaran SPMB:* Mendukung 3 mode (*Gratis Rp 0*, *Transfer Bank/QRIS Lembaga 0% potongan* dengan kode unik 3 digit & opsi *Cicilan DP*, serta *Virtual Account Otomatis* dengan *Saldo Yayasan*).\n` +
      `• *Syarat Berkas & Formulir:* Atur berkas persyaratan dengan dukungan *Scan Kamera Langsung* maupun unggah file besar hingga *500 MB / 1 GB*, plus kolom pertanyaan kustom.\n\n` +
      `*3. Posisi Data ${s.schoolName} Saat Ini*\n` +
      `• Gelombang aktif: *${s.waveLabel}* — terisi *${s.waveFilled}/${s.waveQuota} kursi (${s.fillPercent}%)*.\n` +
      `• Mode pembayaran tersimpan: *${s.currentPaymentModeLabel}*.\n` +
      `• Sisa *Kapasitas Penyimpanan Cloud*: *${s.quotaBalance} slot* | *Saldo Yayasan*: *${s.foundationBalanceLabel}*.\n\n` +
      `Silakan tanyakan bagian mana pun secara lebih spesifik (misalnya *alur verifikasi & kirim WA*, *skema bagi hasil & Saldo Yayasan*, *ekspor Dapodik/EMIS*, atau *pengaturan jalur & berkas*) untuk penjelasan langkah demi langkah!`
    );
  }

  // 2. Bagi hasil, potongan, QRIS, Transfer Bank, VA, Saldo Yayasan, Withdraw
  if (
    q.includes('bagi hasil') ||
    q.includes('potong') ||
    q.includes('qris') ||
    q.includes('va') ||
    q.includes('virtual') ||
    q.includes('tf') ||
    q.includes('transfer') ||
    q.includes('kemitraan') ||
    q.includes('saldo yayasan') ||
    q.includes('withdraw') ||
    q.includes('tarik dana')
  ) {
    return (
      `Berikut rincian lengkap *aturan bagi hasil, potongan biaya, dan pengelolaan Saldo Yayasan* pada DaftarKu untuk *${s.schoolName}*:\n\n` +
      `*1. Transfer Bank Manual Rekening Sekolah (0% Potongan / Tanpa Bagi Hasil)*\n` +
      `• Pada mode *Transfer Bank / QRIS Lembaga*, dana pendaftaran dari wali murid masuk *100% langsung ke rekening bank atau QRIS milik sekolah/yayasan*.\n` +
      `• Sistem DaftarKu *tidak mengambil potongan atau bagi hasil sepeser pun*.\n` +
      `• Sistem otomatis menambahkan *kode unik 3 digit* di akhir nominal transfer agar bendahara mudah mencocokkan mutasi rekening saat memeriksa bukti bayar.\n\n` +
      `*2. QRIS Dinamis & Virtual Account (VA) Otomatis (Terintegrasi Payment Gateway — Tanpa Perlu Punya QRIS Sendiri)*\n` +
      `• Jika lembaga memilih pembayaran otomatis via Virtual Account (VA), dikenakan *Dana Kemitraan* sebesar *${s.platformRegFeeLabel} per transaksi pendaftaran awal* yang lunas.\n` +
      `• Contoh simulasi: Tagihan pendaftaran *Rp 150.000* otomatis terbagi menjadi *Rp 145.000* masuk ke *Saldo Yayasan* milik sekolah dan *${s.platformRegFeeLabel}* sebagai Dana Kemitraan sistem.\n` +
      `• Dana di *Saldo Yayasan* dapat ditarik (*Withdraw*) kapan saja ke rekening bank resmi lembaga.\n\n` +
      `*3. Fase Daftar Ulang (Opt-In)*\n` +
      `• *Opsi Manual (Gratis):* Pembayaran daftar ulang tunai atau transfer langsung ke sekolah *tanpa potongan (Rp 0)*.\n` +
      `• *Opsi Otomatis (VA):* Menggunakan VA dinamis dengan Dana Kemitraan *${s.platformReRegFeeLabel} per transaksi*, sedangkan sisanya masuk ke Saldo Yayasan.\n\n` +
      `*4. Status Lembaga Anda Saat Ini*\n` +
      `• Mode tersimpan: *${s.currentPaymentModeLabel}* | Saldo Yayasan: *${s.foundationBalanceLabel}* | Sisa *Kapasitas Penyimpanan Cloud*: *${s.quotaBalance} slot*.`
    );
  }

  // 3. Tampilan halaman pendaftar, warna, banner, logo, jenjang
  if (
    q.includes('tampilan') ||
    q.includes('merbah') ||
    q.includes('rubah') ||
    q.includes('ubah') ||
    q.includes('ganti') ||
    q.includes('tema') ||
    q.includes('warna') ||
    q.includes('banner') ||
    q.includes('logo') ||
    q.includes('desain') ||
    q.includes('jenjang')
  ) {
    return (
      `Admin *${s.schoolName}* dapat menyesuaikan tampilan *Halaman Pendaftaran Publik* (${s.portalLink}) langsung dari dashboard:\n\n` +
      `*1. Warna Identitas, Logo, Banner & Foto Lembaga (Menu Profil & Warna Lembaga)*\n` +
      `• Pilih *19 jenjang satuan pendidikan* secara spesifik (TK, RA, KB, TPA, SD, MI, SMP, MTs, SMA, MA, SMK, MAK, TPQ, SLB, Asrama, Pondok Pesantren, Pendidikan Diniyah, Boarding School, hingga Perguruan Tinggi/Kampus).\n` +
      `• Ganti *Warna Identitas* (otomatis mengubah warna header portal, tombol utama, bilah progres, dan Kartu Bukti Pendaftaran).\n` +
      `• Unggah *Logo Lembaga*, *Banner Sampul*, *Foto Gedung/Kegiatan*, *Visi/Tagline*, *Poin Keunggulan*, serta *Catatan Kartu*.\n\n` +
      `*2. Gelombang, Benefit & Status Buka/Tutup (Menu Jadwal Gelombang & Pusat Kendali)*\n` +
      `• Ubah nama gelombang, periode pendaftaran, kuota kursi, dan poin benefit bagi pendaftar.\n` +
      `• Gunakan tombol *Tutup/Buka Pendaftaran* di *Pusat Kendali & Pendaftar* untuk mengontrol akses formulir publik.\n\n` +
      `*3. Jalur, Syarat Berkas & Pertanyaan Tambahan*\n` +
      `• Atur pilihan jalur di menu *Jalur & Kuota*, serta atur syarat berkas maupun pertanyaan kustom di menu *Syarat Berkas & Formulir*.`
    );
  }

  // 4. Kapasitas Penyimpanan Cloud & Soft-Limit 30 slot
  if (
    q.includes('kapasitas') ||
    q.includes('cloud') ||
    q.includes('penyimpanan') ||
    q.includes('kunci') ||
    q.includes('blur') ||
    q.includes('30') ||
    q.includes('slot')
  ) {
    return (
      `Berikut cara kerja *Kapasitas Penyimpanan Cloud* pada aplikasi DaftarKu:\n\n` +
      `• *30 Slot Gratis di Awal:* Setiap lembaga mendapatkan *30 slot Kapasitas Penyimpanan Cloud gratis* untuk 30 pendaftar pertama (sisa milik *${s.schoolName}*: *${s.quotaBalance} slot*).\n` +
      `• *Perlindungan Pendaftar (Soft-Limit):* Jika pendaftar ke-31 dan seterusnya mendaftar saat kapasitas habis, calon peserta didik *tetap bisa mengisi formulir dan datanya tersimpan aman* di database sehingga sekolah tidak kehilangan pendaftar.\n` +
      `• *Pembukaan Akses Data:* Biodata dan berkas PDF pendaftar ke-31 dst akan terkunci sementara di dashboard admin sampai lembaga menambahkan *Paket Kapasitas Penyimpanan Cloud* (+200 slot data pendaftar), yang otomatis membuka seluruh kunci data pendaftar tersebut.`
    );
  }

  // 5. Verifikasi, Kartu Peserta, WA Wali, Daftar Ulang, & Ekspor Dapodik/EMIS
  if (
    q.includes('verifikasi') ||
    q.includes('dapodik') ||
    q.includes('emis') ||
    q.includes('excel') ||
    q.includes('csv') ||
    q.includes('kartu') ||
    q.includes('daftar ulang') ||
    q.includes('cicil') ||
    q.includes('angsur')
  ) {
    return (
      `Panduan *Alur Verifikasi Panitia, Pengiriman Kartu ke WA, Daftar Ulang, & Ekspor Dapodik/EMIS*:\n\n` +
      `*1. Pemeriksaan Berkas & Kode Unik (Menu Pusat Kendali & Pendaftar)*\n` +
      `• Klik tombol *Periksa* pada baris nama pendaftar untuk meninjau file berkas unggahan (KK, Akta, Pas Foto) dan mencocokkan nominal transfer + *kode unik 3 digit* dengan mutasi rekening.\n\n` +
      `*2. Penetapan Kelulusan & Kirim Kartu Peserta ke WA Wali*\n` +
      `• Pilih status (*Menunggu Verifikasi, Berkas Valid, Diterima, Cadangan, atau Tidak Diterima*), lalu klik *Simpan & Kirim Kartu Peserta ke WA Wali*.\n` +
      `• WhatsApp otomatis terbuka dengan pesan resmi beserta tautan *Kartu Tanda Bukti Pendaftaran* yang siap dicetak orang tua.\n\n` +
      `*3. Konfirmasi Daftar Ulang & Pelunasan Cicilan*\n` +
      `• Centang opsi *"Konfirmasi Sudah Daftar Ulang"* di laci pemeriksaan siswa saat siswa menyelesaikan daftar ulang.\n` +
      `• Jika pendaftar sebelumnya membayar Uang Muka (DP), wali murid dapat mengunggah bukti pelunasan angsuran melalui tab *Cek Status & Cetak Kartu* di portal pendaftaran.\n\n` +
      `*4. Ekspor Excel (.xls) & CSV Siap Dapodik / EMIS*\n` +
      `• Klik tombol hijau *Unduh Excel (.xls) Siap Dapodik / EMIS* di atas tabel pendaftar. Kolom NIK 16 digit dan nomor WhatsApp sudah diproteksi sebagai teks agar tidak rusak saat dibuka di Excel.`
    );
  }

  // 6. Jalur & Gelombang
  if (q.includes('jalur') || q.includes('gelombang') || q.includes('negeri') || q.includes('swasta')) {
    return (
      `Pengaturan *Jadwal Gelombang & Jalur Pendaftaran* di *${s.schoolName}*:\n\n` +
      `*1. Jadwal Multi-Gelombang (Menu Jadwal Gelombang)*\n` +
      `• Anda dapat membuat beberapa gelombang (*Gelombang 1, Gelombang 2, Gelombang 3, dst.*), mengatur kuota kursi masing-masing gelombang, dan memantau persentase keterisiannya melalui *Diagram Kuota Gelombang* di Pusat Kendali.\n` +
      `• Gelombang aktif saat ini: *${s.waveLabel}* (${s.waveFilled}/${s.waveQuota} kursi, sisa *${s.waveRemaining} kursi*).\n\n` +
      `*2. Jalur Pendaftaran Negeri & Swasta (Menu Jalur & Kuota)*\n` +
      `• Tersedia tombol template instan untuk *Sekolah Negeri (Kemendikdasmen)* (*Domisili, Afirmasi, Prestasi, Mutasi*) dan *Sekolah Swasta / Mandiri* (*Reguler, Prestasi/Beasiswa, Inden*).\n` +
      `• Jalur aktif Anda saat ini:\n${s.pathList}`
    );
  }

  // 7. Broadcast WA Promosi
  if (q.includes('broadcast') || q.includes('promosi') || q.includes('ajak') || q.includes('iklan')) {
    return (
      `*PENERIMAAN PESERTA DIDIK BARU (SPMB)*\n` +
      `*${s.schoolName.toUpperCase()}*\n` +
      `${s.waveLabel}\n\n` +
      `Assalamu'alaikum / Salam Sejahtera Ayah & Bunda,\n` +
      `Pendaftaran peserta didik baru di *${s.schoolName}* telah resmi dibuka! Kuota tersedia terbatas (*sisa ${s.waveRemaining} dari ${s.waveQuota} kursi*).\n\n` +
      `${s.benefits && s.benefits !== '-' ? `🎁 *Keuntungan Gelombang Ini:*\n${s.benefits}\n\n` : ''}` +
      `📋 *Pilihan Jalur Pendaftaran:*\n${s.pathList}\n\n` +
      `💰 *Biaya Pendaftaran:* ${s.feeInfo}\n` +
      `🗓️ *Batas Pendaftaran:* ${s.endDateLabel}\n\n` +
      `Daftar praktis dari rumah melalui HP (cukup foto berkas & langsung terbit Kartu Peserta resmi):\n` +
      `👉 ${s.portalLink}\n\n` +
      `Mari bergabung bersama keluarga besar *${s.schoolName}*!`
    );
  }

  // 8. Pengumuman Kelulusan
  if (q.includes('pengumuman') || q.includes('lulus')) {
    return (
      `*PENGUMUMAN HASIL SELEKSI SPMB*\n` +
      `*${s.schoolName.toUpperCase()}*\n\n` +
      `Assalamu'alaikum / Salam Sejahtera Bapak/Ibu Orang Tua/Wali,\n\n` +
      `Berdasarkan hasil verifikasi berkas dan seleksi Panitia SPMB *${s.schoolName}*, kami sampaikan bahwa pemeriksaan data pendaftaran pada *${s.waveLabel}* telah selesai dilaksanakan.\n\n` +
      `Silakan cek status kelulusan resmi serta unduh/cetak *Kartu Peserta* melalui tautan portal berikut:\n` +
      `👉 ${s.portalLink}\n` +
      `*(Pilih tab "Cek Status & Cetak Kartu", lalu masukkan Nomor Registrasi dan NIK/No. WA)*\n\n` +
      `Bagi peserta didik yang dinyatakan *DITERIMA*, dimohon segera melakukan proses *Daftar Ulang* sesuai jadwal dan ketentuan pada kartu peserta.\n\n` +
      `Hormat kami,\n*Panitia SPMB ${s.schoolName}*`
    );
  }

  // 9. Analisis Kuota & Strategi
  if (q.includes('analisis') || q.includes('kuota') || q.includes('strategi') || q.includes('evaluasi')) {
    return (
      `📊 *Laporan Analisis Keterisian Kuota ${s.schoolName}*\n\n` +
      `*1. Posisi Kuota Gelombang Aktif*\n` +
      `• Gelombang: *${s.waveLabel}*\n` +
      `• Keterisian saat ini: *${s.waveFilled} dari ${s.waveQuota} kursi (${s.fillPercent}%)* — tersisa *${s.waveRemaining} kursi*.\n` +
      `• Progres administrasi: *${s.pendingCount}* menunggu verifikasi, *${s.verifiedCount}* berkas valid, *${s.acceptedCount}* diterima, dan *${s.reRegisteredCount}* sudah daftar ulang.\n\n` +
      `*2. Rekomendasi 3 Langkah Praktis untuk Panitia*\n` +
      `• *Sebar Broadcast WA ke Grup Wali & Sekolah Asal:* Gunakan template *Buat Broadcast WA Promosi* di tab Pustaka Prompt dan bagikan ke grup orang tua serta sekolah jenjang sebelumnya.\n` +
      `• *Percepat Verifikasi & Kirim Kartu WA:* Segera periksa *${s.pendingCount}* pendaftar baru agar wali murid langsung menerima kartu peserta via WhatsApp.\n` +
      `• *Optimalkan Benefit Gelombang (${s.endDateLabel}):* Pastikan keuntungan gelombang aktif tertulis jelas agar calon pendaftar segera mendaftar sebelum batas waktu berakhir.`
    );
  }

  // 10. Jawaban Default Lengkap (Saat pertanyaan bebas/umum)
  return (
    `Halo Admin *${s.schoolName}*! Saya menguasai seluruh fitur dan alur kerja aplikasi *DaftarKu*. Berikut ringkasan kondisi lembaga Anda saat ini beserta panduan topik yang bisa langsung kita bahas:\n\n` +
    `*Ringkasan Real-Time ${s.schoolName}:*\n` +
    `• *Gelombang & Kuota:* ${s.waveLabel} — terisi *${s.waveFilled}/${s.waveQuota} kursi (${s.fillPercent}%)*.\n` +
    `• *Pembayaran:* ${s.currentPaymentModeLabel} (${s.feeInfo}).\n` +
    `• *Kapasitas & Saldo:* Sisa *${s.quotaBalance} slot* Kapasitas Penyimpanan Cloud | Saldo Yayasan *${s.foundationBalanceLabel}*.\n\n` +
    `*Topik Seluk-Beluk DaftarKu yang Bisa Anda Tanyakan:*\n` +
    `• *"Jelaskan seluk-beluk semua fitur dan 6 menu di aplikasi DaftarKu"*\n` +
    `• *"Bagaimana aturan bagi hasil, QRIS, Transfer Bank, VA, dan penarikan Saldo Yayasan?"*\n` +
    `• *"Bagaimana cara mengubah tampilan warna, banner, logo, dan jenjang halaman pendaftar?"*\n` +
    `• *"Bagaimana alur verifikasi berkas, kirim kartu WA, daftar ulang, dan ekspor Excel Dapodik/EMIS?"*\n` +
    `• *"Bagaimana cara kerja Kapasitas Penyimpanan Cloud 30 slot gratis?"*`
  );
}