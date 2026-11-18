'use client';

import React, { useState } from 'react';
import { Users, CheckCircle2, XCircle, Clock, Search, Filter, ArrowLeft, ExternalLink, ShieldAlert } from 'lucide-react';

interface ApplicantRow {
  id: string;
  regNo: string;
  name: string;
  track: string;
  wave: string;
  status: 'Diverifikasi' | 'Menunggu Verifikasi' | 'Ditolak';
  paymentStatus: 'Lunas' | 'Belum Lunas';
  phone: string;
  date: string;
}

const INITIAL_APPLICANTS: ApplicantRow[] = [
  {
    id: 'app-1',
    regNo: 'MIHA-2027-0018',
    name: 'Ahmad Fauzan Al-Farizi',
    track: 'Jalur Prestasi',
    wave: 'Gelombang 1',
    status: 'Diverifikasi',
    paymentStatus: 'Lunas',
    phone: '081234567890',
    date: '15 Nov 2026',
  },
  {
    id: 'app-2',
    regNo: 'MIHA-2027-0019',
    name: 'Siti Nur Aisyah',
    track: 'Jalur Reguler',
    wave: 'Gelombang 1',
    status: 'Menunggu Verifikasi',
    paymentStatus: 'Belum Lunas',
    phone: '085678901234',
    date: '16 Nov 2026',
  },
  {
    id: 'app-3',
    regNo: 'MIHA-2027-0020',
    name: 'Muhammad Rizki Pratama',
    track: 'Jalur Reguler',
    wave: 'Gelombang 1',
    status: 'Diverifikasi',
    paymentStatus: 'Lunas',
    phone: '081987654321',
    date: '16 Nov 2026',
  },
];

export default function SchoolApplicantsPage() {
  const [applicants, setApplicants] = useState<ApplicantRow[]>(INITIAL_APPLICANTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [toastMsg, setToastMsg] = useState('');

  const showNotice = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleUpdateStatus = (id: string, newStatus: 'Diverifikasi' | 'Ditolak') => {
    setApplicants((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    );
    showNotice(`Status pendaftar berhasil diubah menjadi ${newStatus}`);
  };

  const filteredApplicants = applicants.filter((app) => {
    const matchSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.regNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.phone.includes(searchQuery);
    const matchStatus = statusFilter === 'ALL' || app.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-[#F5F7FC] font-sans text-[#172B4D] p-4 sm:p-8 space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <a href="/dashboard" className="text-xs font-bold text-[#155EEF] hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Ringkasan Dashboard
            </a>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#102A56]">Meja Verifikasi Pendaftar (Verification Desk)</h1>
          <p className="text-xs text-slate-500 mt-0.5">Kelola data calon siswa baru yang masuk melalui portal publik madrasah.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-blue-50 text-[#155EEF] px-3.5 py-1.5 text-xs font-extrabold border border-blue-200">
            Total Pendaftar: {applicants.length} Siswa
          </span>
        </div>
      </div>

      {/* Filter & Pencarian */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, No. Reg, atau No. WA..."
            className="w-full rounded-xl border border-slate-200 bg-[#F5F7FC] pl-10 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-[#155EEF]"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto rounded-xl border border-slate-200 bg-[#F5F7FC] px-3 py-2 text-xs font-bold text-[#102A56] focus:outline-none"
          >
            <option value="ALL">Semua Status</option>
            <option value="Diverifikasi">Diverifikasi</option>
            <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
            <option value="Ditolak">Ditolak</option>
          </select>
        </div>
      </div>

      {/* Tabel Pendaftar */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F5F7FC] text-[10px] uppercase text-slate-400 border-b border-slate-100">
                <th className="px-5 py-3.5 font-extrabold">Nomor Reg & Nama</th>
                <th className="px-5 py-3.5 font-extrabold">Jalur & Gelombang</th>
                <th className="px-5 py-3.5 font-extrabold">Status Berkas</th>
                <th className="px-5 py-3.5 font-extrabold">Pembayaran</th>
                <th className="px-5 py-3.5 font-extrabold text-right">Aksi Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApplicants.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <p className="font-extrabold text-[#155EEF]">{app.regNo}</p>
                    <p className="text-sm font-extrabold text-[#102A56] mt-0.5">{app.name}</p>
                    <p className="text-[11px] text-slate-400">WA: {app.phone} • Daftar: {app.date}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-700">{app.track}</p>
                    <p className="text-[11px] text-slate-500">{app.wave}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        app.status === 'Diverifikasi'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'Menunggu Verifikasi'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      ● {app.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        app.paymentStatus === 'Lunas' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {app.paymentStatus}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(app.id, 'Diverifikasi')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold cursor-pointer shadow-xs"
                    >
                      Terima
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(app.id, 'Ditolak')}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold cursor-pointer"
                    >
                      Tolak
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-[#102A56] text-white shadow-xl text-xs font-extrabold animate-in fade-in">
          {toastMsg}
        </div>
      )}
    </div>
  );
}