import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const VALID_STATUSES = ['PENDING', 'ACTIVE', 'EXPIRED', 'SUSPENDED'] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const { schoolId } = await params;
    const body = await request.json().catch(() => null);

    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      include: { license: true },
    });

    if (!school || school.deletedAt) {
      return NextResponse.json({ error: 'Data sekolah tidak ditemukan.' }, { status: 404 });
    }

    const nextStatus = VALID_STATUSES.includes(body?.licenseStatus)
      ? body.licenseStatus
      : school.license?.status ?? 'PENDING';

    const nextPlanName =
      typeof body?.planName === 'string' && body.planName.trim()
        ? body.planName.trim()
        : school.license?.planName ?? 'LIFETIME_PRO';

    const nextNotes =
      typeof body?.notes === 'string' ? body.notes.trim() : school.license?.notes ?? null;

    const nextIsActive =
      typeof body?.isActive === 'boolean' ? body.isActive : school.isActive;

    await prisma.$transaction(async (tx) => {
      await tx.school.update({
        where: { id: schoolId },
        data: { isActive: nextIsActive },
      });

      if (school.license) {
        await tx.license.update({
          where: { schoolId },
          data: {
            status: nextStatus,
            planName: nextPlanName,
            notes: nextNotes,
            activatedAt:
              nextStatus === 'ACTIVE' && !school.license.activatedAt
                ? new Date()
                : school.license.activatedAt,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          schoolId,
          actorUserId: session.userId,
          action: 'UPDATE_SCHOOL_LICENSE',
          targetEntity: 'License',
          targetId: school.license?.id ?? schoolId,
          metadata: { status: nextStatus, planName: nextPlanName, isActive: nextIsActive },
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update license error:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui status lisensi sekolah.' },
      { status: 500 }
    );
  }
}