'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Wallet,
  Printer,
  Megaphone,
  Zap,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  FileText,
  ExternalLink,
  Copy,
  Check,
  Menu,
  X,
  Bot,
  Sparkles,
  Send,
  TrendingUp,
  ShieldCheck,
  QrCode,
  HardDrive,
  Share2,
  Image as ImageIcon,
  Camera,
  FileUp,
  Edit3,
  Trash2,
  Sliders,
  Upload,
  School,
} from 'lucide-react';
import { DaftarKuLogo } from '@/components/DaftarKuLogo';

interface ApplicantItem {
  id: string;
  regNo: string;
  nisn: string;
  name: string;
  gender: 'L' | 'P';
  originSchool: string;
  photoUrl: string;
  wave: string;
  parentName: string;
  phone: string;
  regDate: string;
  docsStatus: 'Lengkap' | 'Kurang Berkas';
  uploadedDocs: string[];
  paymentStatus: 'Lunas' | 'Menunggu' | 'Gratis (Rp0)';
  selectionStatus: 'Terverifikasi' | 'Menunggu Seleksi' | 'Lulus';
  schoolFeePaid: number;
  serviceFeePaid: number;
}

interface WaveItem {
  id: string;
  name: string;
  period: string;
  quota: number;
  filled: number;
  regFee: number;
  benefit: string;
  status: 'Aktif' | 'Akan Datang' | 'Ditutup';
}

interface CustomDocFieldItem {
  id: string;
  label: string;
  required: boolean;
  active: boolean;
  allowDirectScan: boolean;
  allowPdfUpload: boolean;
  allowImageUpload: boolean;
  maxSizeMb: number;
}

interface UpgradeHistoryItem {
  id: string;
  txId: string;
  date: string;
  fromPlan: string;
  toPlan: string;
  amount: number;
  method: string;
  status: 'Terverifikasi & Aktif';
}

const INITIAL_APPLICANTS: ApplicantItem[] = [
  {
    id: 'sis-1',
    regNo: 'REG-2026-001',
    nisn: '0123456781',
    name: 'Ahmad Zaki Al-Faruq',
    gender: 'L',
    originSchool: 'TK Dharma Wanita Persatuan',
    photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80',
    wave: 'Gelombang 1 (Inden / Prestasi)',
    parentName: 'H. Sulaiman',
    phone: '081234567890',
    regDate: '14 Nov 2026',
    docsStatus: 'Lengkap',
    uploadedDocs: ['Scan KK (PDF)', 'KTP Orang Tua (Scan)', 'Akta Kelahiran (PDF)'],
    paymentStatus: 'Lunas',
    selectionStatus: 'Lulus',
    schoolFeePaid: 100000,
    serviceFeePaid: 5000,
  },
  {
    id: 'sis-2',
    regNo: 'REG-2026-002',
    nisn: '0123456782',
    name: 'Siti Nur Aisyah',
    gender: 'P',
    originSchool: 'RA Muslimat NU 12',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    wave: 'Gelombang 1 (Inden / Prestasi)',
    parentName: 'Hj. Fatimah',
    phone: '081987654321',
    regDate: '15 Nov 2026',
    docsStatus: 'Lengkap',
    uploadedDocs: ['Scan KK (PDF)', 'KTP Orang Tua (Scan)', 'Akta Kelahiran (PDF)'],
    paymentStatus: 'Lunas',
    selectionStatus: 'Terverifikasi',
    schoolFeePaid: 100000,
    serviceFeePaid: 5000,
  },
  {
    id: 'sis-3',
    regNo: 'REG-2026-003',
    nisn: '0123456783',
    name: 'Muhammad Rizki Pratama',
    gender: 'L',
    originSchool: 'PAUD Al-Hidayah',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    wave: 'Gelombang 1 (Inden / Prestasi)',
    parentName: 'Bpk. Hendra',
    phone: '085678901234',
    regDate: '16 Nov 2026',
    docsStatus: 'Kurang Berkas',
    uploadedDocs: ['Scan KK (PDF)'],
    paymentStatus: 'Menunggu',
    selectionStatus: 'Menunggu Seleksi',
    schoolFeePaid: 100000,
    serviceFeePaid: 5000,
  },
  {
    id: 'sis-4',
    regNo: 'REG-2026-004',
    nisn: '0123456784',
    name: 'Nabila Putri Zahra',
    gender: 'P',
    originSchool: 'TK Aisyiyah Bustanul Athfal',
    photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
    wave: 'Gelombang 1 (Inden / Prestasi)',
    parentName: 'Bpk. Wahyu',
    phone: '081345678901',
    regDate: '17 Nov 2026',
    docsStatus: 'Lengkap',
    uploadedDocs: ['Scan KK (PDF)', 'KTP Orang Tua (Scan)', 'Pas Foto 3x4'],
    paymentStatus: 'Lunas',
    selectionStatus: 'Lulus',
    schoolFeePaid: 100000,
    serviceFeePaid: 5000,
  },
];

const INITIAL_WAVES: WaveItem[] = [
  {
    id: 'wv-1',
    name: 'Gelombang 1 (Inden / Prestasi)',
    period: '1 Nov – 31 Des 2026',
    quota: 150,
    filled: 38,
    regFee: 100000,
    benefit: 'Gratis Seragam Olahraga & Potongan Gedung Rp500.000',
    status: 'Aktif',
  },
  {
    id: 'wv-2',
    name: 'Gelombang 2 (Reguler)',
    period: '1 Jan – 31 Mar 2027',
    quota: 150,
    filled: 0,
    regFee: 150000,
    benefit: 'Potongan Dana Pengembangan Rp250.000',
    status: 'Akan Datang',
  },
  {
    id: 'wv-3',
    name: 'Gelombang 3 (Khusus)',
    period: '1 Apr – 30 Jun 2027',
    quota: 100,
    filled: 0,
    regFee: 200000,
    benefit: 'Bebas Tes Akademik Jalur Tahfidz',
    status: 'Akan Datang',
  },
];

const INITIAL_CUSTOM_DOCS: CustomDocFieldItem[] = [
  {
    id: 'doc-1',
    label: 'Scan Kartu Keluarga (KK) Asli',
    required: true,
    active: true,
    allowDirectScan: true,
    allowPdfUpload: true,
    allowImageUpload: true,
    maxSizeMb: 2,
  },
  {
    id: 'doc-2',
    label: 'Scan KTP Orang Tua / Wali (Ayah & Ibu)',
    required: true,
    active: true,
    allowDirectScan: true,
    allowPdfUpload: true,
    allowImageUpload: true,
    maxSizeMb: 2,
  },
  {
    id: 'doc-3',
    label: 'Scan Akta Kelahiran Calon Siswa',
    required: true,
    active: true,
    allowDirectScan: true,
    allowPdfUpload: true,
    allowImageUpload: true,
    maxSizeMb: 2,
  },
  {
    id: 'doc-4',
    label: 'Pas Foto Berwarna 3x4',
    required: true,
    active: true,
    allowDirectScan: true,
    allowPdfUpload: false,
    allowImageUpload: true,
    maxSizeMb: 2,
  },
  {
    id: 'doc-5',
    label: 'Piagam Prestasi / Sertifikat Tahfidz (Opsional)',
    required: false,
    active: true,
    allowDirectScan: true,
    allowPdfUpload: true,
    allowImageUpload: true,
    maxSizeMb: 5,
  },
];

export default function SchoolAdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState<
    'overview' | 'settings' | 'applicants' | 'form_config' | 'waves' | 'payments' | 'cards' | 'broadcast' | 'upgrade'
  >('overview');

  const [schoolProfile, setSchoolProfile] = useState({
    name: 'MI Hidayatul Abidin',
    slug: 'mi-hidayatul-abidin',
    npsn: '20501234',
    level: 'SD/MI Sederajat',
    address: 'Desa Ngampel, Sidoarjo, Jawa Timur',
    whatsappContact: '6281234567890',
    plan: 'FREE' as 'FREE' | 'PRO' | 'PREMIUM',
    applicantsCount: 38,
    registrationFee: 100000,
    packageExpiry: '30 Juni 2027 (1 Periode SPMB)',
    storageUsedMb: 120,
    logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=200&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80',
    vision: 'Terwujudnya generasi Islami yang berakhlakul karimah, unggul dalam prestasi akademik, dan cakap digital.',
    mission:
      '1. Menyelenggarakan pendidikan terpadu berbasis karakter Aswaja.\n2. Mengembangkan potensi tahfidz, sains, dan literasi teknologi.\n3. Membangun sinergi harmonis antara sekolah, wali murid, dan masyarakat.',
    highlights: 'Tahfidz Al-Qur’an, Ekstrakurikuler Robotik & Sains, Lingkungan Asri & Ramah Anak, Guru Bersertifikasi.',
    galleryPhotos: [
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=600&q=80',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
    ] as string[],
  });

  const [applicants, setApplicants] = useState<ApplicantItem[]>(INITIAL_APPLICANTS);
  const [waves, setWaves] = useState<WaveItem[]>(INITIAL_WAVES);
  const [customDocs, setCustomDocs] = useState<CustomDocFieldItem[]>(INITIAL_CUSTOM_DOCS);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedCardApplicant, setSelectedCardApplicant] = useState<ApplicantItem | null>(null);
  const [editingApplicant, setEditingApplicant] = useState<ApplicantItem | null>(null);
  const [editingWave, setEditingWave] = useState<WaveItem | null>(null);
  const [isNewWaveModal, setIsNewWaveModal] = useState(false);

  const [newDocLabel, setNewDocLabel] = useState('');
  const [newDocMaxMb, setNewDocMaxMb] = useState(2);

  const [simApplicantEstimate, setSimApplicantEstimate] = useState(250);
  const [pendingUpgradeInvoice, setPendingUpgradeInvoice] = useState<{
    invoiceCode: string;
    targetPlan: 'PRO' | 'PREMIUM';
    amount: number;
    method: 'QRIS Dinamis' | 'VA BSI' | 'VA Mandiri';
    payload: string;
    createdAt: string;
  } | null>({
    invoiceCode: 'INV-DK-2026-881',
    targetPlan: 'PRO',
    amount: 700000,
    method: 'QRIS Dinamis',
    payload: 'QRIS-DAFTARKU-PRO-700K',
    createdAt: 'Dikirim otomatis oleh Billing Gateway',
  });

  const [upgradeHistory, setUpgradeHistory] = useState<UpgradeHistoryItem[]>([
    {
      id: 'uh-1',
      txId: 'ACT-2026-001',
      date: '10 Nov 2026',
      fromPlan: 'Inisialisasi',
      toPlan: 'FREE (40 Kuota)',
      amount: 0,
      method: 'Sistem Otomatis',
      status: 'Terverifikasi & Aktif',
    },
  ]);

  const [waBroadcastText, setWaBroadcastText] = useState(
    'Assalamu’alaikum Wr. Wb. Bapak/Ibu Wali Calon Siswa MI Hidayatul Abidin, berkas pendaftaran putra/putri Anda telah kami terima. Silakan unduh Kartu Registrasi melalui portal SPMB kami.'
  );

  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; msg: string }>({ show: false, msg: '' });

  useEffect(() => {
    if (toast.show) {
      const t = setTimeout(() => setToast({ show: false, msg: '' }), 3500);
      return () => clearTimeout(t);
    }
  }, [toast.show]);

  const showNotice = (msg: string) => setToast({ show: true, msg });

  const planConfig = useMemo(() => {
    const isFreeReg = schoolProfile.registrationFee === 0;
    if (schoolProfile.plan === 'PREMIUM') {
      return {
        name: 'PREMIUM',
        price: 2000000,
        maxCapacity: 2000,
        serviceFeePerApplicant: isFreeReg ? 0 : 2000,
        commissionPercent: 0,
        storageLimitMb: 5120,
        badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      };
    }
    if (schoolProfile.plan === 'PRO') {
      return {
        name: 'PRO',
        price: 700000,
        maxCapacity: 400,
        serviceFeePerApplicant: isFreeReg ? 0 : 2500,
        commissionPercent: 0,
        storageLimitMb: 2048,
        badgeColor: 'bg-blue-50 text-[#155EEF] border-blue-200',
      };
    }
    return {
      name: 'FREE',
      price: 0,
      maxCapacity: 40,
      serviceFeePerApplicant: isFreeReg ? 0 : Math.round(schoolProfile.registrationFee * 0.05),
      commissionPercent: isFreeReg ? 0 : 5,
      storageLimitMb: 512,
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
    };
  }, [schoolProfile.plan, schoolProfile.registrationFee]);

  const quotaStats = useMemo(() => {
    const total = planConfig.maxCapacity;
    const used = schoolProfile.applicantsCount;
    const remaining = Math.max(0, total - used);
    const percent = Math.min(100, Math.round((used / total) * 100));
    const isFull = used >= total;
    const isWarning90 = !isFull && percent >= 90;
    const isWarning80 = !isFull && percent >= 80 && percent < 90;

    return { total, used, remaining, percent, isFull, isWarning90, isWarning80 };
  }, [planConfig.maxCapacity, schoolProfile.applicantsCount]);

  const spmbFinancials = useMemo(() => {
    const grossSchoolRevenue = schoolProfile.applicantsCount * schoolProfile.registrationFee;
    const totalPlatformFee = schoolProfile.applicantsCount * planConfig.serviceFeePerApplicant;
    const gatewayFeePerTx = schoolProfile.registrationFee > 0 ? 1500 : 0;
    const totalGatewayFee = schoolProfile.applicantsCount * gatewayFeePerTx;

    const netSchoolBalance =
      schoolProfile.plan === 'FREE'
        ? Math.max(0, grossSchoolRevenue - totalPlatformFee)
        : grossSchoolRevenue;

    return {
      grossSchoolRevenue,
      totalPlatformFee,
      totalGatewayFee,
      netSchoolBalance,
      totalPaidByApplicant:
        schoolProfile.plan === 'FREE'
          ? schoolProfile.registrationFee
          : schoolProfile.registrationFee + planConfig.serviceFeePerApplicant,
    };
  }, [schoolProfile.applicantsCount, schoolProfile.registrationFee, schoolProfile.plan, planConfig]);

  const filteredApplicants = useMemo(() => {
    return applicants.filter((a) => {
      const matchSearch =
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.regNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.nisn.includes(searchQuery) ||
        a.originSchool.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || a.selectionStatus === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [applicants, searchQuery, statusFilter]);

  const handleRequestUpgrade = (targetPlan: 'PRO' | 'PREMIUM', method: 'QRIS Dinamis' | 'VA BSI' = 'QRIS Dinamis') => {
    const amount = targetPlan === 'PREMIUM' ? 2000000 : 700000;
    const code = `INV-DK-2026-${Math.floor(100 + Math.random() * 900)}`;
    setPendingUpgradeInvoice({
      invoiceCode: code,
      targetPlan,
      amount,
      method,
      payload: method === 'QRIS Dinamis' ? `QRIS-DAFTARKU-${targetPlan}-${code}` : `90087721${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: 'Baru saja dibuat',
    });
    setActiveMenu('upgrade');
    showNotice(`Tagihan ${code} (${targetPlan}) berhasil dibuat. Silakan selesaikan pembayaran untuk aktivasi otomatis.`);
  };

  const handleVerifyUpgradePayment = () => {
    if (!pendingUpgradeInvoice) return;
    const prevPlan = schoolProfile.plan;
    const nextPlan = pendingUpgradeInvoice.targetPlan;

    setSchoolProfile((prev) => ({
      ...prev,
      plan: nextPlan,
    }));

    const newHistory: UpgradeHistoryItem = {
      id: 'uh-' + Date.now(),
      txId: pendingUpgradeInvoice.invoiceCode,
      date: 'Hari ini (Terverifikasi)',
      fromPlan: prevPlan,
      toPlan: `${nextPlan} (${nextPlan === 'PREMIUM' ? '2.000' : '400'} Kuota)`,
      amount: pendingUpgradeInvoice.amount,
      method: pendingUpgradeInvoice.method,
      status: 'Terverifikasi & Aktif',
    };

    setUpgradeHistory((prev) => [newHistory, ...prev]);
    setPendingUpgradeInvoice(null);
    showNotice(`Pembayaran terverifikasi! Paket ${nextPlan} aktif otomatis & penerimaan formulir publik kembali dibuka.`);
  };

  const handleVerifyApplicant = (id: string) => {
    setApplicants((prev) =>
      prev.map((a) => (a.id === id ? { ...a, docsStatus: 'Lengkap', selectionStatus: 'Lulus' } : a))
    );
    showNotice('Status berkas & kelulusan siswa berhasil diverifikasi!');
  };

  const handleSaveEditedApplicant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApplicant) return;
    setApplicants((prev) => prev.map((a) => (a.id === editingApplicant.id ? editingApplicant : a)));
    showNotice(`Data pendaftar ${editingApplicant.name} berhasil diperbarui!`);
    setEditingApplicant(null);
  };

  const handleApplicantPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingApplicant) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditingApplicant({ ...editingApplicant, photoUrl: reader.result });
        showNotice('Foto pendaftar berhasil diunggah!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveWave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWave) return;
    if (isNewWaveModal) {
      setWaves((prev) => [...prev, editingWave]);
      showNotice(`${editingWave.name} berhasil ditambahkan!`);
    } else {
      setWaves((prev) => prev.map((w) => (w.id === editingWave.id ? editingWave : w)));
      showNotice(`Pengaturan ${editingWave.name} berhasil diperbarui!`);
    }
    setEditingWave(null);
    setIsNewWaveModal(false);
  };

  const handleDeleteWave = (id: string) => {
    setWaves((prev) => prev.filter((w) => w.id !== id));
    showNotice('Gelombang pendaftaran berhasil dihapus.');
  };

  const handleAddCustomDocField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocLabel.trim()) return;
    const newItem: CustomDocFieldItem = {
      id: 'doc-' + Date.now(),
      label: newDocLabel.trim(),
      required: true,
      active: true,
      allowDirectScan: true,
      allowPdfUpload: true,
      allowImageUpload: true,
      maxSizeMb: Number(newDocMaxMb) || 2,
    };
    setCustomDocs((prev) => [...prev, newItem]);
    setNewDocLabel('');
    showNotice(`Syarat berkas "${newItem.label}" (Maks ${newItem.maxSizeMb} MB) berhasil ditambahkan!`);
  };

  const handleDirectImageUpload = (
    target: 'logo' | 'banner' | 'gallery',
    e: React.ChangeEvent<HTMLInputElement>,
    galleryIdx?: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (target === 'logo') {
        setSchoolProfile((prev) => ({ ...prev, logoUrl: dataUrl }));
        showNotice(`Logo "${file.name}" berhasil diunggah!`);
      } else if (target === 'banner') {
        setSchoolProfile((prev) => ({ ...prev, bannerUrl: dataUrl }));
        showNotice(`Banner/Thumbnail "${file.name}" berhasil diunggah!`);
      } else if (target === 'gallery' && typeof galleryIdx === 'number') {
        setSchoolProfile((prev) => {
          const updated = [...prev.galleryPhotos];
          updated[galleryIdx] = dataUrl;
          return { ...prev, galleryPhotos: updated };
        });
        showNotice(`Foto Galeri #${galleryIdx + 1} ("${file.name}") berhasil diunggah!`);
      }
    };
    reader.readAsDataURL(file);
  };

  const getInstitutionPublicUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    return `${origin}/daftar/${schoolProfile.slug}`;
  };

  const handleCopyPublicLink = () => {
    const url = getInstitutionPublicUrl();
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    showNotice(`Link resmi ${url} berhasil disalin!`);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareToWhatsApp = () => {
    const localOrCurrentUrl = getInstitutionPublicUrl();
    const productionClickableUrl = `https://daftarku.id/daftar/${schoolProfile.slug}`;
    const activeWave = waves.find((w) => w.status === 'Aktif') || waves[0];

    const text = [
      `Assalamu'alaikum Wr. Wb.`,
      ``,
      `Telah dibuka Penerimaan Peserta Didik Baru (SPMB) *${schoolProfile.name}* (${schoolProfile.level}).`,
      ``,
      `📌 *${activeWave ? activeWave.name : 'Gelombang 1'}*: ${activeWave ? activeWave.period : 'Aktif'}`,
      `🎁 *Keunggulan & Benefit*: ${activeWave ? activeWave.benefit : schoolProfile.highlights}`,
      ``,
      `Silakan klik link biru resmi lembaga kami di bawah ini untuk mengisi formulir & mencetak Kartu Peserta:`,
      `${productionClickableUrl}`,
      ``,
      `🔗 Link Akses Server Lokal / Langsung:`,
      `${localOrCurrentUrl}`,
      ``,
      `Terima kasih.`,
    ].join('\n');

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    showNotice('Membuka WhatsApp dengan Link Biru Aktif atas nama lembaga!');
  };

  const handleUpdateSchoolNameAndSlug = (newName: string) => {
    const autoSlug = newName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setSchoolProfile((prev) => ({
      ...prev,
      name: newName,
      slug: autoSlug || 'lembaga-pendidikan',
    }));
  };

  const MENUS = [
    { id: 'overview', label: '1. Ringkasan & Statistik', icon: LayoutDashboard },
    { id: 'settings', label: '2. Profil, Media & Visual', icon: ImageIcon },
    { id: 'applicants', label: 'Data Pendaftar & Edit', icon: Users, badge: `${applicants.length}` },
    { id: 'form_config', label: 'Atur Form & Scan Berkas', icon: Sliders },
    { id: 'waves', label: 'Jadwal Gelombang', icon: Calendar },
    { id: 'payments', label: 'Pembayaran SPMB', icon: Wallet },
    { id: 'cards', label: 'Cetak Kartu & Seleksi', icon: Printer },
    { id: 'broadcast', label: 'Broadcast WA Wali', icon: Megaphone },
    { id: 'upgrade', label: 'Upgrade Paket & Kuota', icon: Zap, highlight: true },
  ] as const;

  return (
    <div className="flex h-screen bg-[#F4F6F9] font-sans text-[#1E293B] overflow-hidden">
      {/* SIDEBAR GELAP ELEGAN DAFTARKU */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-[#0F172A] text-slate-300 transition-all duration-300 ${
          isSidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:w-20 lg:translate-x-0'
        }`}
      >
        <div className="h-20 flex items-center justify-between px-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5 bg-white/95 px-3 py-1.5 rounded-xl shadow-sm">
            <DaftarKuLogo size="sm" variant={isSidebarOpen ? 'full' : 'icon'} />
          </div>
          <button type="button" onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSidebarOpen && (
          <div className="mx-4 my-3 p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">LEMBAGA MITRA</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${planConfig.badgeColor}`}>
                {schoolProfile.plan}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              {schoolProfile.logoUrl && (
                <img
                  src={schoolProfile.logoUrl}
                  alt="Logo"
                  className="w-8 h-8 rounded-lg object-cover border border-white/20 shrink-0"
                />
              )}
              <div className="min-w-0">
                <p className="text-xs font-black text-white truncate">{schoolProfile.name}</p>
                <p className="text-[10px] text-sky-400 truncate">/daftar/{schoolProfile.slug}</p>
              </div>
            </div>
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-slate-400">Kuota Pendaftar:</span>
                <span className={quotaStats.isFull ? 'text-rose-400' : 'text-[#38BDF8]'}>
                  {quotaStats.used}/{quotaStats.total} ({quotaStats.percent}%)
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div
                  style={{ width: `${quotaStats.percent}%` }}
                  className={`h-full transition-all ${
                    quotaStats.isFull ? 'bg-rose-500' : quotaStats.percent >= 80 ? 'bg-amber-400' : 'bg-[#38BDF8]'
                  }`}
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 py-2 px-3 space-y-1 overflow-y-auto">
          {MENUS.map((menu) => {
            const Icon = menu.icon;
            const isActive = activeMenu === menu.id;
            return (
              <button
                key={menu.id}
                type="button"
                onClick={() => setActiveMenu(menu.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
                  isActive
                    ? 'bg-[#155EEF] text-white font-bold shadow-md'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-white font-medium'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'highlight' in menu && menu.highlight ? 'text-amber-400' : 'text-slate-400'
                    }`}
                  />
                  <span className={`text-xs truncate ${!isSidebarOpen ? 'lg:hidden' : ''}`}>{menu.label}</span>
                </div>
                {isSidebarOpen && 'badge' in menu && menu.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/15 text-white">
                    {menu.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <a
            href={`/daftar/${schoolProfile.slug}?plan=${schoolProfile.plan}&used=${quotaStats.used}&limit=${quotaStats.total}&fee=${schoolProfile.registrationFee}`}
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#155EEF] to-[#0284C7] hover:opacity-95 shadow-sm"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            <span className={!isSidebarOpen ? 'lg:hidden' : ''}>Cek Tampilan Link Pendaftar</span>
          </a>
          <a
            href="/superadmin"
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-bold text-slate-400 hover:text-white hover:bg-slate-800/60"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className={!isSidebarOpen ? 'lg:hidden' : ''}>Ke Panel Superadmin</span>
          </a>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <div className="bg-[#0F172A] text-slate-200 py-2 px-6 text-[11px] font-semibold flex items-center gap-3 overflow-hidden shrink-0 border-b border-slate-800">
          <span className="bg-[#155EEF] px-2 py-0.5 rounded text-[10px] uppercase font-black text-white shrink-0">
            SPMB Live
          </span>
          <div className="whitespace-nowrap overflow-hidden animate-marquee">
            📢 Panel Admin SPMB {schoolProfile.name} Aktif — Link Resmi: https://daftarku.id/daftar/{schoolProfile.slug} • Unggah Foto Galeri 10x, Kartu Peserta Ber-Barcode, & Jadwal Gelombang Fleksibel Siap Digunakan!
          </div>
        </div>

        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-6 gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen((v) => !v)}
              className="p-2 text-slate-500 rounded-xl hover:bg-slate-100 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm sm:text-base font-black text-[#0F172A]">{schoolProfile.name}</h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Link Lembaga: <strong className="text-[#155EEF]">/daftar/{schoolProfile.slug}</strong> • Paket: <strong>{schoolProfile.plan}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden 2xl:flex items-center gap-1 bg-[#F4F6F9] p-1 rounded-xl border border-slate-200 text-[10px] font-bold">
              <span className="px-2 text-slate-400">Uji Kuota:</span>
              <button
                type="button"
                onClick={() => setSchoolProfile((p) => ({ ...p, applicantsCount: Math.round(planConfig.maxCapacity * 0.82) }))}
                className="px-2 py-1 rounded-lg bg-white hover:bg-amber-50 text-amber-700 border border-slate-200 cursor-pointer"
              >
                82%
              </button>
              <button
                type="button"
                onClick={() => setSchoolProfile((p) => ({ ...p, applicantsCount: Math.round(planConfig.maxCapacity * 0.95) }))}
                className="px-2 py-1 rounded-lg bg-white hover:bg-orange-50 text-orange-700 border border-slate-200 cursor-pointer"
              >
                95%
              </button>
              <button
                type="button"
                onClick={() => setSchoolProfile((p) => ({ ...p, applicantsCount: planConfig.maxCapacity }))}
                className="px-2 py-1 rounded-lg bg-white hover:bg-rose-50 text-rose-700 border border-slate-200 cursor-pointer"
              >
                100%
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopyPublicLink}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-[#0F172A] cursor-pointer shadow-2xs"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#155EEF]" />}
              <span className="hidden md:inline">{copiedLink ? 'Tersalin' : 'Salin Link'}</span>
            </button>

            <button
              type="button"
              onClick={handleShareToWhatsApp}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black cursor-pointer shadow-xs"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share Link ke WA</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMenu('upgrade')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black cursor-pointer shadow-xs"
            >
              <Zap className="w-4 h-4" /> Upgrade
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-6 pb-24">
          {quotaStats.isFull ? (
            <div className="rounded-3xl bg-rose-50 border-2 border-rose-300 p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-black text-[10px] uppercase">
                      Kapasitas 100% Penuh ({quotaStats.used}/{quotaStats.total})
                    </span>
                    <span className="text-xs font-bold text-rose-800">• Formulir Publik Dihentikan Sementara</span>
                  </div>
                  <h3 className="text-sm font-black text-rose-950">
                    Kuota Paket {schoolProfile.plan} Telah Habis — Data Siswa Lama Tetap Aman & Terbuka 100%!
                  </h3>
                  <p className="text-xs text-rose-800 leading-relaxed">
                    Penerimaan formulir baru dihentikan sementara. Namun <strong>seluruh data siswa yang sudah masuk tidak dihapus dan tidak diburamkan</strong>. Anda tetap bebas mengedit, memverifikasi, mencetak kartu peserta ber-barcode, dan mengekspor Excel/PDF.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleRequestUpgrade('PRO')}
                  className="px-4 py-2.5 rounded-xl bg-[#155EEF] hover:bg-blue-700 text-white font-black text-xs cursor-pointer shadow-sm"
                >
                  Upgrade PRO (Rp700rb)
                </button>
                <button
                  type="button"
                  onClick={() => handleRequestUpgrade('PREMIUM')}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs cursor-pointer shadow-sm"
                >
                  Upgrade PREMIUM (Rp2jt)
                </button>
              </div>
            </div>
          ) : quotaStats.isWarning90 ? (
            <div className="rounded-3xl bg-orange-50 border border-orange-300 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-orange-950 uppercase">
                    Rekomendasi Upgrade — Kapasitas Mencapai {quotaStats.percent}% ({quotaStats.used}/{quotaStats.total} Pendaftar)
                  </h4>
                  <p className="text-xs text-orange-800 mt-0.5">
                    Sisa kapasitas tinggal <strong>{quotaStats.remaining} kursi lagi</strong>. Segera tingkatkan ke Paket PRO atau PREMIUM agar portal pendaftaran tidak tertutup saat kuota mencapai 100%.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveMenu('upgrade')}
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs shrink-0 cursor-pointer"
              >
                Upgrade Sekarang →
              </button>
            </div>
          ) : quotaStats.isWarning80 ? (
            <div className="rounded-3xl bg-amber-50 border border-amber-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-xs font-bold text-amber-900">
                  <strong>Peringatan Awal (80%+):</strong> Kuota pendaftar telah terpakai {quotaStats.used} dari {quotaStats.total} ({quotaStats.percent}%). Sisa kuota: {quotaStats.remaining} pendaftar.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveMenu('upgrade')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs shrink-0 cursor-pointer"
              >
                Cek Paket Upgrade
              </button>
            </div>
          ) : null}

          <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              {MENUS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setActiveMenu(m.id)}
                  className={`px-3.5 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                    activeMenu === m.id ? 'bg-blue-50 text-[#155EEF]' : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {activeMenu === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs hover:border-[#155EEF] transition">
                  <div className="flex items-center justify-between">
                    <span className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-[#155EEF]">
                      <Users className="w-4 h-4" />
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" /> {quotaStats.percent}% Terpakai
                    </span>
                  </div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-3">
                    KAPASITAS PENDAFTAR ({schoolProfile.plan})
                  </p>
                  <h3 className="text-xl font-black text-[#0F172A] mt-0.5">
                    {quotaStats.used} / {quotaStats.total} Siswa
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Sisa Kapasitas: <strong className="text-[#155EEF]">{quotaStats.remaining} Kursi</strong>
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs hover:border-emerald-300 transition">
                  <div className="flex items-center justify-between">
                    <span className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-[#12B76A]">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600">Aman & Lengkap</span>
                  </div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-3">
                    SYARAT BERKAS AKTIF
                  </p>
                  <h3 className="text-xl font-black text-[#12B76A] mt-0.5">
                    {customDocs.filter((d) => d.active).length} Jenis Dokumen
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1">Scan Kamera & Upload PDF Aktif</p>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs hover:border-amber-300 transition">
                  <div className="flex items-center justify-between">
                    <span className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-[#F79009]">
                      <Wallet className="w-4 h-4" />
                    </span>
                    <span className="text-[11px] font-bold text-[#155EEF]">
                      {schoolProfile.registrationFee === 0
                        ? 'Pendaftaran Gratis'
                        : `Biaya Rp${schoolProfile.registrationFee.toLocaleString('id-ID')}`}
                    </span>
                  </div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-3">
                    KAS MURNI SEKOLAH (SPMB)
                  </p>
                  <h3 className="text-xl font-black text-[#0F172A] mt-0.5">
                    Rp {spmbFinancials.netSchoolBalance.toLocaleString('id-ID')}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {schoolProfile.plan === 'FREE'
                      ? `Komisi 5% (${schoolProfile.registrationFee === 0 ? 'Rp0' : 'Rp' + planConfig.serviceFeePerApplicant.toLocaleString('id-ID')})`
                      : `Tarif Layanan Rp${planConfig.serviceFeePerApplicant.toLocaleString('id-ID')} (Komisi 0%)`}
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs hover:border-purple-300 transition">
                  <div className="flex items-center justify-between">
                    <span className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                      <HardDrive className="w-4 h-4" />
                    </span>
                    <span className="text-[11px] font-bold text-purple-700">{schoolProfile.plan} Tier</span>
                  </div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-3">
                    PENYIMPANAN BERKAS & MASA AKTIF
                  </p>
                  <h3 className="text-xl font-black text-[#0F172A] mt-0.5">
                    {schoolProfile.storageUsedMb} MB / {planConfig.storageLimitMb >= 1024 ? `${planConfig.storageLimitMb / 1024} GB` : `${planConfig.storageLimitMb} MB`}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1">Berlaku: {schoolProfile.packageExpiry}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                <div className="xl:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-sm font-black text-[#0F172A]">Tren Pendaftaran Siswa & Pembayaran SPMB</h2>
                      <p className="text-[11px] text-slate-400">
                        Grafik pergerakan pendaftar harian di seluruh gelombang penerimaan.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleShareToWhatsApp}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-black text-[11px] rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" /> Bagikan Link /daftar/{schoolProfile.slug}
                    </button>
                  </div>
                  <div className="h-56 w-full bg-gradient-to-b from-blue-50/50 to-transparent rounded-2xl p-5 flex flex-col justify-end relative border border-slate-100">
                    <div className="grid grid-cols-10 gap-3 items-end h-36 pt-4 px-2">
                      {[25, 40, 35, 60, 50, 75, 68, 85, 90, 95].map((val, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end">
                          <div
                            style={{ height: `${val}%` }}
                            className={`w-full rounded-t-lg transition-all ${
                              idx === 9 ? 'bg-[#155EEF]' : 'bg-[#38BDF8]/75 hover:bg-[#155EEF]'
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 z-10 pt-3 border-t border-slate-200">
                      <span>H-9</span><span>H-8</span><span>H-7</span><span>H-6</span><span>H-5</span>
                      <span>H-4</span><span>H-3</span><span>H-2</span><span>Kemarin</span><span>Hari Ini</span>
                    </div>
                  </div>
                </div>

                <div className="xl:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-black text-[#0F172A]">Indikator Kapasitas Paket</h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${planConfig.badgeColor}`}>
                      {schoolProfile.plan}
                    </span>
                  </div>
                  <div className="h-44 flex items-center justify-center relative">
                    <div
                      className={`w-36 h-36 rounded-full border-[12px] flex flex-col items-center justify-center shadow-inner ${
                        quotaStats.isFull
                          ? 'border-rose-500'
                          : quotaStats.percent >= 80
                          ? 'border-amber-500 border-t-[#155EEF]'
                          : 'border-[#155EEF] border-r-emerald-500'
                      }`}
                    >
                      <span className="text-[10px] font-bold text-slate-400">Terpakai</span>
                      <span className="text-2xl font-black text-[#0F172A]">{quotaStats.percent}%</span>
                      <span className="text-[10px] font-bold text-slate-500">
                        {quotaStats.used}/{quotaStats.total}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5 pt-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Total Kapasitas Paket:</span>
                      <strong className="text-[#0F172A]">{quotaStats.total} Pendaftar Valid</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Sisa Kuota Saat Ini:</span>
                      <strong className={quotaStats.remaining <= 5 ? 'text-rose-600' : 'text-emerald-600'}>
                        {quotaStats.remaining} Pendaftar
                      </strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveMenu('upgrade')}
                      className="w-full mt-2 py-2.5 rounded-xl bg-[#155EEF] hover:bg-blue-700 text-white font-black text-xs cursor-pointer"
                    >
                      Tingkatkan Kapasitas Kuota →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'settings' && (
            <div className="space-y-6 text-xs">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#155EEF] font-black text-[10px]">
                      MENU URUTAN KE-2 • UNGGAH FOTO LANGSUNG DARI PERANGKAT (OPSIONAL)
                    </span>
                    <h2 className="text-sm sm:text-base font-black text-[#0F172A] mt-1">
                      Profil, Media & Identitas Visual Lembaga
                    </h2>
                    <p className="text-slate-500">
                      Unggah foto Logo, Banner/Thumbnail utama, serta 10 foto dokumentasi kegiatan sekolah langsung dari galeri perangkat Anda.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleShareToWhatsApp}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Share2 className="w-4 h-4" /> Share Link Biru ke WA
                    </button>
                    <a
                      href={`/daftar/${schoolProfile.slug}?plan=${schoolProfile.plan}&used=${quotaStats.used}&limit=${quotaStats.total}&fee=${schoolProfile.registrationFee}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-[#155EEF] hover:bg-blue-700 text-white font-black inline-flex items-center gap-1.5 shadow-xs"
                    >
                      <ExternalLink className="w-4 h-4" /> Cek Tampilan Link Pendaftar
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="font-bold text-slate-700">Nama Resmi Lembaga *</label>
                    <input
                      type="text"
                      value={schoolProfile.name}
                      onChange={(e) => handleUpdateSchoolNameAndSlug(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2.5 mt-1 bg-[#F4F6F9] font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700">Slug Link Pendaftar (Otomatis Atas Nama Lembaga)</label>
                    <div className="flex items-center mt-1 rounded-xl border border-slate-200 bg-[#F4F6F9] px-3 py-2.5">
                      <span className="text-slate-400 font-semibold">/daftar/</span>
                      <input
                        type="text"
                        value={schoolProfile.slug}
                        onChange={(e) => setSchoolProfile({ ...schoolProfile, slug: e.target.value })}
                        className="bg-transparent font-black text-[#155EEF] focus:outline-none w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700">Jenjang Pendidikan Lembaga</label>
                    <select
                      value={schoolProfile.level}
                      onChange={(e) => setSchoolProfile({ ...schoolProfile, level: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 mt-1 bg-[#F4F6F9] font-bold"
                    >
                      <option value="PAUD / TK / RA">PAUD / TK / RA</option>
                      <option value="SD/MI Sederajat">SD / MI Sederajat</option>
                      <option value="SMP/MTs Sederajat">SMP / MTs Sederajat</option>
                      <option value="SMA/SMK/MA Sederajat">SMA / SMK / MA Sederajat</option>
                      <option value="Pondok Pesantren / Madrasah">Pondok Pesantren / Madrasah</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700">NPSN / NSM Lembaga (Opsional)</label>
                    <input
                      type="text"
                      value={schoolProfile.npsn}
                      onChange={(e) => setSchoolProfile({ ...schoolProfile, npsn: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 mt-1 bg-[#F4F6F9] font-semibold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700">WhatsApp Panitia SPMB</label>
                    <input
                      type="text"
                      value={schoolProfile.whatsappContact}
                      onChange={(e) => setSchoolProfile({ ...schoolProfile, whatsappContact: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 mt-1 bg-[#F4F6F9] font-semibold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700">Alamat Lengkap Lembaga</label>
                    <input
                      type="text"
                      value={schoolProfile.address}
                      onChange={(e) => setSchoolProfile({ ...schoolProfile, address: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 mt-1 bg-[#F4F6F9] font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-slate-100">
                  <div className="rounded-2xl bg-[#F4F6F9] p-4 border border-slate-200 flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs">
                      {schoolProfile.logoUrl ? (
                        <img src={schoolProfile.logoUrl} alt="Logo Lembaga" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-7 h-7 text-slate-300" />
                      )}
                    </div>
                    <div className="space-y-2 flex-1">
                      <div>
                        <p className="font-black text-[#0F172A]">Logo Resmi Lembaga (Opsional)</p>
                        <p className="text-[11px] text-slate-500">Tampil di Header Portal & Kartu Peserta Siswa.</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="px-3.5 py-2 rounded-xl bg-[#155EEF] hover:bg-blue-700 text-white font-black text-[11px] inline-flex items-center gap-1.5 cursor-pointer shadow-2xs">
                          <Upload className="w-3.5 h-3.5" /> Unggah Foto Logo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleDirectImageUpload('logo', e)}
                            className="hidden"
                          />
                        </label>
                        {schoolProfile.logoUrl && (
                          <button
                            type="button"
                            onClick={() => setSchoolProfile((p) => ({ ...p, logoUrl: '' }))}
                            className="px-3 py-2 rounded-xl bg-white border border-rose-200 text-rose-600 font-bold text-[11px] cursor-pointer"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#F4F6F9] p-4 border border-slate-200 flex items-center gap-4">
                    <div className="w-28 h-20 rounded-2xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs">
                      {schoolProfile.bannerUrl ? (
                        <img src={schoolProfile.bannerUrl} alt="Banner Lembaga" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-7 h-7 text-slate-300" />
                      )}
                    </div>
                    <div className="space-y-2 flex-1">
                      <div>
                        <p className="font-black text-[#0F172A]">Banner / Thumbnail Utama (Opsional)</p>
                        <p className="text-[11px] text-slate-500">Gambar latar utama pada halaman Link Pendaftar.</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="px-3.5 py-2 rounded-xl bg-[#155EEF] hover:bg-blue-700 text-white font-black text-[11px] inline-flex items-center gap-1.5 cursor-pointer shadow-2xs">
                          <Upload className="w-3.5 h-3.5" /> Unggah Banner / Thumbnail
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleDirectImageUpload('banner', e)}
                            className="hidden"
                          />
                        </label>
                        {schoolProfile.bannerUrl && (
                          <button
                            type="button"
                            onClick={() => setSchoolProfile((p) => ({ ...p, bannerUrl: '' }))}
                            className="px-3 py-2 rounded-xl bg-white border border-rose-200 text-rose-600 font-bold text-[11px] cursor-pointer"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="font-bold text-slate-700">Visi Lembaga (Opsional)</label>
                    <textarea
                      rows={3}
                      value={schoolProfile.vision}
                      onChange={(e) => setSchoolProfile({ ...schoolProfile, vision: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 mt-1 bg-[#F4F6F9] font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700">Misi Lembaga (Opsional)</label>
                    <textarea
                      rows={3}
                      value={schoolProfile.mission}
                      onChange={(e) => setSchoolProfile({ ...schoolProfile, mission: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 mt-1 bg-[#F4F6F9] font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700">Program Unggulan & Ekstrakurikuler (Opsional)</label>
                    <textarea
                      rows={3}
                      value={schoolProfile.highlights}
                      onChange={(e) => setSchoolProfile({ ...schoolProfile, highlights: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 mt-1 bg-[#F4F6F9] font-medium"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-[#0F172A]">
                        Galeri Dokumentasi & Fasilitas Sekolah (10 Slot Unggah Foto Opsional)
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Klik tombol <strong>Unggah Foto</strong> pada masing-masing kotak untuk memilih foto langsung dari laptop/HP Anda.
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-black text-[10px]">
                      Terisi: {schoolProfile.galleryPhotos.filter((u) => u.trim() !== '').length} / 10 Foto
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {schoolProfile.galleryPhotos.map((photoUrl, idx) => (
                      <div key={idx} className="rounded-2xl border border-slate-200 bg-[#F4F6F9] p-3 space-y-2.5 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-[11px] text-[#0F172A]">Foto #{idx + 1}</span>
                            {photoUrl ? (
                              <span className="text-[10px] font-bold text-emerald-600">✓ Terunggah</span>
                            ) : (
                              <span className="text-[10px] text-slate-400">Kosong</span>
                            )}
                          </div>
                          <div className="h-24 rounded-xl bg-white overflow-hidden flex items-center justify-center border border-slate-200">
                            {photoUrl ? (
                              <img src={photoUrl} alt={`Galeri ${idx + 1}`} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-6 h-6 text-slate-300" />
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <label className="flex-1 py-2 px-2.5 rounded-xl bg-[#155EEF] hover:bg-blue-700 text-white font-black text-[10px] inline-flex items-center justify-center gap-1 cursor-pointer shadow-2xs">
                            <Upload className="w-3 h-3" /> {photoUrl ? 'Ganti Foto' : 'Unggah Foto'}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleDirectImageUpload('gallery', e, idx)}
                              className="hidden"
                            />
                          </label>
                          {photoUrl && (
                            <button
                              type="button"
                              onClick={() =>
                                setSchoolProfile((prev) => {
                                  const next = [...prev.galleryPhotos];
                                  next[idx] = '';
                                  return { ...prev, galleryPhotos: next };
                                })
                              }
                              className="p-2 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                              title="Hapus Foto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => showNotice('Seluruh profil visual, foto logo, banner, & 10 foto galeri berhasil disimpan!')}
                    className="px-6 py-3 rounded-xl bg-[#155EEF] hover:bg-blue-700 text-white font-black cursor-pointer shadow-sm"
                  >
                    Simpan Profil & Identitas Visual
                  </button>
                </div>
              </div>
            </div>
          )}

          {(activeMenu === 'overview' || activeMenu === 'applicants' || activeMenu === 'cards') && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-black text-[#0F172A]">
                      Data Calon Siswa, Asal Lembaga & Cetak Kartu Ber-Barcode (Akses 100%)
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-black text-[10px]">
                      ✓ Anti-Penyanderaan Data
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Klik tombol <strong>Cetak Kartu</strong> pada baris siswa untuk melihat & mencetak Kartu Bukti Registrasi lengkap dengan Foto, Asal Sekolah, Tujuan, dan Barcode.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    placeholder="Cari nama / No. Reg / Asal Sekolah..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-[#F4F6F9] border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setActiveMenu('form_config')}
                    className="px-3.5 py-2 rounded-xl bg-blue-50 text-[#155EEF] border border-blue-200 font-black text-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5" /> Atur Syarat Scan/PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => showNotice('Berhasil mengekspor seluruh data siswa ke Excel (.xlsx)!')}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Ekspor Excel
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F4F6F9] text-[10px] uppercase text-slate-400 border-b border-slate-100">
                      <th className="px-5 py-3.5 font-black">Foto & Nama Calon Siswa</th>
                      <th className="px-5 py-3.5 font-black">Asal Lembaga & Gelombang</th>
                      <th className="px-5 py-3.5 font-black">Berkas Terunggah (Scan/PDF)</th>
                      <th className="px-5 py-3.5 font-black">Pembayaran SPMB</th>
                      <th className="px-5 py-3.5 font-black text-right">Edit, Verifikasi & Kartu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredApplicants.map((sis) => (
                      <tr key={sis.id} className="hover:bg-slate-50/80">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={sis.photoUrl}
                              alt={sis.name}
                              className="w-11 h-14 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                            />
                            <div>
                              <p className="font-black text-[#155EEF]">{sis.regNo}</p>
                              <p className="font-black text-[#0F172A] text-sm">{sis.name} ({sis.gender})</p>
                              <p className="text-[11px] text-slate-400">NISN: {sis.nisn} • Wali: {sis.parentName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-black text-[#0F172A] flex items-center gap-1">
                            <School className="w-3.5 h-3.5 text-[#155EEF]" /> {sis.originSchool}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{sis.wave}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                              sis.docsStatus === 'Lengkap'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            ● {sis.docsStatus}
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {sis.uploadedDocs.map((doc, i) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold text-[10px]">
                                {doc}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                              sis.paymentStatus === 'Lunas'
                                ? 'bg-blue-100 text-[#155EEF]'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            ● {sis.paymentStatus}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-1">
                            Biaya Sekolah: Rp {sis.schoolFeePaid.toLocaleString('id-ID')}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingApplicant(sis)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 font-bold text-[11px] hover:bg-slate-200 inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" /> Edit Data
                            </button>
                            <button
                              type="button"
                              onClick={() => handleVerifyApplicant(sis.id)}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px] hover:bg-emerald-100 cursor-pointer"
                            >
                              ✓ Verifikasi
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedCardApplicant(sis)}
                              className="px-3 py-1.5 rounded-xl bg-[#0F172A] text-white font-bold text-[11px] hover:bg-slate-800 inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                            >
                              <Printer className="w-3.5 h-3.5" /> Cetak Kartu
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeMenu === 'form_config' && (
            <div className="space-y-6 text-xs">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-sm font-black text-[#0F172A]">
                      Pengaturan Isian Data & Syarat Berkas Pendaftar (Scan Kamera, PDF & Batas MB)
                    </h2>
                    <p className="text-slate-500 mt-0.5">
                      Sesuaikan dokumen yang wajib/opsional diunggah calon siswa (Scan KK, KTP Orang Tua, Akta, Pas Foto, dll.), aktifkan Scan Kamera Langsung atau Upload PDF, dan atur batas ukuran maksimal (MB).
                    </p>
                  </div>
                  <a
                    href={`/daftar/${schoolProfile.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-[#155EEF] text-white font-black inline-flex items-center gap-1.5 shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" /> Cek di Link Pendaftar
                  </a>
                </div>

                <form onSubmit={handleAddCustomDocField} className="rounded-2xl bg-[#F4F6F9] p-4 border border-slate-200 flex flex-col sm:flex-row items-end gap-3">
                  <div className="flex-1 w-full">
                    <label className="font-bold text-slate-700">Tambah Syarat Berkas / Kolom Pendaftar Baru</label>
                    <input
                      type="text"
                      placeholder="Contoh: Scan Kartu KIP / PKH, Surat Keterangan Sehat, Scan Rapor..."
                      value={newDocLabel}
                      onChange={(e) => setNewDocLabel(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 mt-1 font-semibold"
                    />
                  </div>
                  <div className="w-full sm:w-44">
                    <label className="font-bold text-slate-700">Batas Ukuran Maks (MB)</label>
                    <select
                      value={newDocMaxMb}
                      onChange={(e) => setNewDocMaxMb(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 mt-1 font-bold"
                    >
                      <option value={1}>Maks 1 MB</option>
                      <option value={2}>Maks 2 MB (Standar)</option>
                      <option value={5}>Maks 5 MB</option>
                      <option value={10}>Maks 10 MB</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#155EEF] hover:bg-blue-700 text-white font-black cursor-pointer shrink-0"
                  >
                    + Tambah Berkas
                  </button>
                </form>

                <div className="space-y-3">
                  {customDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className={`rounded-2xl border p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 transition ${
                        doc.active ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={doc.active}
                            onChange={() =>
                              setCustomDocs((prev) =>
                                prev.map((d) => (d.id === doc.id ? { ...d, active: !d.active } : d))
                              )
                            }
                            className="w-4 h-4 accent-[#155EEF] cursor-pointer"
                          />
                          <h3 className="font-black text-[#0F172A] text-sm">{doc.label}</h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              doc.required ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {doc.required ? 'Wajib Diisi' : 'Opsional'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 pl-6">
                          Mode didukung: {doc.allowDirectScan ? '📷 Scan Kamera Langsung • ' : ''}
                          {doc.allowPdfUpload ? '📄 Upload PDF • ' : ''}
                          {doc.allowImageUpload ? '🖼️ Foto JPG/PNG • ' : ''}
                          Batas File: <strong>Maksimal {doc.maxSizeMb} MB</strong>
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pl-6 lg:pl-0">
                        <button
                          type="button"
                          onClick={() =>
                            setCustomDocs((prev) =>
                              prev.map((d) => (d.id === doc.id ? { ...d, allowDirectScan: !d.allowDirectScan } : d))
                            )
                          }
                          className={`px-3 py-1.5 rounded-xl border font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer ${
                            doc.allowDirectScan
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-white text-slate-500 border-slate-200'
                          }`}
                        >
                          <Camera className="w-3.5 h-3.5" /> Scan Langsung: {doc.allowDirectScan ? 'ON' : 'OFF'}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setCustomDocs((prev) =>
                              prev.map((d) => (d.id === doc.id ? { ...d, allowPdfUpload: !d.allowPdfUpload } : d))
                            )
                          }
                          className={`px-3 py-1.5 rounded-xl border font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer ${
                            doc.allowPdfUpload
                              ? 'bg-blue-50 text-[#155EEF] border-blue-200'
                              : 'bg-white text-slate-500 border-slate-200'
                          }`}
                        >
                          <FileUp className="w-3.5 h-3.5" /> Upload PDF: {doc.allowPdfUpload ? 'ON' : 'OFF'}
                        </button>

                        <select
                          value={doc.maxSizeMb}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setCustomDocs((prev) =>
                              prev.map((d) => (d.id === doc.id ? { ...d, maxSizeMb: val } : d))
                            );
                            showNotice(`Batas ukuran "${doc.label}" diatur ke Maks ${val} MB`);
                          }}
                          className="rounded-xl border border-slate-200 bg-[#F4F6F9] px-2.5 py-1.5 font-black text-[11px] cursor-pointer"
                        >
                          <option value={1}>Maks 1 MB</option>
                          <option value={2}>Maks 2 MB</option>
                          <option value={5}>Maks 5 MB</option>
                          <option value={10}>Maks 10 MB</option>
                        </select>

                        <button
                          type="button"
                          onClick={() =>
                            setCustomDocs((prev) =>
                              prev.map((d) => (d.id === doc.id ? { ...d, required: !d.required } : d))
                            )
                          }
                          className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-[11px] cursor-pointer"
                        >
                          Ubah Wajib/Opsional
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'waves' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-2xs text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-sm font-black text-[#0F172A]">
                    Pengaturan Jadwal Gelombang Fleksibel (Edit & Tambah Gelombang)
                  </h2>
                  <p className="text-slate-400">
                    Anda bebas mengubah nama gelombang, jadwal periode, kuota, biaya pendaftaran per gelombang, maupun menambahkan gelombang baru sesuai kebutuhan sekolah.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsNewWaveModal(true);
                    setEditingWave({
                      id: 'wv-' + Date.now(),
                      name: `Gelombang ${waves.length + 1} (Tambahan)`,
                      period: '1 Jul – 31 Jul 2027',
                      quota: 50,
                      filled: 0,
                      regFee: 150000,
                      benefit: 'Diskon Seragam & Bebas Biaya Tes',
                      status: 'Akan Datang',
                    });
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#155EEF] hover:bg-blue-700 text-white font-black inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" /> Tambah Gelombang Baru
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {waves.map((w) => (
                  <div key={w.id} className="rounded-2xl border border-slate-200 bg-[#F4F6F9] p-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-black text-[10px] ${
                            w.status === 'Aktif'
                              ? 'bg-emerald-100 text-emerald-800'
                              : w.status === 'Akan Datang'
                              ? 'bg-blue-100 text-[#155EEF]'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          ● {w.status}
                        </span>
                        <span className="font-bold text-slate-500">{w.period}</span>
                      </div>
                      <h3 className="text-sm font-black text-[#0F172A]">{w.name}</h3>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-slate-500 font-semibold">Kuota Gelombang:</span>
                        <strong className="text-[#0F172A]">{w.filled} / {w.quota} Kursi</strong>
                      </div>
                      <p className="text-base font-black text-emerald-700">
                        Biaya Daftar: {w.regFee === 0 ? 'Gratis (Rp0)' : `Rp ${w.regFee.toLocaleString('id-ID')}`}
                      </p>
                      <p className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200/80">
                        🎁 <strong>Benefit:</strong> {w.benefit}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80">
                      <button
                        type="button"
                        onClick={() => {
                          setIsNewWaveModal(false);
                          setEditingWave(w);
                        }}
                        className="flex-1 py-2 rounded-xl bg-white border border-slate-200 hover:bg-blue-50 text-[#155EEF] font-black inline-flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit Jadwal & Biaya
                      </button>
                      {waves.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteWave(w.id)}
                          className="p-2 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Hapus Gelombang"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeMenu === 'payments' && (
            <div className="space-y-6 text-xs">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-sm font-black text-[#0F172A]">
                      Pengaturan Biaya Pendaftaran SPMB & Transparansi Tarif Layanan
                    </h2>
                    <p className="text-slate-500">
                      Jika sekolah menetapkan biaya pendaftaran Rp0 (Gratis), maka komisi maupun tarif layanan DaftarKu otomatis menjadi <strong>Rp0</strong>.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSchoolProfile((p) => ({ ...p, registrationFee: 0 }));
                        showNotice('Mode Pendaftaran Gratis (Rp0) diaktifkan! Tarif layanan otomatis Rp0.');
                      }}
                      className={`px-3.5 py-2 rounded-xl font-black border cursor-pointer ${
                        schoolProfile.registrationFee === 0
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      Set Gratis (Rp0)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSchoolProfile((p) => ({ ...p, registrationFee: 100000 }));
                        showNotice('Biaya pendaftaran disetel ke Rp 100.000');
                      }}
                      className={`px-3.5 py-2 rounded-xl font-black border cursor-pointer ${
                        schoolProfile.registrationFee === 100000
                          ? 'bg-[#155EEF] text-white border-[#155EEF]'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      Set Berbayar (Rp100.000)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="rounded-2xl bg-[#F4F6F9] p-4 border border-slate-200">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase">BIAYA POKOK SEKOLAH</p>
                    <p className="text-lg font-black text-[#0F172A] mt-1">
                      Rp {schoolProfile.registrationFee.toLocaleString('id-ID')}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Per formulir pendaftar</p>
                  </div>

                  <div className="rounded-2xl bg-[#F4F6F9] p-4 border border-slate-200">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase">
                      {schoolProfile.plan === 'FREE' ? 'KOMISI DAFTARKU (5%)' : `TARIF LAYANAN (${schoolProfile.plan})`}
                    </p>
                    <p className="text-lg font-black text-[#155EEF] mt-1">
                      Rp {planConfig.serviceFeePerApplicant.toLocaleString('id-ID')}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#F4F6F9] p-4 border border-slate-200">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase">TOTAL DIBAYAR PENDAFTAR</p>
                    <p className="text-lg font-black text-emerald-700 mt-1">
                      Rp {spmbFinancials.totalPaidByApplicant.toLocaleString('id-ID')}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-200">
                    <p className="text-[10px] font-extrabold text-emerald-700 uppercase">TOTAL DANA BERSIH SEKOLAH</p>
                    <p className="text-lg font-black text-emerald-900 mt-1">
                      Rp {spmbFinancials.netSchoolBalance.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'broadcast' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-2xs text-xs max-w-3xl">
              <h2 className="text-sm font-black text-[#0F172A]">Broadcast WhatsApp ke Wali Calon Siswa</h2>
              <textarea
                rows={4}
                value={waBroadcastText}
                onChange={(e) => setWaBroadcastText(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 p-3.5 bg-[#F4F6F9] font-medium"
              />
              <button
                type="button"
                onClick={() => showNotice(`Pesan WhatsApp berhasil dikirim ke ${applicants.length} nomor wali murid!`)}
                className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black inline-flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" /> Kirim Broadcast ke Wali Siswa
              </button>
            </div>
          )}

          {activeMenu === 'upgrade' && (
            <div className="space-y-6 text-xs">
              {pendingUpgradeInvoice && (
                <div className="bg-white rounded-3xl border-2 border-[#155EEF] p-6 space-y-4 shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#155EEF] flex items-center justify-center">
                        <QrCode className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="font-black text-[#155EEF]">{pendingUpgradeInvoice.invoiceCode}</span>
                        <h3 className="text-sm font-black text-[#0F172A] mt-0.5">
                          Tagihan Upgrade Paket {pendingUpgradeInvoice.targetPlan} — Rp {pendingUpgradeInvoice.amount.toLocaleString('id-ID')}
                        </h3>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleVerifyUpgradePayment}
                      className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black inline-flex items-center gap-2 shadow-md cursor-pointer"
                    >
                      <Zap className="w-4 h-4" /> Simulasi Bayar Lunas (Verifikasi & Aktifkan Otomatis)
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className={`bg-white rounded-3xl p-6 border-2 flex flex-col justify-between space-y-5 ${schoolProfile.plan === 'FREE' ? 'border-[#155EEF] shadow-md' : 'border-slate-200'}`}>
                  <div className="space-y-3">
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-black text-[10px]">STARTER TIER</span>
                    <h3 className="text-xl font-black text-[#0F172A]">FREE</h3>
                    <p className="text-2xl font-black text-[#0F172A]">Rp 0 <span className="text-xs font-normal text-slate-400">/ periode</span></p>
                    <ul className="space-y-2 pt-2 text-slate-600 font-semibold">
                      <li>✓ Maksimal <strong>40 pendaftar valid</strong></li>
                      <li>✓ Komisi DaftarKu <strong>5%</strong> dari pendaftaran berbayar</li>
                    </ul>
                  </div>
                  <button disabled className="w-full py-3 rounded-xl bg-slate-100 text-slate-500 font-black">
                    {schoolProfile.plan === 'FREE' ? 'Paket Saat Ini' : 'Paket Dasar'}
                  </button>
                </div>

                <div className={`bg-white rounded-3xl p-6 border-2 flex flex-col justify-between space-y-5 ${schoolProfile.plan === 'PRO' ? 'border-[#155EEF] shadow-lg' : 'border-blue-300 shadow-md'}`}>
                  <div className="space-y-3">
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-[#155EEF] font-black text-[10px]">PALING POPULER</span>
                    <h3 className="text-xl font-black text-[#0F172A]">PRO</h3>
                    <p className="text-2xl font-black text-[#155EEF]">Rp 700.000 <span className="text-xs font-normal text-slate-400">/ periode</span></p>
                    <ul className="space-y-2 pt-2 text-slate-600 font-semibold">
                      <li>✓ Maksimal <strong>400 pendaftar valid</strong></li>
                      <li>✓ Tarif layanan <strong>Rp2.500</strong> / pendaftar valid (Komisi 0%)</li>
                    </ul>
                  </div>
                  <button type="button" onClick={() => handleRequestUpgrade('PRO')} className="w-full py-3 rounded-xl bg-[#155EEF] hover:bg-blue-700 text-white font-black cursor-pointer">
                    Upgrade ke PRO
                  </button>
                </div>

                <div className={`bg-white rounded-3xl p-6 border-2 flex flex-col justify-between space-y-5 ${schoolProfile.plan === 'PREMIUM' ? 'border-purple-600 shadow-lg' : 'border-purple-200 shadow-md'}`}>
                  <div className="space-y-3">
                    <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-black text-[10px]">ENTERPRISE & YAYASAN</span>
                    <h3 className="text-xl font-black text-[#0F172A]">PREMIUM</h3>
                    <p className="text-2xl font-black text-purple-700">Rp 2.000.000 <span className="text-xs font-normal text-slate-400">/ periode</span></p>
                    <ul className="space-y-2 pt-2 text-slate-600 font-semibold">
                      <li>✓ Maksimal <strong>2.000 pendaftar valid</strong></li>
                      <li>✓ Tarif layanan <strong>Rp2.000</strong> / pendaftar valid & Storage 5 GB</li>
                    </ul>
                  </div>
                  <button type="button" onClick={() => handleRequestUpgrade('PREMIUM')} className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black cursor-pointer">
                    Upgrade ke PREMIUM
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-2xs">
                  <h3 className="text-sm font-black text-[#0F172A]">Kalkulator Simulasi Biaya Transparan</h3>
                  <div>
                    <label className="font-bold text-slate-600">Target Jumlah Pendaftar: <strong>{simApplicantEstimate} Siswa</strong></label>
                    <input
                      type="range"
                      min={20}
                      max={1500}
                      step={10}
                      value={simApplicantEstimate}
                      onChange={(e) => setSimApplicantEstimate(Number(e.target.value))}
                      className="w-full mt-2 accent-[#155EEF]"
                    />
                  </div>
                  <div className="rounded-2xl bg-[#F4F6F9] p-4 space-y-2 border border-slate-200">
                    <p className="font-bold text-[#0F172A]">
                      Rekomendasi Paket: <span className="text-[#155EEF]">{simApplicantEstimate <= 40 ? 'FREE' : simApplicantEstimate <= 400 ? 'PRO (Rp700.000)' : 'PREMIUM (Rp2.000.000)'}</span>
                    </p>
                    <p className="text-[11px] text-emerald-700 font-bold">
                      • Dana Pokok Diterima Sekolah: Rp {(simApplicantEstimate * schoolProfile.registrationFee).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-2xs">
                  <h3 className="text-sm font-black text-[#0F172A]">Riwayat Aktivasi & Perubahan Paket</h3>
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#F4F6F9] text-[10px] uppercase text-slate-400 border-b">
                        <th className="px-3.5 py-2.5 font-black">ID & Tanggal</th>
                        <th className="px-3.5 py-2.5 font-black">Perubahan Paket</th>
                        <th className="px-3.5 py-2.5 font-black">Nominal</th>
                        <th className="px-3.5 py-2.5 font-black text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {upgradeHistory.map((h) => (
                        <tr key={h.id}>
                          <td className="px-3.5 py-3">
                            <p className="font-black text-[#155EEF]">{h.txId}</p>
                            <p className="text-[10px] text-slate-400">{h.date}</p>
                          </td>
                          <td className="px-3.5 py-3 font-bold text-[#0F172A]">
                            {h.fromPlan} → <span className="text-[#155EEF]">{h.toPlan}</span>
                          </td>
                          <td className="px-3.5 py-3 font-black text-emerald-700">Rp {h.amount.toLocaleString('id-ID')}</td>
                          <td className="px-3.5 py-3 text-right">
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">● {h.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {editingApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form
            onSubmit={handleSaveEditedApplicant}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 space-y-4 text-xs border border-slate-200"
          >
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-sm font-black text-[#0F172A]">Edit Biodata, Foto & Asal Sekolah Siswa</h3>
                <p className="text-[11px] text-slate-400">Nomor Registrasi: {editingApplicant.regNo}</p>
              </div>
              <button type="button" onClick={() => setEditingApplicant(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="flex items-center gap-4 bg-[#F4F6F9] p-3.5 rounded-2xl border border-slate-200">
              <img
                src={editingApplicant.photoUrl}
                alt={editingApplicant.name}
                className="w-14 h-18 rounded-xl object-cover border border-slate-300 shrink-0"
              />
              <div className="space-y-1.5">
                <p className="font-black text-[#0F172A]">Pas Foto Pendaftar (3x4)</p>
                <label className="px-3.5 py-1.5 rounded-xl bg-[#155EEF] text-white font-black text-[11px] inline-flex items-center gap-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" /> Unggah Foto Baru
                  <input type="file" accept="image/*" onChange={handleApplicantPhotoUpload} className="hidden" />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700">Nama Lengkap Siswa</label>
                <input
                  required
                  type="text"
                  value={editingApplicant.name}
                  onChange={(e) => setEditingApplicant({ ...editingApplicant, name: e.target.value })}
                  className="w-full rounded-xl border p-2.5 mt-1 bg-[#F4F6F9] font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Asal Sekolah / TK / RA / SD / SMP</label>
                <input
                  required
                  type="text"
                  value={editingApplicant.originSchool}
                  onChange={(e) => setEditingApplicant({ ...editingApplicant, originSchool: e.target.value })}
                  className="w-full rounded-xl border p-2.5 mt-1 bg-[#F4F6F9] font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">NISN / NIK</label>
                <input
                  type="text"
                  value={editingApplicant.nisn}
                  onChange={(e) => setEditingApplicant({ ...editingApplicant, nisn: e.target.value })}
                  className="w-full rounded-xl border p-2.5 mt-1 bg-[#F4F6F9] font-semibold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Gelombang Pendaftaran</label>
                <select
                  value={editingApplicant.wave}
                  onChange={(e) => setEditingApplicant({ ...editingApplicant, wave: e.target.value })}
                  className="w-full rounded-xl border p-2.5 mt-1 bg-[#F4F6F9] font-bold"
                >
                  {waves.map((w) => (
                    <option key={w.id} value={w.name}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700">Status Kelengkapan Berkas</label>
                <select
                  value={editingApplicant.docsStatus}
                  onChange={(e) =>
                    setEditingApplicant({
                      ...editingApplicant,
                      docsStatus: e.target.value as 'Lengkap' | 'Kurang Berkas',
                    })
                  }
                  className="w-full rounded-xl border p-2.5 mt-1 bg-[#F4F6F9] font-bold"
                >
                  <option value="Lengkap">Lengkap (Scan KK, KTP, Akta)</option>
                  <option value="Kurang Berkas">Kurang Berkas</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700">Status Seleksi</label>
                <select
                  value={editingApplicant.selectionStatus}
                  onChange={(e) =>
                    setEditingApplicant({
                      ...editingApplicant,
                      selectionStatus: e.target.value as any,
                    })
                  }
                  className="w-full rounded-xl border p-2.5 mt-1 bg-[#F4F6F9] font-bold"
                >
                  <option value="Terverifikasi">Terverifikasi</option>
                  <option value="Menunggu Seleksi">Menunggu Seleksi</option>
                  <option value="Lulus">Lulus</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingApplicant(null)}
                className="px-4 py-2 rounded-xl border font-bold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#155EEF] text-white font-black cursor-pointer"
              >
                Simpan Perubahan Data
              </button>
            </div>
          </form>
        </div>
      )}

      {editingWave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form
            onSubmit={handleSaveWave}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 space-y-4 text-xs border border-slate-200"
          >
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-sm font-black text-[#0F172A]">
                {isNewWaveModal ? 'Tambah Gelombang Pendaftaran Baru' : `Edit ${editingWave.name}`}
              </h3>
              <button type="button" onClick={() => setEditingWave(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700">Nama Gelombang / Jalur *</label>
                <input
                  required
                  type="text"
                  value={editingWave.name}
                  onChange={(e) => setEditingWave({ ...editingWave, name: e.target.value })}
                  className="w-full rounded-xl border p-2.5 mt-1 bg-[#F4F6F9] font-bold"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Jadwal Periode Buka–Tutup *</label>
                  <input
                    required
                    type="text"
                    value={editingWave.period}
                    onChange={(e) => setEditingWave({ ...editingWave, period: e.target.value })}
                    className="w-full rounded-xl border p-2.5 mt-1 bg-[#F4F6F9] font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Status Gelombang</label>
                  <select
                    value={editingWave.status}
                    onChange={(e) => setEditingWave({ ...editingWave, status: e.target.value as any })}
                    className="w-full rounded-xl border p-2.5 mt-1 bg-[#F4F6F9] font-bold"
                  >
                    <option value="Aktif">Aktif (Dibuka)</option>
                    <option value="Akan Datang">Akan Datang</option>
                    <option value="Ditutup">Ditutup</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700">Target Kuota Kursi</label>
                  <input
                    type="number"
                    value={editingWave.quota}
                    onChange={(e) => setEditingWave({ ...editingWave, quota: Number(e.target.value) })}
                    className="w-full rounded-xl border p-2.5 mt-1 bg-[#F4F6F9] font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Biaya Pendaftaran (Rp)</label>
                  <input
                    type="number"
                    value={editingWave.regFee}
                    onChange={(e) => setEditingWave({ ...editingWave, regFee: Number(e.target.value) })}
                    className="w-full rounded-xl border p-2.5 mt-1 bg-[#F4F6F9] font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700">Benefit / Promo Beasiswa Gelombang Ini</label>
                <input
                  type="text"
                  value={editingWave.benefit}
                  onChange={(e) => setEditingWave({ ...editingWave, benefit: e.target.value })}
                  className="w-full rounded-xl border p-2.5 mt-1 bg-[#F4F6F9] font-semibold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingWave(null)}
                className="px-4 py-2 rounded-xl border font-bold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#155EEF] text-white font-black cursor-pointer"
              >
                Simpan Gelombang
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedCardApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 text-xs">
            <div className="bg-gradient-to-r from-[#0F172A] via-[#1E3A8A] to-[#155EEF] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                {schoolProfile.logoUrl ? (
                  <img
                    src={schoolProfile.logoUrl}
                    alt="Logo"
                    className="w-12 h-12 rounded-2xl object-cover bg-white p-0.5 shadow-md"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center font-black text-base">
                    DK
                  </div>
                )}
                <div>
                  <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider">
                    KARTU TANDA PESERTA SPMB 2026/2027
                  </span>
                  <h3 className="text-base font-black mt-1">{schoolProfile.name}</h3>
                  <p className="text-[10px] text-sky-200">{schoolProfile.address}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCardApplicant(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 bg-white">
              <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div className="w-28 h-36 rounded-2xl overflow-hidden border-2 border-[#155EEF] shadow-md bg-slate-100">
                    <img
                      src={selectedCardApplicant.photoUrl}
                      alt={selectedCardApplicant.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px]">
                    ● {selectedCardApplicant.selectionStatus}
                  </span>
                </div>

                <div className="flex-1 w-full space-y-2.5">
                  <div className="bg-[#F4F6F9] p-3 rounded-2xl border border-slate-200/80">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase">NOMOR REGISTRASI RESMI</p>
                    <p className="text-base font-black text-[#155EEF] tracking-wide">{selectedCardApplicant.regNo}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-2 px-1">
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500 font-semibold">Nama Calon Siswa:</span>
                      <strong className="text-[#0F172A] text-right">{selectedCardApplicant.name} ({selectedCardApplicant.gender})</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500 font-semibold">NISN / NIK:</span>
                      <strong className="text-[#0F172A]">{selectedCardApplicant.nisn}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500 font-semibold">Asal Sekolah / Lembaga:</span>
                      <strong className="text-[#155EEF] text-right">{selectedCardApplicant.originSchool}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500 font-semibold">Sekolah / Lembaga Tujuan:</span>
                      <strong className="text-emerald-700 text-right">{schoolProfile.name}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Jalur / Gelombang:</span>
                      <strong className="text-[#0F172A] text-right">{selectedCardApplicant.wave}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-[#F8FAFC] border border-dashed border-slate-300 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <p className="text-[10px] font-black text-[#0F172A] uppercase tracking-wider">
                    BARCODE VALIDASI ELEKTRONIK DAFTARKU
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Kartu ini sah dan terverifikasi otomatis oleh sistem SPMB {schoolProfile.name}.
                  </p>
                  <p className="text-[10px] font-mono font-bold text-[#155EEF]">
                    ID: {selectedCardApplicant.regNo}-{selectedCardApplicant.nisn}
                  </p>
                </div>

                <div className="bg-white px-3.5 py-2 rounded-xl border border-slate-200 flex flex-col items-center shrink-0">
                  <div className="flex items-center gap-[2px] h-10">
                    {[3, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 3, 1, 2, 1, 3].map((w, idx) => (
                      <div
                        key={idx}
                        style={{ width: `${w * 1.5}px` }}
                        className="h-full bg-[#0F172A]"
                      />
                    ))}
                  </div>
                  <span className="text-[9px] font-mono font-bold tracking-[0.2em] text-slate-700 mt-1">
                    *{selectedCardApplicant.regNo}*
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedCardApplicant(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                    showNotice(`Mencetak kartu peserta resmi ${selectedCardApplicant.name}...`);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#155EEF] hover:bg-blue-700 text-white font-black inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4" /> Cetak / Unduh PDF Kartu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-5 right-5 z-40">
        <button
          type="button"
          onClick={() => setIsAiOpen(true)}
          className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#0F172A] to-[#155EEF] text-white pl-4 pr-5 py-3 shadow-xl border border-white/20 hover:scale-105 transition cursor-pointer"
        >
          <Bot className="w-5 h-5 text-[#38BDF8]" />
          <div className="text-left">
            <p className="text-xs font-black leading-none flex items-center gap-1">
              DaftarKu AI <Sparkles className="w-3 h-3 text-[#38BDF8]" />
            </p>
            <p className="text-[10px] text-slate-300">Asisten Panitia SPMB</p>
          </div>
        </button>
      </div>

      {isAiOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsAiOpen(false)} />
          <aside className="relative z-10 w-full sm:max-w-md bg-white h-full shadow-2xl flex flex-col justify-between">
            <div className="bg-[#0F172A] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Bot className="w-6 h-6 text-[#38BDF8]" />
                <div>
                  <h3 className="text-sm font-black">DaftarKu AI — Asisten Sekolah</h3>
                  <p className="text-[11px] text-slate-400">Bantuan Kuota, Surat Kelulusan & Broadcast WA</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsAiOpen(false)} className="p-1.5 rounded-lg bg-white/10 text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-[#F4F6F9] text-xs">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
                <p className="font-bold text-[#0F172A]">Halo Panitia SPMB {schoolProfile.name}!</p>
                <p className="text-slate-600 leading-relaxed">
                  Link pendaftaran resmi lembaga Anda adalah <strong>https://daftarku.id/daftar/{schoolProfile.slug}</strong>. Seluruh fitur unggah 10 foto galeri, kartu peserta ber-barcode, dan kustomisasi berkas telah aktif.
                </p>
              </div>
            </div>
            <div className="p-3.5 bg-white border-t border-slate-200 flex gap-2">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Minta AI buatkan pengumuman kelulusan..."
                className="flex-1 rounded-xl border border-slate-200 bg-[#F4F6F9] px-3.5 py-2 text-xs font-semibold"
              />
              <button
                type="button"
                onClick={() => {
                  showNotice('Draf pengumuman berhasil dibuat oleh DaftarKu AI!');
                  setAiInput('');
                }}
                className="p-2.5 rounded-xl bg-[#155EEF] text-white cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </aside>
        </div>
      )}

      {toast.show && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-[#0F172A] text-white shadow-xl text-xs font-black">
          {toast.msg}
        </div>
      )}
    </div>
  );
}
