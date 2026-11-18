'use client';
import { Shield as HShield, Building2 as HBuilding, QrCode as HQrCode, Sparkles as HSparkles, CheckCircle2 as HCheck, Wallet as HWallet, Plus as HPlus, Trash2 as HTrash, Save as HSave } from 'lucide-react';


import { useState } from 'react';
import { HybridSaasBillingPanel, FoundationBalanceCard, CloudOrderSummary, FoundationLedgerSummary } from './HybridSaasBillingPanel';
import { useRouter } from 'next/navigation';
import {
  Wallet,
  CheckCircle2,
  Building,
  QrCode,
  Link2,
  Plus,
  Trash2,
  Save,
  Upload,
  X,
  Sparkles,
  Layers,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';

export interface BankAccountItem {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export interface WaveFeeItem {
  id: string;
  waveNumber: number;
  name: string;
  registrationFee: number;
}

export interface PaymentConfigData {
  paymentMode: string;
  paymentAmount: number;
  paymentPerWave: boolean;
  useUniqueCode: boolean;
  allowInstallment: boolean;
  minDownPayment: number;
  maxInstallments: number;
  installmentNote: string | null;
  bankAccounts: BankAccountItem[];
  qrisImageUrl: string | null;
  externalPaymentUrl: string | null;
  paymentInstruction: string | null;
  requirePaymentVerifiedForCard: boolean;
  waveFees: WaveFeeItem[];
}

function formatRupiah(num: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(num);
}

export function SchoolPaymentTab({
  isAdmin,
  brandColor,
  initialConfig,
  onNotify,
}: {
  isAdmin: boolean;
  brandColor: string;
  initialConfig: PaymentConfigData;
  onNotify: (type: 'success' | 'error', message: string) => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    paymentMode: initialConfig.paymentMode || 'FREE',
    paymentAmount: initialConfig.paymentAmount || 100000,
    paymentPerWave: initialConfig.paymentPerWave,
    useUniqueCode: initialConfig.useUniqueCode,
    allowInstallment: initialConfig.allowInstallment,
    minDownPayment: initialConfig.minDownPayment || 50000,
    maxInstallments: initialConfig.maxInstallments || 2,
    installmentNote: initialConfig.installmentNote ?? '',
    qrisImageUrl: initialConfig.qrisImageUrl ?? '',
    externalPaymentUrl: initialConfig.externalPaymentUrl ?? '',
    paymentInstruction: initialConfig.paymentInstruction ?? '',
    requirePaymentVerifiedForCard: initialConfig.requirePaymentVerifiedForCard,
  });

  const [bankAccounts, setBankAccounts] = useState<BankAccountItem[]>(
    initialConfig.bankAccounts
  );
  const [newBank, setNewBank] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
  });
  const [waveFees, setWaveFees] = useState<WaveFeeItem[]>(initialConfig.waveFees);
  const [uploadingQris, setUploadingQris] = useState(false);
  const [saving, setSaving] = useState(false);

  function handleAddBank() {
    if (!newBank.bankName.trim() || !newBank.accountNumber.trim() || !newBank.accountHolder.trim()) {
      onNotify('error', 'Lengkapi nama bank, nomor rekening, dan nama pemilik rekening.');
      return;
    }
    setBankAccounts([
      ...bankAccounts,
      {
        id: `bank_${Date.now()}`,
        bankName: newBank.bankName.trim().toUpperCase(),
        accountNumber: newBank.accountNumber.trim(),
        accountHolder: newBank.accountHolder.trim(),
      },
    ]);
    setNewBank({ bankName: '', accountNumber: '', accountHolder: '' });
  }

  function handleRemoveBank(id: string) {
    setBankAccounts(bankAccounts.filter((b) => b.id !== id));
  }

  async function handleUploadQris(file: File | undefined) {
    if (!file) return;
    setUploadingQris(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('kind', 'qris');
      const res = await fetch('/api/dashboard/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) {
        onNotify('error', data.error || 'Gagal mengunggah gambar QRIS.');
      } else {
        setForm({ ...form, qrisImageUrl: data.url });
        onNotify('success', 'Gambar QRIS sekolah berhasil diunggah!');
      }
    } catch {
      onNotify('error', 'Koneksi terputus saat mengunggah QRIS.');
    } finally {
      setUploadingQris(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/dashboard/payment', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          bankAccounts,
          waveFees,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onNotify('error', data.error || 'Gagal menyimpan pengaturan pembayaran.');
      } else {
        onNotify('success', 'Pengaturan pembayaran SPMB berhasil disimpan!');
        router.refresh();
      }
    } catch {
      onNotify('error', 'Koneksi ke server terputus.');
    } finally {
      setSaving(false);
    }
  }

  // Simulasi nominal pendaftar ke-15
  const sampleBase = form.paymentPerWave
    ? waveFees[0]?.registrationFee ?? 100000
    : form.paymentAmount;
  const sampleUnique = form.useUniqueCode && sampleBase > 0 ? sampleBase + 15 : sampleBase;
  const sampleDp =
    form.allowInstallment && sampleBase > 0
      ? (form.useUniqueCode ? form.minDownPayment + 15 : form.minDownPayment)
      : sampleUnique;


  const [draftBankItem, setDraftBankItem] = useState({ bankName: '', accountNumber: '', accountHolder: '' });

  const isPaidMode =
    form.paymentMode === 'MANUAL_TRANSFER' ||
    form.paymentMode === 'AUTOMATIC_VA' ||
    form.paymentMode === 'EXTERNAL_LINK';
  const isAutoGateway = form.paymentMode === 'AUTOMATIC_VA';
  const baseNominal = Number(form.paymentAmount || 0);
  const netFoundationSample = Math.max(0, baseNominal - 5000);
  const manualSampleTotal = baseNominal + (form.useUniqueCode ? 15 : 0);

  return (
    <div className="space-y-6">
      {/* 1. PILIH SISTEM BIAYA PENDAFTARAN LEMBAGA */}
      <section className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            1. Pilih Sistem Biaya Pendaftaran Lembaga
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pilih skema yang paling sesuai dengan kebijakan sekolah/yayasan Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Opsi 1: Gratis */}
          <button
            type="button"
            onClick={() => setForm({ ...form, paymentMode: 'FREE' })}
            style={form.paymentMode === 'FREE' ? { borderColor: brandColor } : undefined}
            className={`text-left rounded-2xl border-2 p-5 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
              form.paymentMode === 'FREE'
                ? 'bg-teal-50/30 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <HShield className="w-5 h-5" />
                </div>
                {form.paymentMode === 'FREE' && (
                  <span
                    style={{ backgroundColor: brandColor }}
                    className="text-[11px] font-bold text-white px-3 py-0.5 rounded-full"
                  >
                    Dipilih
                  </span>
                )}
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Gratis / Tanpa Biaya (Rp 0)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Calon siswa mendaftar gratis tanpa tahap pembayaran. Sekolah mendapat{' '}
                <strong>30 slot Kapasitas Penyimpanan Cloud gratis</strong>; jika lebih dari 30
                pendaftar, cukup tambah Paket Kapasitas Penyimpanan Cloud.
              </p>
            </div>
          </button>

          {/* Opsi 2: Transfer Bank Manual Sekolah */}
          <button
            type="button"
            onClick={() => setForm({ ...form, paymentMode: 'MANUAL_TRANSFER' })}
            style={
              form.paymentMode === 'MANUAL_TRANSFER' ? { borderColor: brandColor } : undefined
            }
            className={`text-left rounded-2xl border-2 p-5 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
              form.paymentMode === 'MANUAL_TRANSFER'
                ? 'bg-teal-50/30 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                  <HBuilding className="w-5 h-5" />
                </div>
                {form.paymentMode === 'MANUAL_TRANSFER' && (
                  <span
                    style={{ backgroundColor: brandColor }}
                    className="text-[11px] font-bold text-white px-3 py-0.5 rounded-full"
                  >
                    Dipilih
                  </span>
                )}
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Transfer Bank Manual Sekolah
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Wali murid transfer ke rekening sekolah, lalu unggah bukti. Admin wajib
                memverifikasi kecocokan transfer dan foto struk satu per satu secara manual.
                Memakai Kapasitas Penyimpanan Cloud (gratis 30 slot awal).
              </p>
            </div>
          </button>

          {/* Opsi 3: QRIS Dinamis & VA Otomatis */}
          <button
            type="button"
            onClick={() => setForm({ ...form, paymentMode: 'AUTOMATIC_VA' })}style={
              isAutoGateway
                ? { borderColor: brandColor }
                : { borderColor: '#2dd4bf' }
            }
            className={`relative text-left rounded-2xl border-2 p-5 pt-6 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
              isAutoGateway
                ? 'bg-gradient-to-br from-teal-50/85 via-emerald-50/50 to-white ring-2 ring-teal-500/25 shadow-md'
                : 'bg-gradient-to-br from-teal-50/45 via-emerald-50/20 to-white hover:shadow-sm'
            }`}
          >
            <span className="absolute -top-3 left-5 inline-flex items-center gap-1 rounded-full bg-amber-400 text-slate-950 px-3 py-0.5 text-[10px] font-extrabold tracking-wide shadow-xs">
              ⭐ Sangat Disarankan
            </span>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-teal-100/80 text-teal-800 flex items-center justify-center">
                  <HQrCode className="w-5 h-5" />
                </div>
                {isAutoGateway && (
                  <span
                    style={{ backgroundColor: brandColor }}
                    className="text-[11px] font-bold text-white px-3 py-0.5 rounded-full"
                  >
                    Dipilih
                  </span>
                )}
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">
                QRIS Dinamis & VA Otomatis (Payment Gateway)
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                Sistem otomatis menerbitkan QRIS & VA. Bebas stres & tanpa perlu cek mutasi
                manual. Lunas instan dengan <strong>Biaya Layanan hanya Rp 5.000/transaksi</strong>.
                Dana bersih langsung masuk ke <strong>Saldo Yayasan</strong>.
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* BAGIAN 2, 3, & 4: HANYA TAMPIL JIKA LEMBAGA MEMUNGUT BIAYA PENDAFTARAN */}
      {isPaidMode && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* KOLOM KIRI (7 KOLOM): TARIF, KODE UNIK & SKEMA CICILAN */}
          <div className="lg:col-span-7 space-y-6">
            {/* 2. NOMINAL BIAYA & KODE UNIK OTOMATIS */}
            <section className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                2. Nominal Biaya & Pengaturan Kode Unik
              </h3>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, paymentPerWave: false })}
                  className={`rounded-xl px-4 py-2 text-xs font-bold border transition-all cursor-pointer ${
                    !form.paymentPerWave
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Tarif Sama Semua Gelombang
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, paymentPerWave: true })}
                  className={`rounded-xl px-4 py-2 text-xs font-bold border transition-all cursor-pointer ${
                    form.paymentPerWave
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Tarif Berbeda Tiap Gelombang
                </button>
              </div>

              {!form.paymentPerWave ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nominal Biaya Pendaftaran (Rupiah) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={form.paymentAmount}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        paymentAmount: Math.max(0, Number(e.target.value)),
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-mono font-bold text-slate-900 focus:border-teal-600 focus:outline-none"
                  />
                </div>
              ) : (
                <div className="space-y-2.5 bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-700">
                    Atur Tarif Masing-Masing Gelombang:
                  </p>
                  {[].length === 0 ? (
                    <p className="text-xs text-slate-500">
                      Belum ada gelombang terdaftar. Silakan atur di tab Jadwal Gelombang.
                    </p>
                  ) : (
                    [].map((p) => (
                      <div key={p.id} className="flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold text-slate-800">
                          Gelombang {p.waveNumber} ({p.name})
                        </span>
                        <input
                          type="number"
                          min={0}
                          step={1000}
                          value={waveFees[p.id] ?? p.registrationFee ?? 0}
                          onChange={(e) =>
                            setWaveFees({
                              ...waveFees,
                              [p.id]: Math.max(0, Number(e.target.value)),
                            })
                          }
                          className="w-40 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono font-bold text-slate-900 text-right"
                        />
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Kotak Kode Unik 3 Digit dengan Penjelasan Dampak yang Sangat Jelas */}
              {isAutoGateway ? (
                <div className="rounded-2xl bg-teal-50/80 border border-teal-200 p-4 text-xs text-teal-950 space-y-1">
                  <p className="font-bold text-teal-900">
                    ℹ️ Kode Unik 3 Digit Tidak Diperlukan pada Mode QRIS & VA Otomatis
                  </p>
                  <p className="text-teal-800 leading-relaxed">
                    Karena setiap calon siswa otomatis dibuatkan kode QRIS & Nomor VA unik
                    tersendiri, nominal tagihan tetap bulat pas (contoh{' '}
                    <strong>Rp {baseNominal.toLocaleString('id-ID')}</strong>) dan sistem otomatis
                    mengenali pembayar tanpa perlu kode unik 3 digit.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(form.useUniqueCode)}
                      onChange={(e) =>
                        setForm({ ...form, useUniqueCode: e.target.checked })
                      }
                      className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                      <HSparkles className="w-4 h-4 text-teal-600" />
                      Aktifkan Kode Unik 3 Digit Otomatis (Sangat Disarankan)
                    </span>
                  </label>

                  <div className="grid grid-cols-1 gap-2 text-xs leading-relaxed">
                    <div
                      className={`rounded-xl border p-3 transition-all ${
                        form.useUniqueCode
                          ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <p className="font-bold text-emerald-900">
                        ✓ Jika DICENTANG (Sangat Disarankan):
                      </p>
                      <p className="mt-0.5">
                        Sistem otomatis menambahkan nomor urut pendaftar di belakang nominal (contoh
                        pendaftar ke-15 mentransfer{' '}
                        <strong>Rp {(baseNominal + 15).toLocaleString('id-ID')}</strong>). Bendahara
                        langsung mengenali pengirim di mutasi rekening bank tanpa tertukar meski
                        banyak wali transfer di jam yang sama.
                      </p>
                    </div>

                    <div
                      className={`rounded-xl border p-3 transition-all ${
                        !form.useUniqueCode
                          ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <p className="font-bold text-slate-800">
                        ℹ️ Jika TIDAK DICENTANG:
                      </p>
                      <p className="mt-0.5">
                        Semua pendaftar membayar nominal bulat kembar (semua transfer{' '}
                        <strong>Rp {baseNominal.toLocaleString('id-ID')}</strong>). Bendahara wajib
                        memeriksa nama pengirim & jam transfer di foto struk satu per satu
                        karena nominal di mutasi bank semuanya kembar.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* 3. SKEMA PEMBAYARAN: LUNAS SEKALIGUS ATAU BISA DIANGSUR */}
            <section className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  3. Skema Pembayaran: Lunas Sekaligus atau Bisa Diangsur?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tentukan apakah wali murid wajib membayar penuh di awal atau diperbolehkan mencicil.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, allowInstallment: false })}
                  style={!form.allowInstallment ? { borderColor: brandColor } : undefined}
                  className={`text-left rounded-xl border-2 p-3.5 cursor-pointer ${
                    !form.allowInstallment
                      ? 'bg-teal-50/30 font-bold'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <p className="text-xs font-extrabold text-slate-900">Wajib Lunas Sekaligus</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Wali murid membayar penuh sesuai nominal tagihan saat mendaftar.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setForm({ ...form, allowInstallment: true })}
                  style={form.allowInstallment ? { borderColor: brandColor } : undefined}
                  className={`text-left rounded-xl border-2 p-3.5 cursor-pointer ${
                    form.allowInstallment
                      ? 'bg-teal-50/30 font-bold'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <p className="text-xs font-extrabold text-slate-900">
                    Bisa Diangsur / Cicilan (DP)
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Boleh bayar Uang Muka (DP) dulu, sisanya dilunasi bertahap.
                  </p>
                </button>
              </div>

              {form.allowInstallment && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Minimal Uang Muka / DP Pertama (Rp)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={5000}
                      value={form.minDownPayment}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          minDownPayment: Math.max(0, Number(e.target.value)),
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Maksimal Kali Angsuran
                    </label>
                    <input
                      type="number"
                      min={2}
                      max={12}
                      value={form.maxInstallments}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          maxInstallments: Math.max(2, Number(e.target.value)),
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>
              )}

              <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(form.requirePaymentVerifiedForCard)}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      requirePaymentVerifiedForCard: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded border-slate-300 text-teal-600"
                />
                <span className="text-xs font-semibold text-slate-700">
                  Tahan cetak Kartu Peserta sebelum pembayaran terverifikasi lunas
                </span>
              </label>
            </section>
          </div>

          {/* KOLOM KANAN (5 KOLOM): ALUR UANG / REKENING TUJUAN & SIMULASI DANA */}
          <div className="lg:col-span-5 space-y-6">
            {isAutoGateway ? (
              <>
                <section className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-xs space-y-4">
                  <div>
                    <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 mb-1.5">
                      Otomatis — Tanpa Isi Link & Tanpa Upload QRIS
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      4. Uangnya Masuk ke Mana & Cara Pencairannya?
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Anda tidak perlu mengisi tautan pembayaran apa pun pada mode ini.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-emerald-50/80 border border-emerald-200 p-4 space-y-3 text-xs text-slate-800">
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                        1
                      </span>
                      <p className="leading-relaxed">
                        <strong>QRIS & VA Terbit Otomatis untuk Siswa:</strong> Begitu calon
                        siswa mengirim formulir, layar siswa langsung menampilkan{' '}
                        <strong>QRIS Dinamis</strong> & <strong>Nomor Virtual Account (VA)</strong>{' '}
                        atas nama sekolah Anda.
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                        2
                      </span>
                      <p className="leading-relaxed">
                        <strong>Uangnya Masuk ke Saldo Yayasan:</strong> Saat siswa membayar (via
                        GoPay, OVO, DANA, ShopeePay, BRImo, Livin', BCA Mobile, atau transfer
                        VA), dana bersih otomatis masuk ke kotak <strong>Saldo Yayasan</strong> di
                        bagian bawah halaman ini (Biaya Layanan hanya Rp 5.000/transaksi).
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                        3
                      </span>
                      <p className="leading-relaxed">
                        <strong>Cara Mencairkan ke Rekening Sekolah:</strong> Gulir ke bagian{' '}
                        <strong>Saldo Yayasan</strong> di bawah, isi nomor rekening resmi
                        sekolah/yayasan, lalu klik <strong>Tarik Saldo Yayasan</strong>.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Catatan Tambahan untuk Wali Murid di Halaman Bayar (Opsional)
                    </label>
                    <textarea
                      rows={2}
                      value={form.paymentInstruction ?? ''}
                      onChange={(e) =>
                        setForm({ ...form, paymentInstruction: e.target.value })
                      }
                      placeholder="Boleh dikosongkan. Contoh: Pembayaran terverifikasi otomatis. Jika butuh bantuan, hubungi Bendahara di WA 0812..."
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none"
                    />
                  </div>
                </section>

                {/* SALDO YAYASAN & SPLIT PAYMENT OTOMATIS (DI ATAS SIMULASI PEMBAGIAN DANA) */}
                <FoundationBalanceCard
                  brandColor={brandColor}
                  foundationBalance={initialConfig.foundationBalance ?? 0}
                  platformRegFee={initialConfig.platformRegFee ?? 5000}
                  foundationLedgers={initialConfig.foundationLedgers ?? []}
                  onNotify={onNotify}
                />

                {/* Kartu Simulasi Pembagian Dana Otomatis */}
                <div className="rounded-2xl bg-slate-900 text-white p-5 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-300">
                      SIMULASI PEMBAGIAN DANA PER PENDAFTAR
                    </span>
                    <HWallet className="w-4 h-4 text-teal-300" />
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-300 pt-1">
                    <div className="flex justify-between">
                      <span>Dibayar Calon Siswa (Bulat Pas):</span>
                      <span className="font-mono font-bold text-white">
                        Rp {baseNominal.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between text-amber-300">
                      <span>Biaya Layanan Payment Gateway:</span>
                      <span className="font-mono font-bold">
                        - Rp {Math.min(baseNominal, 5000).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="pt-2 mt-1 border-t border-slate-700 flex justify-between items-baseline">
                      <span className="font-bold text-emerald-300">Masuk ke Saldo Yayasan:</span>
                      <span className="text-xl font-extrabold font-mono text-emerald-400">
                        Rp {netFoundationSample.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Mode Transfer Bank Manual Sekolah */}
                <section className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-xs space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      4. Rekening Bank & QRIS Milik Sekolah
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Dana transfer dari wali murid masuk 100% langsung ke rekening di bawah ini.
                    </p>
                  </div>

                  {/* Daftar Rekening Bank Tersimpan */}
                  {Array.isArray(form.bankAccounts) && form.bankAccounts.length > 0 && (
                    <div className="space-y-2">
                      {form.bankAccounts.map((acc, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs"
                        >
                          <div>
                            <p className="font-extrabold text-slate-900">
                              {acc.bankName} • <span className="font-mono">{acc.accountNumber}</span>
                            </p>
                            <p className="text-slate-600">a.n. {acc.accountHolder}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setForm({
                                ...form,
                                bankAccounts: form.bankAccounts.filter((_, i) => i !== idx),
                              })
                            }
                            className="text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg cursor-pointer"
                          >
                            <HTrash className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Form Tambah Rekening Tujuan */}
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-2.5">
                    <p className="text-xs font-bold text-slate-800">Tambah Rekening Tujuan:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Nama Bank (BSI/BRI/BCA)"
                        value={draftBankItem.bankName}
                        onChange={(e) =>
                          setDraftBankItem({ ...draftBankItem, bankName: e.target.value })
                        }
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                      />
                      <input
                        type="text"
                        placeholder="Nomor Rekening"
                        value={draftBankItem.accountNumber}
                        onChange={(e) =>
                          setDraftBankItem({ ...draftBankItem, accountNumber: e.target.value })
                        }
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900"
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Atas Nama (misal: Yayasan Pendidikan...)"
                        value={draftBankItem.accountHolder}
                        onChange={(e) =>
                          setDraftBankItem({ ...draftBankItem, accountHolder: e.target.value })
                        }
                        className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!draftBankItem.bankName.trim() || !draftBankItem.accountNumber.trim()) {
                            return;
                          }
                          setForm({
                            ...form,
                            bankAccounts: [
                              ...(form.bankAccounts ?? []),
                              {
                                bankName: draftBankItem.bankName.trim(),
                                accountNumber: draftBankItem.accountNumber.trim(),
                                accountHolder: draftBankItem.accountHolder.trim() || '-',
                              },
                            ],
                          });
                          setDraftBankItem({ bankName: '', accountNumber: '', accountHolder: '' });
                        }}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-900 text-white px-3 py-2 text-xs font-bold hover:bg-slate-800 cursor-pointer shrink-0"
                      >
                        <HPlus className="w-3.5 h-3.5" />
                        Tambah
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Petunjuk Cara Transfer untuk Wali Murid (Opsional)
                    </label>
                    <textarea
                      rows={2}
                      value={form.paymentInstruction ?? ''}
                      onChange={(e) =>
                        setForm({ ...form, paymentInstruction: e.target.value })
                      }
                      placeholder="Contoh: Transfer sesuai nominal hingga 3 digit kode unik terakhir, lalu unggah foto bukti transfer."
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900"
                    />
                  </div>
                </section>

                {/* Simulasi Tampilan Pendaftar Ke-15 */}
                <div className="rounded-2xl bg-slate-900 text-white p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-300">
                      SIMULASI TAMPILAN PENDAFTAR KE-15
                    </span>
                    <HWallet className="w-4 h-4 text-teal-300" />
                  </div>
                  <p className="text-xs text-slate-300 mt-1.5">Total Transfer yang Ditampilkan:</p>
                  <p className="text-2xl sm:text-3xl font-extrabold font-mono text-white mt-0.5">
                    Rp {manualSampleTotal.toLocaleString('id-ID')}
                  </p>
                  <p className="text-[11px] text-slate-300 leading-relaxed mt-2">
                    Catatan: 3 digit terakhir akan dibebankan kepada pendaftar, tidak memotong
                    nominal pokok pendaftaran sekolah.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* TOMBOL SIMPAN PENGATURAN PEMBAYARAN */}
      <div className="flex justify-end">
        <button
          type="button"
          disabled={uploadingQris}
          onClick={() => handleSave()}
          style={{ backgroundColor: brandColor }}
          className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-sm hover:opacity-95 disabled:opacity-50 cursor-pointer"
        >
          <HSave className="w-4 h-4" />
          {uploadingQris ? 'Menyimpan Pengaturan...' : 'Simpan Pengaturan Pembayaran'}
        </button>
      </div>

      {/* PANEL SAAS HIBRIDA: KAPASITAS PENYIMPANAN CLOUD, SALDO YAYASAN & DAFTAR ULANG */}
      <HybridSaasBillingPanel
        brandColor={brandColor}
        quotaBalance={initialConfig.quotaBalance ?? 30}
        lockedApplicantsCount={initialConfig.lockedApplicantsCount ?? 0}
        foundationBalance={initialConfig.foundationBalance ?? 0}
        platformRegFee={initialConfig.platformRegFee ?? 5000}
        platformReRegFee={initialConfig.platformReRegFee ?? 10000}
        reRegMode={initialConfig.reRegMode ?? 'MANUAL'}
        reRegFeeAmount={initialConfig.reRegFeeAmount ?? 0}
        reRegAllowInstallment={initialConfig.reRegAllowInstallment ?? false}
        cloudOrders={initialConfig.cloudOrders ?? []}
        foundationLedgers={initialConfig.foundationLedgers ?? []}
        hideFoundationCard={isAutoGateway}
        onNotify={onNotify}
      />
    </div>
  );
}