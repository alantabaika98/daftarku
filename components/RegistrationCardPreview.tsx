'use client';

import { GraduationCap, User } from 'lucide-react';

export interface RegistrationCardProps {
  schoolName: string;
  schoolLevelLabel: string;
  schoolSlug: string;
  primaryColor: string;
  logoUrl?: string | null;
  registrationNumber: string;
  waveLabel: string;
  pathName: string;
  studentName: string;
  studentNikOrNisn?: string;
  originSchool?: string;
  photoUrl?: string | null;
  registeredDateLabel?: string;
  customNotes?: string | null;
}

export function RegistrationCardPreview({
  schoolName,
  schoolLevelLabel,
  schoolSlug,
  primaryColor,
  logoUrl,
  registrationNumber,
  waveLabel,
  pathName,
  studentName,
  studentNikOrNisn = '3515012014000123',
  originSchool = 'TK / Sekolah Asal Calon Murid',
  photoUrl,
  registeredDateLabel = '15 November 2026',
  customNotes,
}: RegistrationCardProps) {
  const defaultNotes = [
    'Kartu ini merupakan tanda bukti sah pendaftaran SPMB online.',
    'Kartu ini belum dapat dijadikan bukti calon pendaftar dinyatakan lulus seleksi.',
    `Informasi terkini hasil seleksi dapat dipantau melalui laman pendaftaran resmi ${schoolName}.`,
  ];

  const parsedNotes = customNotes
    ? customNotes
        .split('\n')
        .map((line) => line.replace(/^[-•*\d.)\s]+/, '').trim())
        .filter(Boolean)
    : defaultNotes;

  return (
    <div className="w-full max-w-2xl mx-auto bg-white border border-slate-300 rounded-xl shadow-md overflow-hidden text-slate-900 print:shadow-none print:border-slate-400">
      {/* Header Atas: Judul Kiri & Logo Sekolah Kanan */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between gap-4">
        <div className="bg-slate-100/90 border border-slate-200/80 rounded-lg px-5 py-3.5 flex-1">
          <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
            Tanda Bukti Pendaftaran
          </h3>
          <p className="text-xs sm:text-sm font-medium text-slate-600 mt-0.5">
            SPMB {schoolName}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={`Logo ${schoolName}`}
              className="w-16 h-16 object-contain rounded-lg border border-slate-200 p-1 bg-white"
            />
          ) : (
            <div
              style={{ backgroundColor: primaryColor }}
              className="w-16 h-16 rounded-xl text-white flex flex-col items-center justify-center shadow-xs"
            >
              <GraduationCap className="w-7 h-7" />
              <span className="text-[9px] font-bold tracking-wider uppercase mt-0.5">
                SPMB
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Blok Utama: Pas Foto Kiri + Strip Warna Sekolah & Biodata Kanan */}
      <div className="px-6 py-2 grid grid-cols-1 sm:grid-cols-12 gap-4 items-stretch">
        {/* Pas Foto Calon Murid */}
        <div className="sm:col-span-3 flex justify-center sm:justify-start">
          <div className="w-28 h-36 sm:w-full sm:h-full min-h-[148px] rounded-md border border-slate-300 bg-slate-100 overflow-hidden flex flex-col items-center justify-center relative">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={studentName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-2 text-slate-400">
                <User className="w-10 h-10 mx-auto mb-1 text-slate-400" />
                <span className="text-[10px] font-semibold block leading-tight">
                  Pas Foto Calon Murid
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Bar Warna Sekolah + Rincian Peserta */}
        <div className="sm:col-span-9 flex flex-col rounded-md overflow-hidden border border-slate-200">
          {/* Strip Warna Identitas Sekolah */}
          <div
            style={{ backgroundColor: primaryColor }}
            className="px-4 py-3 text-white grid grid-cols-3 gap-2 divide-x divide-white/30"
          >
            <div className="pr-2">
              <p className="text-[10px] uppercase tracking-wider text-white/80">
                Kode Registrasi
              </p>
              <p className="font-mono font-extrabold text-xs sm:text-sm mt-0.5 break-all">
                {registrationNumber}
              </p>
            </div>
            <div className="px-3">
              <p className="text-[10px] uppercase tracking-wider text-white/80">
                Periode Pendaftaran
              </p>
              <p className="font-bold text-xs sm:text-sm mt-0.5">{waveLabel}</p>
            </div>
            <div className="pl-3">
              <p className="text-[10px] uppercase tracking-wider text-white/80">
                Jalur Pilihan
              </p>
              <p className="font-bold text-xs sm:text-sm mt-0.5">{pathName}</p>
            </div>
          </div>

          {/* Biodata Ringkas */}
          <div className="bg-slate-50/90 px-4 py-3.5 space-y-2.5 flex-1">
            <div>
              <p className="text-[11px] text-slate-500">Nama Calon Murid</p>
              <p className="text-sm font-extrabold text-slate-900">{studentName}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500">NIK / NISN</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800 font-mono">
                {studentNikOrNisn}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500">Asal Lembaga / Sekolah Sebelumnya</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800">{originSchool}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabel Pilihan Lembaga Tujuan */}
      <div className="px-6 pt-3">
        <div className="border border-slate-200 rounded-md overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                <th className="py-2 px-3 w-12 font-semibold">No.</th>
                <th className="py-2 px-3 font-semibold">Lembaga Tujuan</th>
                <th className="py-2 px-3 font-semibold">Jenjang & Jalur</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white">
                <td className="py-2.5 px-3 font-semibold text-slate-700">1</td>
                <td className="py-2.5 px-3 font-bold text-slate-900">{schoolName}</td>
                <td className="py-2.5 px-3 font-semibold text-slate-800">
                  {schoolLevelLabel} • {pathName}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Bagian Perhatian & QR Code Verifikasi */}
      <div className="px-6 py-4 flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          <p className="text-xs font-extrabold tracking-wide text-slate-900 uppercase">
            PERHATIAN
          </p>
          <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-700 leading-relaxed">
            {parsedNotes.map((note, idx) => (
              <li key={idx}>{note}</li>
            ))}
          </ol>
        </div>

        {/* QR Code Verifikasi Otomatis */}
        <div className="shrink-0 flex flex-col items-center sm:items-end">
          <div className="p-1.5 bg-white border border-slate-300 rounded-md">
            <svg viewBox="0 0 36 36" className="w-20 h-20 text-slate-900" fill="currentColor">
              <path d="M2 2h10v10H2V2zm2 2v6h6V4H4zm2 2h2v2H6V6zm18-4h10v10H24V2zm2 2v6h6V4h-6zm2 2h2v2h-2V6zM2 24h10v10H2V24zm2 2v6h6v-6H4zm2 2h2v2H6v-2zm10-24h2v4h-2V4zm4 2h2v4h-2V6zm-4 6h4v2h-4v-2zm-2 4h6v2h-6v-2zm8 0h4v4h-4v-4zm6 0h4v2h-4v-2zM2 16h6v2H2v-2zm8 0h2v6h-2v-6zm4 4h4v2h-4v-2zm6 2h4v2h-4v-2zm6 0h2v6h-2v-6zm4 2h4v4h-4v-4zM14 26h4v4h-4v-4zm6 4h6v4h-6v-4zm-6 2h2v2h-2v-2z" />
            </svg>
          </div>
          <p className="text-[10px] font-semibold text-slate-600 mt-1 text-center">
            Tanggal Pendaftaran
          </p>
          <p className="text-[10px] font-bold text-slate-900">{registeredDateLabel}</p>
        </div>
      </div>

      {/* Garis Potong Bawah Kartu */}
      <div className="px-6 py-2.5 border-t border-dashed border-slate-300 bg-slate-50/60 flex items-center justify-between text-[11px] text-slate-500">
        <span>daftarku.id/daftar/{schoolSlug}</span>
        <span>Dicetak otomatis oleh Sistem DaftarKu</span>
      </div>
    </div>
  );
}