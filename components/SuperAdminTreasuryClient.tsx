'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Wallet,
  Cloud,
  Split,
  ArrowUpRight,
  CheckCircle2,
  Landmark,
} from 'lucide-react';
import { disburseSuperAdminTreasuryAction } from '@/app/actions/saasHybridActions';

function formatRp(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n);
}

export function SuperAdminTreasuryClient({
  initialBalance,
  cloudIncome,
  vaFeeIncome,
  ledgers,
  withdrawals,
}: {
  initialBalance: number;
  cloudIncome: number;
  vaFeeIncome: number;
  ledgers: {
    id: string;
    schoolName: string;
    sourceType: string;
    referenceNo: string;
    netAmount: number;
    balanceAfter: number;
    description: string;
    createdAt: string;
  }[];
  withdrawals: {
    id: string;
    disbursementNo: string;
    amount: number;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    status: string;
    disbursedAt: string;
  }[];
}) {
  const router = useRouter();
  const [amount, setAmount] = useState(initialBalance >= 10000 ? initialBalance : 10000);
  const [bankName, setBankName] = useState('BCA');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('Mokhammad Alan Tabaika');
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  async function handleDisburse(e: React.FormEvent) {
    e.preventDefault();
    setBanner(null);
    setLoading(true);
    try {
      const res = await disburseSuperAdminTreasuryAction({
        amount,
        bankName,
        accountNumber,
        accountHolder,
      });
      if (!res.ok) {
        setBanner({ type: 'err', text: res.error || 'Gagal mencairkan dana.' });
      } else {
        setBanner({
          type: 'ok',
          text: `Pencairan Otomatis (${res.disbursementNo}) berhasil ditransfer! Saldo tampungan tersisa ${formatRp(
            res.balanceAfter ?? 0
          )}.`,
        });
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {banner && (
        <div
          className={`rounded-2xl border p-4 text-xs sm:text-sm font-bold ${
            banner.type === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {banner.text}
        </div>
      )}

      {/* 3 Kartu Ringkasan Tampungan Dana Super Admin */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-slate-900 text-white p-6 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-teal-300 flex items-center gap-1.5">
            <Wallet className="w-4 h-4" />
            Total Tampungan Dana Siap Cair
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono pt-1">
            {formatRp(initialBalance)}
          </p>
          <p className="text-[11px] text-slate-400">Otomatis terakumulasi dari semua tenant</p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Cloud className="w-4 h-4 text-teal-600" />
            Pendapatan Paket Kapasitas Cloud
          </span>
          <p className="text-2xl font-extrabold font-mono text-slate-900 pt-1">
            {formatRp(cloudIncome)}
          </p>
          <p className="text-[11px] text-slate-500">Dari lembaga jalur gratis / transfer mandiri</p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Split className="w-4 h-4 text-sky-600" />
            Pendapatan Dana Kemitraan VA
          </span>
          <p className="text-2xl font-extrabold font-mono text-slate-900 pt-1">
            {formatRp(vaFeeIncome)}
          </p>
          <p className="text-[11px] text-slate-500">Split otomatis Rp 5.000 & Rp 10.000/tx</p>
        </div>
      </div>

      {/* Formulir Pencairan Dana Otomatis Super Admin */}
      <form
        onSubmit={handleDisburse}
        className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs space-y-4"
      >
        <div className="flex items-center gap-2">
          <Landmark className="w-5 h-5 text-teal-700" />
          <h2 className="text-base font-bold text-slate-900">
            Pencairan Otomatis (Auto-Disbursement) ke Rekening Super Admin
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nominal Pencairan (Rp)
            </label>
            <input
              type="number"
              min={10000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Bank / E-Wallet</label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="BCA / BRI / Mandiri / BSI"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Rekening</label>
            <input
              type="text"
              required
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Masukkan no. rekening"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-mono text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Penerima</label>
            <input
              type="text"
              required
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading || initialBalance < 10000}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 px-4 py-2.5 text-xs font-bold text-white shadow-xs disabled:opacity-45 cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" />
              {loading ? 'Memproses...' : 'Cairkan Dana Sekarang'}
            </button>
          </div>
        </div>
      </form>

      {/* Tabel Riwayat Mutasi Tampungan & Pencairan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">
            Buku Besar Masuk & Keluar Tampungan Dana
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="py-2.5 px-3 font-bold">Referensi</th>
                  <th className="py-2.5 px-3 font-bold">Keterangan</th>
                  <th className="py-2.5 px-3 font-bold text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ledgers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-400">
                      Belum ada transaksi masuk ke Tampungan Dana Super Admin.
                    </td>
                  </tr>
                ) : (
                  ledgers.map((l) => (
                    <tr key={l.id}>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                        {l.referenceNo}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{l.description}</td>
                      <td
                        className={`py-2.5 px-3 font-mono font-bold text-right ${
                          l.netAmount >= 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {l.netAmount >= 0 ? `+${formatRp(l.netAmount)}` : formatRp(l.netAmount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-2xl bg-white border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Riwayat Pencairan Super Admin</h3>
          {withdrawals.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center border border-dashed border-slate-200 rounded-xl">
              Belum ada riwayat pencairan dana.
            </p>
          ) : (
            <div className="space-y-2.5">
              {withdrawals.map((w) => (
                <div
                  key={w.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900">{w.disbursementNo}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      Terkirim Otomatis
                    </span>
                  </div>
                  <p className="font-extrabold font-mono text-sm text-teal-800">
                    {formatRp(w.amount)}
                  </p>
                  <p className="text-slate-600">
                    {w.bankName} • {w.accountNumber} ({w.accountHolder})
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}