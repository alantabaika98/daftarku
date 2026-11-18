'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Cloud,
  Wallet,
  Copy,
  Check,
  CheckCircle2,
  ArrowUpRight,
  RefreshCw,
  ShieldCheck,
  Layers,
  Building2,
  Flame,
} from 'lucide-react';
import {
  createCloudStorageOrderAction,
  settleCloudStorageOrderAction,
  withdrawFoundationBalanceAction,
  updateHybridSaasSettingsAction,
} from '@/app/actions/saasHybridActions';

export interface CloudOrderSummary {
  id: string;
  orderNumber: string;
  packageName: string;
  quotaAdded: number;
  amount: number;
  vaNumber: string | null;
  status: string;
  createdAt: string;
}

export interface FoundationLedgerSummary {
  id: string;
  type: string;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

const PACKAGES = [
  {
    code: 'STARTER_50',
    title: 'Paket Starter',
    quotaLabel: '50 Kuota Data',
    quota: 50,
    price: 250000,
    unitLabel: 'Setara Rp 5.000 / pendaftar',
    costAnchor: '',
    isHero: false,
    isDecoy: false,
    desc: 'Kapasitas awal untuk gelombang percobaan atau rombel skala kecil.',
  },
  {
    code: 'STANDAR_200',
    title: 'Paket Standar',
    quotaLabel: '200 Kuota Data',
    quota: 200,
    price: 600000,
    unitLabel: 'Setara Rp 3.000 / pendaftar',
    costAnchor: '(Lebih hemat 70% dibanding biaya cetak map, formulir fisik, & fotokopi manual)',
    isHero: true,
    isDecoy: false,
    desc: 'Kapasitas ideal untuk penerimaan reguler sekolah, madrasah, & pesantren.',
  },
  {
    code: 'JUMBO_500',
    title: 'Paket Jumbo',
    quotaLabel: '500 Kuota Data',
    quota: 500,
    price: 1000000,
    unitLabel: 'Setara Rp 2.000 / pendaftar',
    costAnchor: '',
    isHero: false,
    isDecoy: true,
    desc: 'Kapasitas institusi besar untuk yayasan multi-unit, boarding school, & kampus.',
  },
];

function formatRp(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n);
}

// KARTU SALDO YAYASAN & SPLIT PAYMENT OTOMATIS (DITEMPATKAN DI ATAS SIMULASI PEMBAGIAN DANA)
export function FoundationBalanceCard({
  brandColor,
  foundationBalance,
  platformRegFee,
  foundationLedgers,
  onNotify,
}: {
  brandColor: string;
  foundationBalance: number;
  platformRegFee: number;
  foundationLedgers: FoundationLedgerSummary[];
  onNotify: (type: 'success' | 'error', msg: string) => void;
}) {
  const router = useRouter();
  const [wdAmount, setWdAmount] = useState(foundationBalance >= 50000 ? foundationBalance : 50000);
  const [wdBank, setWdBank] = useState('BRI');
  const [wdAccNum, setWdAccNum] = useState('');
  const [wdAccHolder, setWdAccHolder] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  async function handleWithdrawFoundation(e: React.FormEvent) {
    e.preventDefault();
    setWithdrawing(true);
    try {
      const res = await withdrawFoundationBalanceAction({
        amount: wdAmount,
        bankName: wdBank,
        accountNumber: wdAccNum,
        accountHolder: wdAccHolder,
      });
      if (!res.ok) {
        onNotify('error', res.error || 'Gagal mencairkan Saldo Yayasan.');
      } else {
        onNotify('success', 'Pencairan Saldo Yayasan berhasil diproses secara otomatis!');
        setWdAccNum('');
        router.refresh();
      }
    } finally {
      setWithdrawing(false);
    }
  }

  return (
    <section className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs space-y-4">
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-start gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Saldo Yayasan & Split Payment Otomatis
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
              Dana bersih pembayaran QRIS & VA otomatis masuk ke saldo ini (Biaya Layanan{' '}
              {formatRp(platformRegFee)}/tx).
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2 text-right shrink-0">
          <span className="text-[10px] font-bold text-emerald-800 block">Saldo Tersedia</span>
          <span className="text-base sm:text-lg font-extrabold font-mono text-emerald-900">
            {formatRp(foundationBalance)}
          </span>
        </div>
      </div>

      <form
        onSubmit={handleWithdrawFoundation}
        className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50 border border-slate-200/80 rounded-xl p-3.5"
      >
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Nominal Tarik (Rp)
          </label>
          <input
            type="number"
            min={50000}
            value={wdAmount}
            onChange={(e) => setWdAmount(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono font-bold text-slate-900"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Bank Tujuan</label>
          <input
            type="text"
            value={wdBank}
            onChange={(e) => setWdBank(e.target.value)}
            placeholder="BRI / BSI / BNI / BCA"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Nomor Rekening Yayasan
          </label>
          <input
            type="text"
            value={wdAccNum}
            onChange={(e) => setWdAccNum(e.target.value)}
            placeholder="00123456789"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Atas Nama Yayasan / Lembaga
          </label>
          <input
            type="text"
            value={wdAccHolder}
            onChange={(e) => setWdAccHolder(e.target.value)}
            placeholder="Yayasan Pendidikan..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
          />
        </div>
        <div className="sm:col-span-2 pt-0.5">
          <button
            type="submit"
            disabled={withdrawing || foundationBalance < 50000}
            style={{ backgroundColor: brandColor }}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:opacity-95 disabled:opacity-45 cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            {withdrawing ? 'Mencairkan...' : 'Tarik Saldo Yayasan ke Rekening'}
          </button>
        </div>
      </form>

      {foundationLedgers.length > 0 && (
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="py-2 px-3 font-bold">Mutasi</th>
                <th className="py-2 px-3 font-bold">Bersih</th>
                <th className="py-2 px-3 font-bold text-right">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {foundationLedgers.slice(0, 5).map((lg) => (
                <tr key={lg.id}>
                  <td className="py-2 px-3 text-slate-700">{lg.description}</td>
                  <td
                    className={`py-2 px-3 font-mono font-bold ${
                      lg.netAmount >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {lg.netAmount >= 0 ? `+${formatRp(lg.netAmount)}` : formatRp(lg.netAmount)}
                  </td>
                  <td className="py-2 px-3 font-mono font-bold text-right text-slate-900">
                    {formatRp(lg.balanceAfter)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function HybridSaasBillingPanel({
  brandColor,
  quotaBalance,
  lockedApplicantsCount,
  foundationBalance,
  platformRegFee,
  platformReRegFee,
  reRegMode,
  reRegFeeAmount,
  reRegAllowInstallment,
  cloudOrders,
  foundationLedgers,
  hideFoundationCard = false,
  onNotify,
}: {
  brandColor: string;
  quotaBalance: number;
  lockedApplicantsCount: number;
  foundationBalance: number;
  platformRegFee: number;
  platformReRegFee: number;
  reRegMode: string;
  reRegFeeAmount: number;
  reRegAllowInstallment: boolean;
  cloudOrders: CloudOrderSummary[];
  foundationLedgers: FoundationLedgerSummary[];
  hideFoundationCard?: boolean;
  onNotify: (type: 'success' | 'error', msg: string) => void;
}) {
  const router = useRouter();
  const [selectedPkg, setSelectedPkg] = useState('STANDAR_200');
  const [generatingOrder, setGeneratingOrder] = useState(false);
  const [settlingId, setSettlingId] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Opt-In Fase Daftar Ulang
  const [rrMode, setRrMode] = useState<'MANUAL' | 'AUTOMATIC_VA'>(
    reRegMode === 'AUTOMATIC_VA' ? 'AUTOMATIC_VA' : 'MANUAL'
  );
  const [rrFee, setRrFee] = useState(reRegFeeAmount);
  const [rrInstallment, setRrInstallment] = useState(reRegAllowInstallment);
  const [savingRr, setSavingRr] = useState(false);

  function copyVal(key: string, val: string) {
    navigator.clipboard.writeText(val);
    setCopiedText(key);
    setTimeout(() => setCopiedText(null), 2000);
  }

  async function handleGeneratePaymentCode() {
    setGeneratingOrder(true);
    try {
      const res = await createCloudStorageOrderAction(selectedPkg);
      if (!res.ok) {
        onNotify('error', res.error || 'Gagal membuat kode pembayaran.');
      } else {
        onNotify(
          'success',
          `Kode Pembayaran ${res.order?.orderNumber} & VA otomatis berhasil dibuat!`
        );
        router.refresh();
      }
    } finally {
      setGeneratingOrder(false);
    }
  }

  async function handleConfirmCloudOrder(orderId: string) {
    setSettlingId(orderId);
    try {
      const res = await settleCloudStorageOrderAction(orderId);
      if (!res.ok) {
        onNotify('error', res.error || 'Gagal mengonfirmasi pembayaran.');
      } else {
        onNotify(
          'success',
          `Kapasitas aktif! +${res.quotaAdded ?? 200} slot Kapasitas Penyimpanan Cloud otomatis ditambahkan & data pendaftar dibuka.`
        );
        router.refresh();
      }
    } finally {
      setSettlingId(null);
    }
  }

  async function handleSaveReReg() {
    setSavingRr(true);
    try {
      const res = await updateHybridSaasSettingsAction({
        reRegMode: rrMode,
        reRegFeeAmount: rrFee,
        reRegAllowInstallment: rrInstallment,
      });
      if (!res.ok) {
        onNotify('error', res.error || 'Gagal menyimpan pengaturan Daftar Ulang.');
      } else {
        onNotify('success', 'Pengaturan Fase Daftar Ulang berhasil disimpan!');
        router.refresh();
      }
    } finally {
      setSavingRr(false);
    }
  }

  return (
    <div className="space-y-6 pt-2">
      {!hideFoundationCard && foundationBalance > 0 && (
        <FoundationBalanceCard
          brandColor={brandColor}
          foundationBalance={foundationBalance}
          platformRegFee={platformRegFee}
          foundationLedgers={foundationLedgers}
          onNotify={onNotify}
        />
      )}

      {/* BAGIAN A: KAPASITAS PENYIMPANAN CLOUD (PRICING TIER PSIKOLOGIS) */}
      <section className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div
              style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
              className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
            >
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Kapasitas Penyimpanan Cloud (Jalur Gratis & Transfer Mandiri)
              </h3>
              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                Lembaga memperoleh <strong>30 slot penyimpanan data pendaftar gratis</strong> di awal.
                Jika pendaftar ke-31 dst masuk, calon siswa tetap bisa mendaftar normal; pilih paket
                kapasitas di bawah agar penyimpanan berkas & biodata aktif permanen tanpa masa
                kedaluwarsa.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-right">
              <span className="text-[11px] font-semibold text-slate-500 block">
                Sisa Kapasitas Cloud
              </span>
              <span style={{ color: brandColor }} className="text-lg font-extrabold font-mono">
                {quotaBalance} Slot
              </span>
            </div>
            {lockedApplicantsCount > 0 && (
              <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-right">
                <span className="text-[11px] font-semibold text-amber-800 block">
                  Data Terkunci
                </span>
                <span className="text-lg font-extrabold font-mono text-amber-900">
                  {lockedApplicantsCount} Siswa
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 3 Pilihan Paket Kapasitas Penyimpanan Cloud */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2 items-stretch">
          {PACKAGES.map((pkg) => {
            const active = selectedPkg === pkg.code;

            // Tampilan Khusus Trik 1, 2, 3: Paket Standar (Best Value / Hero Card 3D)
            if (pkg.isHero) {
              return (
                <button
                  key={pkg.code}
                  type="button"
                  onClick={() => setSelectedPkg(pkg.code)}
                  className={`relative text-left rounded-2xl border-2 border-emerald-600 bg-gradient-to-b from-emerald-50/75 via-white to-white p-5 pt-7 shadow-xl shadow-emerald-950/10 md:-translate-y-1.5 transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                    active ? 'ring-4 ring-emerald-500/20' : 'hover:shadow-2xl'
                  }`}
                >
                  <span className="absolute -top-3.5 left-5 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                    <Flame className="w-3 h-3" />
                    PALING HEMAT
                  </span>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-base font-extrabold text-slate-900">{pkg.title}</p>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                        {pkg.quotaLabel}
                      </span>
                    </div>

                    {/* Trik 1: Tonjolkan Harga Eceran (Micro-Pricing) agar mata mengunci angka 3.000 */}
                    <div className="pt-1 space-y-1.5">
                      <div className="inline-flex items-center rounded-xl bg-emerald-100/90 border border-emerald-300 px-3 py-1.5">
                        <span className="text-sm sm:text-base font-extrabold text-emerald-800">
                          {pkg.unitLabel}
                        </span>
                      </div>

                      {/* Trik 2: Jangkar Pembanding Biaya Kertas */}
                      <p className="text-[11px] font-medium text-emerald-900/75 leading-snug">
                        {pkg.costAnchor}
                      </p>

                      <p className="text-base font-extrabold font-mono text-slate-900 pt-1">
                        Total {formatRp(pkg.price)}
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed pt-0.5">{pkg.desc}</p>
                  </div>

                  <div className="pt-2.5 border-t border-emerald-100 text-xs font-bold flex items-center justify-between">
                    <span className="text-slate-600">✓ Berlaku selamanya</span>
                    <span className="text-emerald-700 font-extrabold">
                      {active ? '✓ Pilih & Berhemat' : 'Pilih & Berhemat →'}
                    </span>
                  </div>
                </button>
              );
            }

            // Trik 4: Paket Jumbo (1 Juta) sengaja dibuat kaku, formal, dan korporat sebagai Decoy
            if (pkg.isDecoy) {
              return (
                <button
                  key={pkg.code}
                  type="button"
                  onClick={() => setSelectedPkg(pkg.code)}
                  className={`text-left rounded-2xl border p-5 transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                    active
                      ? 'border-slate-600 bg-slate-100/90 shadow-xs'
                      : 'border-slate-200 bg-slate-50/75 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-slate-800">{pkg.title}</p>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-slate-200/80 text-slate-700">
                        {pkg.quotaLabel}
                      </span>
                    </div>

                    <div className="pt-1 space-y-1">
                      <p className="text-xl font-bold font-mono text-slate-800">
                        {formatRp(pkg.price)}
                      </p>
                      <p className="text-xs font-medium text-slate-500">{pkg.unitLabel}</p>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed pt-1">{pkg.desc}</p>
                  </div>

                  <div className="pt-2.5 border-t border-slate-200/80 text-[11px] font-semibold text-slate-600 flex items-center justify-between">
                    <span>Berlaku selamanya</span>
                    {active && <span className="font-bold text-slate-900">Dipilih</span>}
                  </div>
                </button>
              );
            }

            // Paket Starter (50 Kuota)
            return (
              <button
                key={pkg.code}
                type="button"
                onClick={() => setSelectedPkg(pkg.code)}
                className={`text-left rounded-2xl border p-5 transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                  active
                    ? 'border-slate-700 bg-slate-50 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-slate-900">{pkg.title}</p>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {pkg.quotaLabel}
                    </span>
                  </div>

                  <div className="pt-1 space-y-1">
                    <p className="text-xl font-extrabold font-mono text-slate-900">
                      {formatRp(pkg.price)}
                    </p>
                    <p className="text-xs font-semibold text-slate-500">{pkg.unitLabel}</p>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed pt-1">{pkg.desc}</p>
                </div>

                <div className="pt-2.5 border-t border-slate-100 text-[11px] font-semibold text-slate-600 flex items-center justify-between">
                  <span>✓ Berlaku selamanya</span>
                  {active && <span className="font-extrabold text-slate-900">Dipilih</span>}
                </div>
              </button>
            );
          })}
        </div>

        {/* Trik 5: Kata Kerja Tombol Pemicu Rasa Aman & Hemat */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <p className="text-xs text-slate-500">
            Sistem otomatis menerbitkan <strong>Kode Pembayaran & Nomor VA</strong>. Kuota
            kapasitas langsung bertambah otomatis begitu pembayaran selesai.
          </p>
          <button
            type="button"
            disabled={generatingOrder}
            onClick={handleGeneratePaymentCode}
            style={{ backgroundColor: brandColor }}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-sm hover:opacity-95 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            {generatingOrder ? 'Menyiapkan Kapasitas...' : 'Amankan Kapasitas Sekarang'}
          </button>
        </div>

        {/* Daftar Kode Pembayaran Otomatis & Riwayat Paket Cloud */}
        {cloudOrders.length > 0 && (
          <div className="space-y-2.5 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Tagihan & Riwayat Kapasitas Penyimpanan Cloud
            </h4>
            <div className="space-y-2.5">
              {cloudOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-extrabold text-slate-900">
                        {ord.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          ord.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord.status === 'PAID'
                          ? `✓ Aktif (+${ord.quotaAdded} Slot Kapasitas)`
                          : 'Menunggu Pembayaran'}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-700">{ord.packageName}</p>
                    {ord.vaNumber && (
                      <div className="flex items-center gap-3 text-xs text-slate-600 pt-0.5 flex-wrap">
                        <span>
                          Kode VA Otomatis:{' '}
                          <strong className="font-mono text-slate-900">{ord.vaNumber}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => copyVal(ord.id + 'va', ord.vaNumber!)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 hover:underline cursor-pointer"
                        >
                          {copiedText === ord.id + 'va' ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          Salin VA
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-left lg:text-right">
                      <span className="text-[11px] text-slate-500 block">
                        Nominal Bayar (+Kode Unik)
                      </span>
                      <span className="text-base font-extrabold font-mono text-slate-900">
                        {formatRp(ord.amount)}
                      </span>
                    </div>

                    {ord.status !== 'PAID' && (
                      <button
                        type="button"
                        disabled={settlingId === ord.id}
                        onClick={() => handleConfirmCloudOrder(ord.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs cursor-pointer"
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 ${settlingId === ord.id ? 'animate-spin' : ''}`}
                        />
                        {settlingId === ord.id
                          ? 'Memverifikasi...'
                          : 'Konfirmasi & Aktifkan Kapasitas'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* BAGIAN C: PENGATURAN FASE DAFTAR ULANG (OPT-IN MANUAL VS OTOMATIS VA) */}
      <section className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Pengaturan Sistem Pembayaran Fase Daftar Ulang (Opsional / Opt-In)
            </h3>
            <p className="text-xs text-slate-500">
              Pilih bagaimana wali murid menyelesaikan administrasi daftar ulang setelah dinyatakan
              diterima.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setRrMode('MANUAL')}
            style={rrMode === 'MANUAL' ? { borderColor: brandColor } : undefined}
            className={`text-left rounded-2xl border p-4 cursor-pointer transition-all ${
              rrMode === 'MANUAL' ? 'bg-slate-50 ring-2 ring-teal-500/20' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Opsi Manual (Gratis — Tanpa Biaya Layanan)
              </span>
              {rrMode === 'MANUAL' && (
                <span
                  style={{ backgroundColor: brandColor }}
                  className="text-[10px] font-bold text-white px-2.5 py-0.5 rounded-full"
                >
                  Aktif
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Admin/bendahara memverifikasi pembayaran daftar ulang tunai atau transfer ke rekening
              lembaga secara manual (Rp 0 biaya layanan).
            </p>
          </button>

          <button
            type="button"
            onClick={() => setRrMode('AUTOMATIC_VA')}
            style={rrMode === 'AUTOMATIC_VA' ? { borderColor: brandColor } : undefined}
            className={`text-left rounded-2xl border p-4 cursor-pointer transition-all ${
              rrMode === 'AUTOMATIC_VA'
                ? 'bg-slate-50 ring-2 ring-teal-500/20'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-sky-600" />
                Opsi Otomatis (Virtual Account Dinamis)
              </span>
              {rrMode === 'AUTOMATIC_VA' && (
                <span
                  style={{ backgroundColor: brandColor }}
                  className="text-[10px] font-bold text-white px-2.5 py-0.5 rounded-full"
                >
                  Aktif
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Sistem menerbitkan VA dinamis per siswa (mendukung cicilan) dengan{' '}
              <strong>Biaya Layanan {formatRp(platformReRegFee)}/transaksi</strong> dan sisa bersih
              otomatis masuk ke Saldo Yayasan.
            </p>
          </button>
        </div>

        {rrMode === 'AUTOMATIC_VA' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nominal Biaya Daftar Ulang (Rp)
              </label>
              <input
                type="number"
                min={0}
                value={rrFee}
                onChange={(e) => setRrFee(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-mono font-bold text-slate-900"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rrInstallment}
                  onChange={(e) => setRrInstallment(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300"
                />
                Izinkan Cicilan (Installment) pada Daftar Ulang
              </label>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            disabled={savingRr}
            onClick={handleSaveReReg}
            style={{ backgroundColor: brandColor }}
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-xs hover:opacity-95 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {savingRr ? 'Menyimpan...' : 'Simpan Pengaturan Daftar Ulang'}
          </button>
        </div>
      </section>
    </div>
  );
}