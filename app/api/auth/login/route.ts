import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/auth';

const failedAttempts = new Map<string, { count: number; lockUntil: number }>();

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'local-user';
    const now = Date.now();
    const attempt = failedAttempts.get(ip);

    if (attempt && attempt.lockUntil > now) {
      const waitSeconds = Math.ceil((attempt.lockUntil - now) / 1000);
      return NextResponse.json(
        { error: `Terlalu banyak percobaan login. Silakan coba lagi dalam ${waitSeconds} detik.` },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan kata sandi wajib diisi.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        school: {
          include: { license: true },
        },
      },
    });

    if (!user || !user.isActive || user.deletedAt) {
      recordFailure(ip);
      return NextResponse.json(
        { error: 'Email atau kata sandi tidak sesuai.' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      recordFailure(ip);
      return NextResponse.json(
        { error: 'Email atau kata sandi tidak sesuai.' },
        { status: 401 }
      );
    }

    if (user.role !== 'SUPER_ADMIN') {
      if (!user.school || !user.school.isActive || user.school.deletedAt) {
        return NextResponse.json(
          { error: 'Akun sekolah Anda sedang dinonaktifkan. Hubungi ARA Digital.' },
          { status: 403 }
        );
      }

      if (user.school.license?.status !== 'ACTIVE') {
        return NextResponse.json(
          {
            error:
              'Lisensi DaftarKu sekolah Anda belum aktif atau sedang ditangguhkan. Silakan hubungi tim ARA Digital untuk aktivasi.',
          },
          { status: 403 }
        );
      }
    }

    failedAttempts.delete(ip);

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await prisma.auditLog.create({
      data: {
        schoolId: user.schoolId,
        actorUserId: user.id,
        action: 'USER_LOGIN',
        targetEntity: 'User',
        targetId: user.id,
        ipAddress: ip,
      },
    });

    await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      schoolId: user.schoolId,
      schoolSlug: user.school?.slug ?? null,
      schoolName: user.school?.name ?? null,
    });

    const redirectTo = user.role === 'SUPER_ADMIN' ? '/super-admin' : '/dashboard';

    return NextResponse.json({
      success: true,
      redirectTo,
      user: {
        name: user.name,
        role: user.role,
        schoolName: user.school?.name ?? 'ARA Digital',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Terjadi gangguan pada server saat memproses login. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}

function recordFailure(ip: string) {
  const current = failedAttempts.get(ip) ?? { count: 0, lockUntil: 0 };
  const nextCount = current.count + 1;
  failedAttempts.set(ip, {
    count: nextCount,
    lockUntil: nextCount >= 5 ? Date.now() + 60 * 1000 : 0,
  });
}