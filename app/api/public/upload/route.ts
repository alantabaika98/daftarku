import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';

const ALLOWED_EXTENSIONS = new Set(['pdf', 'jpg', 'jpeg', 'png', 'webp']);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const slug = String(formData.get('slug') || '').trim();
    const kind = String(formData.get('kind') || 'berkas').replace(/[^a-z0-9_-]/gi, '');
    const maxMb = Math.min(1024, Math.max(2, Number(formData.get('maxMb') || 100)));

    if (!slug) {
      return NextResponse.json({ error: 'Identitas lembaga tidak valid.' }, { status: 400 });
    }

    const school = await prisma.school.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!school) {
      return NextResponse.json({ error: 'Lembaga tidak ditemukan.' }, { status: 404 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Pilih atau foto berkas terlebih dahulu.' }, { status: 400 });
    }

    const originalName = file.name || 'dokumen.jpg';
    const ext = originalName.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: 'Format berkas harus berupa foto (JPG, PNG, WEBP) atau dokumen PDF.' },
        { status: 400 }
      );
    }

    if (file.size > maxMb * 1024 * 1024) {
      return NextResponse.json(
        {
          error: `Ukuran file terlalu besar. Batas maksimal berkas ini adalah ${
            maxMb >= 1024 ? '1 GB' : `${maxMb} MB`
          }.`,
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'applicants');
    await mkdir(uploadDir, { recursive: true });

    const safeFileName = `${school.id}-${kind}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 6)}.${ext}`;
    await writeFile(path.join(uploadDir, safeFileName), buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/applicants/${safeFileName}`,
      fileName: originalName,
    });
  } catch (error) {
    console.error('Public upload error:', error);
    return NextResponse.json({ error: 'Gagal mengunggah berkas. Coba lagi.' }, { status: 500 });
  }
}