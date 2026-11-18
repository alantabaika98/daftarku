import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getValidatedSchoolApiSession } from '@/lib/auth';

const VALID_STATUSES = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'VERIFIED',
  'ACCEPTED',
  'WAITLISTED',
  'REJECTED',
] as const;

const VALID_PAY_STATUSES = [
  'UNPAID',
  'DP_SUBMITTED',
  'DP_VERIFIED',
  'PAID_SUBMITTED',
  'PAID',
] as const;

export async function PATCH(request: NextRequest) {
  try {
    const auth = await getValidatedSchoolApiSession();
    if (!auth) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const applicantId = typeof body?.applicantId === 'string' ? body.applicantId : '';

    const existing = await prisma.applicant.findFirst({
      where: { id: applicantId, schoolId: auth.session.schoolId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Data pendaftar tidak ditemukan.' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (VALID_STATUSES.includes(body?.status)) {
      updateData.status = body.status;
      if (body.status === 'VERIFIED' || body.status === 'ACCEPTED') {
        updateData.verifiedAt = new Date();
      }
    }

    if (VALID_PAY_STATUSES.includes(body?.paymentStatus)) {
      updateData.paymentStatus = body.paymentStatus;
    }

    if (typeof body?.paidAmount === 'number' && Number.isFinite(body.paidAmount)) {
      updateData.paidAmount = Math.max(0, Math.floor(body.paidAmount));
    }

    if (typeof body?.verifierNote === 'string') {
      updateData.verifierNote = body.verifierNote.trim() || null;
    }

    if (typeof body?.isReRegistered === 'boolean') {
      updateData.isReRegistered = body.isReRegistered;
      updateData.reRegisteredAt = body.isReRegistered ? new Date() : null;
    }

    await prisma.$transaction(async (tx) => {
      await tx.applicant.update({
        where: { id: applicantId },
        data: updateData,
      });

      await tx.auditLog.create({
        data: {
          schoolId: auth.session.schoolId,
          actorUserId: auth.session.userId,
          action: 'VERIFY_APPLICANT',
          targetEntity: 'Applicant',
          targetId: applicantId,
          metadata: {
            registrationNumber: existing.registrationNumber,
            status: updateData.status ?? existing.status,
            paymentStatus: updateData.paymentStatus ?? null,
            isReRegistered: updateData.isReRegistered ?? null,
          },
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update applicant error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui status pendaftar.' }, { status: 500 });
  }
}