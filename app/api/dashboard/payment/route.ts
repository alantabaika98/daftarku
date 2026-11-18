import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getValidatedSchoolApiSession } from '@/lib/auth';

const VALID_MODES = ['FREE', 'MANUAL_TRANSFER', 'EXTERNAL_LINK', 'AUTOMATIC_VA'] as const;

export async function PATCH(request: NextRequest) {
  try {
    const auth = await getValidatedSchoolApiSession();
    if (!auth || auth.session.role !== 'SCHOOL_ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const paymentMode = VALID_MODES.includes(body?.paymentMode) ? body.paymentMode : 'FREE';
    const paymentAmount = Math.max(0, Math.floor(Number(body?.paymentAmount ?? 0)));
    const paymentPerWave = Boolean(body?.paymentPerWave);
    const useUniqueCode = Boolean(body?.useUniqueCode);
    const allowInstallment = Boolean(body?.allowInstallment);
    const minDownPayment = Math.max(0, Math.floor(Number(body?.minDownPayment ?? 0)));
    const maxInstallments = Math.min(12, Math.max(2, Math.floor(Number(body?.maxInstallments ?? 2))));
    const installmentNote = typeof body?.installmentNote === 'string' ? body.installmentNote.trim() : '';
    const qrisImageUrl = typeof body?.qrisImageUrl === 'string' ? body.qrisImageUrl.trim() : '';
    const externalPaymentUrl = typeof body?.externalPaymentUrl === 'string' ? body.externalPaymentUrl.trim() : '';
    const paymentInstruction = typeof body?.paymentInstruction === 'string' ? body.paymentInstruction.trim() : '';
    const requirePaymentVerifiedForCard = Boolean(body?.requirePaymentVerifiedForCard);

    const bankAccounts = Array.isArray(body?.bankAccounts) ? body.bankAccounts : [];
    const waveFees = Array.isArray(body?.waveFees) ? body.waveFees : [];

    if (paymentMode === 'MANUAL_TRANSFER' && !paymentPerWave && paymentAmount < 1) {
      return NextResponse.json(
        { error: 'Masukkan nominal biaya pendaftaran (minimal Rp 1) atau pilih mode Gratis.' },
        { status: 400 }
      );
    }

    if (allowInstallment && !paymentPerWave && paymentAmount > 0 && minDownPayment >= paymentAmount) {
      return NextResponse.json(
        { error: 'Nominal minimal uang muka (DP) harus lebih kecil dari total biaya pendaftaran.' },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.school.update({
        where: { id: auth.session.schoolId },
        data: {
          paymentMode,
          paymentAmount,
          paymentPerWave,
          useUniqueCode,
          allowInstallment,
          minDownPayment,
          maxInstallments,
          installmentNote: installmentNote || null,
          bankAccountsJson: JSON.stringify(bankAccounts),
          qrisImageUrl: qrisImageUrl || null,
          externalPaymentUrl: externalPaymentUrl || null,
          paymentInstruction: paymentInstruction || null,
          requirePaymentVerifiedForCard,
        },
      });

      for (const wf of waveFees) {
        if (wf && typeof wf.id === 'string') {
          await tx.admissionPeriod.updateMany({
            where: { id: wf.id, schoolId: auth.session.schoolId },
            data: { registrationFee: Math.max(0, Math.floor(Number(wf.registrationFee ?? 0))) },
          });
        }
      }

      await tx.auditLog.create({
        data: {
          schoolId: auth.session.schoolId,
          actorUserId: auth.session.userId,
          action: 'UPDATE_PAYMENT_CONFIG',
          targetEntity: 'School',
          targetId: auth.session.schoolId,
          metadata: { paymentMode, allowInstallment, useUniqueCode },
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update payment config error:', error);
    return NextResponse.json({ error: 'Gagal menyimpan pengaturan pembayaran.' }, { status: 500 });
  }
}