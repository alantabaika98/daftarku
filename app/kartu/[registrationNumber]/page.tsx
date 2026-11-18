import { notFound } from 'next/navigation';
import { CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { RegistrationCardPreview } from '@/components/RegistrationCardPreview';
import { PrintCardButton } from '@/components/PrintCardButton';

const LEVEL_LABELS: Record<string, string> = {
  TK: 'TK (Taman Kanak-kanak)',
  RA: 'RA (Raudhatul Athfal)',
  KB: 'KB (Kelompok Bermain)',
  TPA: 'TPA (Taman Penitipan Anak)',
  SD: 'SD (Sekolah Dasar)',
  MI: 'MI (Madrasah Ibtidaiyah)',
  SMP: 'SMP (Sekolah Menengah Pertama)',
  MTs: 'MTs (Madrasah Tsanawiyah)',
  SMA: 'SMA (Sekolah Menengah Atas)',
  MA: 'MA (Madrasah Aliyah)',
  SMK: 'SMK (Sekolah Menengah Kejuruan)',
  MAK: 'MAK (Madrasah Aliyah Kejuruan)',
  TPQ: 'TPQ (Taman Pendidikan Al-Qur’an)',
  SLB: 'SLB (Pendidikan Khusus)',
  ASRAMA: 'Asrama',
  PONDOK_PESANTREN: 'Pondok Pesantren',
  PENDIDIKAN_DINIYAH: 'Pendidikan Diniyah',
  BOARDING_SCHOOL: 'Boarding School',
  PERGURUAN_TINGGI: 'Perguruan Tinggi / Kampus',
  TK_PAUD: 'TK',
  SD_MI: 'SD',
  SMP_MTS: 'SMP',
  SMA_MA: 'SMA',
};

const STATUS_BADGE: Record<string, { label: string; tone: string }> = {
  SUBMITTED: { label: 'Menunggu Verifikasi Panitia', tone: 'bg-amber-50 text-amber-800 border-amber-200' },
  UNDER_REVIEW: { label: 'Sedang Diperiksa Panitia', tone: 'bg-amber-50 text-amber-800 border-amber-200' },
  VERIFIED: { label: 'Data & Berkas Terverifikasi Valid', tone: 'bg-sky-50 text-sky-800 border-sky-200' },
  ACCEPTED: { label: 'DINYATAKAN DITERIMA', tone: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  WAITLISTED: { label: 'Cadangan Seleksi', tone: 'bg-purple-50 text-purple-800 border-purple-200' },
  REJECTED: { label: 'Belum Lulus Seleksi', tone: 'bg-rose-50 text-rose-800 border-rose-200' },
};

export default async function PublicParticipantCardPage({
  params,
}: {
  params: Promise<{ registrationNumber: string }>;
}) {
  const { registrationNumber } = await params;
  const decodedReg = decodeURIComponent(registrationNumber);

  const applicant = await prisma.applicant.findUnique({
    where: { registrationNumber: decodedReg },
    include: {
      school: true,
      period: true,
      path: true,
    },
  });

  if (!applicant || !applicant.school) {
    notFound();
  }

  const raw = applicant as Record<string, unknown>;
  const studentName = String(raw.fullName || raw.name || 'Calon Peserta Didik');
  const nikOrNisn = String(raw.nik || raw.nisn || '-');
  const originSchool = String(raw.originSchool || '-');
  const photoUrl = typeof raw.studentPhotoUrl === 'string' ? raw.studentPhotoUrl : null;
  const isReRegistered = Boolean(raw.isReRegistered);
  const badge = STATUS_BADGE[applicant.status] ?? STATUS_BADGE.SUBMITTED;

  const regDate = new Date(applicant.createdAt).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 print:bg-white print:py-0">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Bilah Status Verifikasi & Tombol Cetak */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.tone}`}
            >
              {applicant.status === 'VERIFIED' || applicant.status === 'ACCEPTED' ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
              {badge.label}
            </span>
            {isReRegistered && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                <Sparkles className="w-3 h-3" />
                Sudah Daftar Ulang
              </span>
            )}
          </div>
          <PrintCardButton color={applicant.school.primaryColor || '#0F766E'} />
        </div>

        {/* Kartu Peserta Resmi Lembaga */}
        <RegistrationCardPreview
          schoolName={applicant.school.name}
          schoolLevelLabel={LEVEL_LABELS[applicant.school.level] ?? applicant.school.level}
          schoolSlug={applicant.school.slug}
          primaryColor={applicant.school.primaryColor || '#0F766E'}
          logoUrl={applicant.school.logoUrl}
          registrationNumber={applicant.registrationNumber}
          waveLabel={`Gelombang ${applicant.period.waveNumber}`}
          pathName={applicant.path?.name ?? 'Jalur Reguler'}
          studentName={studentName}
          studentNikOrNisn={nikOrNisn}
          originSchool={originSchool}
          photoUrl={photoUrl}
          registeredDateLabel={regDate}
          customNotes={applicant.school.cardNotes}
        />
      </div>
    </div>
  );
}