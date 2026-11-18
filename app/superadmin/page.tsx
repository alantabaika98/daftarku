'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Building,
  Plus,
  CheckCircle2,
  Clock,
  X,
  Menu,
  Wallet,
  Sparkles,
  Bot,
  Send,
  ExternalLink,
  Power,
  Headphones,
  Copy,
  Check,
  AlertTriangle,
  Lock,
  Settings,
  Download,
  FileText,
  Key,
  TrendingUp,
  QrCode,
  LogIn,
  Zap,
  Megaphone,
  MessageSquareWarning,
  History,
  ShieldCheck,
  BarChart3,
  PieChart as PieIcon,
  DollarSign,
  ArrowUpRight,
} from 'lucide-react';
import { DaftarKuLogo } from '@/components/DaftarKuLogo';

interface SuperAdminSchoolItem {
  id: string;
  name: string;
  slug: string;
  npsn: string;
  level: string;
  location: string;
  adminName: string;
  adminEmail: string;
  status: 'active' | 'inactive';
  plan: 'FREE' | 'PRO' | 'PREMIUM';
  applicantsCount: number;
  applicantSlotLimit: number;
  registrationFee: number;
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
  lastLoginSession: string;
  securityIp: string;
}

interface FinancialTransactionItem {
  id: string;
  txId: string;
  schoolName: string;
  source: 'Pembelian Paket' | 'Komisi 5% (Free)' | 'Tarif Layanan Pendaftar' | 'Add-on AI';
  amount: number;
  gatewayFee: number;
  date: string;
  status: 'Berhasil' | 'Menunggu' | 'Refund';
}

interface BillingInvoiceRequest {
  id: string;
  invoiceCode: string;
  schoolId: string;
  schoolName: string;
  requestType: 'UPGRADE_PRO' | 'UPGRADE_PREMIUM' | 'ADDON_AI_100';
  label: string;
  amount: number;
  paymentMethod: 'QRIS Dinamis' | 'VA BSI' | 'VA Mandiri';
  vaOrQrisPayload: string;
  status: 'PENDING_PAYMENT' | 'PAID';
  createdAt: string;
}

interface HelpdeskTicketItem {
  id: string;
  ticketCode: string;
  schoolName: string;
  adminName: string;
  subject: string;
  priority: 'TINGGI' | 'SEDANG' | 'RENDAH';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
}

interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  ipAddress: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
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
    applicantSlotLimit: 400,
    registrationFee: 100000,
    aiUsage: 18,
    aiLimit: 500,
    revenueContribution: 700000,
    joinedDate: '10 Nov 2026',
    healthStatus: 'SEHAT',
    healthReason: 'Konfigurasi lengkap, pendaftaran aktif, dan rutin menerima siswa.',
    picStaff: 'Alan (Lead Architect)',
    lastContact: 'Hari ini',
    followUpDate: '2026-11-25',
    notes: 'Mitra utama percontohan SaaS DaftarKu.',
    lastLoginSession: 'Hari ini, 10:24 WIB',
    securityIp: '182.253.xx.xx (Aman)',
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
    plan: 'PREMIUM',
    applicantsCount: 185,
    applicantSlotLimit: 2000,
    registrationFee: 200000,
    aiUsage: 64,
    aiLimit: 1000,
    revenueContribution: 2000000,
    joinedDate: '12 Nov 2026',
    healthStatus: 'SEHAT',
    healthReason: 'Lonjakan pendaftar tinggi, operasional stabil.',
    picStaff: 'Tim Success',
    lastContact: 'Kemarin',
    followUpDate: '2026-11-28',
    notes: 'Membutuhkan tambahan kuota server menjelang gelombang 2.',
    lastLoginSession: 'Kemarin, 14:10 WIB',
    securityIp: '36.73.xx.xx (Aman)',
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
    applicantsCount: 38,
    applicantSlotLimit: 40,
    registrationFee: 100000,
    aiUsage: 22,
    aiLimit: 25,
    revenueContribution: 190000,
    joinedDate: '14 Nov 2026',
    healthStatus: 'PERLU_PERHATIAN',
    healthReason: 'Pendaftar mendekati batas 40 (38/40). Mendekati 95% kuota.',
    picStaff: 'Support Team',
    lastContact: '3 hari lalu',
    followUpDate: '2026-11-18',
    notes: 'Segera tawarkan upgrade ke Paket PRO.',
    lastLoginSession: '3 hari lalu',
    securityIp: '114.125.xx.xx (Aman)',
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
    applicantSlotLimit: 40,
    registrationFee: 0,
    aiUsage: 0,
    aiLimit: 25,
    revenueContribution: 0,
    joinedDate: '15 Nov 2026',
    healthStatus: 'KRITIS',
    healthReason: 'Portal ditutup dan belum ada konfigurasi jadwal gelombang SPMB.',
    picStaff: 'Alan (Lead Architect)',
    lastContact: 'Belum pernah',
    followUpDate: '2026-11-17',
    notes: 'Segera reaktivasi akun.',
    lastLoginSession: 'Belum pernah login',
    securityIp: 'Belum tercatat',
  },
];

const MOCK_TRANSACTIONS: FinancialTransactionItem[] = [
  { id: 'tx-1', txId: 'TRX-2026-9011', schoolName: 'MI Hidayatul Abidin', source: 'Pembelian Paket', amount: 700000, gatewayFee: 5000, date: '10 Nov 2026', status: 'Berhasil' },
  { id: 'tx-2', txId: 'TRX-2026-9012', schoolName: 'SMA Nusantara Unggul', source: 'Pembelian Paket', amount: 2000000, gatewayFee: 10000, date: '12 Nov 2026', status: 'Berhasil' },
  { id: 'tx-3', txId: 'TRX-2026-9013', schoolName: 'MI Hidayatul Abidin', source: 'Tarif Layanan Pendaftar', amount: 105000, gatewayFee: 1500, date: '15 Nov 2026', status: 'Berhasil' },
  { id: 'tx-4', txId: 'TRX-2026-9014', schoolName: 'SMA Nusantara Unggul', source: 'Tarif Layanan Pendaftar', amount: 370000, gatewayFee: 3500, date: '16 Nov 2026', status: 'Berhasil' },
  { id: 'tx-5', txId: 'TRX-2026-9015', schoolName: 'SMP Islam Al-Hikmah', source: 'Komisi 5% (Free)', amount: 190000, gatewayFee: 2000, date: '16 Nov 2026', status: 'Berhasil' },
];

const INITIAL_BILLING_REQUESTS: BillingInvoiceRequest[] = [
  {
    id: 'inv-1',
    invoiceCode: 'INV-DK-2026-881',
    schoolId: 'sch-3',
    schoolName: 'SMP Islam Al-Hikmah',
    requestType: 'UPGRADE_PRO',
    label: 'Upgrade Paket PRO (400 Slot + 500 AI + Tarif Rp2.500)',
    amount: 700000,
    paymentMethod: 'QRIS Dinamis',
    vaOrQrisPayload: 'QRIS-DAFTARKU-881002938',
    status: 'PENDING_PAYMENT',
    createdAt: '17 Nov 2026, 09:15 WIB',
  },
];

const INITIAL_TICKETS: HelpdeskTicketItem[] = [
  {
    id: 'tkt-1',
    ticketCode: 'TKT-2026-101',
    schoolName: 'MTs Darul Ulum Terpadu',
    adminName: 'Ahmad Fauzi',
    subject: 'Bingung cara mengatur jadwal Gelombang 1 & biaya pendaftaran',
    priority: 'TINGGI',
    status: 'OPEN',
    createdAt: '17 Nov 2026, 08:30 WIB',
  },
];

const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'log-1',
    timestamp: '17 Nov 2026, 13:10 WIB',
    actor: 'Superadmin (Alan)',
    action: 'Inisialisasi Platform SaaS Enterprise DaftarKu',
    target: 'Platform Multi-Tenant',
    ipAddress: '182.253.xx.xx',
    severity: 'INFO',
  },
];

export default function SuperAdminPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'schools' | 'accounts' | 'financial' | 'mentoring' | 'settings'>('dashboard');
  const [schools, setSchools] = useState<SuperAdminSchoolItem[]>(DEFAULT_SCHOOLS);
  const [transactions, setTransactions] = useState<FinancialTransactionItem[]>(MOCK_TRANSACTIONS);
  const [billingRequests, setBillingRequests] = useState<BillingInvoiceRequest[]>(INITIAL_BILLING_REQUESTS);
  const [tickets, setTickets] = useState<HelpdeskTicketItem[]>(INITIAL_TICKETS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);

  const [searchQuery, setSearchQuery] = useState('');
  const [healthFilter, setHealthFilter] = useState<'ALL' | 'SEHAT' | 'PERLU_PERHATIAN' | 'KRITIS'>('ALL');

  const [broadcastTarget, setBroadcastTarget] = useState<'ALL' | 'UNHEALTHY' | 'FREE_PLAN'>('UNHEALTHY');
  const [broadcastMessage, setBroadcastMessage] = useState(
    'Assalamu’alaikum Admin Lembaga Mitra DaftarKu, pastikan pemantauan kapasitas pendaftar dilakukan secara berkala. Jika pendaftar mencapai 100%, formulir publik otomatis dihentikan sementara tanpa menghapus data siswa lama.'
  );

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSendBillingModalOpen, setIsSendBillingModalOpen] = useState(false);
  const [billingForm, setBillingForm] = useState({
    schoolId: 'sch-3',
    requestType: 'UPGRADE_PRO' as 'UPGRADE_PRO' | 'UPGRADE_PREMIUM' | 'ADDON_AI_100',
    paymentMethod: 'QRIS Dinamis' as 'QRIS Dinamis' | 'VA BSI' | 'VA Mandiri',
  });

  const [toast, setToast] = useState<{ show: boolean; msg: string }>({ show: false, msg: '' });
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    schoolName: '',
    npsn: '',
    level: 'SD/MI',
    address: '',
    plan: 'FREE' as 'FREE' | 'PRO' | 'PREMIUM',
    registrationFee: 100000,
    adminName: '',
    adminEmail: '',
    adminPassword: '',
  });

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ show: false, msg: '' }), 3400);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const showNotice = (msg: string) => setToast({ show: true, msg });

  const recordAuditLog = (action: string, target: string, severity: 'INFO' | 'WARNING' | 'CRITICAL' = 'INFO') => {
    const now = new Date();
    const timeStr = `Hari ini, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;
    const newLog: AuditLogItem = {
      id: 'log-' + Date.now(),
      timestamp: timeStr,
      actor: 'Superadmin (Alan)',
      action,
      target,
      ipAddress: '182.253.xx.xx',
      severity,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const healthMetrics = useMemo(() => {
    const total = schools.length;
    const sehat = schools.filter((s) => s.healthStatus === 'SEHAT').length;
    const perhatian = schools.filter((s) => s.healthStatus === 'PERLU_PERHATIAN').length;
    const kritis = schools.filter((s) => s.healthStatus === 'KRITIS').length;
    const totalApplicants = schools.reduce((acc, s) => acc + s.applicantsCount, 0);
    return { total, sehat, perhatian, kritis, totalApplicants };
  }, [schools]);

  const financialSummary = useMemo(() => {
    const packageRev = transactions
      .filter((t) => t.source === 'Pembelian Paket' && t.status === 'Berhasil')
      .reduce((acc, t) => acc + t.amount, 0);
    const serviceFeeRev = transactions
      .filter((t) => (t.source === 'Tarif Layanan Pendaftar' || t.source === 'Komisi 5% (Free)') && t.status === 'Berhasil')
      .reduce((acc, t) => acc + t.amount, 0);
    const totalNetRevenue = packageRev + serviceFeeRev;

    return { packageRev, serviceFeeRev, totalNetRevenue };
  }, [transactions]);

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

  const handleUpdateSchoolPlan = (schoolId: string, newPlan: 'FREE' | 'PRO' | 'PREMIUM') => {
    setSchools((prev) =>
      prev.map((s) => {
        if (s.id !== schoolId) return s;
        const nextAiLimit = newPlan === 'PREMIUM' ? 1000 : newPlan === 'PRO' ? 500 : 25;
        const nextSlotLimit = newPlan === 'PREMIUM' ? 2000 : newPlan === 'PRO' ? 400 : 40;
        const nextRev = newPlan === 'PREMIUM' ? 2000000 : newPlan === 'PRO' ? 700000 : 0;
        showNotice(`Paket ${s.name} diubah ke ${newPlan} (Kapasitas: ${nextSlotLimit} pendaftar)`);
        recordAuditLog(`Mengubah Tier Paket ke ${newPlan}`, s.name, 'INFO');
        return {
          ...s,
          plan: newPlan,
          aiLimit: nextAiLimit,
          applicantSlotLimit: nextSlotLimit,
          revenueContribution: nextRev,
        };
      })
    );
  };

  const handleCreateAndSendBilling = (e: React.FormEvent) => {
    e.preventDefault();
    const targetSchool = schools.find((s) => s.id === billingForm.schoolId);
    if (!targetSchool) return;

    const amount =
      billingForm.requestType === 'UPGRADE_PREMIUM'
        ? 2000000
        : billingForm.requestType === 'UPGRADE_PRO'
        ? 700000
        : 50000;

    const label =
      billingForm.requestType === 'UPGRADE_PREMIUM'
        ? 'Upgrade Paket PREMIUM (2.000 Slot + Storage 5GB + Tarif Rp2.000)'
        : billingForm.requestType === 'UPGRADE_PRO'
        ? 'Upgrade Paket PRO (400 Slot + 500 AI + Tarif Rp2.500)'
        : 'Add-on Kuota +100 AI Prompt';

    const randomCode = Math.floor(100 + Math.random() * 900);
    const newInvoice: BillingInvoiceRequest = {
      id: 'inv-' + Date.now(),
      invoiceCode: `INV-DK-2026-${randomCode}`,
      schoolId: targetSchool.id,
      schoolName: targetSchool.name,
      requestType: billingForm.requestType,
      label,
      amount,
      paymentMethod: billingForm.paymentMethod,
      vaOrQrisPayload:
        billingForm.paymentMethod === 'QRIS Dinamis'
          ? `QRIS-DAFTARKU-${Date.now().toString().slice(-6)}`
          : `9008${Date.now().toString().slice(-8)}`,
      status: 'PENDING_PAYMENT',
      createdAt: 'Baru saja',
    };

    setBillingRequests((prev) => [newInvoice, ...prev]);
    setIsSendBillingModalOpen(false);
    recordAuditLog(`Membuat Tagihan ${billingForm.paymentMethod} (${newInvoice.invoiceCode})`, targetSchool.name, 'INFO');
    showNotice(`Tagihan ${billingForm.paymentMethod} (${newInvoice.invoiceCode}) dikirim ke Dashboard ${targetSchool.name}!`);
  };

  const handleSimulateWebhookPaid = (invoiceId: string) => {
    const targetInv = billingRequests.find((i) => i.id === invoiceId);
    if (!targetInv || targetInv.status === 'PAID') return;

    setBillingRequests((prev) =>
      prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: 'PAID' } : inv))
    );

    setSchools((prev) =>
      prev.map((s) => {
        if (s.id !== targetInv.schoolId) return s;
        if (targetInv.requestType === 'UPGRADE_PRO') {
          return { ...s, plan: 'PRO', aiLimit: 500, applicantSlotLimit: 400 };
        }
        if (targetInv.requestType === 'UPGRADE_PREMIUM') {
          return { ...s, plan: 'PREMIUM', aiLimit: 1000, applicantSlotLimit: 2000 };
        }
        return { ...s, aiLimit: s.aiLimit + 100 };
      })
    );

    const newTx: FinancialTransactionItem = {
      id: 'tx-' + Date.now(),
      txId: `TRX-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      schoolName: targetInv.schoolName,
      source: 'Pembelian Paket',
      amount: targetInv.amount,
      gatewayFee: Math.round(targetInv.amount * 0.007),
      date: 'Hari ini (Otomatis)',
      status: 'Berhasil',
    };
    setTransactions((prev) => [newTx, ...prev]);

    recordAuditLog(`Webhook PAID (${targetInv.invoiceCode}) -> Paket Aktif Otomatis`, targetInv.schoolName, 'INFO');
    showNotice(`Pembayaran terverifikasi! Paket ${targetInv.schoolName} otomatis aktif dan kuota pendaftar bertambah.`);
  };

  const handleImpersonateSchool = (school: SuperAdminSchoolItem) => {
    recordAuditLog('Sesi Impersonate (Login as School)', school.name, 'WARNING');
    showNotice(`Membuka sesi Impersonate sebagai Admin ${school.name}...`);
    window.open(`/dashboard?school=${school.slug}&impersonate=true`, '_blank');
  };

  const handleToggleSchoolStatus = (id: string) => {
    setSchools((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const nextStatus = s.status === 'active' ? 'inactive' : 'active';
        recordAuditLog(`Mengubah Status Sekolah ke ${nextStatus.toUpperCase()}`, s.name, 'WARNING');
        showNotice(`Status ${s.name} diperbarui menjadi ${nextStatus.toUpperCase()}`);
        return { ...s, status: nextStatus };
      })
    );
  };

  const handleSendMassBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    const targetList =
      broadcastTarget === 'ALL'
        ? schools
        : broadcastTarget === 'UNHEALTHY'
        ? schools.filter((s) => s.healthStatus !== 'SEHAT')
        : schools.filter((s) => s.plan === 'FREE');

    recordAuditLog(`Broadcast WA Massal (${targetList.length} Lembaga)`, `Target: ${broadcastTarget}`, 'INFO');
    showNotice(`Broadcast WhatsApp berhasil dikirim ke ${targetList.length} Admin Sekolah Mitra!`);
  };

  const handleAddSchool = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = formData.schoolName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const slotLimit = formData.plan === 'PREMIUM' ? 2000 : formData.plan === 'PRO' ? 400 : 40;
    const aiLim = formData.plan === 'PREMIUM' ? 1000 : formData.plan === 'PRO' ? 500 : 25;

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
      applicantSlotLimit: slotLimit,
      registrationFee: Number(formData.registrationFee),
      aiUsage: 0,
      aiLimit: aiLim,
      revenueContribution: formData.plan === 'PREMIUM' ? 2000000 : formData.plan === 'PRO' ? 700000 : 0,
      joinedDate: 'Hari ini',
      healthStatus: 'SEHAT',
      healthReason: 'Sekolah baru terdaftar, siap menerima pendaftar.',
      picStaff: 'Alan (Lead Architect)',
      lastContact: 'Baru saja',
      followUpDate: '2026-11-25',
      notes: 'Mitra baru terdaftar.',
      lastLoginSession: 'Baru saja',
      securityIp: '182.253.xx.xx (Aman)',
    };

    setSchools((prev) => [newSchool, ...prev]);
    setIsAddModalOpen(false);
    recordAuditLog(`Menambahkan Mitra Sekolah (${newSchool.plan})`, newSchool.name, 'INFO');
    showNotice(`Sekolah ${newSchool.name} berhasil ditambahkan!`);
    setFormData({ schoolName: '', npsn: '', level: 'SD/MI', address: '', plan: 'FREE', registrationFee: 100000, adminName: '', adminEmail: '', adminPassword: '' });
  };

  const MENUS = [
    { id: 'dashboard', label: 'Dashboard Ekosistem', icon: LayoutDashboard },
    { id: 'schools', label: 'Manajemen Sekolah & Kapasitas', icon: Building },
    { id: 'accounts', label: 'Keamanan & Audit Log', icon: Lock },
    { id: 'financial', label: 'Keuangan & Billing QRIS', icon: Wallet },
    { id: 'mentoring', label: 'Broadcast & Helpdesk', icon: Headphones },
    { id: 'settings', label: 'Pengaturan Platform', icon: Settings },
  ] as const;

  return (
    <div className="flex h-screen bg-[#F4F6F9] font-sans text-[#1E293B] overflow-hidden">
      {/* SIDEBAR GELAP ESTETIKA FINTRACKR */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-[#0F172A] text-slate-300 transition-all duration-300 ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:w-20 lg:translate-x-0'}`}>
        <div className="h-20 flex items-center justify-between px-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5 bg-white/95 px-3 py-1.5 rounded-xl shadow-sm">
            <DaftarKuLogo size="sm" variant={isSidebarOpen ? 'full' : 'icon'} />
          </div>
          <button type="button" onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSidebarOpen && (
          <div className="mx-4 my-4 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#155EEF] to-[#38BDF8] flex items-center justify-center text-white font-bold text-sm shrink-0">
              AT
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">Mokhammad Alan T.</p>
              <p className="text-[10px] text-slate-400 truncate">Superadmin DaftarKu</p>
            </div>
          </div>
        )}

        <div className="flex-1 py-2 px-3 space-y-1.5 overflow-y-auto">
          {MENUS.map((menu) => {
            const Icon = menu.icon;
            const isActive = activeMenu === menu.id;
            return (
              <button
                key={menu.id}
                type="button"
                onClick={() => setActiveMenu(menu.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition cursor-pointer ${isActive ? 'bg-[#155EEF] text-white font-bold shadow-md' : 'text-slate-400 hover:bg-slate-800/80 hover:text-white font-medium'}`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className={`text-xs truncate ${!isSidebarOpen ? 'lg:hidden' : ''}`}>{menu.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-800">
          <a href="/dashboard" className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-800/50 hover:bg-slate-800">
            <ExternalLink className="w-4 h-4 shrink-0 text-[#38BDF8]" />
            <span className={!isSidebarOpen ? 'lg:hidden' : ''}>Ke Panel Admin Sekolah</span>
          </a>
        </div>
      </aside>

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* RUNNING TEXT MARQUEE */}
        <div className="bg-[#0F172A] text-slate-200 py-2 px-6 text-[11px] font-semibold flex items-center gap-3 overflow-hidden shrink-0 border-b border-slate-800">
          <span className="bg-[#155EEF] px-2 py-0.5 rounded text-[10px] uppercase font-black text-white shrink-0">
            DaftarKu Live
          </span>
          <div className="whitespace-nowrap overflow-hidden animate-marquee">
            📢 Superadmin Command Center Aktif — Struktur Paket Free (40 slot, komisi 5%), Pro (Rp700k, 400 slot, tarif Rp2.500), & Premium (Rp2M, 2000 slot, tarif Rp2.000) berjalan sempurna!
          </div>
        </div>

        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setIsSidebarOpen((v) => !v)} className="p-2 text-slate-500 rounded-xl hover:bg-slate-100 cursor-pointer">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base font-black text-[#0F172A] tracking-wide">
              DaftarKu Superadmin Command Center
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSendBillingModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 px-3.5 py-2 text-xs font-black shadow-xs cursor-pointer"
            >
              <QrCode className="w-4 h-4" /> Kirim Tagihan QRIS / VA
            </button>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-[#155EEF] text-white px-3.5 py-2 rounded-xl hover:bg-blue-700 transition shadow-sm text-xs font-black cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Tambah Sekolah
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-6 pb-24">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <button type="button" onClick={() => setActiveMenu('dashboard')} className={`px-3.5 py-2 rounded-xl font-bold text-xs cursor-pointer ${activeMenu === 'dashboard' ? 'bg-blue-50 text-[#155EEF]' : 'hover:bg-slate-50 text-slate-600'}`}>Summary & Diagram</button>
              <button type="button" onClick={() => setActiveMenu('schools')} className={`px-3.5 py-2 rounded-xl font-bold text-xs cursor-pointer ${activeMenu === 'schools' ? 'bg-blue-50 text-[#155EEF]' : 'hover:bg-slate-50 text-slate-600'}`}>Manajemen Sekolah & Kapasitas</button>
              <button type="button" onClick={() => setActiveMenu('financial')} className={`px-3.5 py-2 rounded-xl font-bold text-xs cursor-pointer ${activeMenu === 'financial' ? 'bg-blue-50 text-[#155EEF]' : 'hover:bg-slate-50 text-slate-600'}`}>Keuangan & Billing QRIS</button>
              <button type="button" onClick={() => setActiveMenu('mentoring')} className={`px-3.5 py-2 rounded-xl font-bold text-xs cursor-pointer ${activeMenu === 'mentoring' ? 'bg-blue-50 text-[#155EEF]' : 'hover:bg-slate-50 text-slate-600'}`}>Broadcast WA & Helpdesk</button>
              <button type="button" onClick={() => setActiveMenu('accounts')} className={`px-3.5 py-2 rounded-xl font-bold text-xs cursor-pointer ${activeMenu === 'accounts' ? 'bg-blue-50 text-[#155EEF]' : 'hover:bg-slate-50 text-slate-600'}`}>Keamanan & Audit Log</button>
            </div>
          </div>

          {activeMenu === 'dashboard' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div onClick={() => setActiveMenu('schools')} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs hover:border-[#155EEF] transition cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-[#155EEF]"><Building className="w-4 h-4" /></span>
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5"><TrendingUp className="w-3 h-3" /> Aktif</span>
                  </div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-3">TOTAL MITRA SEKOLAH</p>
                  <h3 className="text-xl font-black text-[#0F172A] mt-0.5">{healthMetrics.total} Lembaga</h3>
                  <p className="text-[10px] text-slate-500 mt-1">{healthMetrics.totalApplicants} Pendaftar Valid</p>
                </div>

                <div onClick={() => setActiveMenu('schools')} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs hover:border-emerald-300 transition cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-[#12B76A]"><CheckCircle2 className="w-4 h-4" /></span>
                    <span className="text-[11px] font-bold text-emerald-600">Stabil</span>
                  </div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-3">SEKOLAH SEHAT</p>
                  <h3 className="text-xl font-black text-[#12B76A] mt-0.5">{healthMetrics.sehat} Lembaga</h3>
                  <p className="text-[10px] text-slate-500 mt-1">Kapasitas aman</p>
                </div>

                <div onClick={() => setActiveMenu('schools')} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs hover:border-amber-300 transition cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-[#F79009]"><Clock className="w-4 h-4" /></span>
                    <span className="text-[11px] font-bold text-amber-600">Perlu Upgrade</span>
                  </div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-3">MENDEKATI BATAS (≥80%)</p>
                  <h3 className="text-xl font-black text-[#F79009] mt-0.5">{healthMetrics.perhatian} Lembaga</h3>
                  <p className="text-[10px] text-slate-500 mt-1">SMP Al-Hikmah (38/40)</p>
                </div>

                <div onClick={() => setActiveMenu('schools')} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs hover:border-rose-300 transition cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-[#F04438]"><AlertTriangle className="w-4 h-4" /></span>
                    <span className="text-[11px] font-bold text-rose-600">Urgent</span>
                  </div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-3">KRITIS / NONAKTIF</p>
                  <h3 className="text-xl font-black text-[#F04438] mt-0.5">{healthMetrics.kritis} Lembaga</h3>
                  <p className="text-[10px] text-slate-500 mt-1">Perlu reaktivasi portal</p>
                </div>
              </div>

              {/* DIAGRAM & GRAFIK ANALITIK GAYA FINTRACKR */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                <div className="xl:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-sm font-black text-[#0F172A]">Profit Pembelian Paket & Tarif Layanan Over Time</h2>
                      <p className="text-[11px] text-slate-400">Akumulasi real-time performa kas platform tahun 2026.</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-50 text-[#155EEF] font-bold text-[11px] rounded-xl">This Year</span>
                  </div>
                  <div className="h-60 w-full bg-gradient-to-b from-blue-50/50 to-transparent rounded-2xl p-4 flex flex-col justify-end relative border border-dashed border-blue-200">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center space-y-1">
                        <BarChart3 className="w-10 h-10 text-[#155EEF] mx-auto opacity-40 animate-pulse" />
                        <p className="text-xs font-bold text-[#155EEF]">Grafik Analitik Interaktif Aktif</p>
                        <p className="text-[10px] text-slate-400">Total Kas Bersih Platform: Rp {financialSummary.totalNetRevenue.toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 z-10 pt-4 border-t border-slate-200">
                      <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>Mei</span><span>Jun</span><span>Jul</span><span>Agu</span><span>Sep</span><span>Okt</span><span>Nov</span><span>Des</span>
                    </div>
                  </div>
                </div>

                <div className="xl:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-2xs">
                  <h2 className="text-sm font-black text-[#0F172A]">Distribution by Tier Paket</h2>
                  <div className="h-48 flex items-center justify-center relative">
                    <div className="w-36 h-36 rounded-full border-8 border-[#155EEF] border-t-purple-600 border-r-amber-500 flex flex-col items-center justify-center shadow-inner">
                      <span className="text-xs font-bold text-slate-400">Total Mitra</span>
                      <span className="text-xl font-black text-[#0F172A]">{healthMetrics.total}</span>
                    </div>
                  </div>
                  <div className="space-y-2 pt-2 text-xs">
                    <div className="flex justify-between items-center"><span className="flex items-center gap-2 font-semibold text-slate-600"><span className="w-3 h-3 rounded-full bg-purple-600"></span> Paket PREMIUM (2000 Slot)</span><strong className="text-[#0F172A]">{schools.filter(s => s.plan === 'PREMIUM').length} Lembaga</strong></div>
                    <div className="flex justify-between items-center"><span className="flex items-center gap-2 font-semibold text-slate-600"><span className="w-3 h-3 rounded-full bg-[#155EEF]"></span> Paket PRO (400 Slot)</span><strong className="text-[#0F172A]">{schools.filter(s => s.plan === 'PRO').length} Lembaga</strong></div>
                    <div className="flex justify-between items-center"><span className="flex items-center gap-2 font-semibold text-slate-600"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Paket FREE (40 Slot)</span><strong className="text-[#0F172A]">{schools.filter(s => s.plan === 'FREE').length} Lembaga</strong></div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeMenu === 'schools' ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-black text-[#0F172A]">Manajemen Sekolah, Ubah Tier Paket & Kuota Pendaftar</h2>
                  <p className="text-[11px] text-slate-500">Struktur: FREE (40 slot, komisi 5%) | PRO (Rp700k, 400 slot, tarif Rp2.500) | PREMIUM (Rp2M, 2000 slot, tarif Rp2.000).</p>
                </div>
                <input
                  type="text"
                  placeholder="Cari sekolah / NPSN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#F4F6F9] border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F4F6F9] text-[10px] uppercase text-slate-400 border-b border-slate-100">
                      <th className="px-5 py-3.5 font-black">Sekolah & NPSN</th>
                      <th className="px-5 py-3.5 font-black">Kapasitas Pendaftar</th>
                      <th className="px-5 py-3.5 font-black">Ubah Paket (Tier)</th>
                      <th className="px-5 py-3.5 font-black">Biaya Pendaftaran Sekolah</th>
                      <th className="px-5 py-3.5 font-black text-right">Aksi & Impersonate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSchools.map((school) => {
                      const percent = Math.min(100, Math.round((school.applicantsCount / school.applicantSlotLimit) * 100));
                      return (
                        <tr key={school.id} className="hover:bg-slate-50/70">
                          <td className="px-5 py-4">
                            <p className="font-black text-[#0F172A]">{school.name}</p>
                            <p className="text-[11px] text-slate-500">NPSN: {school.npsn} • {school.level}</p>
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-bold text-[#0F172A]">
                              {school.applicantsCount} / {school.applicantSlotLimit} ({percent}%)
                            </p>
                            <div className="mt-1 w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${percent}%` }}
                                className={`h-full ${percent >= 100 ? 'bg-rose-600' : percent >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              />
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <select
                              value={school.plan}
                              onChange={(e) => handleUpdateSchoolPlan(school.id, e.target.value as any)}
                              className={`rounded-xl border px-3 py-1.5 text-xs font-black cursor-pointer ${
                                school.plan === 'PREMIUM'
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : school.plan === 'PRO'
                                  ? 'bg-blue-50 text-[#155EEF] border-blue-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              <option value="FREE">FREE (40 Pendaftar)</option>
                              <option value="PRO">PRO (400 Pendaftar)</option>
                              <option value="PREMIUM">PREMIUM (2.000 Pendaftar)</option>
                            </select>
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-bold text-slate-700">
                              {school.registrationFee === 0 ? 'Gratis (Rp0)' : `Rp ${school.registrationFee.toLocaleString('id-ID')}`}
                            </span>
                            <p className="text-[10px] text-slate-400">
                              {school.plan === 'FREE' ? 'Komisi 5%' : school.plan === 'PRO' ? 'Tarif Rp2.500/org' : 'Tarif Rp2.000/org'}
                            </p>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleImpersonateSchool(school)}
                                className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#155EEF] border border-blue-200 font-bold text-[11px] hover:bg-blue-100 inline-flex items-center gap-1 cursor-pointer"
                              >
                                <LogIn className="w-3.5 h-3.5" /> Masuk Panel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleSchoolStatus(school.id)}
                                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 cursor-pointer"
                              >
                                <Power className="w-3.5 h-3.5 text-slate-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeMenu === 'financial' ? (
            <div className="space-y-6 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase">PENDAPATAN PEMBELIAN PAKET</p>
                  <h3 className="text-xl font-black text-[#155EEF] mt-1">Rp {financialSummary.packageRev.toLocaleString('id-ID')}</h3>
                </div>
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase">TARIF LAYANAN & KOMISI</p>
                  <h3 className="text-xl font-black text-[#12B76A] mt-1">Rp {financialSummary.serviceFeeRev.toLocaleString('id-ID')}</h3>
                </div>
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase">TOTAL KAS BERSIH PLATFORM</p>
                  <h3 className="text-xl font-black text-[#0F172A] mt-1">Rp {financialSummary.totalNetRevenue.toLocaleString('id-ID')}</h3>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-sm font-black text-[#0F172A] flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-[#155EEF]" /> Otomasi Billing Gateway (QRIS & VA Sekolah)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Aktivasi paket Pro/Premium baru terbuka secara otomatis setelah pembayaran terverifikasi via webhook QRIS/VA.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSendBillingModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-[#155EEF] text-white font-black flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" /> Buat & Kirim Tagihan Upgrade
                  </button>
                </div>

                <div className="space-y-3">
                  {billingRequests.map((inv) => (
                    <div key={inv.id} className="rounded-2xl border border-slate-200 bg-[#F4F6F9] p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-[#155EEF]">{inv.invoiceCode}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            ● {inv.status === 'PAID' ? 'LUNAS (PAKET AKTIF OTOMATIS)' : 'MENUNGGU PEMBAYARAN'}
                          </span>
                        </div>
                        <p className="font-black text-[#0F172A] text-sm">{inv.schoolName} — {inv.label}</p>
                        <p className="text-[11px] text-slate-500">
                          Metode: <strong>{inv.paymentMethod}</strong> • Tagihan: <strong className="text-emerald-700">Rp {inv.amount.toLocaleString('id-ID')}</strong>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {inv.status === 'PENDING_PAYMENT' ? (
                          <button
                            type="button"
                            onClick={() => handleSimulateWebhookPaid(inv.id)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <Zap className="w-3.5 h-3.5" /> Simulasi Webhook PAID (Aktivasi Otomatis)
                          </button>
                        ) : (
                          <span className="px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-emerald-700 font-bold text-[11px]">
                            ✓ Paket Aktif
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : activeMenu === 'mentoring' ? (
            <div className="space-y-6 text-xs">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <form onSubmit={handleSendMassBroadcast} className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-2xs">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Megaphone className="w-5 h-5 text-[#155EEF]" />
                    <div>
                      <h2 className="text-sm font-black text-[#0F172A]">Broadcast WhatsApp Terpusat</h2>
                      <p className="text-[11px] text-slate-400">Kirim pengumuman massal ke Admin Sekolah.</p>
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700">Target Penerima</label>
                    <select
                      value={broadcastTarget}
                      onChange={(e) => setBroadcastTarget(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-200 p-2.5 mt-1 bg-[#F4F6F9] font-bold"
                    >
                      <option value="UNHEALTHY">Sekolah Mendekati Kuota / Perlu Perhatian</option>
                      <option value="FREE_PLAN">Sekolah Paket FREE (Penawaran Upgrade)</option>
                      <option value="ALL">Seluruh Sekolah Mitra</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700">Pesan WhatsApp</label>
                    <textarea
                      rows={4}
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-3 mt-1 bg-[#F4F6F9]"
                    />
                  </div>
                  <button type="submit" className="w-full py-3 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center gap-2 cursor-pointer">
                    <Send className="w-4 h-4" /> Kirim Broadcast WhatsApp
                  </button>
                </form>

                <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-2xs">
                  <h2 className="text-sm font-black text-[#0F172A]">Helpdesk Ticketing & Kendala Sekolah</h2>
                  <div className="space-y-3">
                    {tickets.map((tkt) => (
                      <div key={tkt.id} className="rounded-2xl border border-slate-200 bg-[#F4F6F9] p-4 flex justify-between items-center gap-4">
                        <div>
                          <p className="font-black text-[#0F172A]">{tkt.ticketCode} — {tkt.subject}</p>
                          <p className="text-[11px] text-slate-500">Sekolah: {tkt.schoolName} ({tkt.adminName})</p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px]">{tkt.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : activeMenu === 'accounts' ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-2xs text-xs">
              <h2 className="text-sm font-black text-[#0F172A]">Live Activity Logs & Audit Trail Sistem</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F4F6F9] text-[10px] uppercase text-slate-400 border-b">
                      <th className="px-4 py-3 font-black">Waktu</th>
                      <th className="px-4 py-3 font-black">Aktor</th>
                      <th className="px-4 py-3 font-black">Aksi</th>
                      <th className="px-4 py-3 font-black">Target</th>
                      <th className="px-4 py-3 font-black text-right">IP & Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-500">{log.timestamp}</td>
                        <td className="px-4 py-3 font-black text-[#0F172A]">{log.actor}</td>
                        <td className="px-4 py-3 font-bold text-[#155EEF]">{log.action}</td>
                        <td className="px-4 py-3 font-bold text-slate-700">{log.target}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">{log.ipAddress} • {log.severity}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 text-xs">
              <h2 className="text-sm font-black text-[#0F172A]">Pengaturan Platform DaftarKu Enterprise</h2>
              <div className="space-y-3 max-w-xl">
                <div><label className="font-bold">Nama Platform Resmi</label><input type="text" defaultValue="DaftarKu SaaS Multi-Tenant" className="w-full rounded-xl border p-2.5 mt-1 bg-[#F4F6F9] font-semibold" /></div>
                <button type="button" onClick={() => showNotice('Pengaturan platform berhasil disimpan!')} className="px-5 py-2.5 rounded-xl bg-[#155EEF] text-white font-black cursor-pointer">Simpan Perubahan</button>
              </div>
            </div>
          )}
        </main>
      </div>

      {isSendBillingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form onSubmit={handleCreateAndSendBilling} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-base font-black text-[#0F172A]">Kirim Tagihan Upgrade Paket</h2>
              <button type="button" onClick={() => setIsSendBillingModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <div>
              <label className="font-bold text-slate-700">Pilih Sekolah Mitra</label>
              <select
                value={billingForm.schoolId}
                onChange={(e) => setBillingForm({ ...billingForm, schoolId: e.target.value })}
                className="w-full rounded-xl border p-2.5 mt-1 font-bold bg-[#F4F6F9]"
              >
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} (Saat ini: {s.plan})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700">Pilih Paket Upgrade</label>
              <select
                value={billingForm.requestType}
                onChange={(e) => setBillingForm({ ...billingForm, requestType: e.target.value as any })}
                className="w-full rounded-xl border p-2.5 mt-1 font-bold bg-[#F4F6F9]"
              >
                <option value="UPGRADE_PRO">Paket PRO — Rp 700.000 (400 Pendaftar + Tarif Rp2.500)</option>
                <option value="UPGRADE_PREMIUM">Paket PREMIUM — Rp 2.000.000 (2.000 Pendaftar + Storage 5GB + Tarif Rp2.000)</option>
                <option value="ADDON_AI_100">Add-on Kuota +100 AI — Rp 50.000</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsSendBillingModalOpen(false)} className="px-4 py-2 rounded-xl border font-bold">Batal</button>
              <button type="submit" className="px-5 py-2 rounded-xl bg-[#155EEF] text-white font-black cursor-pointer">Kirim Tagihan</button>
            </div>
          </form>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form onSubmit={handleAddSchool} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-base font-black text-[#0F172A]">Tambah Sekolah Mitra & Paket</h2>
              <button type="button" onClick={() => setIsAddModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <input required placeholder="Nama Sekolah *" value={formData.schoolName} onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })} className="w-full rounded-xl border p-2.5 font-semibold" />
            <input required placeholder="NPSN *" value={formData.npsn} onChange={(e) => setFormData({ ...formData, npsn: e.target.value })} className="w-full rounded-xl border p-2.5 font-semibold" />
            <select value={formData.plan} onChange={(e) => setFormData({ ...formData, plan: e.target.value as any })} className="w-full rounded-xl border p-2.5 font-bold bg-[#F4F6F9]">
              <option value="FREE">Paket FREE (40 Pendaftar, Komisi 5%)</option>
              <option value="PRO">Paket PRO (400 Pendaftar, Tarif Rp2.500)</option>
              <option value="PREMIUM">Paket PREMIUM (2.000 Pendaftar, Tarif Rp2.000)</option>
            </select>
            <div>
              <label className="font-bold text-slate-700">Biaya Pendaftaran Sekolah (Rp)</label>
              <input type="number" value={formData.registrationFee} onChange={(e) => setFormData({ ...formData, registrationFee: Number(e.target.value) })} className="w-full rounded-xl border p-2.5 mt-1 font-semibold" />
            </div>
            <input required placeholder="Nama Admin Lembaga *" value={formData.adminName} onChange={(e) => setFormData({ ...formData, adminName: e.target.value })} className="w-full rounded-xl border p-2.5 font-semibold" />
            <input required type="email" placeholder="Email Login Admin *" value={formData.adminEmail} onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })} className="w-full rounded-xl border p-2.5 font-semibold" />
            <input required placeholder="Password Awal *" value={formData.adminPassword} onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })} className="w-full rounded-xl border p-2.5 font-semibold" />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-xl border">Batal</button>
              <button type="submit" className="px-5 py-2 rounded-xl bg-[#155EEF] text-white font-black">Simpan & Buat Akun</button>
            </div>
          </form>
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