import Link from 'next/link';
import { ArrowLeft, Landmark, ShieldCheck } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { SuperAdminTreasuryClient } from '@/components/SuperAdminTreasuryClient';

export default async function SuperAdminTreasuryPage() {
  const [ledgers, withdrawals, schoolsCount] = await Promise.all([
    prisma.platformTreasuryLedger.findMany({
      orderBy: { createdAt: 'desc' },
      take: 30,
    }),
    prisma.platformWithdrawal.findMany({
      orderBy: { createdAt: 'desc' },
      take: 15,
    }),
    prisma.school.count(),
  ]);

  const currentBalance =
    ledgers[0]?.balanceAfter ??
    ledgers.reduce((acc, item) => acc + item.netAmount, 0);

  const cloudIncome = ledgers
    .filter((l) => l.sourceType === 'CLOUD_STORAGE_PACKAGE')
    .reduce((s, l) => s + l.netAmount, 0);

  const vaFeeIncome = ledgers
    .filter((l) => l.sourceType === 'VA_REGISTRATION_FEE' || l.sourceType === 'VA_REREGISTRATION_FEE')
    .reduce((s, l) => s + l.netAmount, 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-16">
      <div className="max-w-6xl mx-auto px-4 pt-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center shrink-0">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                  Super Admin Kas & Settlement
                </span>
                <span className="text-xs text-slate-500">{schoolsCount} Lembaga Terdaftar</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                Tampungan Dana Super Admin & Pencairan Otomatis
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Seluruh pembayaran Paket Kapasitas Penyimpanan Cloud dan potongan Dana Kemitraan VA
                otomatis masuk ke kas ini dan siap dicairkan kapan saja.
              </p>
            </div>
          </div>

          <Link
            href="/super-admin"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Command Center
          </Link>
        </div>

        <SuperAdminTreasuryClient
          initialBalance={currentBalance}
          cloudIncome={cloudIncome}
          vaFeeIncome={vaFeeIncome}
          ledgers={ledgers.map((l) => ({
            id: l.id,
            schoolName: l.schoolName,
            sourceType: l.sourceType,
            referenceNo: l.referenceNo,
            netAmount: l.netAmount,
            balanceAfter: l.balanceAfter,
            description: l.description,
            createdAt: l.createdAt.toISOString(),
          }))}
          withdrawals={withdrawals.map((w) => ({
            id: w.id,
            disbursementNo: w.disbursementNo,
            amount: w.amount,
            bankName: w.bankName,
            accountNumber: w.accountNumber,
            accountHolder: w.accountHolder,
            status: w.status,
            disbursedAt: w.disbursedAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}