import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getValidatedSchoolApiSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const auth = await getValidatedSchoolApiSession();
    if (!auth || auth.session.role !== 'SCHOOL_ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const waveNumber = Math.max(1, Math.min(20, Math.floor(Number(body?.waveNumber ?? 1))));
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const academicYear = typeof body?.academicYear === 'string' ? body.academicYear.trim() : '';
    const quota = Math.max(1, Math.floor(Number(body?.quota ?? 30)));
    const benefits = typeof body?.benefits === 'string' ? body.benefits.trim() : '';
    const isPublicOpen = typeof body?.isPublicOpen === 'boolean' ? body.isPublicOpen : true;
    const isActive = typeof body?.isActive === 'boolean' ? body.isActive : true;
    const startDate = body?.startDate ? new Date(body.startDate) : null;
    const endDate = body?.endDate ? new Date(body.endDate) : null;
    const announcementDate = body?.announcementDate ? new Date(body.announcementDate) : null;

    if (!name || !academicYear || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Nama gelombang, tahun ajaran, tanggal mulai, dan tanggal selesai wajib diisi.' },
        { status: 400 }
      );
    }

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate < startDate) {
      return NextResponse.json(
        { error: 'Rentang tanggal tidak valid. Tanggal selesai harus setelah tanggal mulai.' },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      if (isActive) {
        await tx.admissionPeriod.updateMany({
          where: { schoolId: auth.session.schoolId },
          data: { isActive: false },
        });
      }

      const created = await tx.admissionPeriod.create({
        data: {
          schoolId: auth.session.schoolId,
          waveNumber,
          name,
          academicYear,
          quota,
          benefits: benefits || null,
          startDate,
          endDate,
          announcementDate:
            announcementDate && !Number.isNaN(announcementDate.getTime()) ? announcementDate : null,
          isActive,
          isPublicOpen,
        },
      });

      await tx.auditLog.create({
        data: {
          schoolId: auth.session.schoolId,
          actorUserId: auth.session.userId,
          action: 'CREATE_ADMISSION_WAVE',
          targetEntity: 'AdmissionPeriod',
          targetId: created.id,
          metadata: { waveNumber, name, quota },
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Create wave error:', error);
    return NextResponse.json({ error: 'Gagal menambahkan gelombang SPMB.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await getValidatedSchoolApiSession();
    if (!auth || auth.session.role !== 'SCHOOL_ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const periodId = typeof body?.periodId === 'string' ? body.periodId : '';

    const existing = await prisma.admissionPeriod.findFirst({
      where: { id: periodId, schoolId: auth.session.schoolId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Data gelombang tidak ditemukan.' }, { status: 404 });
    }

    // Mode cepat: hanya ubah status aktif/buka publik
    if (body?.quickToggleOnly === true) {
      const nextPublicOpen =
        typeof body?.isPublicOpen === 'boolean' ? body.isPublicOpen : existing.isPublicOpen;
      const nextActive = typeof body?.isActive === 'boolean' ? body.isActive : existing.isActive;

      await prisma.$transaction(async (tx) => {
        if (nextActive) {
          await tx.admissionPeriod.updateMany({
            where: { schoolId: auth.session.schoolId },
            data: { isActive: false },
          });
        }

        await tx.admissionPeriod.update({
          where: { id: periodId },
          data: {
            isActive: nextActive,
            isPublicOpen: nextPublicOpen,
          },
        });
      });

      return NextResponse.json({ success: true });
    }

    const waveNumber = Math.max(
      1,
      Math.min(20, Math.floor(Number(body?.waveNumber ?? existing.waveNumber)))
    );
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const academicYear = typeof body?.academicYear === 'string' ? body.academicYear.trim() : '';
    const quota = Math.max(1, Math.floor(Number(body?.quota ?? existing.quota)));
    const benefits = typeof body?.benefits === 'string' ? body.benefits.trim() : '';
    const isPublicOpen =
      typeof body?.isPublicOpen === 'boolean' ? body.isPublicOpen : existing.isPublicOpen;
    const isActive = typeof body?.isActive === 'boolean' ? body.isActive : existing.isActive;
    const startDate = body?.startDate ? new Date(body.startDate) : existing.startDate;
    const endDate = body?.endDate ? new Date(body.endDate) : existing.endDate;
    const announcementDate = body?.announcementDate ? new Date(body.announcementDate) : null;

    if (!name || !academicYear || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate < startDate) {
      return NextResponse.json(
        { error: 'Periksa kembali nama gelombang, tahun ajaran, dan rentang tanggal.' },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      if (isActive) {
        await tx.admissionPeriod.updateMany({
          where: { schoolId: auth.session.schoolId, NOT: { id: periodId } },
          data: { isActive: false },
        });
      }

      await tx.admissionPeriod.update({
        where: { id: periodId },
        data: {
          waveNumber,
          name,
          academicYear,
          quota,
          benefits: benefits || null,
          startDate,
          endDate,
          announcementDate:
            announcementDate && !Number.isNaN(announcementDate.getTime()) ? announcementDate : null,
          isActive,
          isPublicOpen,
        },
      });

      await tx.auditLog.create({
        data: {
          schoolId: auth.session.schoolId,
          actorUserId: auth.session.userId,
          action: 'UPDATE_ADMISSION_WAVE',
          targetEntity: 'AdmissionPeriod',
          targetId: periodId,
          metadata: { waveNumber, name, isPublicOpen, isActive },
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update wave error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui gelombang SPMB.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await getValidatedSchoolApiSession();
    if (!auth || auth.session.role !== 'SCHOOL_ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const periodId = searchParams.get('periodId') || '';

    const wave = await prisma.admissionPeriod.findFirst({
      where: { id: periodId, schoolId: auth.session.schoolId },
      include: { _count: { select: { applicants: true } } },
    });

    if (!wave) {
      return NextResponse.json({ error: 'Gelombang tidak ditemukan.' }, { status: 404 });
    }

    if (wave._count.applicants > 0) {
      return NextResponse.json(
        { error: 'Gelombang ini sudah memiliki pendaftar sehingga tidak bisa dihapus.' },
        { status: 400 }
      );
    }

    const totalWaves = await prisma.admissionPeriod.count({
      where: { schoolId: auth.session.schoolId },
    });

    if (totalWaves <= 1) {
      return NextResponse.json(
        { error: 'Minimal harus tersedia 1 gelombang SPMB aktif di sekolah.' },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.admissionPath.deleteMany({ where: { periodId } });
      await tx.documentRequirement.deleteMany({ where: { periodId } });
      await tx.formFieldConfig.deleteMany({ where: { periodId } });
      await tx.admissionPeriod.delete({ where: { id: periodId } });

      if (wave.isActive) {
        const fallback = await tx.admissionPeriod.findFirst({
          where: { schoolId: auth.session.schoolId },
          orderBy: { waveNumber: 'asc' },
        });
        if (fallback) {
          await tx.admissionPeriod.update({
            where: { id: fallback.id },
            data: { isActive: true },
          });
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete wave error:', error);
    return NextResponse.json({ error: 'Gagal menghapus gelombang.' }, { status: 500 });
  }
}