import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getValidatedSchoolApiSession } from '@/lib/auth';

const VALID_LEVELS = [
  'TK', 'RA', 'KB', 'TPA',
  'SD', 'MI', 'SMP', 'MTs',
  'SMA', 'MA', 'SMK', 'MAK',
  'TPQ', 'SLB', 'ASRAMA', 'PONDOK_PESANTREN', 'PENDIDIKAN_DINIYAH', 'BOARDING_SCHOOL',
  'PERGURUAN_TINGGI',
  'TK_PAUD', 'SD_MI', 'SMP_MTS', 'SMA_MA',
] as const;

export async function PATCH(request: NextRequest) {
  try {
    const auth = await getValidatedSchoolApiSession();
    if (!auth || auth.session.role !== 'SCHOOL_ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const level = VALID_LEVELS.includes(body?.level) ? body.level : auth.school.level;
    const npsn = typeof body?.npsn === 'string' ? body.npsn.trim() : '';
    const phone = typeof body?.phone === 'string' ? body.phone.trim() : '';
    const whatsapp = typeof body?.whatsapp === 'string' ? body.whatsapp.replace(/[^0-9]/g, '') : '';
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const address = typeof body?.address === 'string' ? body.address.trim() : '';
    const description = typeof body?.description === 'string' ? body.description.trim() : '';
    const visionMission = typeof body?.visionMission === 'string' ? body.visionMission.trim() : '';
    const highlights = typeof body?.highlights === 'string' ? body.highlights.trim() : '';
    const cardNotes = typeof body?.cardNotes === 'string' ? body.cardNotes.trim() : '';

    const logoUrl = typeof body?.logoUrl === 'string' ? body.logoUrl.trim() : '';
    const bannerUrl = typeof body?.bannerUrl === 'string' ? body.bannerUrl.trim() : '';
    const schoolPhotoUrl = typeof body?.schoolPhotoUrl === 'string' ? body.schoolPhotoUrl.trim() : '';

    const rawColor = typeof body?.primaryColor === 'string' ? body.primaryColor.trim() : '#0F766E';
    const primaryColor = /^#[0-9A-Fa-f]{6}$/.test(rawColor) ? rawColor : '#0F766E';
    const rawPrefix = typeof body?.registrationPrefix === 'string' ? body.registrationPrefix.trim().toUpperCase() : '';
    const registrationPrefix = rawPrefix.replace(/[^A-Z0-9]/g, '').slice(0, 6) || auth.school.registrationPrefix;

    if (!name) {
      return NextResponse.json({ error: 'Nama resmi lembaga wajib diisi.' }, { status: 400 });
    }

    const schoolModel = Prisma.dmmf.datamodel.models.find((m) => m.name === 'School');
    const fieldSet = new Set(schoolModel?.fields.map((f) => f.name) ?? []);

    const updateData: Record<string, unknown> = {
      name,
      level,
      primaryColor,
      registrationPrefix,
    };

    if (fieldSet.has('npsn')) updateData.npsn = npsn || null;
    if (fieldSet.has('phone')) updateData.phone = phone || null;
    if (fieldSet.has('whatsapp')) updateData.whatsapp = whatsapp || null;
    if (fieldSet.has('email')) updateData.email = email || null;
    if (fieldSet.has('address')) updateData.address = address || null;
    if (fieldSet.has('description')) updateData.description = description || null;
    if (fieldSet.has('visionMission')) updateData.visionMission = visionMission || null;
    if (fieldSet.has('highlights')) updateData.highlights = highlights || null;
    if (fieldSet.has('cardNotes')) updateData.cardNotes = cardNotes || null;
    if (fieldSet.has('logoUrl')) updateData.logoUrl = logoUrl || null;
    if (fieldSet.has('bannerUrl')) updateData.bannerUrl = bannerUrl || null;
    if (fieldSet.has('schoolPhotoUrl')) updateData.schoolPhotoUrl = schoolPhotoUrl || null;

    await prisma.school.update({
      where: { id: auth.session.schoolId },
      data: updateData as never,
    });

    try {
      await prisma.auditLog.create({
        data: {
        ...(Array.isArray(body.galleryPhotos) ? { galleryPhotosJson: JSON.stringify(body.galleryPhotos.slice(0, 10)) } : (typeof body.galleryPhotosJson === "string" ? { galleryPhotosJson: body.galleryPhotosJson } : {})),
          schoolId: auth.session.schoolId,
          actorUserId: auth.session.userId,
          action: 'UPDATE_SCHOOL_PROFILE',
          targetEntity: 'School',
          targetId: auth.session.schoolId,
        },
      });
    } catch {
      // Abaikan error log audit agar penyimpanan profil tetap berhasil
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update school profile error:', error);
    const detail = error instanceof Error ? error.message : 'Kesalahan server';
    return NextResponse.json(
      { error: `Gagal menyimpan profil lembaga: ${detail}` },
      { status: 500 }
    );
  }
}