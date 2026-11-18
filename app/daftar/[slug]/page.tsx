'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  MapPin,
  Users,
  ArrowRight,
  Lock,
  Printer,
  Search,
  Award,
  BookOpen,
  HeartHandshake,
  QrCode,
  Wallet,
  Clock,
  PhoneCall,
  FileCheck2,
  AlertTriangle,
  Star,
} from 'lucide-react';
import { DaftarKuLogo } from '@/components/DaftarKuLogo';

const HERO_SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1400&q=80',
    caption: 'Lingkungan Belajar Modern, Nyaman & Berkarakter Islami',
  },
  {
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1400&q=80',
    caption: 'Kurikulum Terpadu Berbasis Teknologi & Akhlakul Karimah',
  },
];

export default function PublicRegistrationPortal() {
  const params = useParams();
  const searchParams = useSearchParams();

  const slug = typeof params?.slug === 'string' ? params.slug : 'mi-hidayatul-abidin';
  const initialPlan = (searchParams?.get('plan') as 'FREE' | 'PRO' | 'PREMIUM') || 'PRO';
  const initialUsed = Number(searchParams?.get('used') || 38);
  const initialLimit = Number(searchParams?.get('limit') || (initialPlan === 'PREMIUM' ? 2000 : initialPlan === 'PRO' ? 400 : 40));
  const initialFee = searchParams?.get('fee') !== null ? Number(searchParams.get('fee')) : 100000;

  // State Simulasi Portal (Bisa diuji langsung oleh Admin di bar atas)
  const [plan, setPlan] = useState<'FREE' | 'PRO' | 'PREMIUM'>(initialPlan);
  const [usedQuota, setUsedQuota] = useState<number>(initialUsed);
  const [maxQuota, setMaxQuota] = useState<number>(initialLimit);
  const [schoolRegFee, setSchoolRegFee] = useState<number>(initialFee);
  const [activeSlide, setActiveSlide] = useState(0);

  // Mode Tab: 'register' (Formulir Baru) atau 'check' (Cek Status & Cetak Kartu Siswa Lama)
  const [portalMode, setPortalMode] = useState<'register' | 'check'>('register');

  // State Formulir Pendaftaran
  const [formState, setFormState] = useState({
    fullName: '',
    nisn: '',
    gender: 'L',
    birthPlace: '',
    birthDate: '',
    parentName: '',
    whatsapp: '',
    wave: 'Gelombang 1 (Inden / Prestasi)',
    address: '',
  });

  const [submittedTicket, setSubmittedTicket] = useState<{
    regNo: string;
    name: string;
    nisn: string;
    wave: string;
    totalPaid: number;
    date: string;
  } | null>(null);

  // State Cek Kartu Siswa Terdaftar (Anti-Penyanderaan Data)
  const [lookupQuery, setLookupQuery] = useState('');
  const [foundStudent, setFoundStudent] = useState<{
    regNo: string;
    name: string;
    nisn: string;
    wave: string;
    status: string;
  } | null>(null);

  const schoolName = useMemo(() => {
    if (slug.includes('nusantara')) return 'SMA Nusantara Unggul';
    if (slug.includes('hikmah')) return 'SMP Islam Al-Hikmah';
    if (slug.includes('darul')) return 'MTs Darul Ulum Terpadu';
    return 'MI Hidayatul Abidin';
  }, [slug]);

  // Aturan Tarif Layanan & Komisi Transparan (Bagian A & E)
  const feeBreakdown = useMemo(() => {
    if (schoolRegFee === 0) {
      return {
        schoolFee: 0,
        serviceFee: 0,
        totalApplicantPay: 0,
        note: 'Gratis 100% (Biaya Pendaftaran & Tarif Layanan Rp0)',
      };
    }
    if (plan === 'PREMIUM') {
      return {
        schoolFee: schoolRegFee,
        serviceFee: 2000,
        totalApplicantPay: schoolRegFee + 2000,
        note: 'Termasuk Tarif Layanan Sistem Rp2.000 (Komisi 0%)',
      };
    }
    if (plan === 'PRO') {
      return {
        schoolFee: schoolRegFee,
        serviceFee: 2500,
        totalApplicantPay: schoolRegFee + 2500,
        note: 'Termasuk Tarif Layanan Sistem Rp2.500 (Komisi 0%)',
      };
    }
    // Paket FREE: Komisi 5% dipotong dari pembayaran berbayar
    const comm = Math.round(schoolRegFee * 0.05);
    return {
      schoolFee: schoolRegFee,
      serviceFee: 0,
      totalApplicantPay: schoolRegFee,
      note: `Sudah termasuk layanan gateway (Komisi platform 5% / Rp${comm.toLocaleString('id-ID')})`,
    };
  }, [plan, schoolRegFee]);

  const quotaInfo = useMemo(() => {
    const remaining = Math.max(0, maxQuota - usedQuota);
    const percent = Math.min(100, Math.round((usedQuota / maxQuota) * 100));
    const isFull = usedQuota >= maxQuota;
    return { remaining, percent, isFull };
  }, [usedQuota, maxQuota]);

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quotaInfo.isFull) return;

    const newRegNo = `REG-2026-${Math.floor(100 + Math.random() * 900)}`;
    setSubmittedTicket({
      regNo: newRegNo,
      name: formState.fullName,
      nisn: formState.nisn || '0123456789',
      wave: formState.wave,
      totalPaid: feeBreakdown.totalApplicantPay,
      date: 'Hari ini, Terverifikasi Otomatis',
    });
    setUsedQuota((u) => u + 1);
  };

  const handleCheckExistingStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setFoundStudent({
      regNo: 'REG-2026-001',
      name: lookupQuery.trim() || 'Ahmad Zaki Al-Faruq',
      nisn: '0123456781',
      wave: 'Gelombang 1 (Prestasi)',
      status: 'Terverifikasi & Lulus Seleksi Berkas',
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#0F172A] overflow-x-hidden">
      {/* ANIMASI CSS KUSTOM UNTUK GAMBAR SOFT FLOATING & TEKS BERGERAK */}
      <style>{`
        @keyframes softFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes softFloatDelayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(8px); }
        }
        @keyframes slowKenBurns {
          0% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.08) translate(-1%, -1%); }
          100% { transform: scale(1) translate(0, 0); }
        }
        @keyframes marqueeSmooth {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-soft-float {
          animation: softFloat 5s ease-in-out infinite;
        }
        .animate-soft-float-delayed {
          animation: softFloatDelayed 6s ease-in-out infinite;
        }
        .animate-ken-burns {
          animation: slowKenBurns 22s ease-in-out infinite;
        }
        .animate-marquee-smooth {
          display: flex;
          width: max-content;
          animation: marqueeSmooth 28s linear infinite;
        }
      `}</style>

      {/* RUNNING TEXT (TEKS BERGERAK HALUS DI BAGIAN ATAS) */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E3A8A] to-[#0F172A] text-white py-2.5 px-4 text-xs font-bold overflow-hidden border-b border-white/10 sticky top-0 z-50 shadow-md">
        <div className="animate-marquee-smooth gap-12 items-center">
          <span className="inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            🌟 PENERIMAAN PESERTA DIDIK BARU (SPMB) {schoolName.toUpperCase()} TAHUN AJARAN 2026/2027 TELAH DIBUKA!
          </span>
          <span className="inline-flex items-center gap-2 text-sky-300">
            • Pendaftaran Online Cepat, Transparan & Bukti Kartu Registrasi Langsung Cetak
          </span>
          <span className="inline-flex items-center gap-2 text-emerald-300">
            • Jaminan Perlindungan Data Siswa 100% Aman & Terverifikasi Resmi
          </span>
          <span className="inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            🌟 PENERIMAAN PESERTA DIDIK BARU (SPMB) {schoolName.toUpperCase()} TAHUN AJARAN 2026/2027 TELAH DIBUKA!
          </span>
        </div>
      </div>

      {/* BAR PRATINJAU & SIMULASI CEPAT (UNTUK PENGUJIAN KAPASITAS & TARIF) */}
      <div className="bg-white/90 backdrop-blur-md border-b border-slate-200 py-2.5 px-4 sm:px-8 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <DaftarKuLogo size="sm" variant="full" />
          <span className="hidden md:inline-block text-slate-300">|</span>
          <span className="hidden md:inline-flex items-center gap-1.5 font-bold text-slate-600">
            <ShieldCheck className="w-4 h-4 text-[#155EEF]" /> Portal Resmi SPMB Terintegrasi
          </span>
        </div>

        {/* Simulator Bar untuk Menguji Kuota Penuh 100% & Tarif */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-[11px] font-bold">
          <span className="px-2 text-slate-500">Simulasi Portal:</span>
          <button
            type="button"
            onClick={() => {
              setPlan('FREE');
              setMaxQuota(40);
              setUsedQuota(35);
            }}
            className={`px-2.5 py-1 rounded-lg cursor-pointer transition ${
              !quotaInfo.isFull && plan === 'FREE' ? 'bg-[#155EEF] text-white' : 'bg-white text-slate-700'
            }`}
          >
            Kuota Tersedia (35/40)
          </button>
          <button
            type="button"
            onClick={() => {
              setPlan('FREE');
              setMaxQuota(40);
              setUsedQuota(40);
            }}
            className={`px-2.5 py-1 rounded-lg cursor-pointer transition ${
              quotaInfo.isFull ? 'bg-rose-600 text-white' : 'bg-white text-rose-700'
            }`}
          >
            Uji Kuota Penuh 100% (40/40)
          </button>
          <button
            type="button"
            onClick={() => {
              setPlan('PRO');
              setMaxQuota(400);
              setUsedQuota(42);
            }}
            className={`px-2.5 py-1 rounded-lg cursor-pointer transition ${
              plan === 'PRO' && !quotaInfo.isFull ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-700'
            }`}
          >
            Uji Paket PRO (42/400)
          </button>
          <button
            type="button"
            onClick={() => setSchoolRegFee((f) => (f === 0 ? 100000 : 0))}
            className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 cursor-pointer"
          >
            {schoolRegFee === 0 ? 'Mode: Gratis (Rp0)' : 'Mode: Berbayar (Rp100rb)'}
          </button>
        </div>
      </div>

      {/* HERO SECTION MEMIKAT MATA DENGAN GAMBAR BERGERAK SOFT & FLOATING CARDS */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white py-14 sm:py-20 px-4 sm:px-8">
        {/* Glow Ornaments */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#155EEF]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-0 w-96 h-96 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          {/* Kolom Kiri: Teks Bergerak & Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-extrabold text-sky-300">
              <Award className="w-4 h-4 text-amber-400" /> Terakreditasi Unggul • Pendaftaran Tahun Ajaran 2026/2027
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.15]">
              Wujudkan Masa Depan Gemilang Bersama{' '}
              <span className="bg-gradient-to-r from-sky-300 via-amber-200 to-emerald-300 bg-clip-text text-transparent">
                {schoolName}
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Sistem Penerimaan Peserta Didik Baru (SPMB) berbasis digital yang cepat, transparan, dan terintegrasi. Daftar dari rumah dalam 3 menit dan unduh Kartu Bukti Registrasi secara instan.
            </p>

            {/* Indikator Kuota Live */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 max-w-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-sky-200 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-400" /> Status Kuota Pendaftaran Saat Ini:
                </span>
                <span className={quotaInfo.isFull ? 'text-rose-400 font-black' : 'text-emerald-300 font-black'}>
                  {quotaInfo.isFull
                    ? 'KUOTA PENUH (100%)'
                    : `Tersisa ${quotaInfo.remaining} Kursi (${usedQuota}/${maxQuota} Terisi)`}
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-900/80 rounded-full overflow-hidden p-0.5">
                <div
                  style={{ width: `${quotaInfo.percent}%` }}
                  className={`h-full rounded-full transition-all duration-700 ${
                    quotaInfo.isFull
                      ? 'bg-rose-500'
                      : quotaInfo.percent >= 80
                      ? 'bg-amber-400'
                      : 'bg-gradient-to-r from-[#155EEF] to-emerald-400'
                  }`}
                />
              </div>
            </div>

            {/* Tombol Aksi Cepat */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPortalMode('register')}
                className={`px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm inline-flex items-center gap-2 transition shadow-lg cursor-pointer ${
                  portalMode === 'register'
                    ? 'bg-[#FF9F1C] hover:bg-amber-500 text-slate-950 scale-[1.02]'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                Isi Formulir Pendaftaran <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setPortalMode('check')}
                className={`px-5 py-3.5 rounded-2xl font-black text-xs sm:text-sm inline-flex items-center gap-2 border transition cursor-pointer ${
                  portalMode === 'check'
                    ? 'bg-white text-[#0F172A] border-white shadow-lg'
                    : 'bg-white/5 hover:bg-white/15 text-white border-white/20'
                }`}
              >
                <Printer className="w-4 h-4 text-sky-300" /> Cek Status & Cetak Kartu Siswa Lama
              </button>
            </div>
          </div>

          {/* Kolom Kanan: Gambar Bergerak Soft (Ken Burns + Floating Cards) */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl h-80 sm:h-96 bg-slate-900">
              <img
                src={HERO_SLIDES[activeSlide].url}
                alt={schoolName}
                className="w-full h-full object-cover animate-ken-burns"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-2">
                <p className="text-xs font-bold text-white/95 bg-slate-900/70 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15">
                  ✨ {HERO_SLIDES[activeSlide].caption}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveSlide((s) => (s + 1) % HERO_SLIDES.length)}
                  className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-[11px] font-black text-white shrink-0 cursor-pointer"
                >
                  Ganti Foto
                </button>
              </div>
            </div>

            {/* Kartu Mengambang Soft 1 (Kiri Atas) */}
            <div className="hidden sm:flex animate-soft-float absolute -top-5 -left-6 bg-white text-[#0F172A] p-3.5 rounded-2xl shadow-xl border border-slate-100 items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase">VERIFIKASI OTOMATIS</p>
                <p className="text-xs font-black text-[#0F172A]">Kartu Ujian Langsung Terbit</p>
              </div>
            </div>

            {/* Kartu Mengambang Soft 2 (Kanan Bawah) */}
            <div className="hidden sm:flex animate-soft-float-delayed absolute -bottom-5 -right-4 bg-white text-[#0F172A] p-3.5 rounded-2xl shadow-xl border border-slate-100 items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#155EEF] flex items-center justify-center font-black">
                <Star className="w-5 h-5 fill-[#155EEF]" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase">BEASISWA GELOMBANG 1</p>
                <p className="text-xs font-black text-[#155EEF]">Gratis Seragam & Potongan Gedung</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BAGIAN UTAMA: FORMULIR PENDAFTARAN ATAU PROTEKSI KUOTA 100% */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        {portalMode === 'check' ? (
          /* FITUR CEK STATUS & CETAK KARTU SISWA LAMA (TETAP AKTIF 100% MESKIPUN KUOTA PENUH) */
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-black text-[10px]">
                  ✓ AKSES DOKUMEN HAK SISWA TERLINDUNGI 100%
                </span>
                <h2 className="text-lg font-black text-[#0F172A] mt-2">
                  Cek Status Seleksi & Cetak Kartu Bukti Registrasi
                </h2>
                <p className="text-xs text-slate-500">
                  Siswa yang sudah terdaftar tetap dapat mengakses penuh kartu peserta dan dokumen kapan pun tanpa terpengaruh batas kuota baru.
                </p>
              </div>
            </div>

            <form onSubmit={handleCheckExistingStudent} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Masukkan Nama Siswa / Nomor Registrasi / NISN..."
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
                className="flex-1 rounded-2xl border border-slate-200 bg-[#F8FAFC] px-4 py-3 text-xs font-bold"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-[#155EEF] hover:bg-blue-700 text-white font-black text-xs inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search className="w-4 h-4" /> Cari Data Saya
              </button>
            </form>

            {foundStudent && (
              <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/40 p-5 space-y-4 text-xs">
                <div className="flex justify-between items-center border-b border-emerald-200/70 pb-3">
                  <div>
                    <p className="text-[10px] font-black text-emerald-700 uppercase">DATA DITEMUKAN & AMAN</p>
                    <h3 className="text-base font-black text-[#0F172A]">{foundStudent.name}</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-black text-[10px]">
                    {foundStudent.regNo}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>NISN: <strong className="text-[#0F172A]">{foundStudent.nisn}</strong></div>
                  <div>Jalur: <strong className="text-[#0F172A]">{foundStudent.wave}</strong></div>
                  <div className="col-span-2">Status: <strong className="text-emerald-700">{foundStudent.status}</strong></div>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full py-3 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-black inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Cetak Kartu Registrasi Sekarang
                </button>
              </div>
            )}
          </div>
        ) : submittedTicket ? (
          /* BUKTI PENDAFTARAN BERHASIL */
          <div className="max-w-xl mx-auto bg-white rounded-3xl border-2 border-emerald-500 p-8 shadow-xl space-y-5 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-black text-xs">
                PENDAFTARAN BERHASIL TERVERIFIKASI
              </span>
              <h2 className="text-xl font-black text-[#0F172A] pt-1">{submittedTicket.name}</h2>
              <p className="text-xs text-slate-500">Nomor Registrasi Resmi: <strong className="text-[#155EEF]">{submittedTicket.regNo}</strong></p>
            </div>
            <div className="rounded-2xl bg-[#F8FAFC] p-4 border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between"><span className="text-slate-500">Lembaga Tujuan:</span><strong className="text-[#0F172A]">{schoolName}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">Gelombang:</span><strong>{submittedTicket.wave}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">Total Pembayaran SPMB:</span><strong className="text-emerald-700">Rp {submittedTicket.totalPaid.toLocaleString('id-ID')}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">Status Kartu:</span><strong className="text-emerald-700">{submittedTicket.date}</strong></div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-xl bg-[#155EEF] text-white font-black text-xs inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Cetak Kartu Bukti Registrasi
              </button>
              <button
                type="button"
                onClick={() => setSubmittedTicket(null)}
                className="px-4 py-3 rounded-xl border border-slate-200 font-bold text-xs cursor-pointer"
              >
                Kembali
              </button>
            </div>
          </div>
        ) : quotaInfo.isFull ? (
          /* PROTEKSI SAAT KAPASITAS PENUH 100% (BAGIAN C) */
          <div className="max-w-3xl mx-auto bg-white rounded-3xl border-2 border-rose-300 p-8 shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Lock className="w-7 h-7" />
              </div>
              <div>
                <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-black text-[10px] uppercase">
                  Kapasitas Kuota Paket Penuh ({usedQuota}/{maxQuota})
                </span>
                <h2 className="text-xl font-black text-[#0F172A] mt-1.5">
                  Penerimaan Formulir Baru Dihentikan Sementara
                </h2>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Mohon maaf, kuota penerimaan formulir online pada paket aktif <strong>{schoolName}</strong> saat ini telah mencapai batas 100% ({maxQuota} pendaftar). Formulir akan otomatis terbuka kembali segera setelah pihak sekolah meningkatkan kapasitas paket ke <strong>PRO</strong> atau <strong>PREMIUM</strong>.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200 p-4 space-y-2">
                <h3 className="font-black text-emerald-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Sudah Mendaftar Sebelumnya?
                </h3>
                <p className="text-emerald-800 leading-relaxed">
                  Data dan dokumen Anda yang sudah masuk <strong>100% aman dan tidak dihapus</strong>. Anda tetap dapat mengecek status kelulusan dan mencetak Kartu Peserta.
                </p>
                <button
                  type="button"
                  onClick={() => setPortalMode('check')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs cursor-pointer"
                >
                  Cetak Kartu Peserta Saya →
                </button>
              </div>

              <div className="rounded-2xl bg-blue-50/70 border border-blue-200 p-4 space-y-2">
                <h3 className="font-black text-[#0F172A] flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-[#155EEF]" /> Anda Panitia / Admin Sekolah?
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Tingkatkan kapasitas paket sekolah Anda ke <strong>PRO (400 Pendaftar)</strong> atau <strong>PREMIUM (2.000 Pendaftar)</strong> agar formulir ini otomatis aktif kembali.
                </p>
                <a
                  href="/dashboard"
                  className="inline-block px-4 py-2 rounded-xl bg-[#155EEF] text-white font-black text-xs"
                >
                  Upgrade Paket di Dashboard Admin →
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* FORMULIR PENDAFTARAN PUBLIK + RINCIAN BIAYA TRANSPARAN */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <form
              onSubmit={handleRegisterSubmit}
              className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6"
            >
              <div className="border-b border-slate-100 pb-4">
                <span className="px-3 py-1 rounded-full bg-blue-50 text-[#155EEF] font-black text-[10px]">
                  FORMULIR RESMI SPMB 2026/2027
                </span>
                <h2 className="text-lg sm:text-xl font-black text-[#0F172A] mt-2">
                  Biodata Calon Peserta Didik Baru
                </h2>
                <p className="text-xs text-slate-500">
                  Lengkapi data di bawah ini dengan benar. Nomor registrasi dan kartu peserta akan terbit otomatis.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700">Pilih Gelombang Pendaftaran *</label>
                  <select
                    value={formState.wave}
                    onChange={(e) => setFormState({ ...formState, wave: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-3 mt-1 bg-[#F8FAFC] font-bold text-[#0F172A]"
                  >
                    <option value="Gelombang 1 (Inden / Prestasi)">Gelombang 1 (Inden / Prestasi) — Gratis Seragam Olahraga</option>
                    <option value="Gelombang 2 (Reguler)">Gelombang 2 (Reguler) — Potongan Dana Gedung</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700">Nama Lengkap Calon Siswa *</label>
                  <input
                    required
                    type="text"
                    placeholder="Sesuai Akta Kelahiran / Ijazah"
                    value={formState.fullName}
                    onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-3 mt-1 bg-[#F8FAFC] font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">NISN / NIK Anak *</label>
                  <input
                    required
                    type="text"
                    placeholder="10 digit NISN atau 16 digit NIK"
                    value={formState.nisn}
                    onChange={(e) => setFormState({ ...formState, nisn: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-3 mt-1 bg-[#F8FAFC] font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Nama Orang Tua / Wali *</label>
                  <input
                    required
                    type="text"
                    placeholder="Nama Ayah / Ibu / Wali"
                    value={formState.parentName}
                    onChange={(e) => setFormState({ ...formState, parentName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-3 mt-1 bg-[#F8FAFC] font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Nomor WhatsApp Aktif (Untuk Kirim Kartu) *</label>
                  <input
                    required
                    type="tel"
                    placeholder="Contoh: 081234567890"
                    value={formState.whatsapp}
                    onChange={(e) => setFormState({ ...formState, whatsapp: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-3 mt-1 bg-[#F8FAFC] font-semibold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700">Alamat Lengkap Domisili *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Desa/Kelurahan, RT/RW, Kecamatan, Kabupaten/Kota"
                    value={formState.address}
                    onChange={(e) => setFormState({ ...formState, address: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-3 mt-1 bg-[#F8FAFC] font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#155EEF] to-[#0284C7] hover:opacity-95 text-white font-black text-sm shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                Kirim Pendaftaran & Terbitkan Kartu Peserta <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* KOLOM KANAN: RINCIAN BIAYA TRANSPARAN (BAGIAN A & E) */}
            <div className="lg:col-span-4 space-y-5">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <Wallet className="w-5 h-5 text-[#155EEF]" />
                  <div>
                    <h3 className="text-sm font-black text-[#0F172A]">Rincian Biaya Pendaftaran</h3>
                    <p className="text-[11px] text-slate-400">Transparan & Terverifikasi Otomatis</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-semibold">Biaya Pendaftaran Sekolah:</span>
                    <strong className="text-[#0F172A]">
                      {feeBreakdown.schoolFee === 0 ? 'Gratis (Rp0)' : `Rp ${feeBreakdown.schoolFee.toLocaleString('id-ID')}`}
                    </strong>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-semibold">Tarif Layanan Sistem ({plan}):</span>
                    <strong className="text-[#155EEF]">
                      {feeBreakdown.serviceFee === 0 ? 'Rp 0' : `Rp ${feeBreakdown.serviceFee.toLocaleString('id-ID')}`}
                    </strong>
                  </div>

                  <div className="border-t border-dashed border-slate-200 pt-2.5 flex justify-between items-center text-sm">
                    <span className="font-black text-[#0F172A]">Total Pembayaran:</span>
                    <span className="font-black text-emerald-700 text-base">
                      Rp {feeBreakdown.totalApplicantPay.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#F8FAFC] p-3.5 border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed">
                  💡 <strong>Keterangan:</strong> {feeBreakdown.note}
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] text-white rounded-3xl p-6 shadow-md space-y-3 text-xs">
                <h3 className="font-black text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-300" /> Jaminan Keamanan Data Siswa
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Seluruh data pribadi dan berkas pendaftaran calon siswa dilindungi dengan enkripsi penuh dan menjadi hak milik siswa serta sekolah tujuan.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Building(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
    </svg>
  );
}