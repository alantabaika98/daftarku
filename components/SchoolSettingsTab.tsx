'use client';

import React, { useState } from 'react';
import {
  Shield,
  Users,
  Bell,
  Palette,
  Webhook,
  UserCheck,
  KeyRound,
  Plus,
  CheckCircle2,
  Mail,
  Smartphone,
  Building2,
} from 'lucide-react';

interface SchoolSettingsTabProps {
  mode: 'pengaturan' | 'akun';
  schoolName: string;
  adminName?: string;
  adminEmail?: string;
  onSaveSettings: (summary: string) => void;
}

export function SchoolSettingsTab({
  mode,
  schoolName,
  adminName = 'Mokhammad Alan Tabaika',
  adminEmail = 'admin@sekolah.sch.id',
  onSaveSettings,
}: SchoolSettingsTabProps) {
  const [activeSection, setActiveSection] = useState<
    'keamanan' | 'pengguna' | 'notifikasi' | 'tampilan' | 'integrasi'
  >('keamanan');

  const [accountForm, setAccountForm] = useState({
    fullName: adminName,
    email: adminEmail,
    roleTitle: 'Ketua Panitia SPMB / Admin Utama',
    phone: '6281234567890',
    currentPassword: '',
    newPassword: '',
  });

  const [staffList, setStaffList] = useState([
    { id: 'st-1', name: adminName, email: adminEmail, role: 'Admin Utama (Akses Penuh)', active: true },
    { id: 'st-2', name: 'Ustadzah Siti Rahmah', email: 'verifikator@sekolah.sch.id', role: 'Verifikator Berkas', active: true },
    { id: 'st-3', name: 'Bpk. Ahmad Fauzi', email: 'bendahara@sekolah.sch.id', role: 'Bendahara SPMB', active: true },
  ]);

  const [newStaff, setNewStaff] = useState({ name: '', email: '', role: 'Verifikator Berkas' });

  const [notifPrefs, setNotifPrefs] = useState({
    waNewApplicant: true,
    waPaymentUploaded: true,
    emailDailySummary: false,
    browserBellAlert: true,
  });

  const [displayPrefs, setDisplayPrefs] = useState({
    showQuotaBarPublic: true,
    showFloatingWaPublic: true,
    compactTableDensity: false,
  });

  const [integrationPrefs, setIntegrationPrefs] = useState({
    webhookUrl: '',
    autoExportSheet: true,
    whatsappGatewayStatus: 'Terhubung (Aktif)',
  });

  const [savedBanner, setSavedBanner] = useState(false);

  const triggerSave = (label: string) => {
    setSavedBanner(true);
    onSaveSettings(label);
    setTimeout(() => setSavedBanner(false), 3000);
  };

  // JIKA PENGGUNA MEMBUKA MENU 9: PROFIL AKUN
  if (mode === 'akun') {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#102B56] to-[#155EEF] text-[#FF9F1C] flex items-center justify-center text-xl font-extrabold shadow-sm">
                {accountForm.fullName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700">
                  <UserCheck className="w-3 h-3" /> Akun Terverifikasi
                </span>
                <h2 className="text-lg font-extrabold text-[#102B56] mt-1">{accountForm.fullName}</h2>
                <p className="text-xs text-slate-500">
                  {accountForm.roleTitle} • <strong>{schoolName}</strong>
                </p>
              </div>
            </div>
            {savedBanner && (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-extrabold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" /> Profil Diperbarui
              </span>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              triggerSave(`Memperbarui profil akun ${accountForm.fullName}`);
            }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6"
          >
            <div>
              <label className="mb-1.5 block text-[11px] font-extrabold uppercase text-[#102B56]">
                Nama Lengkap Pengelola
              </label>
              <input
                type="text"
                value={accountForm.fullName}
                onChange={(e) => setAccountForm({ ...accountForm, fullName: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-[#F5F8FF] px-4 py-2.5 text-sm font-semibold text-[#172B4D]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-extrabold uppercase text-[#102B56]">
                Jabatan Kepanitiaan
              </label>
              <input
                type="text"
                value={accountForm.roleTitle}
                onChange={(e) => setAccountForm({ ...accountForm, roleTitle: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-[#F5F8FF] px-4 py-2.5 text-sm font-semibold text-[#172B4D]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-extrabold uppercase text-[#102B56]">
                Email Login Resmi
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={accountForm.email}
                  onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-[#F5F8FF] pl-10 pr-4 py-2.5 text-sm font-semibold text-[#172B4D]"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-extrabold uppercase text-[#102B56]">
                Nomor WhatsApp Admin
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={accountForm.phone}
                  onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-[#F5F8FF] pl-10 pr-4 py-2.5 text-sm font-semibold text-[#172B4D]"
                />
              </div>
            </div>
            <div className="sm:col-span-2 pt-3 flex justify-end">
              <button
                type="submit"
                className="rounded-xl bg-[#155EEF] hover:bg-[#102B56] text-white px-6 py-2.5 text-xs font-extrabold shadow-xs transition cursor-pointer"
              >
                Simpan Profil Akun
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // JIKA PENGGUNA MEMBUKA MENU 8: PENGATURAN (5 SUB-BAGIAN BERSIH)
  const sections = [
    { id: 'keamanan', label: 'Akun & Keamanan', icon: Shield },
    { id: 'pengguna', label: 'Pengguna & Hak Akses', icon: Users },
    { id: 'notifikasi', label: 'Notifikasi SPMB', icon: Bell },
    { id: 'tampilan', label: 'Preferensi Tampilan', icon: Palette },
    { id: 'integrasi', label: 'Integrasi Sistem', icon: Webhook },
  ] as const;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Kolom Kiri: Navigasi Pengaturan */}
      <div className="lg:col-span-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xs space-y-1.5">
          <div className="px-3 py-2">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Pengaturan Lembaga
            </p>
            <h3 className="text-sm font-extrabold text-[#102B56] flex items-center gap-1.5 mt-0.5">
              <Building2 className="w-4 h-4 text-[#155EEF]" /> {schoolName}
            </h3>
          </div>
          {sections.map((sec) => {
            const Icon = sec.icon;
            const active = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSection(sec.id)}
                className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-extrabold transition cursor-pointer ${
                  active
                    ? 'bg-[#155EEF] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-[#F5F8FF] hover:text-[#102B56]'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-[#FF9F1C]' : 'text-slate-400'}`} />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Kolom Kanan: Konten Pengaturan */}
      <div className="lg:col-span-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs">
          {savedBanner && (
            <div className="mb-4 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs font-extrabold text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Pengaturan berhasil diperbarui dan disimpan.
            </div>
          )}

          {/* 1. Akun & Keamanan */}
          {activeSection === 'keamanan' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                triggerSave('Memperbarui kata sandi & keamanan akun');
                setAccountForm({ ...accountForm, currentPassword: '', newPassword: '' });
              }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-base font-extrabold text-[#102B56] flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#155EEF]" /> Akun dan Keamanan Sandi
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Perbarui kata sandi pengelola secara berkala untuk menjaga keamanan data pendaftar sekolah.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="mb-1 block text-[11px] font-extrabold text-[#102B56]">Kata Sandi Saat Ini</label>
                  <input
                    type="password"
                    value={accountForm.currentPassword}
                    onChange={(e) => setAccountForm({ ...accountForm, currentPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-[#F5F8FF] px-4 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-extrabold text-[#102B56]">Kata Sandi Baru</label>
                  <input
                    type="password"
                    value={accountForm.newPassword}
                    onChange={(e) => setAccountForm({ ...accountForm, newPassword: e.target.value })}
                    placeholder="Minimal 8 karakter"
                    className="w-full rounded-xl border border-slate-200 bg-[#F5F8FF] px-4 py-2.5 text-sm"
                  />
                </div>
              </div>
              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="rounded-xl bg-[#155EEF] hover:bg-[#102B56] text-white px-5 py-2.5 text-xs font-extrabold cursor-pointer"
                >
                  Simpan Keamanan
                </button>
              </div>
            </form>
          )}

          {/* 2. Pengguna & Hak Akses Panitia */}
          {activeSection === 'pengguna' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-extrabold text-[#102B56]">Pengguna & Hak Akses Panitia</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kelola anggota panitia SPMB di sekolah Anda (Admin Utama, Verifikator Berkas, atau Bendahara).
                </p>
              </div>

              <div className="space-y-2.5">
                {staffList.map((st) => (
                  <div
                    key={st.id}
                    className="rounded-2xl border border-slate-200/90 bg-[#F5F8FF]/60 p-3.5 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-xs font-extrabold text-[#102B56]">{st.name}</p>
                      <p className="text-[11px] text-slate-500">{st.email}</p>
                    </div>
                    <span className="rounded-full bg-white border border-slate-200 px-3 py-1 text-[10px] font-extrabold text-[#155EEF]">
                      {st.role}
                    </span>
                  </div>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newStaff.name || !newStaff.email) return;
                  setStaffList([
                    ...staffList,
                    { id: 'st-' + Date.now(), ...newStaff, active: true },
                  ]);
                  setNewStaff({ name: '', email: '', role: 'Verifikator Berkas' });
                  triggerSave(`Menambahkan akses panitia: ${newStaff.name}`);
                }}
                className="rounded-2xl border border-slate-200 p-4 space-y-3"
              >
                <p className="text-xs font-extrabold text-[#102B56]">Tambah Anggota Panitia Baru</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    placeholder="Nama Guru / Panitia"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                    className="rounded-xl border border-slate-200 bg-[#F5F8FF] px-3 py-2 text-xs font-semibold"
                  />
                  <input
                    type="email"
                    placeholder="Email login"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    className="rounded-xl border border-slate-200 bg-[#F5F8FF] px-3 py-2 text-xs font-semibold"
                  />
                  <select
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                    className="rounded-xl border border-slate-200 bg-[#F5F8FF] px-3 py-2 text-xs font-bold text-[#102B56]"
                  >
                    <option value="Verifikator Berkas">Verifikator Berkas</option>
                    <option value="Bendahara SPMB">Bendahara SPMB</option>
                    <option value="Admin Utama">Admin Utama</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#155EEF] text-white px-4 py-2 text-xs font-extrabold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Panitia
                </button>
              </form>
            </div>
          )}

          {/* 3. Notifikasi */}
          {activeSection === 'notifikasi' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-[#102B56]">Pengaturan Notifikasi SPMB</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pilih pemberitahuan otomatis yang ingin Anda terima saat ada aktivitas pendaftar.
                </p>
              </div>
              <div className="space-y-3 pt-2 text-xs">
                {[
                  { key: 'waNewApplicant', label: 'Kirim notifikasi WhatsApp saat ada calon siswa baru mendaftar' },
                  { key: 'waPaymentUploaded', label: 'Beritahu saat bukti pembayaran formulir diunggah' },
                  { key: 'browserBellAlert', label: 'Tampilkan lencana merah pada lonceng notifikasi dashboard' },
                  { key: 'emailDailySummary', label: 'Kirim rekapitulasi harian SPMB ke email sekolah' },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-[#F5F8FF]/60 p-3.5 cursor-pointer"
                  >
                    <span className="font-bold text-[#102B56]">{item.label}</span>
                    <input
                      type="checkbox"
                      checked={(notifPrefs as any)[item.key]}
                      onChange={(e) => {
                        setNotifPrefs({ ...notifPrefs, [item.key]: e.target.checked });
                        triggerSave('Memperbarui preferensi notifikasi');
                      }}
                      className="w-4 h-4 accent-[#155EEF]"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 4. Preferensi Tampilan */}
          {activeSection === 'tampilan' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-[#102B56]">Preferensi Tampilan Portal & Admin</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sesuaikan elemen visual yang tampil di portal publik maupun tabel admin.
                </p>
              </div>
              <div className="space-y-3 pt-2 text-xs">
                {[
                  { key: 'showQuotaBarPublic', label: 'Tampilkan indikator sisa kuota kursi di halaman publik pendaftar' },
                  { key: 'showFloatingWaPublic', label: 'Tampilkan tombol mengambang WhatsApp & AI di halaman pendaftar' },
                  { key: 'compactTableDensity', label: 'Gunakan mode tabel rapat (Compact View) untuk layar laptop kecil' },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-[#F5F8FF]/60 p-3.5 cursor-pointer"
                  >
                    <span className="font-bold text-[#102B56]">{item.label}</span>
                    <input
                      type="checkbox"
                      checked={(displayPrefs as any)[item.key]}
                      onChange={(e) => {
                        setDisplayPrefs({ ...displayPrefs, [item.key]: e.target.checked });
                        triggerSave('Memperbarui preferensi tampilan');
                      }}
                      className="w-4 h-4 accent-[#155EEF]"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 5. Integrasi & Konfigurasi Sistem */}
          {activeSection === 'integrasi' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-[#102B56]">Integrasi & Konfigurasi Sistem</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hubungkan data SPMB sekolah dengan Google Sheets atau layanan pesan WhatsApp.
                </p>
              </div>
              <div className="space-y-3 pt-2 text-xs">
                <div className="rounded-2xl border border-slate-200 bg-[#F5F8FF]/60 p-4 flex items-center justify-between">
                  <div>
                    <p className="font-extrabold text-[#102B56]">Sinkronisasi Tabel & Ekspor CSV/Excel</p>
                    <p className="text-[11px] text-slate-500">Format data siap diimpor ke Google Sheets / Dapodik / EMIS.</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-[10px] font-extrabold">
                    Aktif Otomatis
                  </span>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-extrabold text-[#102B56]">
                    Webhook URL / Endpoint Sinkronisasi (Opsional)
                  </label>
                  <input
                    type="url"
                    value={integrationPrefs.webhookUrl}
                    onChange={(e) => setIntegrationPrefs({ ...integrationPrefs, webhookUrl: e.target.value })}
                    placeholder="https://script.google.com/macros/s/..."
                    className="w-full rounded-xl border border-slate-200 bg-[#F5F8FF] px-4 py-2.5 text-xs font-semibold"
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => triggerSave('Menyimpan konfigurasi integrasi sistem')}
                    className="rounded-xl bg-[#155EEF] text-white px-5 py-2.5 text-xs font-extrabold cursor-pointer"
                  >
                    Simpan Integrasi
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SchoolSettingsTab;