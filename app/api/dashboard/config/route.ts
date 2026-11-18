import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getValidatedSchoolApiSession } from '@/lib/auth';

const VALID_METHODS = ['CAMERA_OR_PDF', 'CAMERA_ONLY', 'PDF_ONLY'] as const;

export async function POST(request: NextRequest) {
  try {
    const auth = await getValidatedSchoolApiSession();
    if (!auth || auth.session.role !== 'SCHOOL_ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const kind = body?.kind;
    const periodId = typeof body?.periodId === 'string' ? body.periodId : '';

    const period = await prisma.admissionPeriod.findFirst({
      where: { id: periodId, schoolId: auth.session.schoolId },
    });

    if (!period) {
      return NextResponse.json({ error: 'Periode aktif tidak ditemukan.' }, { status: 404 });
    }

    if (kind === 'document') {
      const name = typeof body?.name === 'string' ? body.name.trim() : '';
      const description = typeof body?.description === 'string' ? body.description.trim() : '';
      const isRequired = typeof body?.isRequired === 'boolean' ? body.isRequired : true;
      const uploadMethod = VALID_METHODS.includes(body?.uploadMethod)
        ? body.uploadMethod
        : 'CAMERA_OR_PDF';
      const maxSizeMb = Math.min(1024, Math.max(1, Math.floor(Number(body?.maxSizeMb ?? 10))));

      if (!name) {
        return NextResponse.json({ error: 'Nama syarat berkas wajib diisi.' }, { status: 400 });
      }

      const allowedTypes =
        uploadMethod === 'PDF_ONLY'
          ? 'pdf'
          : uploadMethod === 'CAMERA_ONLY'
          ? 'jpg,jpeg,png'
          : 'pdf,jpg,jpeg,png';

      const count = await prisma.documentRequirement.count({
        where: { schoolId: auth.session.schoolId, periodId },
      });

      await prisma.documentRequirement.create({
        data: {
          schoolId: auth.session.schoolId,
          periodId,
          name,
          description: description || null,
          isRequired,
          uploadMethod,
          allowedTypes,
          maxSizeMb,
          sortOrder: count + 1,
        },
      });

      return NextResponse.json({ success: true });
    }

    if (kind === 'field') {
      const label = typeof body?.label === 'string' ? body.label.trim() : '';
      const fieldType = ['text', 'number', 'textarea', 'select'].includes(body?.fieldType)
        ? body.fieldType
        : 'text';
      const isRequired = typeof body?.isRequired === 'boolean' ? body.isRequired : false;

      if (!label) {
        return NextResponse.json({ error: 'Label pertanyaan formulir wajib diisi.' }, { status: 400 });
      }

      const baseKey = label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 24);
      const fieldKey = `${baseKey || 'field'}_${Math.random().toString(36).slice(2, 5)}`;

      const count = await prisma.formFieldConfig.count({
        where: { schoolId: auth.session.schoolId, periodId },
      });

      await prisma.formFieldConfig.create({
        data: {
          schoolId: auth.session.schoolId,
          periodId,
          fieldKey,
          label,
          fieldType,
          isRequired,
          isEnabled: true,
          sortOrder: count + 1,
        },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Jenis konfigurasi tidak dikenali.' }, { status: 400 });
  } catch (error) {
    console.error('Create config error:', error);
    return NextResponse.json({ error: 'Gagal menyimpan konfigurasi formulir.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await getValidatedSchoolApiSession();
    if (!auth || auth.session.role !== 'SCHOOL_ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const kind = body?.kind;
    const id = typeof body?.id === 'string' ? body.id : '';

    if (kind === 'document') {
      const existing = await prisma.documentRequirement.findFirst({
        where: { id, schoolId: auth.session.schoolId },
      });
      if (!existing) {
        return NextResponse.json({ error: 'Syarat berkas tidak ditemukan.' }, { status: 404 });
      }

      const name = typeof body?.name === 'string' && body.name.trim() ? body.name.trim() : existing.name;
      const isRequired = typeof body?.isRequired === 'boolean' ? body.isRequired : existing.isRequired;
      const uploadMethod = VALID_METHODS.includes(body?.uploadMethod)
        ? body.uploadMethod
        : existing.uploadMethod;
      const maxSizeMb = Number.isFinite(Number(body?.maxSizeMb))
        ? Math.min(1024, Math.max(1, Math.floor(Number(body.maxSizeMb))))
        : existing.maxSizeMb;

      const allowedTypes =
        uploadMethod === 'PDF_ONLY'
          ? 'pdf'
          : uploadMethod === 'CAMERA_ONLY'
          ? 'jpg,jpeg,png'
          : 'pdf,jpg,jpeg,png';

      await prisma.documentRequirement.update({
        where: { id },
        data: { name, isRequired, uploadMethod, allowedTypes, maxSizeMb },
      });

      return NextResponse.json({ success: true });
    }

    if (kind === 'field') {
      const existing = await prisma.formFieldConfig.findFirst({
        where: { id, schoolId: auth.session.schoolId },
      });
      if (!existing) {
        return NextResponse.json({ error: 'Pertanyaan formulir tidak ditemukan.' }, { status: 404 });
      }

      const label = typeof body?.label === 'string' && body.label.trim() ? body.label.trim() : existing.label;
      const fieldType = ['text', 'number', 'textarea', 'select'].includes(body?.fieldType)
        ? body.fieldType
        : existing.fieldType;
      const isRequired = typeof body?.isRequired === 'boolean' ? body.isRequired : existing.isRequired;

      await prisma.formFieldConfig.update({
        where: { id },
        data: { label, fieldType, isRequired },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Parameter tidak valid.' }, { status: 400 });
  } catch (error) {
    console.error('Update config error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui item.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await getValidatedSchoolApiSession();
    if (!auth || auth.session.role !== 'SCHOOL_ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const kind = searchParams.get('kind');
    const id = searchParams.get('id') || '';

    if (kind === 'document') {
      await prisma.documentRequirement.deleteMany({
        where: { id, schoolId: auth.session.schoolId },
      });
      return NextResponse.json({ success: true });
    }

    if (kind === 'field') {
      await prisma.formFieldConfig.deleteMany({
        where: { id, schoolId: auth.session.schoolId },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Parameter tidak valid.' }, { status: 400 });
  } catch (error) {
    console.error('Delete config error:', error);
    return NextResponse.json({ error: 'Gagal menghapus item.' }, { status: 500 });
  }
}