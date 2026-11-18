import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getValidatedSchoolApiSession } from '@/lib/auth';

const ALLOWED_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export async function POST(request: NextRequest) {
  try {
    const auth = await getValidatedSchoolApiSession();
    if (!auth || auth.session.role !== 'SCHOOL_ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const kind = String(formData.get('kind') || 'asset').replace(/[^a-z0-9_-]/gi, '');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Pilih file gambar terlebih dahulu.' }, { status: 400 });
    }

    const ext = ALLOWED_MIME[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: 'Format gambar harus JPG, PNG, atau WEBP.' },
        { status: 400 }
      );
    }

    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Ukuran gambar profil maksimal 15 MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'schools');
    await mkdir(uploadDir, { recursive: true });

    const safeName = `${auth.session.schoolId}-${kind}-${Date.now()}.${ext}`;
    await writeFile(path.join(uploadDir, safeName), buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/schools/${safeName}`,
    });
  } catch (error) {
    console.error('Upload school asset error:', error);
    return NextResponse.json({ error: 'Gagal mengunggah gambar.' }, { status: 500 });
  }
}