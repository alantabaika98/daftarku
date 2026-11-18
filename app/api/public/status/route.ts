import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = (searchParams.get('slug') || '').trim();
    const regNo = (searchParams.get('regNo') || '').trim().toUpperCase();
    const key = (searchParams.get('key') || '').replace(/[^0-9]/g, '');

    if (!slug || !regNo || !key) {
      return NextResponse.json(
        { error: 'Masukkan Nomor Registrasi dan NIK atau Nomor WhatsApp Wali.' },
        { status: 400 }
      );
    }

    const applicant = await prisma.applicant.findFirst({
      where: {
        registrationNumber: regNo,
        school: { slug },
      },
      include: {
        school: true,
        period: true,
        path: true,
        invoices: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    if (!applicant) {
      return NextResponse.json(
        { error: 'Nomor Registrasi tidak ditemukan pada lembaga ini.' },
        { status: 404 }
      );
    }

    const raw = applicant as Record<string, unknown>;
    const savedNik = String(raw.nik ?? '').replace(/[^0-9]/g, '');
    const savedPhone = String(raw.parentPhone ?? '').replace(/[^0-9]/g, '');

    const matchesNik = savedNik && savedNik === key;
    const matchesPhone =
      savedPhone &&
      (savedPhone === key ||
        savedPhone.endsWith(key.slice(-8)) ||
        key.endsWith(savedPhone.slice(-8)));

    if (!matchesNik && !matchesPhone) {
      return NextResponse.json(
        { error: 'NIK atau Nomor WhatsApp tidak cocok dengan data pendaftar tersebut.' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      applicant: {
        id: applicant.id,
        registrationNumber: applicant.registrationNumber,
        status: applicant.status,
        fullName: String(raw.fullName || raw.name || 'Calon Peserta Didik'),
        nikOrNisn: String(raw.nik || raw.nisn || '-'),
        originSchool: String(raw.originSchool || '-'),
        waveLabel: `Gelombang ${applicant.period.waveNumber}`,
        pathName: applicant.path?.name ?? 'Jalur Reguler',
        studentPhotoUrl: typeof raw.studentPhotoUrl === 'string' ? raw.studentPhotoUrl : null,
        paymentStatus: String(raw.paymentStatus ?? 'UNPAID'),
        expectedAmount: Number(raw.expectedAmount ?? 0),
        paidAmount: Number(raw.paidAmount ?? 0),
        uniqueCode: Number(raw.uniqueCode ?? 0),
        isReRegistered: Boolean(raw.isReRegistered),
        verifierNote: typeof raw.verifierNote === 'string' ? raw.verifierNote : null,
        latestInvoice: applicant.invoices[0] ?? null,
        registeredDateLabel: new Date(applicant.createdAt).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
      },
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json({ error: 'Gagal memeriksa status pendaftaran.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const applicantId = typeof body?.applicantId === 'string' ? body.applicantId : '';
    const paymentProofUrl =
      typeof body?.paymentProofUrl === 'string' ? body.paymentProofUrl.trim() : '';

    if (!applicantId || !paymentProofUrl) {
      return NextResponse.json(
        { error: 'Unggah foto/file bukti pelunasan terlebih dahulu.' },
        { status: 400 }
      );
    }

    await prisma.applicant.update({
      where: { id: applicantId },
      data: {
        paymentProofUrl,
        paymentStatus: 'PAID_SUBMITTED',
        paymentNote: 'Bukti pelunasan angsuran diunggah oleh wali murid',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Installment payoff upload error:', error);
    return NextResponse.json({ error: 'Gagal mengirim bukti pelunasan.' }, { status: 500 });
  }
}