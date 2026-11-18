'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Eye,
  X,
  MessageCircle,
  ExternalLink,
  UserCheck,
  Wallet,
  FileText,
  Save,
  Sparkles,
  Award,
  AlertCircle,
} from 'lucide-react';

export interface UploadedDocItem {
  name: string;
  url: string;
  method?: string;
}

export interface ApplicantListItem {
  id: string;
  registrationNumber: string;
  periodId: string;
  waveNumber: number;
  waveName: string;
  pathId: string | null;
  pathName: string;
  status: string;
  fullName: string;
  nik: string;
  nisn: string;
  gender: string;
  birthPlace: string;
  birthDate: string;
  originSchool: string;
  address: string;
  parentName: string;
  parentPhone: string;
  studentPhotoUrl: string | null;
  uploadedDocs: UploadedDocItem[];
  paymentStatus: string;
  uniqueCode: number;
  expectedAmount: number;
  paidAmount: number;
  paymentProofUrl: string | null;
  paymentNote: string | null;
  isReRegistered: boolean;
  reRegisteredAt: string | null;
  verifierNote: string | null;
  createdAt: string;
}

export interface WaveQuotaSummary {
  id: string;
  waveNumber: number;
  name: string;
  quota: number;
  applicantCount: number;
  acceptedCount: number;
  reRegisteredCount: number;
  isActive: boolean;
}

export interface PathFilterItem {
  id: string;
  name: string;
}

const STATUS_META: Record<
  string,
  { label: string; badgeClass: string }
> = {
  SUBMITTED: {
    label: 'Menunggu Verifikasi',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  UNDER_REVIEW: {
    label: 'Menunggu Verifikasi',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  VERIFIED: {
    label: 'Berkas Valid',
    badgeClass: 'bg-sky-50 text-sky-800 border-sky-200',
  },
  ACCEPTED: {
    label: 'Diterima',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  WAITLISTED: {
    label: 'Cadangan',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
  },
  REJECTED: {
    label: 'Tidak Diterima',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
  },
};

const PAY_META: Record<string, { label: string; badgeClass: string }> = {
  UNPAID: {
    label: 'Belum Bayar / Gratis',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
  },
  DP_SUBMITTED: {
    label: 'Bukti DP Masuk (Cek Mutasi)',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  DP_VERIFIED: {
    label: 'DP Valid (Angsuran)',
    badgeClass: 'bg-sky-50 text-sky-800 border-sky-200',
  },
  PAID_SUBMITTED: {
    label: 'Bukti Lunas Masuk (Cek Mutasi)',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  PAID: {
    label: 'Lunas Terverifikasi',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
};

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n);
}

function normalizeWaPhone(raw: string) {
  const digits = raw.replace(/[^0-9]/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) return '62' + digits.slice(1);
  if (digits.startsWith('8')) return '62' + digits;
  return digits;
}

export function SchoolApplicantsTab({
  schoolName,
  brandColor,
  waves,
  paths,
  applicants,
  onNotify,
  hideWaveSection = false,
}: {
  schoolName: string;
  brandColor: string;
  waves: WaveQuotaSummary[];
  paths: PathFilterItem[];
  applicants: ApplicantListItem[];
  onNotify: (type: 'success' | 'error', message: string) => void;
  hideWaveSection?: boolean;
}) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [waveFilter, setWaveFilter] = useState('ALL');
  const [pathFilter, setPathFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [selected, setSelected] = useState<ApplicantListItem | null>(null);
  const [editStatus, setEditStatus] = useState('VERIFIED');
  const [editPayStatus, setEditPayStatus] = useState('PAID');
  const [editPaidAmount, setEditPaidAmount] = useState(0);
  const [editIsReReg, setEditIsReReg] = useState(false);
  const [editNote, setEditNote] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = applicants.filter((item) => {
    if (waveFilter !== 'ALL' && item.periodId !== waveFilter) return false;
    if (pathFilter !== 'ALL' && item.pathId !== pathFilter) return false;
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'PENDING') {
        if (item.status !== 'SUBMITTED' && item.status !== 'UNDER_REVIEW') return false;
      } else if (statusFilter === 'REREG') {
        if (!item.isReRegistered) return false;
      } else if (item.status !== statusFilter) {
        return false;
      }
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const hit =
        item.fullName.toLowerCase().includes(q) ||
        item.registrationNumber.toLowerCase().includes(q) ||
        item.nik.includes(q) ||
        item.parentName.toLowerCase().includes(q);
      if (!hit) return false;
    }
    return true;
  });

  function openInspector(item: ApplicantListItem) {
    setSelected(item);
    setEditStatus(item.status);
    setEditPayStatus(item.paymentStatus);
    setEditPaidAmount(item.paidAmount || item.expectedAmount);
    setEditIsReReg(item.isReRegistered);
    setEditNote(item.verifierNote ?? '');
  }

  function buildCardUrl(regNumber: string) {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    return `${origin}/kartu/${encodeURIComponent(regNumber)}`;
  }

  function sendWhatsAppVerification(
    item: ApplicantListItem,
    statusCode: string,
    isReReg: boolean
  ) {
    const phone = normalizeWaPhone(item.parentPhone);
    if (!phone) {
      onNotify('error', 'Nomor WhatsApp wali murid belum terisi pada data pendaftar ini.');
      return;
    }

    const cardUrl = buildCardUrl(item.registrationNumber);
    const statusLabel = STATUS_META[statusCode]?.label ?? statusCode;
    const extraLine =
      statusCode === 'ACCEPTED'
        ? `Selamat! Ananda dinyatakan *DITERIMA* di ${schoolName}. ${
            isReReg
              ? 'Status Daftar Ulang telah tercatat LUNAS/SELESAI.'
              : 'Silakan melakukan proses Daftar Ulang sesuai jadwal panitia.'
          }`
        : statusCode === 'VERIFIED'
        ? 'Berkas pendaftaran & data ananda telah *DIVERIFIKASI VALID* oleh panitia.'
        : `Status pendaftaran saat ini: *${statusLabel}*.`;

    const msg = encodeURIComponent(
      `Assalamu'alaikum / Salam Sejahtera Bapak/Ibu *${item.parentName || 'Wali Murid'}*,\n\n` +
        `Pemberitahuan resmi dari Panitia SPMB *${schoolName}*:\n` +
        `• Nama Calon Peserta Didik: *${item.fullName}*\n` +
        `• Nomor Registrasi: *${item.registrationNumber}*\n` +
        `• Gelombang / Jalur: Gelombang ${item.waveNumber} (${item.pathName})\n\n` +
        `${extraLine}\n\n` +
        `Silakan buka dan cetak *Kartu Peserta Resmi* melalui tautan berikut:\n${cardUrl}\n\n` +
        `Terima kasih.`
    );

    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank', 'noopener,noreferrer');
  }

  async function handleSaveVerification(andSendWa = false) {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch('/api/dashboard/applicants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantId: selected.id,
          status: editStatus,
          paymentStatus: editPayStatus,
          paidAmount: editPaidAmount,
          isReRegistered: editIsReReg,
          verifierNote: editNote,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onNotify('error', data.error || 'Gagal menyimpan hasil verifikasi.');
      } else {
        onNotify('success', `Data & status ${selected.fullName} berhasil diperbarui!`);
        if (andSendWa) {
          sendWhatsAppVerification(selected, editStatus, editIsReReg);
        }
        setSelected(null);
        router.refresh();
      }
    } catch {
      onNotify('error', 'Koneksi ke server terputus.');
    } finally {
      setSaving(false);
    }
  }

  function handleExport(format: 'xls' | 'csv') {
    const params = new URLSearchParams({
      format,
      periodId: waveFilter,
      pathId: pathFilter,
      status: statusFilter,
    });
    window.open(`/api/dashboard/applicants/export?${params.toString()}`, '_blank');
  }

  return (
    <div className="space-y-6">
      {/* 1. Kartu Persentase Keterisian Kuota Setiap Gelombang */}
      {!hideWaveSection && (
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Persentase Keterisian Kuota per Gelombang
            </h2>
            <p className="text-xs text-slate-500">
              Pantau perbandingan jumlah pendaftar terhadap kuota kursi pada masing-masing
              gelombang SPMB.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {waves.map((w) => {
            const pct =
              w.quota > 0 ? Math.min(100, Math.round((w.applicantCount / w.quota) * 100)) : 0;
            const sisa = Math.max(0, w.quota - w.applicantCount);
            return (
              <div
                key={w.id}
                className={`rounded-2xl bg-white border p-5 shadow-xs space-y-3 transition-all ${
                  w.isActive ? 'border-teal-500/60 ring-1 ring-teal-500/15' : 'border-slate-200/90'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      style={w.isActive ? { backgroundColor: brandColor } : undefined}
                      className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shrink-0 ${
                        w.isActive ? 'text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      Gelombang {w.waveNumber}
                    </span>
                    <span className="text-sm font-bold text-slate-900 truncate">{w.name}</span>
                  </div>
                  <span
                    style={{ color: brandColor }}
                    className="text-lg font-extrabold font-mono shrink-0"
                  >
                    {pct}%
                  </span>
                </div>

                {/* Progress Bar Persentase Kuota */}
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    style={{ width: `${pct}%`, backgroundColor: brandColor }}
                    className="h-full rounded-full transition-all duration-500"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-0.5">
                  <span>
                    Terisi: <strong className="text-slate-900">{w.applicantCount}</strong> /{' '}
                    {w.quota} kursi
                  </span>
                  <span>
                    Sisa: <strong className="text-teal-700">{sisa} kursi</strong>
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Diterima: {w.acceptedCount} siswa</span>
                  <span>Daftar Ulang: {w.reRegisteredCount} siswa</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      )}

      {/* 2. Bilah Filter & Ekspor Rekap Excel / CSV Siap Dapodik & EMIS */}
      <section className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Daftar Pendaftar & Verifikasi ({filtered.length} data)
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleExport('xls')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Unduh Excel (.xls) Siap Dapodik / EMIS
            </button>
            <button
              type="button"
              onClick={() => handleExport('csv')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              Unduh CSV
            </button>
          </div>
        </div>

        {/* Baris Pencarian & Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, no. daftar, NIK..."
              className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3.5 py-2 text-xs text-slate-900 focus:border-teal-600 focus:outline-none"
            />
          </div>

          <select
            value={waveFilter}
            onChange={(e) => setWaveFilter(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 focus:border-teal-600 focus:outline-none"
          >
            <option value="ALL">Semua Gelombang</option>
            {waves.map((w) => (
              <option key={w.id} value={w.id}>
                Gelombang {w.waveNumber} — {w.name}
              </option>
            ))}
          </select>

          <select
            value={pathFilter}
            onChange={(e) => setPathFilter(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 focus:border-teal-600 focus:outline-none"
          >
            <option value="ALL">Semua Jalur Pendaftaran</option>
            {paths.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 focus:border-teal-600 focus:outline-none"
          >
            <option value="ALL">Semua Status Seleksi</option>
            <option value="PENDING">Menunggu Verifikasi</option>
            <option value="VERIFIED">Berkas Valid</option>
            <option value="ACCEPTED">Diterima</option>
            <option value="WAITLISTED">Cadangan</option>
            <option value="REJECTED">Tidak Diterima</option>
            <option value="REREG">Sudah Daftar Ulang</option>
          </select>
        </div>

        {/* Tabel Daftar Pendaftar */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 border border-dashed border-slate-300 p-10 text-center space-y-2">
            <p className="text-sm font-bold text-slate-700">
              Belum ada data pendaftar yang sesuai filter
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Calon peserta didik yang mendaftar melalui link publik lembaga akan otomatis tampil
              di sini untuk diperiksa berkas, mutasi transfer kode unik, dan daftar ulangnya.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="py-3 px-4 font-bold">No. Registrasi</th>
                  <th className="py-3 px-4 font-bold">Calon Peserta Didik</th>
                  <th className="py-3 px-4 font-bold">Gelombang & Jalur</th>
                  <th className="py-3 px-4 font-bold">Pembayaran & Kode Unik</th>
                  <th className="py-3 px-4 font-bold">Status & Daftar Ulang</th>
                  <th className="py-3 px-4 font-bold text-right">Aksi Panitia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const st = STATUS_META[item.status] ?? STATUS_META.SUBMITTED;
                  const py = PAY_META[item.paymentStatus] ?? PAY_META.UNPAID;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 align-top">
                        <span
                          style={{ color: brandColor }}
                          className="font-mono font-extrabold text-xs block"
                        >
                          {item.registrationNumber}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 align-top">
                        <p className="font-bold text-slate-900 text-sm">{item.fullName}</p>
                        <p className="text-[11px] text-slate-500">
                          Asal: {item.originSchool || '-'}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Wali: {item.parentName || '-'} ({item.parentPhone || '-'})
                        </p>
                      </td>

                      <td className="py-3.5 px-4 align-top">
                        <span className="inline-block font-bold text-slate-800">
                          Gelombang {item.waveNumber}
                        </span>
                        <span className="block text-[11px] text-slate-500">{item.pathName}</span>
                      </td>

                      <td className="py-3.5 px-4 align-top space-y-1">
                        {item.expectedAmount > 0 ? (
                          <>
                            <p className="font-mono font-bold text-slate-900">
                              {formatRupiah(item.expectedAmount)}
                              {item.uniqueCode > 0 && (
                                <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-50 text-teal-700">
                                  +{item.uniqueCode}
                                </span>
                              )}
                            </p>
                            <span
                              className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${py.badgeClass}`}
                            >
                              {py.label}
                            </span>
                          </>
                        ) : (
                          <span className="inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            Gratis (Rp 0)
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 align-top space-y-1.5">
                        <span
                          className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${st.badgeClass}`}
                        >
                          {st.label}
                        </span>
                        {item.isReRegistered && (
                          <span className="block w-fit text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                            ✓ Sudah Daftar Ulang
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 align-top text-right">
                        <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openInspector(item)}
                            style={{ backgroundColor: brandColor }}
                            className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:opacity-95 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Periksa
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              sendWhatsAppVerification(item, item.status, item.isReRegistered)
                            }
                            title="Kirim Kartu Peserta & Status ke WhatsApp Wali Murid"
                            className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1.5 text-xs font-bold text-white cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            WA Kartu
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* MODAL PEMERIKSAAN BERKAS, MUTASI KODE UNIK, KELULUSAN & DAFTAR ULANG */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-4xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-6">
            {/* Header Modal */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
              <div>
                <span
                  style={{ color: brandColor }}
                  className="font-mono text-xs font-extrabold"
                >
                  {selected.registrationNumber} • Gelombang {selected.waveNumber}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{selected.fullName}</h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/kartu/${encodeURIComponent(selected.registrationNumber)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Buka Kartu Peserta
                </a>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-xl border border-slate-200 bg-white p-1.5 text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[80vh] overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Kolom Kiri (7 kolom): Biodata, Berkas Unggahan, & Bukti Transfer */}
              <div className="lg:col-span-7 space-y-5">
                {/* Biodata Ringkas */}
                <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">NIK / NISN</span>
                    <strong className="font-mono text-slate-900">
                      {selected.nik || '-'} / {selected.nisn || '-'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Jalur Pendaftaran</span>
                    <strong className="text-slate-900">{selected.pathName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Tempat, Tgl Lahir</span>
                    <strong className="text-slate-900">
                      {selected.birthPlace || '-'}, {selected.birthDate || '-'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Asal Lembaga</span>
                    <strong className="text-slate-900">{selected.originSchool || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Orang Tua / Wali</span>
                    <strong className="text-slate-900">{selected.parentName || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">No. WhatsApp Wali</span>
                    <strong className="font-mono text-emerald-700">
                      {selected.parentPhone || '-'}
                    </strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block">Alamat Lengkap</span>
                    <strong className="text-slate-900">{selected.address || '-'}</strong>
                  </div>
                </div>

                {/* Pemeriksaan Berkas Unggahan */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                    Berkas Persyaratan Unggahan ({selected.uploadedDocs.length})
                  </h4>
                  {selected.uploadedDocs.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 p-4 text-xs text-slate-500">
                      Belum ada lampiran berkas yang diunggah pada data ini.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selected.uploadedDocs.map((doc, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                            <span className="font-bold text-slate-800 truncate">{doc.name}</span>
                          </div>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-bold text-teal-700 hover:underline shrink-0"
                          >
                            Lihat File <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pencocokan Nominal Transfer & Kode Unik 3 Digit */}
                {selected.expectedAmount > 0 && (
                  <div className="rounded-2xl bg-amber-50/60 border border-amber-200 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                        <Wallet className="w-4 h-4 text-amber-600" />
                        Pencocokan Mutasi Transfer & Kode Unik
                      </h4>
                      {selected.uniqueCode > 0 && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-950">
                          Kode Unik: {String(selected.uniqueCode).padStart(3, '0')}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs bg-white rounded-xl p-3 border border-amber-200/80">
                      <div>
                        <span className="text-slate-500 block">
                          Total Tagihan Seharusnya (Mutasi)
                        </span>
                        <span className="text-base font-extrabold font-mono text-slate-900">
                          {formatRupiah(selected.expectedAmount)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Nominal Terkonfirmasi Masuk</span>
                        <span className="text-base font-extrabold font-mono text-emerald-700">
                          {formatRupiah(editPaidAmount)}
                        </span>
                      </div>
                    </div>

                    {selected.paymentProofUrl && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">Bukti Struk / Screenshot Transfer:</span>
                        <a
                          href={selected.paymentProofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-bold text-teal-700 hover:underline"
                        >
                          Buka Bukti Transfer <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Kolom Kanan (5 kolom): Keputusan Verifikasi, Pembayaran, Daftar Ulang & Kirim WA */}
              <div className="lg:col-span-5 space-y-4">
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-teal-600" />
                    Keputusan Verifikasi & Kelulusan
                  </h4>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Status Berkas & Kelulusan
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900"
                    >
                      <option value="SUBMITTED">Menunggu Verifikasi</option>
                      <option value="VERIFIED">Berkas Valid (Terverifikasi)</option>
                      <option value="ACCEPTED">Diterima (Lulus Seleksi)</option>
                      <option value="WAITLISTED">Cadangan</option>
                      <option value="REJECTED">Tidak Diterima</option>
                    </select>
                  </div>

                  {selected.expectedAmount > 0 && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Status Pembayaran (Mutasi Rekening)
                        </label>
                        <select
                          value={editPayStatus}
                          onChange={(e) => setEditPayStatus(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-900"
                        >
                          <option value="UNPAID">Belum Bayar</option>
                          <option value="DP_SUBMITTED">Bukti DP Diunggah</option>
                          <option value="DP_VERIFIED">DP Terverifikasi (Angsuran)</option>
                          <option value="PAID_SUBMITTED">Bukti Lunas Diunggah</option>
                          <option value="PAID">Lunas Terverifikasi</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Nominal Masuk di Rekening (Rp)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={editPaidAmount}
                          onChange={(e) => setEditPaidAmount(Number(e.target.value))}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-mono font-bold text-slate-900"
                        />
                      </div>
                    </>
                  )}

                  {/* Fitur Daftar Ulang */}
                  <div className="rounded-xl bg-white border border-slate-200 p-3.5">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editIsReReg}
                        onChange={(e) => setEditIsReReg(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-teal-600"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                          Konfirmasi Sudah Daftar Ulang
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          Tandai jika calon peserta didik sudah menyelesaikan daftar ulang di
                          lembaga.
                        </span>
                      </div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Catatan Panitia (Opsional)
                    </label>
                    <textarea
                      rows={2}
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                      placeholder="Contoh: Berkas KK & Akta sudah sesuai, transfer kode unik cocok."
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                    />
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => handleSaveVerification(true)}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {saving
                        ? 'Menyimpan...'
                        : 'Simpan & Kirim Kartu Peserta ke WA Wali'}
                    </button>

                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => handleSaveVerification(false)}
                      style={{ backgroundColor: brandColor }}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:opacity-95 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      Simpan Perubahan Saja
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}