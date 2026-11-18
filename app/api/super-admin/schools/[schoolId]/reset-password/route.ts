import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(
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
    const userId = typeof body?.userId === 'string' ? body.userId : '';
    const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : '';

    if (!userId || newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Pilih akun admin dan masukkan kata sandi baru minimal 8 karakter.' },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findFirst({
      where: {
        id: userId,
        schoolId,
        deletedAt: null,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Akun admin sekolah tidak ditemukan.' },
        { status: 404 }
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: targetUser.id },
        data: { passwordHash },
      });

      await tx.auditLog.create({
        data: {
          schoolId,
          actorUserId: session.userId,
          action: 'RESET_SCHOOL_ADMIN_PASSWORD',
          targetEntity: 'User',
          targetId: targetUser.id,
          metadata: { email: targetUser.email },
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Gagal mengatur ulang kata sandi admin sekolah.' },
      { status: 500 }
    );
  }
}