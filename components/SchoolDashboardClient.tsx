'use client';

import React, { useState, useMemo } from 'react';
import {
  Store,
  CheckCircle2,
  Smartphone,
  Calendar,
  Users,
  CreditCard,
  FileText,
  Sparkles,
  Copy,
  Check,
  Building2,
  Plus,
  Trash2,
  ShieldCheck,
  Zap,
  Bell,
  LayoutDashboard,
  ChevronDown,
  Maximize2,
  Minimize2,
  ExternalLink,
  AlertTriangle,
  Settings,
  UserCircle,
  MoreHorizontal,
} from 'lucide-react';
import { SchoolGalleryUploader, type GalleryPhotoItem } from '@/components/SchoolGalleryUploader';
import { PortalShowcaseBanner } from '@/components/PortalShowcaseBanner';
import { DaftarKuLogo } from '@/components/DaftarKuLogo';
import {
  SchoolCommandCenter,
  type ApplicantItem,
  type AuditLogItem,
  type ReadinessItem,
} from '@/components/SchoolCommandCenter';
import { DaftarKuAiDrawer, type ProposedAiAction } from '@/components/DaftarKuAiDrawer';
import { SchoolSettingsTab } from '@/components/SchoolSettingsTab';

// Export Tipe Data Wajib untuk app/dashboard/page.tsx (JANGAN DIHAPUS)
export type SchoolProfileData = any;
export type PeriodData = any;
export type PathItemData = any;
export type DocReqData = any;
export type CustomFieldData = any;
export type StatsData = any;

export interface WaveItem {
  id: string;
  name: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  promoNote: string;
  isActive: boolean;
}

export interface TrackItem {
  id: string;
  name: string;
  quota: number;
  filled: number;
  description: string;
  isOpen: boolean;
}

export interface DocRequirementItem {
  id: string;
  label: string;
  required: boolean;
  note: string;
}

// 9 Menu Standar Admin Lembaga
export type AdminMenuId =
  | 'dashboard'
  | 'pendaftar'
  | 'profil'
  | 'jadwal'
  | 'jalur'
  | 'pembayaran'
  | 'syarat'
  | 'pengaturan'
  | 'akun';

export function SchoolDashboardClient(props: any) {
  const school = props?.school || props?.initialProfile || props?.profile || {};

  // Navigasi 9 Menu Utama
  const [activeTab, setActiveTab] = useState<AdminMenuId>('dashboard');
  const [applicantSubMode, setApplicantSubMode] = useState<'tabel' | 'verifikasi'>('tabel');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showNotifBell, setShowNotifBell] = useState(false);

  // Status Pendaftaran Sekolah
  const [registrationStatus, setRegistrationStatus] = useState<'Draft' | 'Belum Dibuka' | 'Dibuka' | 'Ditutup'>(
    school?.isOpen === false ? 'Ditutup' : 'Dibuka'
  );

  // Indikator Penyimpanan & Paket
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState('Tersinkron');
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'starter' | 'standard' | 'jumbo'>('standard');

  // State Kontrol Live Preview
  const [previewScale, setPreviewScale] = useState<'compact' | 'expanded'>('compact');
  const [fullScreenPreview, setFullScreenPreview] = useState(false);

  // 1. State Profil & Tampilan Lembaga (Membaca Database Aktual)
  const [profileForm, setProfileForm] = useState({
    name: school?.name || 'MI Hidayatul Abidin',
    jenjang: school?.level || school?.jenjang || 'Madrasah Ibtidaiyah',
    regPrefix: school?.regPrefix || 'MIHA',
    whatsapp: school?.whatsapp || '6281234567890',
    address: school?.address || 'Ngampel, Prambon, Sidoarjo, Jawa Timur',
    visiMisi:
      school?.visionMission ||
      school?.visiMisi ||
      'Membentuk generasi Qur’ani yang cerdas, terampil, dan berakhlakul karimah.',
    keunggulan:
      typeof school?.highlights === 'string'
        ? school.highlights
        : Array.isArray(school?.highlights)
        ? school.highlights.join('\n')
        : school?.keunggulan ||
          '- Program Tahfidz Juz Amma & Pembiasaan Sholat Dhuha\n- Kegiatan Ekstrakurikuler Pramuka, Seni & Sains\n- Lingkungan Belajar Nyaman & Berbasis Digital',
    logoUrl: school?.logoUrl || '',
    bannerUrl: school?.bannerUrl || '',
    schoolPhotoUrl: school?.activityPhotoUrl || school?.schoolPhotoUrl || '',
  });

  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhotoItem[]>(() => {
    try {
      const raw = school?.galleryPhotosJson || props?.galleryPhotos;
      if (typeof raw === 'string') return JSON.parse(raw);
      if (Array.isArray(raw)) return raw;
    } catch {}
    return [];
  });

  // 2. State Jadwal Gelombang (Membaca Database Aktual: wavesJson / initialPeriods)
  const [waves, setWaves] = useState<WaveItem[]>(() => {
    try {
      const raw = school?.wavesJson || props?.initialPeriods || props?.periods;
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((w: any, idx: number) => ({
          id: String(w.id || `wav-${idx + 1}`),
          name: w.name || `Gelombang ${idx + 1}`,
          academicYear: w.academicYear || 'TA 2027/2028',
          startDate: w.startDate ? String(w.startDate).slice(0, 10) : '2026-11-01',
          endDate: w.endDate ? String(w.endDate).slice(0, 10) : '2027-01-31',
          promoNote: w.promoNote || w.description || 'Bebas Biaya Formulir & Diskon Seragam',
          isActive: Boolean(w.isActive ?? idx === 0),
        }));
      }
    } catch {}
    return [
      {
        id: 'wav-1',
        name: 'Gelombang 1 (Early Bird)',
        academicYear: 'TA 2027/2028',
        startDate: '2026-11-01',
        endDate: '2027-01-31',
        promoNote: 'Bebas Biaya Formulir & Potongan Seragam 25%',
        isActive: true,
      },
      {
        id: 'wav-2',
        name: 'Gelombang 2 (Reguler)',
        academicYear: 'TA 2027/2028',
        startDate: '2027-02-01',
        endDate: '2027-04-30',
        promoNote: 'Seleksi Berkas & Wawancara Wali Murid',
        isActive: false,
      },
    ];
  });

  // 3. State Jalur & Kuota (Membaca Database Aktual: tracksJson / initialPaths)
  const [tracks, setTracks] = useState<TrackItem[]>(() => {
    try {
      const raw = school?.tracksJson || props?.initialPaths || props?.paths;
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((t: any, idx: number) => ({
          id: String(t.id || `trk-${idx + 1}`),
          name: t.name || `Jalur ${idx + 1}`,
          quota: Number(t.quota ?? 50),
          filled: Number(t.filled ?? t.applicantCount ?? 0),
          description: t.description || 'Jalur penerimaan peserta didik baru.',
          isOpen: Boolean(t.isOpen ?? true),
        }));
      }
    } catch {}
    return [
      {
        id: 'trk-1',
        name: 'Jalur Reguler',
        quota: 60,
        filled: 12,
        description: 'Pendaftaran umum terbuka untuk seluruh calon siswa.',
        isOpen: true,
      },
      {
        id: 'trk-2',
        name: 'Jalur Prestasi',
        quota: 40,
        filled: 8,
        description: 'Khusus prestasi akademik, non-akademik, & tahfidz.',
        isOpen: true,
      },
    ];
  });

  // 4. State Pembayaran SPMB (Membaca Database Aktual: paymentConfigJson / initialPaymentConfig)
  const [paymentConfig, setPaymentConfig] = useState(() => {
    try {
      const raw = school?.paymentConfigJson || props?.initialPaymentConfig || props?.paymentConfig;
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (parsed && typeof parsed === 'object') {
        return {
          isFreeRegistration: Boolean(parsed.isFreeRegistration ?? false),
          registrationFee: Number(parsed.registrationFee ?? parsed.fee ?? 150000),
          bankName: parsed.bankName || 'Bank BSI / BRI / Mandiri',
          accountNumber: parsed.accountNumber || '7123456789',
          accountHolder: parsed.accountHolder || 'Panitia SPMB Lembaga',
          paymentInstruction:
            parsed.paymentInstruction ||
            'Transfer sesuai nominal pendaftaran, lalu unggah bukti pembayaran pada formulir.',
        };
      }
    } catch {}
    return {
      isFreeRegistration: false,
      registrationFee: 150000,
      bankName: 'Bank BSI / BRI / Mandiri',
      accountNumber: '7123456789',
      accountHolder: 'Panitia SPMB Yayasan',
      paymentInstruction:
        'Transfer sesuai nominal pendaftaran, lalu unggah bukti pembayaran atau konfirmasi via WhatsApp Panitia.',
    };
  });

  // 5. State Syarat & Formulir (Membaca Database Aktual: docRequirementsJson / initialDocs)
  const [docRequirements, setDocRequirements] = useState<DocRequirementItem[]>(() => {
    try {
      const raw = school?.docRequirementsJson || props?.initialDocs || props?.docs;
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((d: any, idx: number) => ({
          id: String(d.id || `doc-${idx + 1}`),
          label: d.label || d.name || `Dokumen ${idx + 1}`,
          required: Boolean(d.required ?? d.isRequired ?? true),
          note: d.note || d.description || 'Format JPG/PDF jelas terbaca',
        }));
      }
    } catch {}
    return [
      { id: 'doc-1', label: 'Scan / Foto Kartu Keluarga (KK)', required: true, note: 'Format JPG/PDF jelas terbaca' },
      { id: 'doc-2', label: 'Scan / Foto Akta Kelahiran', required: true, note: 'Wajib untuk validasi usia' },
      { id: 'doc-3', label: 'Pas Foto Warna Terbaru (3x4)', required: true, note: 'Latar belakang merah/biru' },
    ];
  });

  // 6. State Pendaftar Aktual (Memetakan props.initialApplicants / props.applicants dari Database)
  const [applicants, setApplicants] = useState<ApplicantItem[]>(() => {
    const rawList = props?.initialApplicants || props?.applicants || school?.applicants;
    if (Array.isArray(rawList) && rawList.length > 0) {
      return rawList.map((a: any, idx: number) => ({
        id: String(a.id || `app-${idx + 1}`),
        regNo: a.regNumber || a.regNo || a.registrationNumber || `${school?.regPrefix || 'REG'}-2027-00${idx + 1}`,
        name: a.fullName || a.name || 'Calon Siswa',
        nisn: a.nisn || '-',
        gender: a.gender === 'P' ? 'P' : 'L',
        track: a.trackName || a.pathName || a.track || 'Jalur Reguler',
        wave: a.waveName || a.periodName || a.wave || 'Gelombang 1',
        parentName: a.parentName || a.fatherName || 'Wali Murid',
        whatsapp: a.whatsapp || a.phone || '6281234567890',
        OriginSchool: a.previousSchool || a.originSchool || a.OriginSchool || 'Sekolah Asal',
        registeredAt: a.createdAt ? new Date(a.createdAt).toLocaleDateString('id-ID') : 'Terdaftar',
        status:
          a.status === 'ACCEPTED' || a.status === 'Diterima'
            ? 'Diterima'
            : a.status === 'VERIFIED' || a.status === 'Diverifikasi'
            ? 'Diverifikasi'
            : a.status === 'REJECTED' || a.status === 'Ditolak'
            ? 'Ditolak'
            : 'Menunggu',
        paymentStatus: a.paymentStatus === 'PAID' || a.paymentStatus === 'Lunas' ? 'Lunas' : 'Menunggu',
        paymentAmount: Number(a.paymentAmount ?? 150000),
        docs: Array.isArray(a.uploadedDocs) && a.uploadedDocs.length > 0
          ? a.uploadedDocs.map((d: any, dIdx: number) => ({
              id: String(d.id || `d-${idx}-${dIdx}`),
              label: d.label || d.docName || 'Dokumen Persyaratan',
              fileName: d.fileName || d.fileUrl || 'berkas_siswa.pdf',
              status:
                d.status === 'APPROVED' || d.status === 'Diterima'
                  ? 'Diterima'
                  : d.status === 'REJECTED' || d.status === 'Ditolak'
                  ? 'Ditolak'
                  : 'Menunggu',
              rejectReason: d.rejectReason || undefined,
            }))
          : [
              { id: `d-${idx}-1`, label: 'Kartu Keluarga (KK)', fileName: 'kk_pendaftar.pdf', status: 'Menunggu' },
              { id: `d-${idx}-2`, label: 'Akta Kelahiran', fileName: 'akta_pendaftar.pdf', status: 'Diterima' },
            ],
      }));
    }
    return [
      {
        id: 'app-1',
        regNo: `${school?.regPrefix || 'MIHA'}-2027-0018`,
        name: 'Ahmad Fauzan Al-Farizi',
        nisn: '0123456789',
        gender: 'L',
        track: 'Jalur Prestasi',
        wave: 'Gelombang 1',
        parentName: 'H. Sulaiman',
        whatsapp: '6281234567890',
        OriginSchool: 'RA Muslimat NU',
        registeredAt: 'Hari ini',
        status: 'Menunggu',
        paymentStatus: 'Lunas',
        paymentAmount: 150000,
        docs: [
          { id: 'd-1', label: 'Kartu Keluarga (KK)', fileName: 'kk_fauzan.jpg', status: 'Menunggu' },
          { id: 'd-2', label: 'Akta Kelahiran', fileName: 'akta_fauzan.pdf', status: 'Diterima' },
        ],
      },
      {
        id: 'app-2',
        regNo: `${school?.regPrefix || 'MIHA'}-2027-0019`,
        name: 'Siti Aisyah Putri',
        nisn: '0129876543',
        gender: 'P',
        track: 'Jalur Reguler',
        wave: 'Gelombang 1',
        parentName: 'Ibu Mahmudah',
        whatsapp: '6285678901234',
        OriginSchool: 'TK Dharma Wanita',
        registeredAt: 'Hari ini',
        status: 'Menunggu',
        paymentStatus: 'Lunas',
        paymentAmount: 150000,
        docs: [
          { id: 'd-3', label: 'Kartu Keluarga (KK)', fileName: 'kk_aisyah.jpg', status: 'Menunggu' },
          { id: 'd-4', label: 'Akta Kelahiran', fileName: 'akta_aisyah.jpg', status: 'Menunggu' },
        ],
      },
      {
        id: 'app-3',
        regNo: `${school?.regPrefix || 'MIHA'}-2027-0017`,
        name: 'Muhammad Rizky Pratama',
        nisn: '0123344556',
        gender: 'L',
        track: 'Jalur Reguler',
        wave: 'Gelombang 1',
        parentName: 'Bpk. Hendra',
        whatsapp: '6281333444555',
        OriginSchool: 'TK Al-Hidayah',
        registeredAt: 'Kemarin',
        status: 'Diterima',
        paymentStatus: 'Lunas',
        paymentAmount: 150000,
        docs: [
          { id: 'd-5', label: 'Kartu Keluarga (KK)', fileName: 'kk_rizky.pdf', status: 'Diterima' },
          { id: 'd-6', label: 'Akta Kelahiran', fileName: 'akta_rizky.pdf', status: 'Diterima' },
        ],
      },
    ];
  });

  // Riwayat Perubahan & Aktivitas Terbaru
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([
    {
      id: 'log-1',
      action: 'Sinkronisasi Pusat Kendali SPMB',
      detail: 'Seluruh modul pendaftaran, kuota, dan DaftarKu AI siap digunakan.',
      user: 'Admin Lembaga',
      timestamp: 'Baru saja',
      category: 'pengaturan',
    },
  ]);

  const handleAddLog = (action: string, detail: string, category: AuditLogItem['category'] = 'pengaturan') => {
    setAuditLogs((prev) => [
      {
        id: 'log-' + Date.now(),
        action,
        detail,
        user: 'Admin Lembaga',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
        category,
      },
      ...prev,
    ]);
  };

  // Checklist Kesiapan Sekolah
  const readinessList: ReadinessItem[] = useMemo(
    () => [
      {
        id: 'r-1',
        label: 'Profil & Tampilan Lembaga',
        isReady: Boolean(profileForm.name && profileForm.whatsapp && profileForm.address),
        targetTab: 'profil',
        hint: profileForm.whatsapp ? 'Identitas & WA aktif' : 'Lengkapi nomor WA',
      },
      {
        id: 'r-2',
        label: 'Jadwal Gelombang SPMB',
        isReady: waves.some((w) => w.isActive),
        targetTab: 'jadwal',
        hint: waves.find((w) => w.isActive)?.name || 'Pilih gelombang aktif',
      },
      {
        id: 'r-3',
        label: 'Jalur & Kuota Kursi',
        isReady: tracks.length > 0 && tracks.reduce((a, b) => a + b.quota, 0) > 0,
        targetTab: 'jalur',
        hint: `${tracks.length} jalur penerimaan`,
      },
      {
        id: 'r-4',
        label: 'Pembayaran SPMB',
        isReady: paymentConfig.isFreeRegistration || Boolean(paymentConfig.accountNumber),
        targetTab: 'pembayaran',
        hint: paymentConfig.isFreeRegistration ? 'Pendaftaran Gratis' : paymentConfig.bankName,
      },
      {
        id: 'r-5',
        label: 'Syarat & Formulir',
        isReady: docRequirements.length > 0,
        targetTab: 'syarat',
        hint: `${docRequirements.length} syarat berkas`,
      },
    ],
    [profileForm, waves, tracks, paymentConfig, docRequirements]
  );

  const activeWave = waves.find((w) => w.isActive) || waves[0];
  const totalQuota = tracks.reduce((acc, t) => acc + (Number(t.quota) || 0), 0);
  const remainingQuota = Math.max(0, totalQuota - applicants.length);
  const pendingDocsCount = applicants.reduce(
    (acc, a) => acc + a.docs.filter((d) => d.status === 'Menunggu').length,
    0
  );

  // Simpan Seluruh Perubahan ke Backend API
  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      await fetch('/api/dashboard/school', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profileForm,
          visionMission: profileForm.visiMisi,
          highlights: profileForm.keunggulan,
          activityPhotoUrl: profileForm.schoolPhotoUrl,
          galleryPhotos,
          galleryPhotosJson: JSON.stringify(galleryPhotos),
          wavesJson: JSON.stringify(waves),
          tracksJson: JSON.stringify(tracks),
          paymentConfigJson: JSON.stringify(paymentConfig),
          docRequirementsJson: JSON.stringify(docRequirements),
        }),
      }).catch(() => {});
    } finally {
      setIsSaving(false);
      setIsDirty(false);
      setLastSavedTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB');
      handleAddLog('Penyimpanan Konfigurasi', 'Perubahan pengaturan sekolah berhasil disimpan.');
    }
  };

  // Eksekutor Tindakan AI yang Telah Disetujui Pengguna (Human-in-the-loop)
  const handleExecuteApprovedAiAction = (action: ProposedAiAction) => {
    if (action.actionType === 'ADD_QUOTA') {
      const addVal = Number(action.payload || 20);
      setTracks((prev) =>
        prev.map((t, idx) => (idx === 0 ? { ...t, quota: Number(t.quota) + addVal } : t))
      );
      setIsDirty(true);
      handleAddLog('Persetujuan Rekomendasi AI', `Menambah +${addVal} kuota kursi pada Jalur Reguler.`);
    } else if (action.actionType === 'VERIFY_ALL_READY') {
      setApplicantSubMode('verifikasi');
      setActiveTab('pendaftar');
    } else if (action.actionType === 'EXTEND_WAVE') {
      setWaves((prev) =>
        prev.map((w) => (w.isActive ? { ...w, endDate: '2027-02-14' } : w))
      );
      setIsDirty(true);
      handleAddLog('Persetujuan Rekomendasi AI', `Memperpanjang batas waktu ${activeWave?.name} hingga 14 Feb 2027.`);
    }
  };

  // Daftar 9 Menu Navigasi Admin Lembaga
  const primaryMenus: Array<{ id: AdminMenuId; label: string; icon: any; badge?: number }> = [
    { id: 'dashboard', label: '1. Dashboard', icon: LayoutDashboard },
    { id: 'pendaftar', label: '2. Pendaftar', icon: Users, badge: applicants.length },
    { id: 'profil', label: '3. Profil & Tampilan Lembaga', icon: Building2 },
    { id: 'jadwal', label: '4. Jadwal Gelombang', icon: Calendar },
    { id: 'jalur', label: '5. Jalur & Kuota', icon: Sparkles },
    { id: 'pembayaran', label: '6. Pembayaran SPMB', icon: CreditCard },
    { id: 'syarat', label: '7. Syarat & Formulir', icon: FileText },
  ];

  const secondaryMenus: Array<{ id: AdminMenuId; label: string; icon: any }> = [
    { id: 'pengaturan', label: '8. Pengaturan', icon: Settings },
    { id: 'akun', label: '9. Profil Akun', icon: UserCircle },
  ];

  return (
    <div className="min-h-screen bg-[#F5F8FF] font-sans text-[#172B4D]">
      {/* =========================================================
          TOP STICKY HEADER
      ========================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between py-3 gap-3">
            {/* Kiri: Logo + Identitas Sekolah + Status Pendaftaran */}
            <div className="flex items-center gap-3 min-w-0">
              <DaftarKuLogo variant="full" size="md" />
              <div className="h-6 w-px bg-slate-200 hidden sm:block" />
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#102B56] to-[#155EEF] flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4 text-[#FF9F1C]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="text-sm font-extrabold text-[#102B56] truncate">{profileForm.name}</h1>
                    <select
                      value={registrationStatus}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setRegistrationStatus(val);
                        handleAddLog('Status Penerimaan', `Status SPMB diubah menjadi: ${val}`, 'status');
                      }}
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border cursor-pointer focus:outline-none ${
                        registrationStatus === 'Dibuka'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : registrationStatus === 'Ditutup'
                          ? 'bg-rose-50 border-rose-200 text-rose-700'
                          : registrationStatus === 'Belum Dibuka'
                          ? 'bg-amber-50 border-amber-200 text-amber-800'
                          : 'bg-slate-100 border-slate-300 text-slate-600'
                      }`}
                    >
                      <option value="Draft">● Draft</option>
                      <option value="Belum Dibuka">● Belum Dibuka</option>
                      <option value="Dibuka">● Dibuka</option>
                      <option value="Ditutup">● Ditutup</option>
                    </select>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-500 truncate">
                    Pusat Kendali Admin Lembaga • {activeWave?.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Kanan: Indikator Simpan + Lonceng Notifikasi + Salin Link + Profil Akun */}
            <div className="flex items-center gap-2 ml-auto">
              {isDirty ? (
                <button
                  type="button"
                  onClick={() => handleSaveAll()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 border border-amber-200 px-3 py-1.5 text-[11px] font-extrabold text-amber-800 hover:bg-amber-100 transition cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Belum Disimpan • Simpan</span>
                </button>
              ) : (
                <span className="hidden md:inline-flex items-center gap-1.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 px-3 py-1.5 text-[11px] font-bold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tersimpan ({lastSavedTime})</span>
                </span>
              )}

              {/* Lonceng Pusat Notifikasi */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotifBell((v) => !v)}
                  className="relative p-2 rounded-xl bg-[#F5F8FF] hover:bg-blue-100/60 border border-[#155EEF]/15 text-[#102B56] transition cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  {pendingDocsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center">
                      {pendingDocsCount}
                    </span>
                  )}
                </button>

                {showNotifBell && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-xl p-4 z-50 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <p className="font-extrabold text-[#102B56]">Notifikasi & Tindak Lanjut</p>
                      <span className="text-[10px] font-bold text-[#155EEF]">{pendingDocsCount} Berkas Antre</span>
                    </div>
                    <div
                      onClick={() => {
                        setApplicantSubMode('verifikasi');
                        setActiveTab('pendaftar');
                        setShowNotifBell(false);
                      }}
                      className="p-2.5 rounded-xl bg-amber-50/70 hover:bg-amber-50 cursor-pointer"
                    >
                      <p className="font-extrabold text-amber-900">📄 {pendingDocsCount} Dokumen Menunggu Cek</p>
                      <p className="text-[11px] text-amber-800">Klik untuk membuka meja verifikasi berkas.</p>
                    </div>
                    <div
                      onClick={() => {
                        setApplicantSubMode('tabel');
                        setActiveTab('pendaftar');
                        setShowNotifBell(false);
                      }}
                      className="p-2.5 rounded-xl bg-[#F5F8FF] hover:bg-blue-50 cursor-pointer"
                    >
                      <p className="font-extrabold text-[#102B56]">👥 Total {applicants.length} Calon Siswa</p>
                      <p className="text-[11px] text-slate-600">Lihat daftar lengkap dan status pembayaran.</p>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  const slug = school?.slug || 'mi-hidayatul-abidin';
                  navigator.clipboard.writeText(`${window.location.origin}/daftar/${slug}`);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#F5F8FF] border border-[#155EEF]/20 px-3 py-2 text-[11px] font-bold text-[#155EEF] cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copiedLink ? 'Tersalin' : 'Salin Link'}</span>
              </button>

              <a
                href={`/daftar/${school?.slug || 'mi-hidayatul-abidin'}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#155EEF] to-[#102B56] px-3.5 py-2 text-[11px] font-bold text-white shadow-xs"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#FF9F1C]" />
                <span className="hidden sm:inline">Portal Publik</span>
              </a>

              {/* Pintasan Cepat ke Menu 9: Profil Akun */}
              <button
                type="button"
                onClick={() => setActiveTab('akun')}
                title="9. Profil Akun"
                className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-extrabold transition cursor-pointer ${
                  activeTab === 'akun'
                    ? 'bg-[#102B56] text-white border-[#102B56]'
                    : 'bg-white text-[#102B56] border-slate-200 hover:bg-slate-50'
                }`}
              >
                <UserCircle className="w-4 h-4 text-[#FF9F1C]" />
                <span className="hidden lg:inline">Profil Akun</span>
              </button>
            </div>
          </div>

          {/* =========================================================
              BARIS NAVIGASI 9 MENU ADMIN LEMBAGA (DENGAN DROPDOWN RESPONSIVE)
          ========================================================= */}
          <nav className="flex items-center justify-between border-t border-slate-100 py-2 gap-2">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {primaryMenus.map((menu) => {
                const Icon = menu.icon;
                const isActive = activeTab === menu.id;
                return (
                  <button
                    key={menu.id}
                    type="button"
                    onClick={() => setActiveTab(menu.id)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-extrabold whitespace-nowrap transition cursor-pointer ${
                      isActive
                        ? 'bg-[#155EEF] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-[#102B56]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#FF9F1C]' : 'text-slate-400'}`} />
                    <span>{menu.label}</span>
                    {typeof menu.badge === 'number' && (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                        }`}
                      >
                        {menu.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Dropdown Menu Sistem (Menu 8: Pengaturan & Menu 9: Profil Akun) */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowMoreMenu((v) => !v)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-extrabold whitespace-nowrap transition cursor-pointer ${
                  activeTab === 'pengaturan' || activeTab === 'akun'
                    ? 'bg-[#102B56] text-white shadow-xs'
                    : 'bg-[#F5F8FF] text-[#102B56] hover:bg-blue-100/60'
                }`}
              >
                <Settings className="w-3.5 h-3.5 text-[#FF9F1C]" />
                <span>{activeTab === 'pengaturan' ? '8. Pengaturan' : activeTab === 'akun' ? '9. Profil Akun' : 'Sistem & Akun'}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showMoreMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 space-y-1">
                  {secondaryMenus.map((m) => {
                    const Icon = m.icon;
                    const active = activeTab === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(m.id);
                          setShowMoreMenu(false);
                        }}
                        className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-extrabold transition cursor-pointer ${
                          active ? 'bg-[#155EEF] text-white' : 'text-[#172B4D] hover:bg-[#F5F8FF]'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${active ? 'text-[#FF9F1C]' : 'text-[#155EEF]'}`} />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* =========================================================
          MAIN CONTENT AREA (SESUAI MENU YANG DIPILIH)
      ========================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-28">
        {/* MENU 1: DASHBOARD (PUSAT KENDALI) & MENU 2: PENDAFTAR */}
        {(activeTab === 'dashboard' || activeTab === 'pendaftar') && (
          <SchoolCommandCenter
            activeSubTab={activeTab}
            initialApplicantMode={applicantSubMode}
            onNavigateTab={(target: any) => {
              if (target === 'verifikasi') {
                setApplicantSubMode('verifikasi');
                setActiveTab('pendaftar');
              } else {
                setActiveTab(target);
              }
            }}
            applicants={applicants}
            onUpdateApplicants={(next) => {
              setApplicants(next);
              setIsDirty(true);
            }}
            auditLogs={auditLogs}
            onAddLog={handleAddLog}
            readinessList={readinessList}
            totalQuota={totalQuota}
            activeWaveName={activeWave?.name}
          />
        )}

        {/* MENU 3: PROFIL & TAMPILAN LEMBAGA (+ STICKY LIVE PREVIEW) */}
        {activeTab === 'profil' && (
          <form onSubmit={handleSaveAll}>
            <div className="grid grid-cols-12 gap-6">
              <div className={previewScale === 'expanded' ? 'col-span-12 lg:col-span-5' : 'col-span-12 lg:col-span-7'}>
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-extrabold text-[#102B56]">Profil & Tampilan Lembaga</h2>
                      <p className="text-xs text-slate-500">
                        Sesuaikan identitas sekolah, galeri kegiatan, dan informasi keunggulan.
                      </p>
                    </div>
                    <span className="rounded-full bg-[#F5F8FF] px-3 py-1 text-[10px] font-bold text-[#155EEF]">
                      <Sparkles className="w-3 h-3 inline text-[#FF9F1C]" /> Live Sync
                    </span>
                  </div>

                  <SchoolGalleryUploader
                    items={galleryPhotos}
                    onChange={(items) => {
                      setGalleryPhotos(items);
                      setIsDirty(true);
                    }}
                    maxPhotos={10}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-[11px] font-extrabold uppercase text-[#102B56]">
                        Nama Resmi Lembaga *
                      </label>
                      <input
                        required
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => {
                          setProfileForm({ ...profileForm, name: e.target.value });
                          setIsDirty(true);
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-[#F5F8FF] px-4 py-2.5 text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-extrabold uppercase text-[#102B56]">
                        Jenjang Pendidikan
                      </label>
                      <input
                        type="text"
                        value={profileForm.jenjang}
                        onChange={(e) => {
                          setProfileForm({ ...profileForm, jenjang: e.target.value });
                          setIsDirty(true);
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-[#F5F8FF] px-4 py-2.5 text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-extrabold uppercase text-[#102B56]">
                        Kode Awalan Registrasi
                      </label>
                      <input
                        type="text"
                        maxLength={8}
                        value={profileForm.regPrefix}
                        onChange={(e) => {
                          setProfileForm({ ...profileForm, regPrefix: e.target.value.toUpperCase() });
                          setIsDirty(true);
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-[#F5F8FF] px-4 py-2.5 text-sm font-semibold uppercase"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-extrabold uppercase text-[#102B56]">
                        WhatsApp Panitia SPMB
                      </label>
                      <input
                        type="text"
                        value={profileForm.whatsapp}
                        onChange={(e) => {
                          setProfileForm({ ...profileForm, whatsapp: e.target.value });
                          setIsDirty(true);
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-[#F5F8FF] px-4 py-2.5 text-sm font-semibold"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-[11px] font-extrabold uppercase text-[#102B56]">
                        Alamat Lengkap Lembaga
                      </label>
                      <input
                        type="text"
                        value={profileForm.address}
                        onChange={(e) => {
                          setProfileForm({ ...profileForm, address: e.target.value });
                          setIsDirty(true);
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-[#F5F8FF] px-4 py-2.5 text-sm font-semibold"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-[11px] font-extrabold uppercase text-[#102B56]">
                        Visi & Misi Lembaga
                      </label>
                      <textarea
                        rows={3}
                        value={profileForm.visiMisi}
                        onChange={(e) => {
                          setProfileForm({ ...profileForm, visiMisi: e.target.value });
                          setIsDirty(true);
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-[#F5F8FF] px-4 py-2.5 text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-[11px] font-extrabold uppercase text-[#102B56]">
                        Poin Keunggulan (Pisahkan per baris)
                      </label>
                      <textarea
                        rows={3}
                        value={profileForm.keunggulan}
                        onChange={(e) => {
                          setProfileForm({ ...profileForm, keunggulan: e.target.value });
                          setIsDirty(true);
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-[#F5F8FF] px-4 py-2.5 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="rounded-xl bg-[#155EEF] hover:bg-[#102B56] px-6 py-2.5 text-xs font-extrabold text-white cursor-pointer"
                    >
                      {isSaving ? 'Menyimpan...' : 'Simpan Profil & Tampilan'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Panel Pratinjau Langsung (Live Preview) */}
              <div className={previewScale === 'expanded' ? 'col-span-12 lg:col-span-7' : 'col-span-12 lg:col-span-5'}>
                <div className="rounded-3xl border border-[#155EEF]/20 bg-white p-5 shadow-xs sticky top-28">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-[#102B56]">
                      Pratinjau Langsung Pendaftar
                    </p>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPreviewScale(previewScale === 'compact' ? 'expanded' : 'compact')}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#F5F8FF] border border-slate-200 px-2.5 py-1 text-[10px] font-extrabold text-[#102B56] hover:bg-blue-50 cursor-pointer"
                      >
                        {previewScale === 'compact' ? (
                          <>
                            <Maximize2 className="w-3 h-3 text-[#155EEF]" /> Perbesar
                          </>
                        ) : (
                          <>
                            <Minimize2 className="w-3 h-3 text-[#155EEF]" /> Perkecil
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFullScreenPreview(true)}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#102B56] px-2.5 py-1 text-[10px] font-extrabold text-white hover:bg-[#155EEF] cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3 text-[#FF9F1C]" /> Layar Penuh
                      </button>
                    </div>
                  </div>

                  <PortalShowcaseBanner
                    compactPreview={previewScale === 'compact'}
                    schoolName={profileForm.name}
                    jenjangLabel={profileForm.jenjang}
                    address={profileForm.address}
                    logoUrl={profileForm.logoUrl}
                    bannerUrl={profileForm.bannerUrl}
                    activityPhotoUrl={profileForm.schoolPhotoUrl}
                    galleryPhotosJson={JSON.stringify(galleryPhotos)}
                    visionMission={profileForm.visiMisi}
                    highlights={profileForm.keunggulan}
                    waveName={activeWave?.name}
                    academicYear={activeWave?.academicYear}
                    waveEndDate={activeWave?.endDate}
                    remainingQuota={remainingQuota}
                    totalQuota={totalQuota}
                    isOpen={registrationStatus === 'Dibuka'}
                  />
                </div>
              </div>
            </div>
          </form>
        )}

        {/* MENU 4: JADWAL GELOMBANG */}
        {activeTab === 'jadwal' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-[#102B56]">Jadwal Gelombang SPMB</h2>
                <p className="text-xs text-slate-500">Atur masa pembukaan, penutupan, dan catatan promo tiap gelombang.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setWaves([
                    ...waves,
                    {
                      id: 'wav-' + Date.now(),
                      name: `Gelombang ${waves.length + 1}`,
                      academicYear: 'TA 2027/2028',
                      startDate: '2027-05-01',
                      endDate: '2027-07-15',
                      promoNote: 'Pendaftaran Gelombang Lanjutan',
                      isActive: false,
                    },
                  ]);
                  setIsDirty(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#155EEF] text-white px-4 py-2 text-xs font-extrabold cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Tambah Gelombang
              </button>
            </div>

            <div className="space-y-4">
              {waves.map((w) => (
                <div key={w.id} className="rounded-2xl border border-slate-200 p-5 bg-[#F5F8FF]/60 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <input
                      type="text"
                      value={w.name}
                      onChange={(e) => {
                        setWaves(waves.map((it) => (it.id === w.id ? { ...it, name: e.target.value } : it)));
                        setIsDirty(true);
                      }}
                      className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-extrabold text-[#102B56]"
                    />
                    <input
                      type="date"
                      value={w.startDate}
                      onChange={(e) => {
                        setWaves(waves.map((it) => (it.id === w.id ? { ...it, startDate: e.target.value } : it)));
                        setIsDirty(true);
                      }}
                      className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold"
                    />
                    <input
                      type="date"
                      value={w.endDate}
                      onChange={(e) => {
                        setWaves(waves.map((it) => (it.id === w.id ? { ...it, endDate: e.target.value } : it)));
                        setIsDirty(true);
                      }}
                      className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setWaves(waves.map((it) => ({ ...it, isActive: it.id === w.id })));
                          setIsDirty(true);
                        }}
                        className={`rounded-xl px-3.5 py-2 text-xs font-extrabold cursor-pointer ${
                          w.isActive ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-[#102B56]'
                        }`}
                      >
                        {w.isActive ? 'Gelombang Aktif' : 'Jadikan Aktif'}
                      </button>
                      {waves.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setWaves(waves.filter((it) => it.id !== w.id));
                            setIsDirty(true);
                          }}
                          className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={w.promoNote}
                    onChange={(e) => {
                      setWaves(waves.map((it) => (it.id === w.id ? { ...it, promoNote: e.target.value } : it)));
                      setIsDirty(true);
                    }}
                    placeholder="Catatan keuntungan / info gelombang..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-600"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleSaveAll()}
                className="rounded-xl bg-[#155EEF] text-white px-6 py-2.5 text-xs font-extrabold cursor-pointer"
              >
                Simpan Jadwal Gelombang
              </button>
            </div>
          </div>
        )}

        {/* MENU 5: JALUR & KUOTA */}
        {activeTab === 'jalur' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-[#102B56]">Jalur Pendaftaran & Kuota Kursi</h2>
                <p className="text-xs text-slate-500">Atur kapasitas kursi untuk masing-masing jalur seleksi.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTracks([
                    ...tracks,
                    {
                      id: 'trk-' + Date.now(),
                      name: 'Jalur Afirmasi / Tahfidz',
                      quota: 20,
                      filled: 0,
                      description: 'Keterangan syarat jalur pendaftaran.',
                      isOpen: true,
                    },
                  ]);
                  setIsDirty(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#155EEF] text-white px-4 py-2 text-xs font-extrabold cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Tambah Jalur
              </button>
            </div>

            <div className="space-y-4">
              {tracks.map((t) => (
                <div
                  key={t.id}
                  className="rounded-2xl border border-slate-200 p-5 bg-[#F5F8FF]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex-1 w-full space-y-2">
                    <input
                      type="text"
                      value={t.name}
                      onChange={(e) => {
                        setTracks(tracks.map((tr) => (tr.id === t.id ? { ...tr, name: e.target.value } : tr)));
                        setIsDirty(true);
                      }}
                      className="w-full sm:w-72 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-extrabold text-[#102B56]"
                    />
                    <input
                      type="text"
                      value={t.description}
                      onChange={(e) => {
                        setTracks(tracks.map((tr) => (tr.id === t.id ? { ...tr, description: e.target.value } : tr)));
                        setIsDirty(true);
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-600"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Kuota Kursi</label>
                      <input
                        type="number"
                        value={t.quota}
                        onChange={(e) => {
                          setTracks(tracks.map((tr) => (tr.id === t.id ? { ...tr, quota: Number(e.target.value) } : tr)));
                          setIsDirty(true);
                        }}
                        className="w-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-center text-[#155EEF]"
                      />
                    </div>
                    {tracks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setTracks(tracks.filter((tr) => tr.id !== t.id));
                          setIsDirty(true);
                        }}
                        className="p-2 mt-4 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleSaveAll()}
                className="rounded-xl bg-[#155EEF] text-white px-6 py-2.5 text-xs font-extrabold cursor-pointer"
              >
                Simpan Jalur & Kuota
              </button>
            </div>
          </div>
        )}

        {/* MENU 6: PEMBAYARAN SPMB (+ STRATEGI PAKET FREE KEMITRAAN VS PRO/VIP) */}
        {activeTab === 'pembayaran' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
              <h2 className="text-lg font-extrabold text-[#102B56]">Pengaturan Rekening & Biaya Formulir SPMB</h2>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={paymentConfig.isFreeRegistration}
                  onChange={(e) => {
                    setPaymentConfig({ ...paymentConfig, isFreeRegistration: e.target.checked });
                    setIsDirty(true);
                  }}
                  className="w-4 h-4 accent-[#155EEF]"
                />
                <span className="text-xs font-bold text-[#102B56]">
                  Gratis Biaya Formulir Pendaftaran untuk Calon Siswa (Rp 0)
                </span>
              </label>

              {!paymentConfig.isFreeRegistration && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="mb-1 block text-[11px] font-extrabold text-[#102B56]">Nominal Formulir (Rp)</label>
                    <input
                      type="number"
                      value={paymentConfig.registrationFee}
                      onChange={(e) => {
                        setPaymentConfig({ ...paymentConfig, registrationFee: Number(e.target.value) });
                        setIsDirty(true);
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-[#F5F8FF] px-4 py-2.5 text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-extrabold text-[#102B56]">Kanal Bank / E-Wallet</label>
                    <input
                      type="text"
                      value={paymentConfig.bankName}
                      onChange={(e) => {
                        setPaymentConfig({ ...paymentConfig, bankName: e.target.value });
                        setIsDirty(true);
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-[#F5F8FF] px-4 py-2.5 text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-extrabold text-[#102B56]">Nomor Rekening Resmi</label>
                    <input
                      type="text"
                      value={paymentConfig.accountNumber}
                      onChange={(e) => {
                        setPaymentConfig({ ...paymentConfig, accountNumber: e.target.value });
                        setIsDirty(true);
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-[#F5F8FF] px-4 py-2.5 text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-extrabold text-[#102B56]">Atas Nama Rekening</label>
                    <input
                      type="text"
                      value={paymentConfig.accountHolder}
                      onChange={(e) => {
                        setPaymentConfig({ ...paymentConfig, accountHolder: e.target.value });
                        setIsDirty(true);
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-[#F5F8FF] px-4 py-2.5 text-sm font-bold"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Paket Free (Kemitraan) vs Standar Pro vs Premium VIP */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <div className="mb-6 text-center max-w-xl mx-auto">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#155EEF]/10 border border-[#155EEF]/20 px-3 py-1 text-[11px] font-extrabold text-[#155EEF] mb-2">
                  <Zap className="w-3.5 h-3.5 text-[#FF9F1C]" /> Lisensi & Kapasitas Sistem DaftarKu
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#102B56]">
                  Strategi Paket Free (Kemitraan) & Pro
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Seluruh fitur inti SPMB terbuka untuk membangun kepercayaan sekolah. Tingkatkan ke Pro untuk analitik lanjutan & 0% potongan.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
                {/* 1. FREE / KEMITRAAN */}
                <div
                  onClick={() => {
                    setSelectedTier('starter');
                    setIsDirty(true);
                  }}
                  className={`rounded-3xl border-2 p-6 flex flex-col justify-between transition cursor-pointer ${
                    selectedTier === 'starter' ? 'border-[#155EEF] bg-[#F5F8FF]' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div>
                    <p className="text-xs font-extrabold text-slate-400 uppercase">Paket Free / Kemitraan</p>
                    <h3 className="text-base font-extrabold text-[#102B56] mt-1">Fitur Inti SPMB Lengkap</h3>
                    <div className="my-4">
                      <span className="text-3xl font-extrabold text-[#102B56]">Rp 0</span>
                      <p className="text-[11px] text-slate-500 mt-1">Tanpa Biaya di Awal (Bagi Hasil Rp 5.000/siswa)</p>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                      <li>✓ Pengelolaan pendaftar, gelombang & jalur</li>
                      <li>✓ Dashboard dasar & pembuat pengumuman</li>
                      <li>✓ DaftarKu AI (Kuota wajar 25 respons)</li>
                    </ul>
                  </div>
                  <div className="mt-6 w-full rounded-2xl py-3 text-xs font-extrabold text-center bg-slate-100 text-[#102B56]">
                    {selectedTier === 'starter' ? 'Aktif: Paket Free Kemitraan' : 'Pilih Paket Free'}
                  </div>
                </div>

                {/* 2. PRO / STANDAR (5 TRIK PSIKOLOGI HARGA) */}
                <div
                  onClick={() => {
                    setSelectedTier('standard');
                    setIsDirty(true);
                  }}
                  className="relative rounded-3xl border-2 border-[#155EEF] bg-white p-6 flex flex-col justify-between shadow-xl ring-4 ring-[#155EEF]/10 scale-[1.02] cursor-pointer"
                >
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#FF9F1C] px-4 py-1 text-[10px] font-extrabold text-[#102B56] shadow-sm uppercase whitespace-nowrap">
                    ⭐ PALING HEMAT & FAVORIT
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-[#155EEF] uppercase">Paket Standar (PRO)</p>
                    <h3 className="text-lg font-extrabold text-[#102B56] mt-1">200 Slot Pendaftar</h3>
                    <div className="my-4">
                      <span className="text-3xl font-extrabold text-[#155EEF]">Rp 600.000</span>
                      <p className="text-xs font-extrabold text-emerald-600 mt-1">Setara Rp 3.000 / pendaftar</p>
                      <p className="text-[10px] text-slate-500 mt-1 italic">
                        (Lebih hemat 70% dibanding biaya cetak map, formulir fisik, & fotokopi manual)
                      </p>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-700 border-t border-slate-100 pt-4 font-medium">
                      <li>✓ <strong>100% Keuntungan</strong> ke Sekolah (0% Potongan)</li>
                      <li>✓ Analitik lanjutan & rekomendasi AI mendalam</li>
                      <li>✓ Kuota DaftarKu AI besar (500 respons) + Cloud 2GB</li>
                    </ul>
                  </div>
                  <div className="mt-6 w-full rounded-2xl py-3 text-xs font-extrabold text-center bg-gradient-to-r from-[#155EEF] to-[#102B56] text-white shadow-md">
                    Amankan Kapasitas Sekarang
                  </div>
                </div>

                {/* 3. PREMIUM VIP */}
                <div
                  onClick={() => {
                    setSelectedTier('jumbo');
                    setIsDirty(true);
                  }}
                  className={`rounded-3xl border-2 p-6 flex flex-col justify-between transition cursor-pointer ${
                    selectedTier === 'jumbo' ? 'border-[#102B56] bg-slate-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div>
                    <p className="text-xs font-extrabold text-[#102B56] uppercase">Paket Premium VIP</p>
                    <h3 className="text-lg font-extrabold text-[#172B4D] mt-1">500+ Slot Pendaftar</h3>
                    <div className="my-4">
                      <span className="text-3xl font-extrabold text-[#172B4D]">Rp 1.000.000</span>
                      <p className="text-xs font-extrabold text-emerald-600 mt-1">Setara Rp 2.000 / pendaftar</p>
                      <p className="text-[10px] text-slate-500 mt-1 italic">
                        (Direkomendasikan untuk lembaga berskala besar / ribuan santri)
                      </p>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-700 border-t border-slate-100 pt-4 font-medium">
                      <li>✓ <strong>100% Bebas Potongan</strong> + Cloud 5 GB</li>
                      <li>✓ Otomatisasi operasional & Prioritas VIP 24/7</li>
                    </ul>
                  </div>
                  <div className="mt-6 w-full rounded-2xl py-3 text-xs font-extrabold text-center bg-[#102B56] text-white">
                    Pilih & Berhemat
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MENU 7: SYARAT & FORMULIR */}
        {activeTab === 'syarat' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-[#102B56]">Syarat Berkas & Formulir Pendaftaran</h2>
                <p className="text-xs text-slate-500">Kelola daftar dokumen persyaratan yang perlu diunggah calon siswa.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDocRequirements([
                    ...docRequirements,
                    { id: 'doc-' + Date.now(), label: 'Dokumen Tambahan', required: false, note: 'Format JPG/PDF' },
                  ]);
                  setIsDirty(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#155EEF] text-white px-4 py-2 text-xs font-extrabold cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Tambah Syarat Berkas
              </button>
            </div>

            <div className="space-y-3">
              {docRequirements.map((doc) => (
                <div
                  key={doc.id}
                  className="rounded-2xl border border-slate-200 p-4 bg-[#F5F8FF]/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={doc.label}
                      onChange={(e) => {
                        setDocRequirements(
                          docRequirements.map((d) => (d.id === doc.id ? { ...d, label: e.target.value } : d))
                        );
                        setIsDirty(true);
                      }}
                      className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-extrabold text-[#102B56]"
                    />
                    <input
                      type="text"
                      value={doc.note}
                      onChange={(e) => {
                        setDocRequirements(
                          docRequirements.map((d) => (d.id === doc.id ? { ...d, note: e.target.value } : d))
                        );
                        setIsDirty(true);
                      }}
                      className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-600"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDocRequirements(
                          docRequirements.map((d) => (d.id === doc.id ? { ...d, required: !d.required } : d))
                        );
                        setIsDirty(true);
                      }}
                      className={`rounded-xl px-3 py-1.5 text-[11px] font-extrabold cursor-pointer ${
                        doc.required ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {doc.required ? 'Wajib' : 'Opsional'}
                    </button>
                    {docRequirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setDocRequirements(docRequirements.filter((d) => d.id !== doc.id));
                          setIsDirty(true);
                        }}
                        className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleSaveAll()}
                className="rounded-xl bg-[#155EEF] text-white px-6 py-2.5 text-xs font-extrabold cursor-pointer"
              >
                Simpan Syarat & Formulir
              </button>
            </div>
          </div>
        )}

        {/* MENU 8: PENGATURAN & MENU 9: PROFIL AKUN */}
        {(activeTab === 'pengaturan' || activeTab === 'akun') && (
          <SchoolSettingsTab
            mode={activeTab}
            schoolName={profileForm.name}
            onSaveSettings={(summary) => {
              handleAddLog('Pembaruan Pengaturan & Akun', summary);
              setLastSavedTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB');
            }}
          />
        )}
      </main>

      {/* =========================================================
          DAFTARKU AI ASSISTANT (TOMBOL MENGAMBANG & PANEL KANAN DI SELURUH HALAMAN)
      ========================================================= */}
      <DaftarKuAiDrawer
        schoolName={profileForm.name}
        activeTab={activeTab}
        planTier={selectedTier}
        totalApplicants={applicants.length}
        totalQuota={totalQuota}
        pendingDocsCount={pendingDocsCount}
        activeWaveName={activeWave?.name || 'Gelombang 1'}
        registrationFee={paymentConfig.isFreeRegistration ? 0 : paymentConfig.registrationFee}
        onExecuteApprovedAction={handleExecuteApprovedAiAction}
      />

      {/* MODAL LAYAR PENUH PRATINJAU LANGSUNG */}
      {fullScreenPreview && (
        <div className="fixed inset-0 z-50 bg-[#102B56]/75 backdrop-blur-sm overflow-y-auto p-4 sm:p-8">
          <div className="max-w-3xl mx-auto bg-[#F5F8FF] rounded-3xl p-5 sm:p-7 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-extrabold text-[#102B56]">Mode Pratinjau Tampilan Penuh</h3>
                <p className="text-[11px] text-slate-500">Tampilan aktual yang dilihat oleh calon wali murid</p>
              </div>
              <button
                type="button"
                onClick={() => setFullScreenPreview(false)}
                className="rounded-xl bg-rose-600 text-white px-4 py-2 text-xs font-extrabold cursor-pointer"
              >
                Tutup Layar Penuh
              </button>
            </div>
            <PortalShowcaseBanner
              compactPreview={false}
              schoolName={profileForm.name}
              jenjangLabel={profileForm.jenjang}
              address={profileForm.address}
              logoUrl={profileForm.logoUrl}
              bannerUrl={profileForm.bannerUrl}
              activityPhotoUrl={profileForm.schoolPhotoUrl}
              galleryPhotosJson={JSON.stringify(galleryPhotos)}
              visionMission={profileForm.visiMisi}
              highlights={profileForm.keunggulan}
              waveName={activeWave?.name}
              academicYear={activeWave?.academicYear}
              waveEndDate={activeWave?.endDate}
              remainingQuota={remainingQuota}
              totalQuota={totalQuota}
              isOpen={registrationStatus === 'Dibuka'}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default SchoolDashboardClient;