import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const VALID_LEVELS = ['TK_PAUD', 'SD_MI', 'SMP_MTS', 'SMA_MA', 'SMK'] as const;
const VALID_STATUSES = ['PENDING', 'ACTIVE', 'EXPIRED', 'SUSPENDED'] as const;

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const rawSlug = typeof body?.slug === 'string' ? body.slug.trim().toLowerCase() : '';
    const slug = rawSlug.replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
    const level = VALID_LEVELS.includes(body?.level) ? body.level : 'SD_MI';
    const npsn = typeof body?.npsn === 'string' ? body.npsn.trim() : '';
    const whatsapp = typeof body?.whatsapp === 'string' ? body.whatsapp.trim() : '';
    const address = typeof body?.address === 'string' ? body.address.trim() : '';
    const rawPrefix = typeof body?.registrationPrefix === 'string' ? body.registrationPrefix.trim().toUpperCase() : '';
    const registrationPrefix = rawPrefix.replace(/[^A-Z0-9]/g, '').slice(0, 6) || 'DFK';

    const adminName = typeof body?.adminName === 'string' ? body.adminName.trim() : '';
    const adminEmail = typeof body?.adminEmail === 'string' ? body.adminEmail.trim().toLowerCase() : '';
    const adminPassword = typeof body?.adminPassword === 'string' ? body.adminPassword : '';

    const planName = typeof body?.planName === 'string' && body.planName.trim() ? body.planName.trim() : 'LIFETIME_PRO';
    const licenseStatus = VALID_STATUSES.includes(body?.licenseStatus) ? body.licenseStatus : 'ACTIVE';
    const notes = typeof body?.notes === 'string' ? body.notes.trim() : '';

    if (!name || !slug || !adminName || !adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: 'Nama sekolah, slug URL, nama admin, email admin, dan kata sandi wajib diisi.' },
        { status: 400 }
      );
    }

    if (slug.length < 3) {
      return NextResponse.json(
        { error: 'Slug URL sekolah minimal 3 karakter (huruf kecil, angka, atau tanda hubung).' },
        { status: 400 }
      );
    }

    if (adminPassword.length < 8) {
      return NextResponse.json(
        { error: 'Kata sandi admin sekolah minimal 8 karakter.' },
        { status: 400 }
      );
    }

    const existingSlug = await prisma.school.findUnique({ where: { slug } });
    if (existingSlug) {
      return NextResponse.json(
        { error: `Slug "${slug}" sudah digunakan oleh sekolah lain. Gunakan slug berbeda.` },
        { status: 409 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (existingUser) {
      return NextResponse.json(
        { error: `Email "${adminEmail}" sudah terdaftar di sistem. Gunakan email lain.` },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(adminPassword, 12);
    const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const licenseKey = `DFK-LIFE-${new Date().getFullYear()}-${randomCode}`;

    const created = await prisma.$transaction(async (tx) => {
      const school = await tx.school.create({
        data: {
          name,
          slug,
          level,
          npsn: npsn || null,
          whatsapp: whatsapp || null,
          address: address || null,
          registrationPrefix,
          isActive: true,
        },
      });

      await tx.license.create({
        data: {
          schoolId: school.id,
          licenseKey,
          planName,
          status: licenseStatus,
          activatedAt: licenseStatus === 'ACTIVE' ? new Date() : null,
          notes: notes || `Didaftarkan oleh ${session.name}`,
        },
      });

      const adminUser = await tx.user.create({
        data: {
          schoolId: school.id,
          name: adminName,
          email: adminEmail,
          passwordHash,
          role: 'SCHOOL_ADMIN',
          isActive: true,
        },
      });

      const period = await tx.admissionPeriod.create({
        data: {
          schoolId: school.id,
          name: 'SPMB Tahun Ajaran 2027/2028',
          academicYear: '2027/2028',
          startDate: new Date(),
          endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
          isActive: true,
          isPublicOpen: true,
        },
      });

      await tx.admissionPath.create({
        data: {
          schoolId: school.id,
          periodId: period.id,
          name: 'Jalur Reguler',
          description: 'Pendaftaran umum calon murid baru.',
          quota: 100,
          isActive: true,
        },
      });

      await tx.documentRequirement.createMany({
        data: [
          {
            schoolId: school.id,
            periodId: period.id,
            name: 'Kartu Keluarga (KK)',
            description: 'Unggah foto atau scan Kartu Keluarga yang jelas.',
            isRequired: true,
            allowedTypes: 'pdf,jpg,jpeg,png',
            maxSizeMb: 2,
            sortOrder: 1,
          },
          {
            schoolId: school.id,
            periodId: period.id,
            name: 'Akta Kelahiran',
            description: 'Unggah foto atau scan Akta Kelahiran calon murid.',
            isRequired: true,
            allowedTypes: 'pdf,jpg,jpeg,png',
            maxSizeMb: 2,
            sortOrder: 2,
          },
        ],
      });

      await tx.auditLog.create({
        data: {
          schoolId: school.id,
          actorUserId: session.userId,
          action: 'CREATE_SCHOOL_TENANT',
          targetEntity: 'School',
          targetId: school.id,
          metadata: { slug, licenseKey, licenseStatus, adminEmail: adminUser.email },
        },
      });

      return school;
    });

    return NextResponse.json({
      success: true,
      school: created,
    });
  } catch (error) {
    console.error('Create school error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat akun sekolah baru.' },
      { status: 500 }
    );
  }
}