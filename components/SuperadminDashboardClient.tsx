'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Building,
  Users,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  User,
  X,
  Menu,
  ChevronRight,
  ShieldCheck,
  Activity,
  Wallet,
  Sparkles,
  Bot,
  Send,
  ExternalLink,
  Power,
  HeartPulse,
  Headphones,
  Copy,
  Check,
} from 'lucide-react';
import { DaftarKuLogo } from '@/components/DaftarKuLogo';

export interface SuperAdminSchoolItem {
  id: string;
  name: string;
  slug: string;
  npsn: string;
  level: string;
  location: string;
  adminName: string;
  adminEmail: string;
  status: 'active' | 'inactive';
  plan: 'FREE' | 'PRO' | 'VIP';
  applicantsCount: number;
  aiUsage: number;
  aiLimit: number;
  revenueContribution: number;
  joinedDate: string;
  healthStatus: 'SEHAT' | 'PERLU_PERHATIAN' | 'KRITIS';
  healthReason: string;
  picStaff: string;
  lastContact: string;
  followUpDate: string;
  notes: string;
}

const DEFAULT_SCHOOLS: SuperAdminSchoolItem[] = [
  {
    id: 'sch-1',
    name: 'MI Hidayatul Abidin',
    slug: 'mi-hidayatul-abidin',
    npsn: '20501234',
    level: 'SD/MI',
    location: 'Sidoarjo, Jawa Timur',
    adminName: 'Mokhammad Alan Tabaika',
    adminEmail: 'admin@miha.sch.id',
    status: 'active',
    plan: 'PRO',
    applicantsCount: 42,
    aiUsage: 18,
    aiLimit: 500,
    revenueContribution: 600000,
    joinedDate: '10 Nov 2026',
    healthStatus: 'SEHAT',
    healthReason: 'Konfigurasi lengkap, pendaftaran aktif, dan rutin menerima siswa.',
    picStaff: 'Alan (Lead Architect)',
    lastContact: 'Hari ini',
    followUpDate: '2026-11-25',
    notes: 'Mitra utama percontohan SaaS DaftarKu.',
  },
  {
    id: 'sch-2',
    name: 'SMA Nusantara Unggul',
    slug: 'sma-nusantara',
    npsn: '20509876',
    level: 'SMA/SMK/MA',
    location: 'Surabaya, Jawa Timur',
    adminName: 'Budi Santoso, M.Pd',
    adminEmail: 'spmb@smanusantara.sch.id',
    status: 'active',
    plan: 'VIP',
    applicantsCount: 185,
    aiUsage: 64,
    aiLimit: 1000,
    revenueContribution: 1000000,
    joinedDate: '12 Nov 2026',
    healthStatus: 'SEHAT',
    healthReason: 'Lonjakan pendaftar tinggi, operasional stabil.',
    picStaff: 'Tim Success',
    lastContact: 'Kemarin',
    followUpDate: '2026-11-28',
    notes: 'Membutuhkan tambahan kuota server menjelang gelombang 2.',
  },
  {
    id: 'sch-3',
    name: 'SMP Islam Al-Hikmah',
    slug: 'smp-al-hikmah',
    npsn: '20504455',
    level: 'SMP/MTs',
    location: 'Malang, Jawa Timur',
    adminName: 'Ustadzah Siti Aminah',
    adminEmail: 'admin@alhikmah.sch.id',
    status: 'active',
    plan: 'FREE',
    applicantsCount: 2,
    aiUsage: 1,
    aiLimit: 25,
    revenueContribution: 10000,
    joinedDate: '14 Nov 2026',
    healthStatus: 'PERLU_PERHATIAN',
    healthReason: 'Pendaftar masih minim (2 siswa), belum melengkapi galeri sekolah.',
    picStaff: 'Support Team',
    lastContact: '3 hari lalu',
    followUpDate: '2026-11-18',
    notes: 'Perlu dijadwalkan sesi pendampingan promosi langsung.',
  },
  {
    id: 'sch-4',
    name: 'MTs Darul Ulum Terpadu',
    slug: 'mts-darul-ulum',
    npsn: '20507788',
    level: 'SMP/MTs',
    location: 'Pasuruan, Jawa Timur',
    adminName: 'Ahmad Fauzi',
    adminEmail: 'info@darululum.sch.id',
    status: 'inactive',
    plan: 'FREE',
    applicantsCount: 0,
    aiUsage: 0,
    aiLimit: 25,
    revenueContribution: 0,
    joinedDate: '15 Nov 2026',
    healthStatus: 'KRITIS',
    healthReason: 'Portal ditutup dan belum ada konfigurasi jadwal gelombang SPMB.',
    picStaff: 'Alan (Lead Architect)',
    lastContact: 'Belum pernah',
    followUpDate: '2026-11-17',
    notes: 'Segera lakukan panggilan WhatsApp untuk reaktivasi akun.',
  },
];

export function SuperAdminDashboardClient() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'schools' | 'mentoring' | 'transactions'>('dashboard');
  const [schools, setSchools] = useState<SuperAdminSchoolItem[]>(DEFAULT_SCHOOLS);
  const [searchQuery, setSearchQuery] = useState('');
  const [healthFilter, setHealthFilter] = useState<'ALL' | 'SEHAT' | 'PERLU_PERHATIAN' | 'KRITIS'>('ALL');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; msg: string }>({ show: false, msg: '' });

  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [aiMessages, setAiMessages] = useState<Array<{ id: string; role: 'ai' | 'user'; text: string; copyable?: string }>>([
    {
      id: 'sa-ai-1',
      role: 'ai',
      text: 'Halo Superadmin! Berdasarkan prinsip No School Left Behind, saya mendeteksi 1 sekolah KRITIS (MTs Darul Ulum) dan 1 PERLU PERHATIAN (SMP Al-Hikmah).\n\nButuh draf WhatsApp pendampingan darurat untuk menghubungi mitra?',
      copyable: 'Assalamu’alaikum Bpk. Ahmad Fauzi (MTs Darul Ulum), kami dari Tim Platform DaftarKu melihat portal SPMB Anda belum aktif. Ada kendala teknis yang bisa kami bantu dampingi hari ini?',
    },
  ]);

  const [formData, setFormData] = useState({
    schoolName: '',
    npsn: '',
    level: 'SD/MI',
    address: '',
    plan: 'FREE' as 'FREE' | 'PRO' | 'VIP',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
  });

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ show: false, msg: '' }), 3200);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const showNotice = (msg: string) => setToast({ show: true, msg });

  const healthMetrics = useMemo(() => {
    const total = schools.length;
    const sehat = schools.filter((s) => s.healthStatus === 'SEHAT').length;
    const perhatian = schools.filter((s) => s.healthStatus === 'PERLU_PERHATIAN').length;
    const kritis = schools.filter((s) => s.healthStatus === 'KRITIS').length;
    const totalApplicants = schools.reduce((acc, s) => acc + s.applicantsCount, 0);
    return { total, sehat, perhatian, kritis, totalApplicants };
  }, [schools]);

  const filteredSchools = useMemo(() => {
    return schools.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.npsn.includes(searchQuery) ||
        s.adminName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchHealth = healthFilter === 'ALL' || s.healthStatus === healthFilter;
      return matchSearch && matchHealth;
    });
  }, [schools, searchQuery, healthFilter]);

  const handleToggleSchoolStatus = (id: string) => {
    setSchools((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const nextStatus = s.status === 'active' ? 'inactive' : 'active';
        showNotice(`Status ${s.name} diperbarui menjadi ${nextStatus.toUpperCase()}`);
        return { ...s, status: nextStatus };
      })
    );
  };

  const handleAddSchool = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const slug = formData.schoolName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newSchool: SuperAdminSchoolItem = {
      id: 'sch-' + Date.now(),
      name: formData.schoolName,
      slug: slug || 'sekolah-baru',
      npsn: formData.npsn,
      level: formData.level,
      location: formData.address || 'Indonesia',
      adminName: formData.adminName,
      adminEmail: formData.adminEmail,
      status: 'active',
      plan: formData.plan,
      applicantsCount: 0,
      aiUsage: 0,
      aiLimit: formData.plan === 'VIP' ? 1000 : formData.plan === 'PRO' ? 500 : 25,
      revenueContribution: formData.plan === 'VIP' ? 1000000 : formData.plan === 'PRO' ? 600000 : 0,
      joinedDate: 'Hari ini',
      healthStatus: 'PERLU_PERHATIAN',
      healthReason: 'Sekolah baru terdaftar, belum ada aktivitas pendaftaran.',
      picStaff: 'Alan (Lead Architect)',
      lastContact: 'Baru saja',
      followUpDate: '2026-11-20',
      notes: 'Mitra baru, jadwalkan orientasi sistem.',
    };

    setTimeout(() => {
      setSchools((prev) => [newSchool, ...prev]);
      setIsSubmitting(false);
      setIsAddModalOpen(false);
      showNotice(`Sekolah ${newSchool.name} berhasil ditambahkan!`);
      setFormData({ schoolName: '', npsn: '', level: 'SD/MI', address: '', plan: 'FREE', adminName: '', adminEmail: '', adminPassword: '' });
    }, 500);
  };

  const handleSendAiPrompt = (customPrompt?: string) => {
    const q = (customPrompt ?? aiInput).trim();
    if (!q) return;
    const reply = `Analisis No School Left Behind: Terdapat 1 sekolah kritis (MTs Darul Ulum) yang memerlukan intervensi WhatsApp. Gunakan draf pesan pendampingan di bawah untuk menghubungi admin sekolah.`;
    const draftWa = `Assalamu’alaikum Bpk. Ahmad Fauzi, kami dari Tim Platform DaftarKu melihat portal SPMB MTs Darul Ulum belum aktif. Ada kendala konfigurasi yang bisa kami bantu dampingi hari ini?`;

    setAiMessages((prev) => [
      ...prev,
      { id: 'u-' + Date.now(), role: 'user', text: q },
      { id: 'a-' + (Date.now() + 1), role: 'ai', text: reply, copyable: draftWa },
    ]);
    if (!customPrompt) setAiInput('');
  };

  // MENU SIDEBAR YANG DISEMAYKAN SESUAI STATE ACTIVE MENU
  const MENUS = [
    { id: 'dashboard', label: 'Dashboard Ekosistem', icon: LayoutDashboard },
    { id: 'schools', label: 'Manajemen Sekolah', icon: Building },
    { id: 'mentoring', label: 'Pendampingan & Follow-Up', icon: Headphones },
    { id: 'transactions', label: 'Paket & Pendapatan', icon: Wallet },
  ] as const;

  return (
    <div className="flex h-screen bg-[#F5F7FC] font-sans text-[#172B4D] overflow-hidden">
      <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-slate-200/85 transition-all duration-300 ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:w-20 lg:translate-x-0'}`}>
        <div className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-slate-100">
          <DaftarKuLogo size="sm" variant={isSidebarOpen ? 'full' : 'icon'} />
          <button type="button" onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 text-slate-400"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 py-6 px-3 space-y-1.5">
          {MENUS.map((menu) => {
            const Icon = menu.icon;
            const isActive = activeMenu === menu.id;
            return (
              <button
                key={menu.id}
                type="button"
                onClick={() => setActiveMenu(menu.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition cursor-pointer ${isActive ? 'bg-[#EAF1FF] text-[#155EEF] font-extrabold' : 'text-slate-500 hover:bg-slate-50 font-semibold'}`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#155EEF]' : 'text-slate-400'}`} />
                <span className={`text-xs truncate ${!isSidebarOpen ? 'lg:hidden' : ''}`}>{menu.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-3 border-t border-slate-100">
          <a href="/dashboard" className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#155EEF] bg-[#F5F7FC] hover:bg-[#EAF1FF]">
            <ExternalLink className="w-4 h-4 shrink-0" />
            <span className={!isSidebarOpen ? 'lg:hidden' : ''}>Ke Panel Admin Sekolah</span>
          </a>
        </div>
      </aside>

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <header className="h-16 bg-white/90 backdrop-blur-xl border-b border-slate-200/85 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setIsSidebarOpen((v) => !v)} className="p-2 text-slate-500 rounded-xl hover:bg-slate-100 cursor-pointer">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <ShieldCheck className="w-4 h-4 text-[#155EEF]" />
              <span className="text-[#102A56] font-extrabold">Superadmin Enterprise Control Center</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="capitalize font-bold text-[#155EEF]">{activeMenu}</span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-extrabold text-emerald-700">
            <HeartPulse className="w-3.5 h-3.5" /> No School Left Behind Aktif
          </span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 pb-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102A56]">Pusat Kendali Ekosistem Sekolah</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">Pastikan setiap mitra mendapatkan pendampingan optimal dan operasional SPMB berjalan lancar.</p>
            </div>
            <button type="button" onClick={() => setIsAddModalOpen(true)} className="inline-flex items-center gap-2 bg-[#155EEF] hover:bg-[#102A56] text-white px-5 py-3 rounded-xl text-xs font-extrabold shadow-md cursor-pointer">
              <Plus className="w-4 h-4" /> Tambah Sekolah
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div onClick={() => { setHealthFilter('ALL'); setActiveMenu('schools'); }} className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-2xs cursor-pointer hover:border-[#155EEF]">
              <p className="text-[10px] font-extrabold text-slate-400">TOTAL MITRA SEKOLAH</p>
              <h3 className="text-2xl font-extrabold text-[#102A56] mt-1">{healthMetrics.total} Lembaga</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Total {healthMetrics.totalApplicants} pendaftar terkelola</p>
            </div>
            <div onClick={() => { setHealthFilter('SEHAT'); setActiveMenu('schools'); }} className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-2xs cursor-pointer hover:border-emerald-300">
              <p className="text-[10px] font-extrabold text-slate-400">SEKOLAH SEHAT</p>
              <h3 className="text-2xl font-extrabold text-[#12B76A] mt-1">{healthMetrics.sehat} Lembaga</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Operasional normal & lancar</p>
            </div>
            <div onClick={() => { setHealthFilter('PERLU_PERHATIAN'); setActiveMenu('mentoring'); }} className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-2xs cursor-pointer hover:border-amber-300">
              <p className="text-[10px] font-extrabold text-slate-400">PERLU PERHATIAN</p>
              <h3 className="text-2xl font-extrabold text-[#F79009] mt-1">{healthMetrics.perhatian} Lembaga</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Membutuhkan pendampingan</p>
            </div>
            <div onClick={() => { setHealthFilter('KRITIS'); setActiveMenu('mentoring'); }} className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-2xs cursor-pointer hover:border-rose-300">
              <p className="text-[10px] font-extrabold text-slate-400">KRITIS (TINDAK SEGERA)</p>
              <h3 className="text-2xl font-extrabold text-[#F04438] mt-1">{healthMetrics.kritis} Lembaga</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Memerlukan intervensi darurat</p>
            </div>
          </div>

          {/* KONTEN BERDASARKAN MENU YANG DIKLIK DI SIDEBAR */}
          {activeMenu === 'mentoring' ? (
            <div className="bg-white rounded-3xl border border-slate-200/70 shadow-2xs p-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h2 className="text-base font-extrabold text-[#102A56]">Pusat Pendampingan & Follow-Up (No School Left Behind)</h2>
                  <p className="text-xs text-slate-500">Daftar sekolah yang membutuhkan perhatian khusus beserta PIC dan jadwal tindak lanjut.</p>
                </div>
                <span className="rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-xs font-extrabold">
                  {schools.filter(s => s.healthStatus !== 'SEHAT').length} Sekolah Perlu Tindakan
                </span>
              </div>
              <div className="space-y-3 text-xs">
                {schools.filter(s => s.healthStatus !== 'SEHAT').map(s => (
                  <div key={s.id} className="rounded-2xl border border-slate-200 bg-[#F5F7FC] p-4 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${s.healthStatus === 'KRITIS' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'}`}>
                          ● {s.healthStatus.replace('_', ' ')}
                        </span>
                        <h3 className="font-extrabold text-[#102A56] text-sm">{s.name}</h3>
                      </div>
                      <p className="text-slate-600"><strong>Alasan:</strong> {s.healthReason}</p>
                      <p className="text-slate-500 text-[11px]">PIC Pendamping: <strong>{s.picStaff}</strong> • Jadwal Follow-Up: <strong>{s.followUpDate}</strong></p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a href={`https://wa.me/?text=Halo%20Admin%20${encodeURIComponent(s.name)},%20kami%20dari%20Tim%20DaftarKu%20ingin%20membantu%20pendampingan%20SPMB%20Anda.`} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold">
                        WhatsApp Pendampingan
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeMenu === 'transactions' ? (
            <div className="bg-white rounded-3xl border border-slate-200/70 shadow-2xs p-6 space-y-4 text-xs">
              <h2 className="text-base font-extrabold text-[#102A56]">Paket Lisensi & Pendapatan Platform</h2>
              <p className="text-slate-500">Ringkasan monetisasi dan pembagian paket Free vs Pro/VIP seluruh mitra sekolah.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="rounded-2xl bg-[#F5F7FC] p-4 border border-slate-200">
                  <p className="text-slate-400 font-bold">Total Pendapatan Ekosistem</p>
                  <p className="text-xl font-extrabold text-[#155EEF] mt-1">Rp 1.610.000</p>
                </div>
                <div className="rounded-2xl bg-[#F5F7FC] p-4 border border-slate-200">
                  <p className="text-slate-400 font-bold">Sekolah Paket PRO/VIP</p>
                  <p className="text-xl font-extrabold text-[#12B76A] mt-1">2 Lembaga</p>
                </div>
                <div className="rounded-2xl bg-[#F5F7FC] p-4 border border-slate-200">
                  <p className="text-slate-400 font-bold">Sekolah Paket FREE (Bagi Hasil)</p>
                  <p className="text-xl font-extrabold text-amber-600 mt-1">2 Lembaga</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              <div className="xl:col-span-8 bg-white rounded-3xl border border-slate-200/70 shadow-2xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-base font-extrabold text-[#102A56]">Manajemen Sekolah & Status Kesehatan</h2>
                  <select value={healthFilter} onChange={(e) => setHealthFilter(e.target.value as any)} className="bg-[#F5F7FC] border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold">
                    <option value="ALL">Semua Kondisi</option>
                    <option value="SEHAT">Sehat</option>
                    <option value="PERLU_PERHATIAN">Perlu Perhatian</option>
                    <option value="KRITIS">Kritis</option>
                  </select>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#F5F7FC] text-[10px] uppercase text-slate-400 border-b border-slate-100">
                        <th className="px-5 py-3.5 font-extrabold">Sekolah & NPSN</th>
                        <th className="px-5 py-3.5 font-extrabold">Kesehatan</th>
                        <th className="px-5 py-3.5 font-extrabold">Paket</th>
                        <th className="px-5 py-3.5 font-extrabold">Pendaftar</th>
                        <th className="px-5 py-3.5 font-extrabold text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredSchools.map((school) => (
                        <tr key={school.id} className="hover:bg-slate-50/70">
                          <td className="px-5 py-4">
                            <p className="font-extrabold text-[#102A56]">{school.name}</p>
                            <p className="text-[11px] text-slate-500">NPSN: {school.npsn} • {school.level}</p>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${school.healthStatus === 'SEHAT' ? 'bg-[#12B76A]/10 text-[#12B76A]' : school.healthStatus === 'PERLU_PERHATIAN' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-700'}`}>
                              ● {school.healthStatus.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-extrabold text-[#155EEF]">{school.plan}</span>
                          </td>
                          <td className="px-5 py-4 font-bold">{school.applicantsCount} Siswa</td>
                          <td className="px-5 py-4 text-right">
                            <button type="button" onClick={() => handleToggleSchoolStatus(school.id)} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 cursor-pointer" title="Toggle Aktif/Nonaktif">
                              <Power className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="xl:col-span-4 bg-white rounded-3xl border border-slate-200/70 shadow-2xs p-5 space-y-4">
                <h2 className="text-base font-extrabold text-[#102A56]">Aktivitas & Kesehatan</h2>
                <div className="rounded-2xl border border-slate-100 bg-[#F5F7FC] p-3.5 text-xs space-y-1">
                  <p className="font-extrabold text-[#102A56]">Sekolah Terdeteksi Kritis</p>
                  <p className="text-[11px] text-slate-600">MTs Darul Ulum Terpadu belum aktif gelombang SPMB.</p>
                  <p className="text-[10px] text-slate-400">20 menit lalu • Health Monitor AI</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#102A56]/50 backdrop-blur-xs">
          <form onSubmit={handleAddSchool} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-base font-extrabold text-[#102A56]">Tambah Sekolah & Akun Admin</h2>
              <button type="button" onClick={() => setIsAddModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <input required placeholder="Nama Sekolah *" value={formData.schoolName} onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })} className="w-full rounded-xl border p-2.5 font-semibold" />
            <input required placeholder="NPSN *" value={formData.npsn} onChange={(e) => setFormData({ ...formData, npsn: e.target.value })} className="w-full rounded-xl border p-2.5 font-semibold" />
            <input required placeholder="Nama Admin Lembaga *" value={formData.adminName} onChange={(e) => setFormData({ ...formData, adminName: e.target.value })} className="w-full rounded-xl border p-2.5 font-semibold" />
            <input required type="email" placeholder="Email Login Admin *" value={formData.adminEmail} onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })} className="w-full rounded-xl border p-2.5 font-semibold" />
            <input required placeholder="Password Awal *" value={formData.adminPassword} onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })} className="w-full rounded-xl border p-2.5 font-semibold" />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-xl border">Batal</button>
              <button type="submit" className="px-5 py-2 rounded-xl bg-[#155EEF] text-white font-extrabold">Simpan & Buat Akun</button>
            </div>
          </form>
        </div>
      )}

      {/* DAFTARKU AI SUPERADMIN DRAWER */}
      <div className="fixed bottom-5 right-5 z-40">
        <button type="button" onClick={() => setIsAiOpen(true)} className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#102A56] to-[#155EEF] text-white pl-4 pr-5 py-3 shadow-xl border border-white/20 hover:scale-[1.03] transition cursor-pointer">
          <Bot className="w-5 h-5 text-[#FF9F1C]" />
          <div className="text-left">
            <p className="text-xs font-extrabold leading-none flex items-center gap-1">DaftarKu AI <Sparkles className="w-3 h-3 text-[#FF9F1C]" /></p>
            <p className="text-[10px] text-blue-200">Superadmin Enterprise AI</p>
          </div>
        </button>
      </div>

      {isAiOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-[#102A56]/40 backdrop-blur-xs" onClick={() => setIsAiOpen(false)} />
          <aside className="relative z-10 w-full sm:max-w-md bg-white h-full shadow-2xl flex flex-col justify-between">
            <div className="bg-gradient-to-r from-[#102A56] to-[#155EEF] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Bot className="w-6 h-6 text-[#FF9F1C]" />
                <div>
                  <h3 className="text-sm font-extrabold">DaftarKu AI — No School Left Behind</h3>
                  <p className="text-[11px] text-blue-200">Asisten Pemantauan & Draf WhatsApp Mitra</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsAiOpen(false)} className="p-1.5 rounded-lg bg-white/10 text-white"><X className="w-4 h-4" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F5F7FC] text-xs">
              <button type="button" onClick={() => handleSendAiPrompt('Siapa sekolah yang berstatus kritis dan buatkan draf WA')} className="w-full text-left rounded-xl bg-white border border-slate-200 p-3 font-bold text-[#102A56] hover:bg-blue-50">
                🚨 Deteksi Sekolah Kritis & Buatkan Draf WA
              </button>

              {aiMessages.map((m) => (
                <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[90%] rounded-2xl p-3.5 leading-relaxed ${m.role === 'user' ? 'bg-[#155EEF] text-white font-medium' : 'bg-white border border-slate-200 text-[#172B4D]'}`}>
                    <p className="whitespace-pre-line">{m.text}</p>
                    {m.copyable && (
                      <div className="mt-3 rounded-xl bg-[#F5F8FF] border border-[#155EEF]/20 p-3 text-[11px] text-[#102A56]">
                        <p className="font-bold mb-1">Draf Pesan WhatsApp Pendampingan:</p>
                        <p className="italic">{m.copyable}</p>
                        <button type="button" onClick={() => { navigator.clipboard.writeText(m.copyable!); setCopiedId(m.id); setTimeout(() => setCopiedId(null), 2000); }} className="mt-2 w-full inline-flex items-center justify-center gap-1 rounded-lg bg-[#155EEF] text-white py-1.5 font-extrabold cursor-pointer">
                          {copiedId === m.id ? <><Check className="w-3.5 h-3.5" /> Berhasil Disalin</> : <><Copy className="w-3.5 h-3.5" /> Salin Draf WhatsApp</>}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSendAiPrompt(); }} className="p-3.5 bg-white border-t border-slate-200 flex gap-2">
              <input type="text" value={aiInput} onChange={(e) => setAiInput(e.target.value)} placeholder="Tanya AI seputar kesehatan sekolah..." className="flex-1 rounded-xl border border-slate-200 bg-[#F5F7FC] px-3.5 py-2 text-xs font-semibold" />
              <button type="submit" className="p-2.5 rounded-xl bg-[#155EEF] text-white cursor-pointer"><Send className="w-4 h-4" /></button>
            </form>
          </aside>
        </div>
      )}

      {toast.show && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-[#102A56] text-white shadow-xl text-xs font-extrabold">
          {toast.msg}
        </div>
      )}
    </div>
  );
}

export default SuperAdminDashboardClient;