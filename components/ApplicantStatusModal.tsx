'use client';

import React, { useState } from 'react';
import { Search, X, CheckCircle2, ShieldAlert, FileText, Smartphone, ArrowRight, UserCheck } from 'lucide-react';

interface ApplicantStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolName: string;
}

export function ApplicantStatusModal({ isOpen, onClose, schoolName }: ApplicantStatusModalProps) {
  const [regNoInput, setRegNoInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [searchedData, setSearchedData] = useState<any | null>(null);
  const [notFound, setNotFound] = useState(false);

  if (!isOpen) return null;

  const handleSearchStatus = (e: React.FormEvent) => {
    e.preventDefault();
    setNotFound(false);

    // Simulasi pencarian aman berdasarkan Nomor Registrasi & No WhatsApp
    if (regNoInput.trim().toUpperCase().includes('MIHA') || regNoInput.trim().length > 3) {
      setSearchedData({
        regNo: regNoInput.trim().toUpperCase(),
        name: 'Ahmad Fauzan Al-Farizi',
        track: 'Jalur Prestasi',
        wave: 'Gelombang 1',
        status: 'Diverifikasi',
        paymentStatus: 'Lunas',
        registeredAt: '15 Nov 2026',
        docs: [
          { label: 'Kartu Keluarga (KK)', status: 'Diterima' },
          { label: 'Akta Kelahiran', status: 'Diterima' },
        ],
      });
    } else {
      setNotFound(true);
      setSearchedData(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102B56]/60 backdrop-blur-xs p-4 font-sans">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#155EEF]">
              Portal Publik {schoolName}
            </span>
            <h3 className="text-base font-extrabold text-[#102B56]">Cek Status Pendaftaran</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!searchedData ? (
          <form onSubmit={handleSearchStatus} className="space-y-4 text-xs">
            <p className="text-slate-500 leading-relaxed">
              Masukkan Nomor Registrasi pendaftaran Anda serta 4 digit terakhir nomor WhatsApp yang terdaftar untuk melihat status seleksi secara aman.
            </p>
            <div>
              <label className="block font-extrabold text-[#102B56] mb-1">Nomor Registrasi / Pendaftaran *</label>
              <input
                required
                type="text"
                value={regNoInput}
                onChange={(e) => setRegNoInput(e.target.value)}
                placeholder="Contoh: MIHA-2027-0018"
                className="w-full rounded-xl border border-slate-200 bg-[#F5F8FF] px-4 py-2.5 font-semibold text-[#172B4D] focus:border-[#155EEF] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-extrabold text-[#102B56] mb-1">4 Digit Terakhir No. WhatsApp *</label>
              <input
                required
                type="password"
                maxLength={4}
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="Cth: 7890"
                className="w-full rounded-xl border border-slate-200 bg-[#F5F8FF] px-4 py-2.5 font-semibold text-[#172B4D] focus:border-[#155EEF] focus:bg-white focus:outline-none"
              />
            </div>

            {notFound && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-rose-700 font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                Data pendaftaran tidak ditemukan. Periksa kembali nomor registrasi Anda.
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-[#155EEF] to-[#102B56] text-white py-3 font-extrabold shadow-sm transition hover:opacity-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Periksa Status Sekarang</span>
              <ArrowRight className="w-4 h-4 text-[#FF9F1C]" />
            </button>
          </form>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="rounded-2xl bg-[#F5F8FF] border border-[#155EEF]/20 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[#155EEF]">{searchedData.regNo}</span>
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px] font-extrabold">
                  ● {searchedData.status}
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-[#102B56]">{searchedData.name}</h4>
              <p className="text-slate-500">
                {searchedData.track} • {searchedData.wave}
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-extrabold text-[#102B56]">Status Dokumen Persyaratan:</p>
              {searchedData.docs.map((d: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                  <span className="font-semibold text-slate-700">{d.label}</span>
                  <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {d.status}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setSearchedData(null);
                setRegNoInput('');
                setPhoneInput('');
              }}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cek Nomor Lain
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ApplicantStatusModal;