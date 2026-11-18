'use client';

import React, { useState } from 'react';
import { PortalShowcaseBanner } from '@/components/PortalShowcaseBanner';
import { ApplicantStatusModal } from '@/components/ApplicantStatusModal';
import { Search, Smartphone, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function PublicRegistrationClient(props: any) {
  const school = props?.school || {};
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F8FF] font-sans text-[#172B4D] py-6 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Tombol Pintasan Cek Status di Bagian Atas Portal */}
        <div className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-xs border border-slate-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#155EEF]" />
            <span className="text-xs font-extrabold text-[#102B56]">Sudah mendaftar sebelumnya?</span>
          </div>
          <button
            type="button"
            onClick={() => setIsStatusModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#155EEF] hover:bg-[#102B56] text-white px-4 py-2 text-xs font-extrabold shadow-sm transition cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" /> Cek Status Pendaftaran
          </button>
        </div>

        {/* Banner Showcase Sekolah */}
        <PortalShowcaseBanner
          schoolName={school?.name || 'MI Hidayatul Abidin'}
          jenjangLabel={school?.level || 'Madrasah Ibtidaiyah'}
          address={school?.address || 'Sidoarjo, Jawa Timur'}
          logoUrl={school?.logoUrl}
          bannerUrl={school?.bannerUrl}
          activityPhotoUrl={school?.activityPhotoUrl}
          galleryPhotosJson={school?.galleryPhotosJson}
          visionMission={school?.visionMission}
          highlights={school?.highlights}
          remainingQuota={48}
          totalQuota={100}
          isOpen={true}
        />

        {/* Informasi Formulir Pendaftaran */}
        <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs text-center space-y-4">
          <h2 className="text-xl font-extrabold text-[#102B56]">Formulir Pendaftaran Siswa Baru</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Silakan lengkapi data diri calon siswa melalui portal resmi ini tanpa perlu membuat akun terlebih dahulu.
          </p>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 px-4 py-2 text-xs font-extrabold border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" /> Gelombang 1 Aktif • Pendaftaran Dibuka
            </span>
          </div>
        </div>
      </div>

      {/* Modal Cek Status Pendaftaran */}
      <ApplicantStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        schoolName={school?.name || 'MI Hidayatul Abidin'}
      />
    </div>
  );
}

export default PublicRegistrationClient;