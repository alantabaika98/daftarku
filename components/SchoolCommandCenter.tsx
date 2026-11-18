'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Search,
  Eye,
  Check,
  X,
  Clock,
  History,
  Sparkles,
  FileCheck2,
  MessageCircle,
  ShieldAlert,
  Globe,
  ExternalLink,
  ChevronRight,
  BarChart3,
  PieChart,
  Plus,
  FileCheck,
  ListFilter,
} from 'lucide-react';

export interface ApplicantItem {
  id: string;
  regNo: string;
  name: string;
  nisn: string;
  gender: 'L' | 'P';
  track: string;
  wave: string;
  parentName: string;
  whatsapp: string;
  OriginSchool: string;
  registeredAt: string;
  status: 'Menunggu' | 'Diverifikasi' | 'Diterima' | 'Ditolak';
  paymentStatus: 'Lunas' | 'Menunggu' | 'Gratis';
  paymentAmount: number;
  docs: Array<{
    id: string;
    label: string;
    fileName: string;
    status: 'Menunggu' | 'Diterima' | 'Ditolak';
    rejectReason?: string;
  }>;
}

export interface AuditLogItem {
  id: string;
  action: string;
  detail: string;
  user: string;
  timestamp: string;
  category: 'profil' | 'verifikasi' | 'pengaturan' | 'status';
}

export interface ReadinessItem {
  id: string;
  label: string;
  isReady: boolean;
  targetTab: string;
  hint: string;
}

interface SchoolCommandCenterProps {
  activeSubTab: 'dashboard' | 'pendaftar' | 'ringkasan' | 'verifikasi' | 'riwayat';
  initialApplicantMode?: 'tabel' | 'verifikasi';
  onNavigateTab: (tab: any) => void;
  applicants: ApplicantItem[];
  onUpdateApplicants: (next: ApplicantItem[]) => void;
  auditLogs: AuditLogItem[];
  onAddLog: (action: string, detail: string, category?: AuditLogItem['category']) => void;
  readinessList: ReadinessItem[];
  totalQuota: number;
  activeWaveName?: string;
}

export function SchoolCommandCenter({
  activeSubTab,
  initialApplicantMode = 'tabel',
  onNavigateTab,
  applicants,
  onUpdateApplicants,
  auditLogs,
  onAddLog,
  readinessList,
  totalQuota,
  activeWaveName = 'Gelombang 1',
}: SchoolCommandCenterProps) {
  const [applicantViewMode, setApplicantViewMode] = useState<'tabel' | 'verifikasi'>(initialApplicantMode);
  const [searchQuery, setSearchQuery] = useState('');
  const [trackFilter, setTrackFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicantItem | null>(null);
  const [showAddApplicantModal, setShowAddApplicantModal] = useState(false);
  const [newApplicantForm, setNewApplicantForm] = useState({
    name: '',
    nisn: '',
    track: 'Jalur Reguler',
    OriginSchool: '',
    parentName: '',
    whatsapp: '',
  });
  const [rejectModal, setRejectModal] = useState<{
    applicantId: string;
    docId: string;
    docLabel: string;
    reason: string;
  } | null>(null);

  useEffect(() => {
    if (activeSubTab === 'verifikasi') {
      setApplicantViewMode('verifikasi');
    } else if (initialApplicantMode) {
      setApplicantViewMode(initialApplicantMode);
    }
  }, [activeSubTab, initialApplicantMode]);

  // Kalkulasi Statistik Aktual dari State/Database
  const stats = useMemo(() => {
    const total = applicants.length;
    const diterima = applicants.filter((a) => a.status === 'Diterima' || a.status === 'Diverifikasi').length;
    const menunggu = applicants.filter((a) => a.status === 'Menunggu').length;
    const berkasPending = applicants.reduce(
      (acc, a) => acc + a.docs.filter((d) => d.status === 'Menunggu').length,
      0
    );
    const lunasCount = applicants.filter((a) => a.paymentStatus === 'Lunas' || a.paymentStatus === 'Gratis').length;
    const totalNominal = applicants
      .filter((a) => a.paymentStatus === 'Lunas')
      .reduce((acc, a) => acc + a.paymentAmount, 0);

    const safeQuota = Math.max(1, totalQuota || 100);
    const quotaPercent = Math.min(100, Math.round((total / safeQuota) * 100));
    const remainingSeats = Math.max(0, safeQuota - total);

    return {
      total,
      diterima,
      menunggu,
      berkasPending,
      lunasCount,
      totalNominal,
      quotaPercent,
      remainingSeats,
    };
  }, [applicants, totalQuota]);

  const readyCount = readinessList.filter((r) => r.isReady).length;
  const readyPercent = Math.round((readyCount / Math.max(1, readinessList.length)) * 100);

  // Grafik Perkembangan Pendaftar Mingguan
  const weeklyTrend = [
    { day: 'Sen', count: Math.max(1, Math.round(stats.total * 0.4)), pct: 58 },
    { day: 'Sel', count: Math.max(1, Math.round(stats.total * 0.5)), pct: 46 },
    { day: 'Rab', count: Math.max(1, Math.round(stats.total * 0.6)), pct: 62 },
    { day: 'Kam', count: Math.max(1, Math.round(stats.total * 0.5)), pct: 54 },
    { day: 'Jum', count: Math.max(2, Math.round(stats.total * 0.8)), pct: 76 },
    { day: 'Sab', count: Math.max(3, stats.total), pct: 88 },
    { day: 'Min', count: Math.max(2, Math.round(stats.total * 0.7)), pct: 65 },
  ];

  const uniqueTracks = useMemo(() => {
    const set = new Set<string>(['Jalur Reguler', 'Jalur Prestasi']);
    applicants.forEach((a) => {
      if (a.track) set.add(a.track);
    });
    return Array.from(set);
  }, [applicants]);

  const filteredApplicants = useMemo(() => {
    return applicants.filter((a) => {
      const matchSearch =
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.regNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.nisn.includes(searchQuery);
      const matchTrack = trackFilter === 'ALL' || a.track === trackFilter;
      const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
      return matchSearch && matchTrack && matchStatus;
    });
  }, [applicants, searchQuery, trackFilter, statusFilter]);

  const handleUpdateApplicantStatus = (applicantId: string, newStatus: ApplicantItem['status']) => {
    const updated = applicants.map((app) => (app.id === applicantId ? { ...app, status: newStatus } : app));
    onUpdateApplicants(updated);
    const targetApp = applicants.find((a) => a.id === applicantId);
    onAddLog('Perubahan Status Pendaftar', `Status ${targetApp?.name} diubah menjadi ${newStatus}`, 'verifikasi');
    if (selectedApplicant && selectedApplicant.id === applicantId) {
      setSelectedApplicant({ ...selectedApplicant, status: newStatus });
    }
  };

  const handleAcceptDoc = (applicantId: string, docId: string, docLabel: string) => {
    const updated = applicants.map((app) => {
      if (app.id !== applicantId) return app;
      const nextDocs = app.docs.map((d) =>
        d.id === docId ? { ...d, status: 'Diterima' as const, rejectReason: undefined } : d
      );
      const allAccepted = nextDocs.every((d) => d.status === 'Diterima');
      return {
        ...app,
        docs: nextDocs,
        status: allAccepted ? ('Diverifikasi' as const) : app.status,
      };
    });
    onUpdateApplicants(updated);
    const targetApp = applicants.find((a) => a.id === applicantId);
    onAddLog('Verifikasi Berkas Diterima', `${docLabel} milik ${targetApp?.name || 'Siswa'} disetujui`, 'verifikasi');
  };

  const handleConfirmRejectDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModal) return;
    const { applicantId, docId, docLabel, reason } = rejectModal;
    const updated = applicants.map((app) => {
      if (app.id !== applicantId) return app;
      const nextDocs = app.docs.map((d) =>
        d.id === docId ? { ...d, status: 'Ditolak' as const, rejectReason: reason || 'Berkas buram / tidak sesuai' } : d
      );
      return { ...app, docs: nextDocs, status: 'Ditolak' as const };
    });
    onUpdateApplicants(updated);
    const targetApp = applicants.find((a) => a.id === applicantId);
    onAddLog('Penolakan Berkas', `${docLabel} milik ${targetApp?.name || 'Siswa'} ditolak (${reason})`, 'verifikasi');
    setRejectModal(null);
  };

  const handleAddManualApplicant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApplicantForm.name.trim()) return;
    const newItem: ApplicantItem = {
      id: 'app-' + Date.now(),
      regNo: `REG-2027-00${applicants.length + 1}`,
      name: newApplicantForm.name,
      nisn: newApplicantForm.nisn || '0123456700',
      gender: 'L',
      track: newApplicantForm.track,
      wave: activeWaveName,
      parentName: newApplicantForm.parentName || 'Wali Murid',
      whatsapp: newApplicantForm.whatsapp || '6281234567890',
      OriginSchool: newApplicantForm.OriginSchool || 'Sekolah Asal',
      registeredAt: 'Baru saja',
      status: 'Menunggu',
      paymentStatus: 'Lunas',
      paymentAmount: 150000,
      docs: [
        { id: 'd-new-1', label: 'Kartu Keluarga (KK)', fileName: 'kk_pendaftar.jpg', status: 'Menunggu' },
        { id: 'd-new-2', label: 'Akta Kelahiran', fileName: 'akta_pendaftar.pdf', status: 'Menunggu' },
      ],
    };
    onUpdateApplicants([newItem, ...applicants]);
    onAddLog('Input Pendaftar Manual', `Menambahkan calon siswa ${newItem.name} (${newItem.regNo})`, 'verifikasi');
    setNewApplicantForm({ name: '', nisn: '', track: 'Jalur Reguler', OriginSchool: '', parentName: '', whatsapp: '' });
    setShowAddApplicantModal(false);
  };

  // Konfigurasi SVG Donut Chart
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.quotaPercent / 100) * circumference;

  const isDashboardView = activeSubTab === 'dashboard' || activeSubTab === 'ringkasan';
  const isApplicantView = activeSubTab === 'pendaftar' || activeSubTab === 'verifikasi';

  return (
    <div className="space-y-6">
      {/* =========================================================
          MENU 1: DASHBOARD (PUSAT KENDALI SEKOLAH)
      ========================================================= */}
      {isDashboardView && (
        <div className="space-y-6">
          {/* BARIS 1: 2 Kartu Banner Atas (Lihat Portal Live + Pekerjaan yang Perlu Ditindaklanjuti) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-6 rounded-3xl bg-gradient-to-r from-[#DCEBFF] via-[#EAF2FF] to-[#F5F8FF] border border-[#155EEF]/15 p-5 sm:p-6 flex items-center justify-between gap-4 shadow-2xs">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white text-[#155EEF] flex items-center justify-center shadow-xs shrink-0">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-[#155EEF] mb-0.5">
                    Profil & Tampilan Lembaga
                  </span>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#102B56]">
                    Pratinjau & Kunjungi Portal Live
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Pantau tampilan pendaftaran seperti yang dilihat calon wali murid.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('profil')}
                className="shrink-0 inline-flex items-center gap-2 rounded-full bg-white hover:bg-[#102B56] text-[#102B56] hover:text-white border border-slate-200/80 px-5 py-2.5 text-xs font-extrabold shadow-xs transition cursor-pointer"
              >
                <span>Buka Pratinjau</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Kanan: Notifikasi & Pekerjaan yang Perlu Ditindaklanjuti */}
            <div
              onClick={() => {
                setApplicantViewMode('verifikasi');
                onNavigateTab('pendaftar');
              }}
              className="lg:col-span-6 rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 flex items-center justify-between gap-4 shadow-2xs hover:border-[#155EEF]/40 transition cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#F5F8FF] border border-[#155EEF]/15 text-[#155EEF] flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-[#FF9F1C]" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm sm:text-base font-extrabold text-[#102B56]">
                      {stats.berkasPending > 0
                        ? `${stats.berkasPending} Berkas menunggu verifikasi panitia`
                        : `${activeWaveName} tersisa ${stats.remainingSeats} kursi tersedia`}
                    </h3>
                    <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-[10px] font-extrabold">
                      {stats.quotaPercent}% Kuota Terisi
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {stats.berkasPending > 0
                      ? 'Klik untuk membuka meja pemeriksaan dokumen dan mempercepat pengumuman kelulusan.'
                      : 'Seluruh berkas telah diperiksa. Pantau terus keterisian kuota gelombang.'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
            </div>
          </div>

          {/* BARIS 2: 3 Kolom Analitik Utama (Statistik 2x3 + Grafik Tren + Donat Kuota) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* KOLOM 1 (5 Span): Statistik Pendaftaran */}
            <div className="lg:col-span-5 rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-base font-extrabold text-[#102B56]">Statistik Pendaftaran</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Data aktual penerimaan peserta didik baru</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddApplicantModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#155EEF] hover:bg-[#102B56] text-white px-4 py-2 text-xs font-extrabold shadow-sm transition cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Input Siswa</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div
                  onClick={() => {
                    setApplicantViewMode('tabel');
                    onNavigateTab('pendaftar');
                  }}
                  className="rounded-2xl border border-slate-100 bg-[#F5F8FF]/60 hover:border-[#155EEF]/40 p-3.5 cursor-pointer transition"
                >
                  <p className="text-[10px] font-bold text-slate-400 truncate">Total Pendaftar</p>
                  <p className="text-xl font-extrabold text-[#155EEF] mt-1">{stats.total}</p>
                </div>
                <div
                  onClick={() => {
                    setApplicantViewMode('tabel');
                    onNavigateTab('pendaftar');
                  }}
                  className="rounded-2xl border border-slate-100 bg-[#F5F8FF]/60 hover:border-[#155EEF]/40 p-3.5 cursor-pointer transition"
                >
                  <p className="text-[10px] font-bold text-slate-400 truncate">Pendaftar Baru</p>
                  <p className="text-xl font-extrabold text-[#102B56] mt-1">{stats.menunggu}</p>
                </div>
                <div
                  onClick={() => {
                    setApplicantViewMode('tabel');
                    onNavigateTab('pendaftar');
                  }}
                  className="rounded-2xl border border-slate-100 bg-[#F5F8FF]/60 hover:border-emerald-300 p-3.5 cursor-pointer transition"
                >
                  <p className="text-[10px] font-bold text-slate-400 truncate">Lulus / Diverifikasi</p>
                  <p className="text-xl font-extrabold text-emerald-600 mt-1">{stats.diterima}</p>
                </div>

                <div
                  onClick={() => {
                    setApplicantViewMode('verifikasi');
                    onNavigateTab('pendaftar');
                  }}
                  className="rounded-2xl border border-slate-100 bg-[#F5F8FF]/60 hover:border-amber-300 p-3.5 cursor-pointer transition"
                >
                  <p className="text-[10px] font-bold text-slate-400 truncate">Berkas Pending</p>
                  <p className="text-xl font-extrabold text-amber-600 mt-1">{stats.berkasPending}</p>
                </div>
                <div
                  onClick={() => onNavigateTab('pembayaran')}
                  className="rounded-2xl border border-slate-100 bg-[#F5F8FF]/60 hover:border-[#155EEF]/40 p-3.5 cursor-pointer transition"
                >
                  <p className="text-[10px] font-bold text-slate-400 truncate">Formulir Lunas</p>
                  <p className="text-xl font-extrabold text-[#102B56] mt-1">{stats.lunasCount}</p>
                </div>
                <div
                  onClick={() => onNavigateTab('jalur')}
                  className="rounded-2xl border border-slate-100 bg-[#F5F8FF]/60 hover:border-[#155EEF]/40 p-3.5 cursor-pointer transition"
                >
                  <p className="text-[10px] font-bold text-slate-400 truncate">Sisa Kuota Kursi</p>
                  <p className="text-xl font-extrabold text-[#FF9F1C] mt-1">{stats.remainingSeats}</p>
                </div>
              </div>
            </div>

            {/* KOLOM 2 (4 Span): Grafik Perkembangan Pendaftar */}
            <div className="lg:col-span-4 rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#155EEF]" />
                  <h3 className="text-base font-extrabold text-[#102B56]">Perkembangan Pendaftar</h3>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-600">
                  <span className="w-2 h-2 rounded-full bg-[#FF9F1C]" /> Tren Mingguan
                </span>
              </div>

              <div className="flex items-end gap-3 h-40 pt-4 px-1 border-b border-slate-100">
                <div className="flex flex-col justify-between h-full text-[10px] font-bold text-slate-300 pb-5 pr-1">
                  <span>100</span>
                  <span>60</span>
                  <span>20</span>
                  <span>0</span>
                </div>

                <div className="flex-1 grid grid-cols-7 gap-2 items-end h-full">
                  {weeklyTrend.map((item) => (
                    <div key={item.day} className="flex flex-col items-center justify-end h-full group">
                      <div className="w-full h-28 bg-slate-100/80 rounded-t-lg flex items-end overflow-hidden p-0.5">
                        <div
                          style={{ height: `${item.pct}%` }}
                          className="w-full rounded-t-md bg-gradient-to-t from-[#155EEF] to-[#528BFF] group-hover:from-[#102B56] group-hover:to-[#FF9F1C] transition-all duration-300"
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 mt-1.5">{item.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2">
                <span>Perkembangan formulir masuk 7 hari terakhir</span>
                <span className="font-extrabold text-emerald-600">Aktif</span>
              </div>
            </div>

            {/* KOLOM 3 (3 Span): Statistik Jalur & Kuota (Donut Chart SVG) */}
            <div className="lg:col-span-3 rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-extrabold text-[#102B56]">Kuota & Jalur</h3>
                <PieChart className="w-4 h-4 text-[#155EEF]" />
              </div>

              <div className="relative flex items-center justify-center my-2">
                <svg className="w-36 h-36 -rotate-90 transform" viewBox="0 0 140 140">
                  <circle cx="70" cy="70" r={radius} fill="transparent" stroke="#E2E8F0" strokeWidth="16" />
                  <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="transparent"
                    stroke="#155EEF"
                    strokeWidth="16"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-extrabold text-[#102B56]">{stats.quotaPercent}%</span>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Kuota Terisi
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 font-bold text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#155EEF]" /> Terisi ({stats.total} Siswa)
                  </span>
                  <span className="font-extrabold text-[#102B56]">{stats.quotaPercent}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 font-bold text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-200" /> Sisa Kursi ({stats.remainingSeats})
                  </span>
                  <span className="font-extrabold text-slate-500">{100 - stats.quotaPercent}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* BARIS 3: Tabel Rincian Pendaftar Terbaru (8 Kolom) & Aktivitas Terbaru (4 Kolom) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Tabel Rincian Pendaftar */}
            <div className="lg:col-span-8 rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-[#102B56]">Pendaftar Terbaru</h3>
                  <p className="text-xs text-slate-500">
                    Ubah status penerimaan secara langsung atau hubungi wali murid via WhatsApp.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setApplicantViewMode('tabel');
                    onNavigateTab('pendaftar');
                  }}
                  className="rounded-full bg-[#F5F8FF] hover:bg-blue-100/70 px-3.5 py-1.5 text-xs font-extrabold text-[#155EEF] transition cursor-pointer self-start sm:self-auto"
                >
                  Kelola Semua Pendaftar ({applicants.length}) →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400">
                      <th className="py-3 px-2.5">#</th>
                      <th className="py-3 px-2.5">Nama Calon Siswa</th>
                      <th className="py-3 px-2.5">Atur Status</th>
                      <th className="py-3 px-2.5">Jalur</th>
                      <th className="py-3 px-2.5 text-right">Kontak</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {applicants.slice(0, 5).map((app, index) => (
                      <tr key={app.id} className="hover:bg-[#F5F8FF]/60 transition">
                        <td className="py-3 px-2.5 font-bold text-slate-400">
                          {String(index + 1).padStart(2, '0')}
                        </td>
                        <td className="py-3 px-2.5">
                          <button
                            type="button"
                            onClick={() => setSelectedApplicant(app)}
                            className="font-extrabold text-[#102B56] hover:text-[#155EEF] text-left cursor-pointer"
                          >
                            {app.name}
                          </button>
                          <p className="text-[10px] text-slate-400 font-semibold">
                            {app.regNo} • {app.OriginSchool}
                          </p>
                        </td>
                        <td className="py-3 px-2.5">
                          <select
                            value={app.status}
                            onChange={(e) => handleUpdateApplicantStatus(app.id, e.target.value as any)}
                            className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold border cursor-pointer focus:outline-none ${
                              app.status === 'Diterima'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                : app.status === 'Diverifikasi'
                                ? 'bg-blue-50 border-blue-200 text-[#155EEF]'
                                : app.status === 'Ditolak'
                                ? 'bg-rose-50 border-rose-200 text-rose-700'
                                : 'bg-amber-50 border-amber-200 text-amber-800'
                            }`}
                          >
                            <option value="Diterima">● Diterima</option>
                            <option value="Diverifikasi">● Diverifikasi</option>
                            <option value="Menunggu">● Menunggu Cek</option>
                            <option value="Ditolak">● Ditolak</option>
                          </select>
                        </td>
                        <td className="py-3 px-2.5 font-bold text-[#102B56]">{app.track}</td>
                        <td className="py-3 px-2.5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <a
                              href={`https://wa.me/${app.whatsapp}`}
                              target="_blank"
                              rel="noreferrer"
                              className="w-7 h-7 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-2xs transition"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => setSelectedApplicant(app)}
                              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-[#155EEF] text-slate-600 hover:text-white flex items-center justify-center transition cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Panel Aktivitas Terbaru (Timeline di Dashboard) */}
            <div className="lg:col-span-4 rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-[#102B56]">Aktivitas Terbaru</h3>
                  <p className="text-xs text-slate-500">Riwayat tindakan & pembaruan sistem</p>
                </div>
                <History className="w-4 h-4 text-[#155EEF]" />
              </div>

              <div className="space-y-3">
                {auditLogs.slice(0, 4).map((log) => (
                  <div
                    key={log.id}
                    className="rounded-2xl border border-slate-100 bg-[#F5F8FF]/60 p-3.5 flex items-start gap-3"
                  >
                    <span className="w-7 h-7 rounded-xl bg-white border border-slate-200 text-[#155EEF] flex items-center justify-center shrink-0 mt-0.5">
                      <FileCheck2 className="w-3.5 h-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-extrabold text-[#102B56] truncate">{log.action}</p>
                      <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{log.detail}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {log.timestamp} • {log.user}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BARIS 4: Checklist Kesiapan Konfigurasi Sekolah */}
          <div className="rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#155EEF]">
                  Checklist Kesiapan Sistem ({readyPercent}% Siap)
                </span>
                <h3 className="text-sm font-extrabold text-[#102B56]">
                  Kelengkapan Konfigurasi Portal SPMB
                </h3>
              </div>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-extrabold text-emerald-700">
                {readyCount} dari {readinessList.length} Modul Siap
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {readinessList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onNavigateTab(item.targetTab)}
                  className="rounded-2xl border border-slate-100 bg-[#F5F8FF]/60 hover:border-[#155EEF]/40 p-3 flex items-start gap-2.5 cursor-pointer transition"
                >
                  {item.isReady ? (
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </span>
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertCircle className="w-3 h-3" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-[#102B56] truncate">{item.label}</p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{item.hint}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MENU 2: PENDAFTAR (TERPADU: TABEL DATA & MEJA VERIFIKASI BERKAS)
      ========================================================= */}
      {isApplicantView && (
        <div className="space-y-5">
          {/* Sub-Navigation Switcher: Tabel Biodata vs Pemeriksaan Berkas */}
          <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 bg-[#F5F8FF] p-1.5 rounded-2xl border border-slate-200/80 self-start">
              <button
                type="button"
                onClick={() => setApplicantViewMode('tabel')}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition cursor-pointer ${
                  applicantViewMode === 'tabel'
                    ? 'bg-[#155EEF] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#102B56]'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Daftar & Biodata Siswa ({applicants.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setApplicantViewMode('verifikasi')}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition cursor-pointer ${
                  applicantViewMode === 'verifikasi'
                    ? 'bg-[#155EEF] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#102B56]'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Verifikasi Berkas</span>
                {stats.berkasPending > 0 && (
                  <span className="rounded-full bg-[#FF9F1C] text-[#102B56] px-2 py-0.5 text-[10px] font-extrabold">
                    {stats.berkasPending} Antre
                  </span>
                )}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama, No. Reg, NISN..."
                  className="rounded-xl border border-slate-200 bg-[#F5F8FF] pl-9 pr-4 py-2 text-xs font-semibold text-[#172B4D] focus:border-[#155EEF] focus:bg-white focus:outline-none"
                />
              </div>
              <select
                value={trackFilter}
                onChange={(e) => setTrackFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-[#F5F8FF] px-3 py-2 text-xs font-bold text-[#102B56]"
              >
                <option value="ALL">Semua Jalur</option>
                {uniqueTracks.map((tr) => (
                  <option key={tr} value={tr}>
                    {tr}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-[#F5F8FF] px-3 py-2 text-xs font-bold text-[#102B56]"
              >
                <option value="ALL">Semua Status</option>
                <option value="Menunggu">Menunggu</option>
                <option value="Diverifikasi">Diverifikasi</option>
                <option value="Diterima">Diterima</option>
                <option value="Ditolak">Ditolak</option>
              </select>
              <button
                type="button"
                onClick={() => setShowAddApplicantModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#155EEF] hover:bg-[#102B56] text-white px-3.5 py-2 text-xs font-extrabold cursor-pointer transition"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Siswa
              </button>
            </div>
          </div>

          {/* SUB-MODE A: TABEL DATA PENDAFTAR */}
          {applicantViewMode === 'tabel' && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-[#F5F8FF] text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      <th className="py-3.5 px-4">No. Reg & Nama Siswa</th>
                      <th className="py-3.5 px-4">Jalur & Asal Sekolah</th>
                      <th className="py-3.5 px-4">Orang Tua / WA</th>
                      <th className="py-3.5 px-4">Pembayaran</th>
                      <th className="py-3.5 px-4">Status SPMB</th>
                      <th className="py-3.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredApplicants.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4">
                          <p className="font-extrabold text-[#102B56]">{app.name}</p>
                          <p className="text-[11px] text-[#155EEF] font-bold">
                            {app.regNo} <span className="text-slate-400 font-normal">• NISN: {app.nisn}</span>
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-[#172B4D]">{app.track}</p>
                          <p className="text-[11px] text-slate-500">{app.OriginSchool}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-[#172B4D]">{app.parentName}</p>
                          <a
                            href={`https://wa.me/${app.whatsapp}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-bold hover:underline"
                          >
                            <MessageCircle className="w-3 h-3" /> {app.whatsapp}
                          </a>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                              app.paymentStatus === 'Lunas'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {app.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            value={app.status}
                            onChange={(e) => handleUpdateApplicantStatus(app.id, e.target.value as any)}
                            className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold border cursor-pointer ${
                              app.status === 'Diterima' || app.status === 'Diverifikasi'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                : app.status === 'Ditolak'
                                ? 'bg-rose-50 border-rose-200 text-rose-700'
                                : 'bg-amber-50 border-amber-200 text-amber-800'
                            }`}
                          >
                            <option value="Diterima">Diterima</option>
                            <option value="Diverifikasi">Diverifikasi</option>
                            <option value="Menunggu">Menunggu</option>
                            <option value="Ditolak">Ditolak</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedApplicant(app)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#F5F8FF] border border-[#155EEF]/20 px-3 py-1.5 text-xs font-extrabold text-[#155EEF] hover:bg-[#155EEF] hover:text-white transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> Biodata
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-MODE B: MEJA PEMERIKSAAN & VERIFIKASI BERKAS */}
          {applicantViewMode === 'verifikasi' && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              {filteredApplicants.map((app) => (
                <div key={app.id} className="rounded-2xl border border-slate-200 p-5 bg-[#F5F8FF]/50 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 pb-3">
                    <div>
                      <span className="text-xs font-extrabold text-[#102B56]">{app.name}</span>
                      <span className="ml-2 text-[11px] font-bold text-[#155EEF]">{app.regNo}</span>
                      <p className="text-[11px] text-slate-500">
                        {app.track} • Waktu Daftar: {app.registeredAt}
                      </p>
                    </div>
                    <span className="rounded-full bg-white border border-slate-200 px-3 py-1 text-[11px] font-extrabold text-[#102B56]">
                      Status: {app.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {app.docs.map((doc) => (
                      <div
                        key={doc.id}
                        className="rounded-xl bg-white border border-slate-200/90 p-3.5 flex flex-col justify-between gap-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-extrabold text-[#102B56]">{doc.label}</p>
                            <p className="text-[11px] text-[#155EEF] font-medium truncate">{doc.fileName}</p>
                            {doc.status === 'Ditolak' && doc.rejectReason && (
                              <p className="mt-1 text-[11px] font-bold text-rose-600 flex items-center gap-1">
                                <ShieldAlert className="w-3.5 h-3.5 shrink-0" /> Alasan: {doc.rejectReason}
                              </p>
                            )}
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                              doc.status === 'Diterima'
                                ? 'bg-emerald-100 text-emerald-700'
                                : doc.status === 'Ditolak'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {doc.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => handleAcceptDoc(app.id, doc.id, doc.label)}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white px-3 py-1.5 text-[11px] font-extrabold transition cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" /> Terima
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setRejectModal({
                                applicantId: app.id,
                                docId: doc.id,
                                docLabel: doc.label,
                                reason: doc.rejectReason || '',
                              })
                            }
                            className="inline-flex items-center gap-1 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white px-3 py-1.5 text-[11px] font-extrabold transition cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" /> Tolak
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          MODAL GLOBAL: DETAIL BIODATA, TAMBAH PENDAFTAR, & TOLAK BERKAS
      ========================================================= */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102B56]/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#155EEF]">
                  {selectedApplicant.regNo}
                </span>
                <h3 className="text-lg font-extrabold text-[#102B56]">{selectedApplicant.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApplicant(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-[#F5F8FF] p-4 rounded-2xl">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">NISN & Gender</p>
                <p className="font-extrabold text-[#102B56]">
                  {selectedApplicant.nisn} ({selectedApplicant.gender})
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Jalur Pilihan</p>
                <p className="font-extrabold text-[#155EEF]">{selectedApplicant.track}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Sekolah Asal</p>
                <p className="font-bold text-[#172B4D]">{selectedApplicant.OriginSchool}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Nama Orang Tua</p>
                <p className="font-bold text-[#172B4D]">{selectedApplicant.parentName}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-extrabold text-[#102B56] mb-2">Keputusan Status Pendaftaran:</p>
              <div className="flex flex-wrap gap-2">
                {(['Menunggu', 'Diverifikasi', 'Diterima', 'Ditolak'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleUpdateApplicantStatus(selectedApplicant.id, st)}
                    className={`rounded-xl px-3.5 py-2 text-xs font-extrabold transition cursor-pointer ${
                      selectedApplicant.status === st
                        ? 'bg-[#155EEF] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddApplicantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102B56]/50 backdrop-blur-xs p-4">
          <form
            onSubmit={handleAddManualApplicant}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-[#102B56]">Input Pendaftar Baru (Walk-in)</h3>
              <button
                type="button"
                onClick={() => setShowAddApplicantModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-extrabold text-[#102B56] mb-1">Nama Lengkap Calon Siswa *</label>
                <input
                  required
                  type="text"
                  value={newApplicantForm.name}
                  onChange={(e) => setNewApplicantForm({ ...newApplicantForm, name: e.target.value })}
                  placeholder="Masukkan nama siswa..."
                  className="w-full rounded-xl border border-slate-200 bg-[#F5F8FF] px-3.5 py-2.5 font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-[#102B56] mb-1">NISN</label>
                  <input
                    type="text"
                    value={newApplicantForm.nisn}
                    onChange={(e) => setNewApplicantForm({ ...newApplicantForm, nisn: e.target.value })}
                    placeholder="012345..."
                    className="w-full rounded-xl border border-slate-200 bg-[#F5F8FF] px-3.5 py-2.5 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-extrabold text-[#102B56] mb-1">Jalur</label>
                  <select
                    value={newApplicantForm.track}
                    onChange={(e) => setNewApplicantForm({ ...newApplicantForm, track: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-[#F5F8FF] px-3 py-2.5 font-bold"
                  >
                    {uniqueTracks.map((tr) => (
                      <option key={tr} value={tr}>
                        {tr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-extrabold text-[#102B56] mb-1">Asal Sekolah</label>
                <input
                  type="text"
                  value={newApplicantForm.OriginSchool}
                  onChange={(e) => setNewApplicantForm({ ...newApplicantForm, OriginSchool: e.target.value })}
                  placeholder="Contoh: TK Muslimat NU"
                  className="w-full rounded-xl border border-slate-200 bg-[#F5F8FF] px-3.5 py-2.5 font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-[#102B56] mb-1">Nama Wali</label>
                  <input
                    type="text"
                    value={newApplicantForm.parentName}
                    onChange={(e) => setNewApplicantForm({ ...newApplicantForm, parentName: e.target.value })}
                    placeholder="Nama Ayah/Ibu"
                    className="w-full rounded-xl border border-slate-200 bg-[#F5F8FF] px-3.5 py-2.5 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-extrabold text-[#102B56] mb-1">No. WhatsApp</label>
                  <input
                    type="text"
                    value={newApplicantForm.whatsapp}
                    onChange={(e) => setNewApplicantForm({ ...newApplicantForm, whatsapp: e.target.value })}
                    placeholder="62812..."
                    className="w-full rounded-xl border border-slate-200 bg-[#F5F8FF] px-3.5 py-2.5 font-semibold"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddApplicantModal(false)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#155EEF] hover:bg-[#102B56] text-white px-5 py-2 text-xs font-extrabold cursor-pointer"
              >
                Simpan Pendaftar
              </button>
            </div>
          </form>
        </div>
      )}

      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102B56]/50 backdrop-blur-xs p-4">
          <form
            onSubmit={handleConfirmRejectDoc}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <h3 className="text-base font-extrabold text-[#102B56]">
              Alasan Penolakan: {rejectModal.docLabel}
            </h3>
            <textarea
              required
              rows={3}
              value={rejectModal.reason}
              onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
              placeholder="Contoh: Foto Kartu Keluarga buram pada bagian NIK."
              className="w-full rounded-xl border border-slate-200 bg-[#F5F8FF] p-3 text-xs font-semibold text-[#172B4D] focus:border-rose-500 focus:bg-white focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectModal(null)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 text-xs font-extrabold cursor-pointer"
              >
                Simpan Penolakan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}