import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

function buildDynamicQrisString(schoolName: string, refNo: string, amount: number): string {
  const cleanMerchant = schoolName.replace(/[^A-Za-z0-9 ]/g, '').toUpperCase().slice(0, 22) || 'DAFTARKU SPMB';
  return `00020101021226570014ID.CO.QRIS.WWW01189360091430000000010215${refNo.slice(-15)}52048299530336054${String(amount).length.toString().padStart(2, '0')}${amount}5802ID59${cleanMerchant.length.toString().padStart(2, '0')}${cleanMerchant}6008SIDOARJO6304A1B2`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const slug = typeof body?.slug === 'string' ? body.slug.trim() : '';
    const pathId = typeof body?.pathId === 'string' ? body.pathId.trim() : '';

    const fullName = typeof body?.fullName === 'string' ? body.fullName.trim() : '';
    const nik = typeof body?.nik === 'string' ? body.nik.replace(/[^0-9]/g, '') : '';
    const nisn = typeof body?.nisn === 'string' ? body.nisn.replace(/[^0-9]/g, '') : '';
    const gender = typeof body?.gender === 'string' ? body.gender.trim() : 'Laki-laki';
    const birthPlace = typeof body?.birthPlace === 'string' ? body.birthPlace.trim() : '';
    const birthDateRaw = typeof body?.birthDate === 'string' ? body.birthDate.trim() : '';
    const originSchool = typeof body?.originSchool === 'string' ? body.originSchool.trim() : '';
    const address = typeof body?.address === 'string' ? body.address.trim() : '';
    const parentName = typeof body?.parentName === 'string' ? body.parentName.trim() : '';
    const parentPhone = typeof body?.parentPhone === 'string' ? body.parentPhone.replace(/[^0-9]/g, '') : '';
    const studentPhotoUrl = typeof body?.studentPhotoUrl === 'string' ? body.studentPhotoUrl.trim() : '';

    const uploadedDocs = Array.isArray(body?.uploadedDocs) ? body.uploadedDocs : [];
    const customAnswers = body?.customAnswers && typeof body.customAnswers === 'object' ? body.customAnswers : {};

    const paymentChoice = body?.paymentChoice === 'DP' ? 'DP' : 'FULL';
    const paymentProofUrl = typeof body?.paymentProofUrl === 'string' ? body.paymentProofUrl.trim() : '';
    const paymentNote = typeof body?.paymentNote === 'string' ? body.paymentNote.trim() : '';

    if (!slug || !fullName || !parentName || !parentPhone) {
      return NextResponse.json(
        { error: 'Nama lengkap pendaftar, nama wali, dan nomor WhatsApp wajib diisi.' },
        { status: 400 }
      );
    }

    const school = await prisma.school.findUnique({ where: { slug } });
    if (!school) {
      return NextResponse.json({ error: 'Lembaga tidak ditemukan.' }, { status: 404 });
    }

    const activePeriod = await prisma.admissionPeriod.findFirst({
      where: { schoolId: school.id, isActive: true },
    });

    if (!activePeriod || !activePeriod.isPublicOpen) {
      return NextResponse.json(
        { error: 'Pendaftaran pada gelombang ini sedang ditutup.' },
        { status: 400 }
      );
    }

    const existingCountInWave = await prisma.applicant.count({
      where: { schoolId: school.id, periodId: activePeriod.id },
    });

    if (existingCountInWave >= activePeriod.quota) {
      return NextResponse.json(
        { error: 'Mohon maaf, kuota kursi pada gelombang ini sudah penuh.' },
        { status: 400 }
      );
    }

    let selectedPath = null;
    if (pathId) {
      selectedPath = await prisma.admissionPath.findFirst({
        where: { id: pathId, schoolId: school.id, isActive: true },
        include: { _count: { select: { applicants: true } } },
      });
      if (!selectedPath) {
        return NextResponse.json({ error: 'Jalur pendaftaran tidak valid.' }, { status: 400 });
      }
      if (selectedPath._count.applicants >= selectedPath.quota) {
        return NextResponse.json(
          { error: `Kuota untuk ${selectedPath.name} sudah penuh. Silakan pilih jalur lain.` },
          { status: 400 }
        );
      }
    }

    const totalSchoolApplicants = await prisma.applicant.count({
      where: { schoolId: school.id },
    });
    const seqNumber = totalSchoolApplicants + 1;
    const yearStr = String(new Date().getFullYear());
    const registrationNumber = `${school.registrationPrefix}-${yearStr}-${String(seqNumber).padStart(
      4,
      '0'
    )}`;

    const isAutoGateway = school.paymentMode === 'AUTOMATIC_VA';
    const baseFee =
      school.paymentMode === 'FREE'
        ? 0
        : school.paymentPerWave
        ? activePeriod.registrationFee
        : school.paymentAmount;

    // Untuk mode QRIS & VA Otomatis, tidak butuh kode unik 3 digit karena gateway mengenali ID transaksi unik
    const uniqueCode =
      !isAutoGateway && baseFee > 0 && school.useUniqueCode ? ((seqNumber - 1) % 999) + 1 : 0;

    const payableBase =
      baseFee > 0 && school.allowInstallment && paymentChoice === 'DP'
        ? Math.min(baseFee, school.minDownPayment || baseFee)
        : baseFee;

    const expectedAmount = baseFee > 0 ? baseFee + uniqueCode : 0;
    const currentChargeAmount = payableBase > 0 ? payableBase + uniqueCode : 0;

    let paymentStatus = 'UNPAID';
    if (!isAutoGateway && baseFee > 0 && paymentProofUrl) {
      paymentStatus =
        school.allowInstallment && paymentChoice === 'DP'
          ? 'DP_SUBMITTED'
          : 'PAID_SUBMITTED';
    }

    const applicantModel = Prisma.dmmf.datamodel.models.find((m) => m.name === 'Applicant');
    const enums = Prisma.dmmf.datamodel.enums;

    const parsedBirthDate = birthDateRaw ? new Date(birthDateRaw) : null;
    const validBirthDate =
      parsedBirthDate && !Number.isNaN(parsedBirthDate.getTime()) ? parsedBirthDate : null;

    const currentQuotaBal = Number((school as Record<string, unknown>).quotaBalance ?? 30);
    const shouldLockByQuota = !isAutoGateway && currentQuotaBal < 1;

    const createData: Record<string, unknown> = {
      schoolId: school.id,
      periodId: activePeriod.id,
      registrationNumber,
      status: 'SUBMITTED',
    };

    if (selectedPath) createData.pathId = selectedPath.id;

    for (const field of applicantModel?.fields ?? []) {
      if (field.kind === 'object' || field.isId || field.isUpdatedAt) continue;
      if (field.name in createData) continue;

      const fname = field.name;
      if (fname === 'name' || fname === 'fullName' || fname === 'studentName' || fname === 'candidateName') {
        createData[fname] = fullName;
      } else if (fname === 'nik') {
        createData[fname] = nik || (field.isRequired ? '-' : null);
      } else if (fname === 'nisn') {
        createData[fname] = nisn || (field.isRequired ? '-' : null);
      } else if (fname === 'gender') {
        if (field.kind === 'enum') {
          const enumDef = enums.find((e) => e.name === field.type);
          const vals = enumDef?.values.map((v) => v.name) ?? [];
          const isFemale = gender.toLowerCase().startsWith('p');
          const matched = isFemale
            ? vals.find((v) => /^(FEMALE|PEREMPUAN|P)$/i.test(v)) ?? vals[vals.length - 1]
            : vals.find((v) => /^(MALE|LAKI|L)$/i.test(v)) ?? vals[0];
          if (matched) createData[fname] = matched;
        } else {
          createData[fname] = gender;
        }
      } else if (fname === 'birthPlace') {
        createData[fname] = birthPlace || (field.isRequired ? '-' : null);
      } else if (fname === 'birthDate') {
        createData[fname] = validBirthDate ?? (field.isRequired ? new Date('2010-01-01T00:00:00.000Z') : null);
      } else if (fname === 'originSchool' || fname === 'previousSchool') {
        createData[fname] = originSchool || (field.isRequired ? '-' : null);
      } else if (fname === 'address') {
        createData[fname] = address || (field.isRequired ? '-' : null);
      } else if (fname === 'parentName' || fname === 'guardianName') {
        createData[fname] = parentName;
      } else if (fname === 'parentPhone' || fname === 'guardianPhone' || fname === 'phone' || fname === 'whatsapp') {
        createData[fname] = parentPhone;
      } else if (fname === 'studentPhotoUrl' || fname === 'photoUrl') {
        createData[fname] = studentPhotoUrl || null;
      } else if (fname === 'uploadedDocsJson') {
        createData[fname] = JSON.stringify(uploadedDocs);
      } else if (fname === 'customDataJson' || fname === 'formDataJson') {
        createData[fname] = JSON.stringify(customAnswers);
      } else if (fname === 'paymentStatus') {
        createData[fname] = paymentStatus;
      } else if (fname === 'uniqueCode') {
        createData[fname] = uniqueCode;
      } else if (fname === 'expectedAmount') {
        createData[fname] = expectedAmount;
      } else if (fname === 'paidAmount') {
        createData[fname] = 0;
      } else if (fname === 'paymentProofUrl') {
        createData[fname] = paymentProofUrl || null;
      } else if (fname === 'paymentNote') {
        createData[fname] =
          paymentNote ||
          (baseFee > 0 && school.allowInstallment && paymentChoice === 'DP'
            ? 'Pilihan Skema Angsuran (DP Pertama)'
            : null);
      } else if (fname === 'isLockedByQuota') {
        createData[fname] = shouldLockByQuota;
      } else if (field.isRequired && !field.hasDefaultValue) {
        if (field.type === 'String') createData[fname] = '-';
        else if (field.type === 'Int' || field.type === 'Float') createData[fname] = 0;
        else if (field.type === 'Boolean') createData[fname] = false;
        else if (field.type === 'DateTime') createData[fname] = new Date();
      }
    }

    let generatedInvoice: {
      id: string;
      invoiceNumber: string;
      vaNumber: string | null;
      qrisPayload: string | null;
      totalAmount: number;
      baseAmount: number;
      platformFee: number;
      foundationNetAmount: number;
      status: string;
    } | null = null;

    const created = await prisma.$transaction(async (tx) => {
      const appRecord = await tx.applicant.create({
        data: createData as never,
      });

      if (!isAutoGateway && currentQuotaBal > 0) {
        await tx.school.update({
          where: { id: school.id },
          data: { quotaBalance: { decrement: 1 } },
        });
      }

      if (isAutoGateway && currentChargeAmount > 0) {
        const regCut = Number((school as Record<string, unknown>).platformRegFee ?? 5000);
        const invoiceNumber = `INV-${registrationNumber}`;
        const vaNum = `8808${String(seqNumber).padStart(8, '0')}`;
        const qrisStr = buildDynamicQrisString(school.name, invoiceNumber, currentChargeAmount);

        const inv = await tx.invoice.create({
          data: {
            invoiceNumber,
            schoolId: school.id,
            applicantId: appRecord.id,
            phase: 'INITIAL_REGISTRATION',
            paymentMethod: 'QRIS_AND_VA',
            gatewayProvider: 'DAFTARKU_GATEWAY',
            bankCode: 'QRIS / BRI / BNI / MANDIRI VA',
            vaNumber: vaNum,
            qrisPayload: qrisStr,
            gatewayExternalId: invoiceNumber,
            baseAmount: currentChargeAmount,
            adminBankFee: 0,
            totalAmount: currentChargeAmount,
            paidAmount: 0,
            platformFee: Math.min(currentChargeAmount, regCut),
            foundationNetAmount: Math.max(0, currentChargeAmount - regCut),
            status: 'PENDING',
          },
        });

        generatedInvoice = {
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          vaNumber: inv.vaNumber,
          qrisPayload: inv.qrisPayload,
          totalAmount: inv.totalAmount,
          baseAmount: inv.baseAmount,
          platformFee: inv.platformFee,
          foundationNetAmount: inv.foundationNetAmount,
          status: inv.status,
        };
      }

      return appRecord;
    });

    return NextResponse.json({
      success: true,
      invoice: generatedInvoice,
      applicant: {
        id: created.id,
        registrationNumber: created.registrationNumber,
        fullName,
        nikOrNisn: nik || nisn || '-',
        originSchool: originSchool || '-',
        waveLabel: `Gelombang ${activePeriod.waveNumber}`,
        pathName: selectedPath?.name ?? 'Jalur Reguler',
        studentPhotoUrl: studentPhotoUrl || null,
        paymentStatus,
        expectedAmount,
        uniqueCode,
        registeredDateLabel: new Date(created.createdAt).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
      },
    });
  } catch (error) {
    console.error('Public register error:', error);
    const detail = error instanceof Error ? error.message : 'Kesalahan server';
    return NextResponse.json(
      { error: `Gagal menyimpan pendaftaran: ${detail}` },
      { status: 500 }
    );
  }
}