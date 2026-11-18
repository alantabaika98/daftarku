import { PrismaClient, UserRole, LicenseStatus, SchoolLevel } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Memulai pengisian data awal DaftarKu...');

  const superAdminHash = await bcrypt.hash('AdminDaftarKu2026!', 12);
  const school1Hash = await bcrypt.hash('SekolahContoh2026!', 12);
  const school2Hash = await bcrypt.hash('SmkHarapan2026!', 12);

  // 1. Akun Super Admin ARA Digital
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@aradigital.id' },
    update: {},
    create: {
      name: 'Super Admin ARA Digital',
      email: 'superadmin@aradigital.id',
      passwordHash: superAdminHash,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  });

  // 2. Tenant 1: Sekolah Contoh Nusantara (Lisensi AKTIF)
  const school1 = await prisma.school.upsert({
    where: { slug: 'sekolah-contoh' },
    update: {},
    create: {
      name: 'Sekolah Contoh Nusantara',
      slug: 'sekolah-contoh',
      level: SchoolLevel.SD_MI,
      npsn: '20500001',
      address: 'Jl. Pendidikan No. 10, Sidoarjo, Jawa Timur',
      phone: '031-8881234',
      whatsapp: '6281234567890',
      email: 'info@sekolahcontoh.sch.id',
      primaryColor: '#0F766E',
      description: 'Sekolah unggulan berbasis karakter dan teknologi dengan layanan SPMB digital terpadu.',
      registrationPrefix: 'SCN',
      isActive: true,
    },
  });

  await prisma.license.upsert({
    where: { schoolId: school1.id },
    update: {},
    create: {
      schoolId: school1.id,
      licenseKey: 'DFK-LIFE-2026-0001',
      planName: 'LIFETIME_PRO',
      status: LicenseStatus.ACTIVE,
      activatedAt: new Date(),
      notes: 'Aktivasi lisensi perdana Sekolah Contoh Nusantara',
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@sekolahcontoh.sch.id' },
    update: {},
    create: {
      schoolId: school1.id,
      name: 'Admin SPMB Nusantara',
      email: 'admin@sekolahcontoh.sch.id',
      passwordHash: school1Hash,
      role: UserRole.SCHOOL_ADMIN,
      isActive: true,
    },
  });

  const existingPeriod = await prisma.admissionPeriod.findFirst({
    where: { schoolId: school1.id },
  });

  if (!existingPeriod) {
    const period = await prisma.admissionPeriod.create({
      data: {
        schoolId: school1.id,
        name: 'SPMB Tahun Ajaran 2027/2028',
        academicYear: '2027/2028',
        startDate: new Date('2026-11-01T00:00:00.000Z'),
        endDate: new Date('2027-06-30T23:59:59.000Z'),
        announcementDate: new Date('2027-07-05T08:00:00.000Z'),
        isActive: true,
        isPublicOpen: true,
      },
    });

    await prisma.admissionPath.createMany({
      data: [
        {
          schoolId: school1.id,
          periodId: period.id,
          name: 'Jalur Reguler',
          description: 'Pendaftaran umum untuk seluruh calon murid baru sesuai kuota.',
          quota: 60,
          isActive: true,
        },
        {
          schoolId: school1.id,
          periodId: period.id,
          name: 'Jalur Prestasi',
          description: 'Jalur khusus calon murid dengan prestasi akademik maupun non-akademik.',
          quota: 20,
          isActive: true,
        },
      ],
    });

    await prisma.documentRequirement.createMany({
      data: [
        {
          schoolId: school1.id,
          periodId: period.id,
          name: 'Kartu Keluarga (KK)',
          description: 'Scan atau foto Kartu Keluarga terbaru yang terbaca jelas.',
          isRequired: true,
          allowedTypes: 'pdf,jpg,jpeg,png',
          maxSizeMb: 2,
          sortOrder: 1,
        },
        {
          schoolId: school1.id,
          periodId: period.id,
          name: 'Akta Kelahiran',
          description: 'Scan atau foto Akta Kelahiran calon murid.',
          isRequired: true,
          allowedTypes: 'pdf,jpg,jpeg,png',
          maxSizeMb: 2,
          sortOrder: 2,
        },
        {
          schoolId: school1.id,
          periodId: period.id,
          name: 'Pas Foto Terbaru 3x4',
          description: 'Foto formal latar belakang merah atau biru.',
          isRequired: true,
          allowedTypes: 'jpg,jpeg,png',
          maxSizeMb: 2,
          sortOrder: 3,
        },
      ],
    });

    await prisma.formFieldConfig.createMany({
      data: [
        {
          schoolId: school1.id,
          periodId: period.id,
          fieldKey: 'nik',
          label: 'NIK Calon Murid (16 Digit)',
          fieldType: 'text',
          isRequired: true,
          isEnabled: true,
          sortOrder: 1,
        },
        {
          schoolId: school1.id,
          periodId: period.id,
          fieldKey: 'previousSchool',
          label: 'Asal Sekolah / TK Sebelumnya',
          fieldType: 'text',
          isRequired: false,
          isEnabled: true,
          sortOrder: 2,
        },
      ],
    });
  }

  // 3. Tenant 2: SMK Harapan Bangsa (Lisensi PENDING untuk uji aktivasi & isolasi tenant)
  const school2 = await prisma.school.upsert({
    where: { slug: 'smk-harapan-bangsa' },
    update: {},
    create: {
      name: 'SMK Harapan Bangsa',
      slug: 'smk-harapan-bangsa',
      level: SchoolLevel.SMK,
      npsn: '20500002',
      address: 'Jl. Industri Raya No. 45, Malang, Jawa Timur',
      phone: '0341-555987',
      whatsapp: '6289876543210',
      email: 'spmb@smkharapan.sch.id',
      primaryColor: '#1D4ED8',
      description: 'Sekolah Menengah Kejuruan berbasis industri dan digital.',
      registrationPrefix: 'SHB',
      isActive: true,
    },
  });

  await prisma.license.upsert({
    where: { schoolId: school2.id },
    update: {},
    create: {
      schoolId: school2.id,
      licenseKey: 'DFK-LIFE-2026-0002',
      planName: 'LIFETIME_BASIC',
      status: LicenseStatus.PENDING,
      notes: 'Menunggu konfirmasi aktivasi dari Super Admin ARA Digital',
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@smkharapan.sch.id' },
    update: {},
    create: {
      schoolId: school2.id,
      name: 'Admin SMK Harapan',
      email: 'admin@smkharapan.sch.id',
      passwordHash: school2Hash,
      role: UserRole.SCHOOL_ADMIN,
      isActive: true,
    },
  });

  console.log('Selesai! Akun Super Admin:', superAdmin.email);
  console.log('Sekolah 1 (Aktif):', school1.name, '| Slug:', school1.slug);
  console.log('Sekolah 2 (Pending):', school2.name, '| Slug:', school2.slug);
}

main()
  .catch((e) => {
    console.error('Gagal menjalankan seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });