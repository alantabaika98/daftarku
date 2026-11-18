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
    const periodId = typeof body?.periodId === 'string' ? body.periodId : '';

    const period = await prisma.admissionPeriod.findFirst({
      where: { id: periodId, schoolId: auth.session.schoolId },
    });

    if (!period) {
      return NextResponse.json({ error: 'Periode aktif tidak ditemukan.' }, { status: 404 });
    }

    // Mode Preset Bulk (Sekolah Negeri Kemendikdasmen / Sekolah Swasta)
    if (Array.isArray(body?.presets)) {
      const items = body.presets
        .filter((item: unknown) => item && typeof (item as { name?: unknown }).name === 'string')
        .map((item: { name: string; description?: string; quota?: number }) => ({
          schoolId: auth.session.schoolId,
          periodId,
          name: item.name.trim(),
          description: item.description ? item.description.trim() : null,
          quota: Math.max(1, Math.floor(Number(item.quota ?? 25))),
          isActive: true,
        }));

      if (items.length === 0) {
        return NextResponse.json({ error: 'Daftar jalur template kosong.' }, { status: 400 });
      }

      await prisma.admissionPath.createMany({ data: items });
      return NextResponse.json({ success: true });
    }

    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const description = typeof body?.description === 'string' ? body.description.trim() : '';
    const quota = Number(body?.quota ?? 0);

    if (!name || !Number.isFinite(quota) || quota < 1) {
      return NextResponse.json(
        { error: 'Nama jalur pendaftaran wajib diisi dan kuota minimal 1 murid.' },
        { status: 400 }
      );
    }

    await prisma.admissionPath.create({
      data: {
        schoolId: auth.session.schoolId,
        periodId,
        name,
        description: description || null,
        quota: Math.floor(quota),
        isActive: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Create path error:', error);
    return NextResponse.json({ error: 'Gagal menambahkan jalur pendaftaran.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await getValidatedSchoolApiSession();
    if (!auth || auth.session.role !== 'SCHOOL_ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const pathId = typeof body?.pathId === 'string' ? body.pathId : '';
    const existing = await prisma.admissionPath.findFirst({
      where: { id: pathId, schoolId: auth.session.schoolId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Jalur pendaftaran tidak ditemukan.' }, { status: 404 });
    }

    const nextName =
      typeof body?.name === 'string' && body.name.trim() ? body.name.trim() : existing.name;
    const nextDesc =
      typeof body?.description === 'string' ? body.description.trim() || null : existing.description;
    const nextActive = typeof body?.isActive === 'boolean' ? body.isActive : existing.isActive;
    const nextQuota =
      Number.isFinite(Number(body?.quota)) && Number(body?.quota) >= 1
        ? Math.floor(Number(body.quota))
        : existing.quota;

    await prisma.admissionPath.update({
      where: { id: pathId },
      data: {
        name: nextName,
        description: nextDesc,
        isActive: nextActive,
        quota: nextQuota,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update path error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui jalur pendaftaran.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await getValidatedSchoolApiSession();
    if (!auth || auth.session.role !== 'SCHOOL_ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const pathId = searchParams.get('pathId') || '';

    const path = await prisma.admissionPath.findFirst({
      where: { id: pathId, schoolId: auth.session.schoolId },
      include: { _count: { select: { applicants: true } } },
    });

    if (!path) {
      return NextResponse.json({ error: 'Jalur tidak ditemukan.' }, { status: 404 });
    }

    if (path._count.applicants > 0) {
      return NextResponse.json(
        {
          error:
            'Jalur ini sudah memiliki pendaftar sehingga tidak bisa dihapus. Nonaktifkan saja statusnya.',
        },
        { status: 400 }
      );
    }

    await prisma.admissionPath.delete({ where: { id: pathId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete path error:', error);
    return NextResponse.json({ error: 'Gagal menghapus jalur pendaftaran.' }, { status: 500 });
  }
}