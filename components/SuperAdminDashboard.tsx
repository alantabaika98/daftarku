'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Building2,
  Plus,
  Search,
  KeyRound,
  CheckCircle2,
  Clock,
  Ban,
  Copy,
  Check,
  Users,
  Sparkles,
  Activity,
  X,
  AlertCircle,
  ExternalLink,
  SlidersHorizontal,
} from 'lucide-react';
import { LogoutButton } from './LogoutButton';

export interface SchoolItem {
  id: string;
  name: string;
  slug: string;
  level: string;
  npsn: string | null;
  whatsapp: string | null;
  address: string | null;
  registrationPrefix: string;
  isActive: boolean;
  createdAt: string;
  applicantCount: number;
  license: {
    id: string;
    licenseKey: string;
    planName: string;
    status: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
    activatedAt: string | null;
    notes: string | null;
  } | null;
  users: {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    lastLoginAt: string | null;
  }[];
}

export interface AuditItem {
  id: string;
  action: string;
  targetEntity: string;
  createdAt: string;
  schoolName: string;
  actorName: string;
}

const LEVEL_LABELS: Record<string, string> = {
  TK_PAUD: 'TK / PAUD',
  SD_MI: 'SD / MI',
  SMP_MTS: 'SMP / MTs',
  SMA_MA: 'SMA / MA',
  SMK: 'SMK',
};

export function SuperAdminDashboard({
  sessionName,
  sessionEmail,
  schools,
  recentLogs,
}: {
  sessionName: string;
  sessionEmail: string;
  schools: SchoolItem[];
  recentLogs: AuditItem[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Modal Tambah Sekolah
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [form, setForm] = useState({
    name: '',
    slug: '',
    level: 'SD_MI',
    npsn: '',
    whatsapp: '',
    address: '',
    registrationPrefix: 'DFK',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    planName: 'LIFETIME_PRO',
    licenseStatus: 'ACTIVE',
    notes: '',
  });

  // Modal Kelola Lisensi
  const [licenseSchool, setLicenseSchool] = useState<SchoolItem | null>(null);
  const [licenseForm, setLicenseForm] = useState({
    licenseStatus: 'ACTIVE',
    planName: 'LIFETIME_PRO',
    notes: '',
    isActive: true,
  });
  const [savingLicense, setSavingLicense] = useState(false);
  const [licenseError, setLicenseError] = useState('');

  // Modal Reset Password
  const [resetSchool, setResetSchool] = useState<SchoolItem | null>(null);
  const [resetUserId, setResetUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resettingPwd, setResettingPwd] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  const totalSchools = schools.length;
  const activeLicenses = schools.filter((s) => s.license?.status === 'ACTIVE').length;
  const pendingLicenses = schools.filter((s) => s.license?.status === 'PENDING').length;
  const totalApplicants = schools.reduce((sum, s) => sum + s.applicantCount, 0);

  const filteredSchools = schools.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.slug.toLowerCase().includes(search.toLowerCase()) ||
      (s.license?.licenseKey ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === 'ALL' || (s.license?.status ?? 'PENDING') === statusFilter;
    return matchSearch && matchStatus;
  });

  function handleNameChange(val: string) {
    const autoSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 40);
    const words = val.trim().split(/\s+/).filter(Boolean);
    const autoPrefix =
      words.length >= 2
        ? words
            .slice(0, 3)
            .map((w) => w[0])
            .join('')
            .toUpperCase()
        : val.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase() || 'DFK';

    setForm((prev) => ({
      ...prev,
      name: val,
      slug: autoSlug,
      registrationPrefix: autoPrefix,
    }));
  }

  function copyText(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  async function handleCreateSchool(e: React.FormEvent) {
    e.preventDefault();
    setCreateError('');
    setCreating(true);

    try {
      const res = await fetch('/api/super-admin/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || 'Gagal menambahkan sekolah.');
        setCreating(false);
        return;
      }

      setShowCreateModal(false);
      setForm({
        name: '',
        slug: '',
        level: 'SD_MI',
        npsn: '',
        whatsapp: '',
        address: '',
        registrationPrefix: 'DFK',
        adminName: '',
        adminEmail: '',
        adminPassword: '',
        planName: 'LIFETIME_PRO',
        licenseStatus: 'ACTIVE',
        notes: '',
      });
      setCreating(false);
      router.refresh();
    } catch {
      setCreateError('Koneksi ke server terputus.');
      setCreating(false);
    }
  }

  function openLicenseModal(school: SchoolItem) {
    setLicenseSchool(school);
    setLicenseError('');
    setLicenseForm({
      licenseStatus: school.license?.status ?? 'PENDING',
      planName: school.license?.planName ?? 'LIFETIME_PRO',
      notes: school.license?.notes ?? '',
      isActive: school.isActive,
    });
  }

  async function handleUpdateLicense(e: React.FormEvent) {
    e.preventDefault();
    if (!licenseSchool) return;
    setLicenseError('');
    setSavingLicense(true);

    try {
      const res = await fetch(`/api/super-admin/schools/${licenseSchool.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(licenseForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setLicenseError(data.error || 'Gagal memperbarui lisensi.');
        setSavingLicense(false);
        return;
      }

      setLicenseSchool(null);
      setSavingLicense(false);
      router.refresh();
    } catch {
      setLicenseError('Koneksi terputus.');
      setSavingLicense(false);
    }
  }

  function openResetModal(school: SchoolItem) {
    setResetSchool(school);
    setResetUserId(school.users[0]?.id ?? '');
    setNewPassword('');
    setResetError('');
    setResetSuccess('');
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resetSchool) return;
    setResetError('');
    setResetSuccess('');
    setResettingPwd(true);

    try {
      const res = await fetch(`/api/super-admin/schools/${resetSchool.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: resetUserId, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResetError(data.error || 'Gagal mereset kata sandi.');
        setResettingPwd(false);
        return;
      }

      setResetSuccess('Kata sandi admin sekolah berhasil diperbarui!');
      setNewPassword('');
      setResettingPwd(false);
      router.refresh();
    } catch {
      setResetError('Koneksi terputus.');
      setResettingPwd(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-teal-500/30 selection:text-teal-200">
      {/* Live Status Ticker (Tulisan Bergerak) */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 border-b border-teal-500/20 overflow-hidden py-2">
        <div className="animate-daftarku-marquee flex items-center gap-10 text-xs font-medium text-teal-300/90">
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            ARA DIGITAL SAAS ENGINE AKTIF
          </span>
          <span>•</span>
          <span>ISOLASI DATA MULTI-TENANT TERKUNCI (POSTGRESQL 16)</span>
          <span>•</span>
          <span>TOTAL SEKOLAH MITRA: {totalSchools} TENANT</span>
          <span>•</span>
          <span>LISENSI AKTIF: {activeLicenses} SEKOLAH</span>
          <span>•</span>
          <span>MENUNGGU AKTIVASI: {pendingLicenses} SEKOLAH</span>
          <span>•</span>
          <span>KEAMANAN SESI TERENKRIPSI HTTP-ONLY JWT</span>
          <span>•</span>
          {/* Duplikat mulus agar teks berjalan tanpa putus */}
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            ARA DIGITAL SAAS ENGINE AKTIF
          </span>
          <span>•</span>
          <span>ISOLASI DATA MULTI-TENANT TERKUNCI (POSTGRESQL 16)</span>
          <span>•</span>
          <span>TOTAL SEKOLAH MITRA: {totalSchools} TENANT</span>
          <span>•</span>
          <span>LISENSI AKTIF: {activeLicenses} SEKOLAH</span>
          <span>•</span>
          <span>MENUNGGU AKTIVASI: {pendingLicenses} SEKOLAH</span>
        </div>
      </div>

      {/* Top Glass Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 text-slate-950 flex items-center justify-center shadow-lg shadow-teal-500/25">
              <ShieldCheck className="w-5 h-5 stroke-[2.4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">
                  DaftarKu Command Center
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-400/30">
                  <Sparkles className="w-3 h-3" /> ARA Digital
                </span>
              </div>
              <p className="text-xs text-slate-400">{sessionEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setCreateError('');
                setShowCreateModal(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-2 text-xs sm:text-sm font-bold text-slate-950 shadow-lg shadow-teal-500/25 hover:from-teal-400 hover:to-emerald-400 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Tambah Sekolah Baru
            </button>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Futuristic Hero Banner dengan Ilustrasi Vektor Bergerak */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/80 p-6 sm:p-8 shadow-2xl">
          <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-teal-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-teal-300">
                <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                Pusat Kendali Lisensi & Multi-Tenant SPMB
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                Selamat datang kembali,{' '}
                <span className="bg-gradient-to-r from-teal-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                  {sessionName}
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                Kelola seluruh sekolah mitra DaftarKu dari satu layar. Buat akun sekolah baru dalam
                hitungan detik, aktifkan lisensi komersial, dan pantau aktivitas sistem secara
                real-time.
              </p>
            </div>

            {/* Ilustrasi Vektor Radar SaaS Bergerak */}
            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <div className="animate-daftarku-float relative w-56 h-44 rounded-2xl bg-slate-950/70 border border-teal-400/25 p-4 backdrop-blur-md shadow-xl flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-teal-300">TENANT RADAR</span>
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    ONLINE
                  </span>
                </div>

                <div className="relative mx-auto my-1 w-24 h-24 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle
                      cx="50"
                      cy="50"
                      r="44"
                      fill="none"
                      stroke="rgba(45,212,191,0.2)"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      className="animate-daftarku-spin-slow origin-center"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="30"
                      fill="none"
                      stroke="rgba(52,211,153,0.35)"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="14"
                      fill="rgba(20,184,166,0.2)"
                      stroke="#2dd4bf"
                      strokeWidth="2"
                    />
                    <circle cx="50" cy="50" r="4" fill="#5eead4" />
                    <circle cx="76" cy="34" r="3.5" fill="#34d399" />
                    <circle cx="28" cy="68" r="3" fill="#38bdf8" />
                  </svg>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-300 border-t border-white/10 pt-2">
                  <span>Isolasi Data</span>
                  <span className="font-bold text-emerald-300">100% Terproteksi</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4 Kartu Statistik KPI Interaktif */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="group rounded-2xl bg-slate-900/90 border border-white/10 p-5 hover:border-teal-400/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Sekolah Mitra
              </span>
              <div className="w-9 h-9 rounded-xl bg-teal-500/15 text-teal-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-white">{totalSchools}</p>
            <p className="mt-1 text-xs text-slate-400">Ruang tenant terisolasi</p>
          </div>

          <div className="group rounded-2xl bg-slate-900/90 border border-white/10 p-5 hover:border-emerald-400/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Lisensi Aktif
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-emerald-400">{activeLicenses}</p>
            <p className="mt-1 text-xs text-slate-400">Siap menerima pendaftaran</p>
          </div>

          <div className="group rounded-2xl bg-slate-900/90 border border-white/10 p-5 hover:border-amber-400/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Menunggu Aktivasi
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-amber-300">{pendingLicenses}</p>
            <p className="mt-1 text-xs text-slate-400">Perlu konfirmasi pembayaran</p>
          </div>

          <div className="group rounded-2xl bg-slate-900/90 border border-white/10 p-5 hover:border-cyan-400/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Pendaftar
              </span>
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-cyan-300">{totalApplicants}</p>
            <p className="mt-1 text-xs text-slate-400">Seluruh sekolah mitra</p>
          </div>
        </section>

        {/* Filter & Daftar Sekolah Mitra */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">Daftar Sekolah & Kontrol Lisensi</h2>
              <p className="text-xs text-slate-400">
                Klik tombol kelola lisensi untuk mengaktifkan sekolah baru atau reset sandi admin.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama sekolah / kode lisensi..."
                  className="w-full sm:w-64 rounded-xl bg-slate-900 border border-white/10 pl-9 pr-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:border-teal-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-white/10">
                {['ALL', 'ACTIVE', 'PENDING', 'SUSPENDED'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      statusFilter === st
                        ? 'bg-teal-500 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {st === 'ALL' ? 'Semua' : st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filteredSchools.length === 0 ? (
            <div className="rounded-2xl bg-slate-900/70 border border-white/10 p-10 text-center">
              <p className="text-sm text-slate-400">
                Tidak ada sekolah yang cocok dengan pencarian Anda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSchools.map((school) => {
                const status = school.license?.status ?? 'PENDING';
                const badgeStyle =
                  status === 'ACTIVE'
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'
                    : status === 'PENDING'
                    ? 'bg-amber-500/15 text-amber-300 border-amber-400/30'
                    : 'bg-rose-500/15 text-rose-300 border-rose-400/30';

                return (
                  <div
                    key={school.id}
                    className="rounded-2xl bg-slate-900/90 border border-white/10 p-5 hover:border-teal-400/35 transition-all flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-base text-white">{school.name}</h3>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white/10 text-slate-300">
                              {LEVEL_LABELS[school.level] ?? school.level}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-400 flex items-center gap-1.5">
                            <span>Tautan publik:</span>
                            <code className="text-teal-300">/daftar/{school.slug}</code>
                            <ExternalLink className="w-3 h-3 text-slate-500" />
                          </p>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${badgeStyle}`}
                        >
                          {status === 'ACTIVE' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {status === 'PENDING' && <Clock className="w-3.5 h-3.5" />}
                          {(status === 'SUSPENDED' || status === 'EXPIRED') && (
                            <Ban className="w-3.5 h-3.5" />
                          )}
                          {status}
                        </span>
                      </div>

                      {/* Kotak Kunci Lisensi */}
                      <div className="rounded-xl bg-slate-950/80 border border-white/10 p-3 flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[11px] text-slate-400">
                            Kunci Lisensi ({school.license?.planName ?? 'LIFETIME'})
                          </p>
                          <p className="font-mono text-xs font-bold text-teal-300 mt-0.5">
                            {school.license?.licenseKey ?? '-'}
                          </p>
                        </div>
                        {school.license?.licenseKey && (
                          <button
                            type="button"
                            onClick={() => copyText(school.license!.licenseKey)}
                            className="inline-flex items-center gap-1 rounded-lg bg-white/5 hover:bg-white/10 px-2.5 py-1.5 text-xs text-slate-300 transition-colors cursor-pointer"
                          >
                            {copiedKey === school.license.licenseKey ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-300">Tersalin</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Salin</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {/* Info Admin Sekolah */}
                      <div className="text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
                        <span>
                          Admin:{' '}
                          <strong className="text-slate-200">
                            {school.users[0]?.email ?? 'Belum ada admin'}
                          </strong>
                        </span>
                        <span>
                          Pendaftar: <strong className="text-white">{school.applicantCount}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Tombol Aksi Cepat */}
                    <div className="pt-3 border-t border-white/10 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openLicenseModal(school)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-400/30 px-3 py-2 text-xs font-semibold text-teal-200 transition-colors cursor-pointer"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        Kelola Lisensi
                      </button>
                      <button
                        type="button"
                        onClick={() => openResetModal(school)}
                        disabled={school.users.length === 0}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition-colors disabled:opacity-40 cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        Reset Sandi
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Log Aktivitas Keamanan Terbaru */}
        <section className="rounded-2xl bg-slate-900/80 border border-white/10 p-5 sm:p-6">
          <h2 className="text-sm font-bold text-white mb-3">
            Catatan Aktivitas Sistem Terbaru (Audit Log)
          </h2>
          {recentLogs.length === 0 ? (
            <p className="text-xs text-slate-400">Belum ada catatan aktivitas.</p>
          ) : (
            <div className="divide-y divide-white/10">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-teal-300">
                      {log.action}
                    </span>
                    <span className="text-slate-300">
                      oleh <strong>{log.actorName}</strong> ({log.schoolName})
                    </span>
                  </div>
                  <span className="text-slate-500">
                    {new Date(log.createdAt).toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* MODAL 1: TAMBAH SEKOLAH BARU */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-white/15 p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="text-lg font-bold text-white">Daftarkan Sekolah Mitra Baru</h3>
                <p className="text-xs text-slate-400">
                  Otomatis membuat ruang sekolah, kunci lisensi, periode SPMB, dan akun admin.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="mt-4 rounded-xl bg-rose-500/15 border border-rose-400/30 p-3 flex items-start gap-2 text-xs text-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSchool} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nama Lengkap Sekolah *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Contoh: MI Hidayatul Abidin"
                    className="w-full rounded-xl bg-slate-950 border border-white/15 px-3.5 py-2 text-sm text-white focus:border-teal-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Slug Tautan Publik *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="mi-hidayatul-abidin"
                    className="w-full rounded-xl bg-slate-950 border border-white/15 px-3.5 py-2 text-sm text-teal-300 font-mono focus:border-teal-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Jenjang Pendidikan *
                  </label>
                  <select
                    value={form.level}
                    onChange={(e) => setForm({ ...form, level: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-white/15 px-3.5 py-2 text-sm text-white focus:border-teal-400 focus:outline-none"
                  >
                    <option value="TK_PAUD">TK / PAUD</option>
                    <option value="SD_MI">SD / MI</option>
                    <option value="SMP_MTS">SMP / MTs</option>
                    <option value="SMA_MA">SMA / MA</option>
                    <option value="SMK">SMK</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kode Awalan No. Daftar
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={form.registrationPrefix}
                    onChange={(e) =>
                      setForm({ ...form, registrationPrefix: e.target.value.toUpperCase() })
                    }
                    placeholder="MHA"
                    className="w-full rounded-xl bg-slate-950 border border-white/15 px-3.5 py-2 text-sm text-white font-mono focus:border-teal-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Status Lisensi Awal
                  </label>
                  <select
                    value={form.licenseStatus}
                    onChange={(e) => setForm({ ...form, licenseStatus: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-white/15 px-3.5 py-2 text-sm text-white focus:border-teal-400 focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE (Langsung Aktif)</option>
                    <option value="PENDING">PENDING (Menunggu Pembayaran)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10">
                <p className="text-xs font-bold text-teal-300 mb-2.5">
                  Akun Admin Sekolah Pertama
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nama Operator / Admin *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.adminName}
                      onChange={(e) => setForm({ ...form, adminName: e.target.value })}
                      placeholder="Panitia SPMB"
                      className="w-full rounded-xl bg-slate-950 border border-white/15 px-3.5 py-2 text-sm text-white focus:border-teal-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email Login Admin *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.adminEmail}
                      onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
                      placeholder="admin@sekolah.sch.id"
                      className="w-full rounded-xl bg-slate-950 border border-white/15 px-3.5 py-2 text-sm text-white focus:border-teal-400 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Kata Sandi Awal (Minimal 8 Karakter) *
                    </label>
                    <input
                      type="text"
                      required
                      minLength={8}
                      value={form.adminPassword}
                      onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
                      placeholder="Contoh: DaftarKu2026!"
                      className="w-full rounded-xl bg-slate-950 border border-white/15 px-3.5 py-2 text-sm text-white font-mono focus:border-teal-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-white/15 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-2 text-xs font-bold text-slate-950 hover:from-teal-400 hover:to-emerald-400 disabled:opacity-50 cursor-pointer"
                >
                  {creating ? 'Membuat Ruang Sekolah...' : 'Simpan & Buat Sekolah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: KELOLA LISENSI SEKOLAH */}
      {licenseSchool && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-white/15 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white">Kelola Lisensi Sekolah</h3>
                <p className="text-xs text-teal-300">{licenseSchool.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setLicenseSchool(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {licenseError && (
              <div className="mt-3 rounded-xl bg-rose-500/15 border border-rose-400/30 p-3 text-xs text-rose-200">
                {licenseError}
              </div>
            )}

            <form onSubmit={handleUpdateLicense} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Status Lisensi
                </label>
                <select
                  value={licenseForm.licenseStatus}
                  onChange={(e) =>
                    setLicenseForm({ ...licenseForm, licenseStatus: e.target.value })
                  }
                  className="w-full rounded-xl bg-slate-950 border border-white/15 px-3.5 py-2.5 text-sm text-white focus:border-teal-400 focus:outline-none"
                >
                  <option value="ACTIVE">ACTIVE (Aktif & Bisa Login)</option>
                  <option value="PENDING">PENDING (Menunggu Pembayaran)</option>
                  <option value="SUSPENDED">SUSPENDED (Ditangguhkan Sementara)</option>
                  <option value="EXPIRED">EXPIRED (Masa Berlaku Habis)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Paket Lisensi
                </label>
                <select
                  value={licenseForm.planName}
                  onChange={(e) => setLicenseForm({ ...licenseForm, planName: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-white/15 px-3.5 py-2.5 text-sm text-white focus:border-teal-400 focus:outline-none"
                >
                  <option value="LIFETIME_BASIC">LIFETIME_BASIC</option>
                  <option value="LIFETIME_PRO">LIFETIME_PRO</option>
                  <option value="ENTERPRISE_YAYASAN">ENTERPRISE_YAYASAN</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Catatan Internal ARA Digital
                </label>
                <textarea
                  rows={2}
                  value={licenseForm.notes}
                  onChange={(e) => setLicenseForm({ ...licenseForm, notes: e.target.value })}
                  placeholder="Contoh: Lunas transfer BCA tgl 15 Nov 2026"
                  className="w-full rounded-xl bg-slate-950 border border-white/15 px-3.5 py-2 text-xs text-white focus:border-teal-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setLicenseSchool(null)}
                  className="rounded-xl border border-white/15 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingLicense}
                  className="rounded-xl bg-teal-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-teal-400 disabled:opacity-50 cursor-pointer"
                >
                  {savingLicense ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RESET KATA SANDI ADMIN SEKOLAH */}
      {resetSchool && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-white/15 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white">Reset Kata Sandi Admin</h3>
                <p className="text-xs text-teal-300">{resetSchool.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setResetSchool(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {resetError && (
              <div className="mt-3 rounded-xl bg-rose-500/15 border border-rose-400/30 p-3 text-xs text-rose-200">
                {resetError}
              </div>
            )}

            {resetSuccess && (
              <div className="mt-3 rounded-xl bg-emerald-500/15 border border-emerald-400/30 p-3 text-xs text-emerald-200">
                {resetSuccess}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Pilih Akun Admin Sekolah
                </label>
                <select
                  value={resetUserId}
                  onChange={(e) => setResetUserId(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-white/15 px-3.5 py-2.5 text-sm text-white focus:border-teal-400 focus:outline-none"
                >
                  {resetSchool.users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kata Sandi Baru (Minimal 8 Karakter)
                </label>
                <input
                  type="text"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Masukkan kata sandi baru..."
                  className="w-full rounded-xl bg-slate-950 border border-white/15 px-3.5 py-2.5 text-sm text-white font-mono focus:border-teal-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetSchool(null)}
                  className="rounded-xl border border-white/15 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={resettingPwd}
                  className="rounded-xl bg-teal-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-teal-400 disabled:opacity-50 cursor-pointer"
                >
                  {resettingPwd ? 'Memproses...' : 'Perbarui Kata Sandi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}