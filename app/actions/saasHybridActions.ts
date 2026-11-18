'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import * as authLib from '@/lib/auth';

const CLOUD_PACKAGES: Record<string, { name: string; quota: number; price: number }> = {
  STARTER_50: {
    name: 'Paket Starter (+50 Kapasitas Cloud)',
    quota: 50,
    price: 250000,
  },
  STANDAR_200: {
    name: 'Paket Standar (+200 Kapasitas Cloud)',
    quota: 200,
    price: 600000,
  },
  JUMBO_500: {
    name: 'Paket Jumbo (+500 Kapasitas Cloud)',
    quota: 500,
    price: 1000000,
  },
};

async function getCurrentPlatformBalance(): Promise<number> {
  const latest = await prisma.platformTreasuryLedger.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { balanceAfter: true },
  });
  if (latest) return latest.balanceAfter;

  const agg = await prisma.platformTreasuryLedger.aggregate({
    _sum: { netAmount: true },
  });
  return agg._sum.netAmount ?? 0;
}

// A. Buat Order Pembelian Paket Kapasitas Penyimpanan Cloud + Kode Pembayaran & VA Otomatis
export async function createCloudStorageOrderAction(packageCode: string) {
  try {
    const auth = await authLib.getValidatedSchoolApiSession();
    if (!auth) {
      return { ok: false, error: 'Sesi admin sekolah tidak valid.' };
    }

    const pkg = CLOUD_PACKAGES[packageCode] ?? CLOUD_PACKAGES.STANDAR_200;
    const uniqueCode = Math.floor(101 + Math.random() * 888);
    const totalPayable = pkg.price + uniqueCode;
    const orderNumber = `CLD-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    const vaNumber = `8808${auth.school.registrationPrefix.replace(/[^0-9]/g, '7').padEnd(4, '9').slice(0, 4)}${Date.now().toString().slice(-8)}`;

    const order = await prisma.cloudStoragePackageOrder.create({
      data: {
        orderNumber,
        schoolId: auth.session.schoolId,
        packageName: pkg.name,
        quotaAdded: pkg.quota,
        amount: totalPayable,
        vaNumber,
        gatewayExternalId: orderNumber,
        status: 'PENDING',
      },
    });

    revalidatePath('/dashboard');
    return {
      ok: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        packageName: order.packageName,
        quotaAdded: order.quotaAdded,
        basePrice: pkg.price,
        uniqueCode,
        amount: order.amount,
        vaNumber: order.vaNumber,
        status: order.status,
      },
    };
  } catch (error) {
    console.error('createCloudStorageOrderAction error:', error);
    return { ok: false, error: 'Gagal membuat kode pembayaran kapasitas penyimpanan.' };
  }
}

// B. Eksekusi Otomatis Pelunasan Order Kapasitas Cloud (Dipanggil Webhook / Verifikasi Otomatis)
export async function settleCloudStorageOrderAction(orderIdOrRef: string) {
  try {
    const order = await prisma.cloudStoragePackageOrder.findFirst({
      where: {
        OR: [{ id: orderIdOrRef }, { orderNumber: orderIdOrRef }, { gatewayExternalId: orderIdOrRef }],
      },
      include: { school: true },
    });

    if (!order) {
      return { ok: false, error: 'Kode pembayaran tidak ditemukan.' };
    }

    if (order.status === 'PAID') {
      return { ok: true, alreadyPaid: true };
    }

    const currentTreasury = await getCurrentPlatformBalance();
    const nextTreasury = currentTreasury + order.amount;

    await prisma.$transaction(async (tx) => {
      await tx.cloudStoragePackageOrder.update({
        where: { id: order.id },
        data: { status: 'PAID', paidAt: new Date() },
      });

      await tx.school.update({
        where: { id: order.schoolId },
        data: {
          quotaBalance: { increment: order.quotaAdded },
        },
      });

      // Otomatis buka seluruh kunci Soft-Limit pendaftar yang sempat ter-blur
      await tx.applicant.updateMany({
        where: { schoolId: order.schoolId, isLockedByQuota: true },
        data: { isLockedByQuota: false, unlockedAt: new Date() },
      });

      // Otomatis masukkan dana ke Tampungan Kas Super Admin
      await tx.platformTreasuryLedger.create({
        data: {
          schoolId: order.schoolId,
          schoolName: order.school.name,
          sourceType: 'CLOUD_STORAGE_PACKAGE',
          referenceNo: order.orderNumber,
          grossAmount: order.amount,
          netAmount: order.amount,
          balanceAfter: nextTreasury,
          description: `Pembayaran ${order.packageName} oleh ${order.school.name}`,
        },
      });
    });

    revalidatePath('/dashboard');
    revalidatePath('/super-admin');
    revalidatePath('/super-admin/treasury');
    return { ok: true, quotaAdded: order.quotaAdded };
  } catch (error) {
    console.error('settleCloudStorageOrderAction error:', error);
    return { ok: false, error: 'Gagal memproses pelunasan otomatis.' };
  }
}

// C. Simulasi / Eksekusi Webhook Pelunasan VA Pendaftaran & Daftar Ulang (Split Payment Otomatis)
export async function settleVaInvoiceSplitAction(invoiceIdOrRef: string) {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: {
        OR: [
          { id: invoiceIdOrRef },
          { invoiceNumber: invoiceIdOrRef },
          { gatewayExternalId: invoiceIdOrRef },
        ],
      },
      include: { school: true, applicant: true },
    });

    if (!invoice) {
      return { ok: false, error: 'Tagihan VA tidak ditemukan.' };
    }

    if (invoice.isSplitSettled && invoice.status === 'PAID') {
      return { ok: true, alreadySettled: true };
    }

    const platformCut = invoice.platformFee;
    const schoolNet = invoice.foundationNetAmount;
    const currentTreasury = await getCurrentPlatformBalance();

    await prisma.$transaction(async (tx) => {
      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          status: 'PAID',
          paidAmount: invoice.totalAmount,
          isSplitSettled: true,
          paidAt: new Date(),
        },
      });

      const updatedSchool = await tx.school.update({
        where: { id: invoice.schoolId },
        data: {
          foundationBalance: { increment: schoolNet },
        },
      });

      await tx.foundationLedger.create({
        data: {
          schoolId: invoice.schoolId,
          invoiceId: invoice.id,
          type:
            invoice.phase === 'RE_REGISTRATION'
              ? 'CREDIT_REREGISTRATION'
              : 'CREDIT_REGISTRATION',
          grossAmount: invoice.baseAmount,
          platformFee: platformCut,
          netAmount: schoolNet,
          balanceAfter: updatedSchool.foundationBalance,
          description:
            invoice.phase === 'RE_REGISTRATION'
              ? `Pelunasan VA Daftar Ulang (${invoice.applicant.registrationNumber})`
              : `Pelunasan VA Pendaftaran (${invoice.applicant.registrationNumber})`,
        },
      });

      if (platformCut > 0) {
        await tx.platformTreasuryLedger.create({
          data: {
            schoolId: invoice.schoolId,
            schoolName: invoice.school.name,
            sourceType:
              invoice.phase === 'RE_REGISTRATION'
                ? 'VA_REREGISTRATION_FEE'
                : 'VA_REGISTRATION_FEE',
            referenceNo: invoice.invoiceNumber,
            grossAmount: invoice.baseAmount,
            netAmount: platformCut,
            balanceAfter: currentTreasury + platformCut,
            description: `Dana Kemitraan VA (${invoice.invoiceNumber}) — ${invoice.school.name}`,
          },
        });
      }

      if (invoice.phase === 'RE_REGISTRATION') {
        await tx.applicant.update({
          where: { id: invoice.applicantId },
          data: {
            isReRegistered: true,
            reRegisteredAt: new Date(),
            paymentStatus: 'PAID',
            paidAmount: invoice.baseAmount,
          },
        });
      } else {
        await tx.applicant.update({
          where: { id: invoice.applicantId },
          data: {
            paymentStatus: 'PAID',
            paidAmount: invoice.baseAmount,
          },
        });
      }
    });

    revalidatePath('/dashboard');
    revalidatePath('/super-admin');
    revalidatePath('/super-admin/treasury');
    return { ok: true, schoolNet, platformCut };
  } catch (error) {
    console.error('settleVaInvoiceSplitAction error:', error);
    return { ok: false, error: 'Gagal memproses Split Payment VA.' };
  }
}

// D. Pengajuan & Pencairan Otomatis Saldo Yayasan oleh Admin Sekolah
export async function withdrawFoundationBalanceAction(input: {
  amount: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}) {
  try {
    const auth = await authLib.getValidatedSchoolApiSession();
    if (!auth) {
      return { ok: false, error: 'Sesi admin tidak valid.' };
    }

    const amount = Math.floor(Number(input.amount || 0));
    if (amount < 50000) {
      return { ok: false, error: 'Minimal penarikan Saldo Yayasan adalah Rp 50.000.' };
    }

    const school = await prisma.school.findUnique({
      where: { id: auth.session.schoolId },
    });
    if (!school || school.foundationBalance < amount) {
      return { ok: false, error: 'Saldo Yayasan tidak mencukupi untuk nominal penarikan tersebut.' };
    }

    if (!input.bankName.trim() || !input.accountNumber.trim() || !input.accountHolder.trim()) {
      return { ok: false, error: 'Lengkapi nama bank, nomor rekening, dan nama pemilik rekening.' };
    }

    await prisma.$transaction(async (tx) => {
      const updated = await tx.school.update({
        where: { id: school.id },
        data: { foundationBalance: { decrement: amount } },
      });

      const wd = await tx.foundationWithdrawal.create({
        data: {
          schoolId: school.id,
          requestedByUserId: auth.session.userId,
          amount,
          bankName: input.bankName.trim(),
          accountNumber: input.accountNumber.trim(),
          accountHolder: input.accountHolder.trim(),
          status: 'COMPLETED',
          adminNote: 'Pencairan otomatis ke rekening resmi yayasan',
          processedAt: new Date(),
        },
      });

      await tx.foundationLedger.create({
        data: {
          schoolId: school.id,
          withdrawalId: wd.id,
          type: 'DEBIT_WITHDRAWAL',
          grossAmount: amount,
          platformFee: 0,
          netAmount: -amount,
          balanceAfter: updated.foundationBalance,
          description: `Pencairan Saldo Yayasan ke ${input.bankName} (${input.accountNumber})`,
        },
      });
    });

    revalidatePath('/dashboard');
    revalidatePath('/super-admin');
    return { ok: true };
  } catch (error) {
    console.error('withdrawFoundationBalanceAction error:', error);
    return { ok: false, error: 'Gagal memproses pencairan Saldo Yayasan.' };
  }
}

// E. Simpan Pengaturan Mode Hibrida & Opt-In Daftar Ulang
export async function updateHybridSaasSettingsAction(input: {
  reRegMode: 'MANUAL' | 'AUTOMATIC_VA';
  reRegFeeAmount: number;
  reRegAllowInstallment: boolean;
}) {
  try {
    const auth = await authLib.getValidatedSchoolApiSession();
    if (!auth) {
      return { ok: false, error: 'Sesi admin tidak valid.' };
    }

    await prisma.school.update({
      where: { id: auth.session.schoolId },
      data: {
        reRegMode: input.reRegMode === 'AUTOMATIC_VA' ? 'AUTOMATIC_VA' : 'MANUAL',
        reRegFeeAmount: Math.max(0, Math.floor(Number(input.reRegFeeAmount || 0))),
        reRegAllowInstallment: Boolean(input.reRegAllowInstallment),
      },
    });

    revalidatePath('/dashboard');
    return { ok: true };
  } catch (error) {
    console.error('updateHybridSaasSettingsAction error:', error);
    return { ok: false, error: 'Gagal menyimpan pengaturan Daftar Ulang.' };
  }
}

// F. Pencairan Otomatis Tampungan Dana Super Admin
export async function disburseSuperAdminTreasuryAction(input: {
  amount: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}) {
  try {
    const amount = Math.floor(Number(input.amount || 0));
    if (amount < 10000) {
      return { ok: false, error: 'Minimal pencairan Tampungan Dana adalah Rp 10.000.' };
    }

    const currentBalance = await getCurrentPlatformBalance();
    if (currentBalance < amount) {
      return {
        ok: false,
        error: `Saldo Tampungan Dana tidak mencukupi (Tersedia: Rp ${currentBalance.toLocaleString('id-ID')}).`,
      };
    }

    if (!input.bankName.trim() || !input.accountNumber.trim() || !input.accountHolder.trim()) {
      return { ok: false, error: 'Lengkapi tujuan bank, nomor rekening, dan nama penerima.' };
    }

    const disbursementNo = `DISB-SA-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    const nextBalance = currentBalance - amount;

    await prisma.$transaction(async (tx) => {
      await tx.platformWithdrawal.create({
        data: {
          disbursementNo,
          amount,
          bankName: input.bankName.trim(),
          accountNumber: input.accountNumber.trim(),
          accountHolder: input.accountHolder.trim(),
          status: 'COMPLETED',
          referenceNote: 'Auto-Disbursement Tampungan Kas Super Admin DaftarKu',
          disbursedAt: new Date(),
        },
      });

      await tx.platformTreasuryLedger.create({
        data: {
          schoolName: 'Super Admin DaftarKu',
          sourceType: 'DISBURSEMENT',
          referenceNo: disbursementNo,
          grossAmount: amount,
          netAmount: -amount,
          balanceAfter: nextBalance,
          description: `Pencairan Otomatis ke ${input.bankName} ${input.accountNumber} a.n. ${input.accountHolder}`,
        },
      });
    });

    revalidatePath('/super-admin');
    revalidatePath('/super-admin/treasury');
    return { ok: true, disbursementNo, balanceAfter: nextBalance };
  } catch (error) {
    console.error('disburseSuperAdminTreasuryAction error:', error);
    return { ok: false, error: 'Gagal mencairkan Tampungan Dana Super Admin.' };
  }
}