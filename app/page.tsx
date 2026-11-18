import { DaftarKuLogo } from '@/components/DaftarKuLogo';
import Link from 'next/link';
import { GraduationCap, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <DaftarKuLogo variant="full" size="md" />
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-slate-900">DaftarKu</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                SPMB Made Simple
              </span>
            </div>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 transition-colors"
          >
            Masuk Portal
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-6">
          <ShieldCheck className="w-4 h-4 text-teal-700" />
          Platform Digital Penerimaan Murid Baru (SPMB)
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight max-w-3xl mx-auto">
          Kelola Penerimaan Murid Baru Lebih Rapi, Cepat, dan Terpercaya.
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Satu tautan pendaftaran ramah ponsel untuk orang tua, dilengkapi verifikasi berkas,
          seleksi otomatis, dan pemisahan data penuh untuk setiap sekolah.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-teal-800 transition-all"
          >
            Masuk ke Dashboard Sekolah / Super Admin
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-5 text-left">
          <div className="rounded-2xl bg-white p-6 border border-slate-200/90 shadow-sm">
            <CheckCircle2 className="w-6 h-6 text-teal-700 mb-3" />
            <h2 className="font-bold text-slate-900">Tanpa Instalasi Aplikasi</h2>
            <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
              Calon murid dan orang tua cukup membuka tautan sekolah langsung dari browser HP.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 border border-slate-200/90 shadow-sm">
            <CheckCircle2 className="w-6 h-6 text-teal-700 mb-3" />
            <h2 className="font-bold text-slate-900">Verifikasi & Seleksi Terpadu</h2>
            <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
              Periksa dokumen persyaratan, beri catatan perbaikan, dan umumkan hasil dalam satu tempat.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 border border-slate-200/90 shadow-sm">
            <CheckCircle2 className="w-6 h-6 text-teal-700 mb-3" />
            <h2 className="font-bold text-slate-900">Isolasi Data Antar-Sekolah</h2>
            <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
              Setiap sekolah memiliki ruang data privat yang terpisah dan dilindungi kontrol lisensi.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p className="font-medium text-slate-700">DaftarKu — SPMB Made Simple</p>
          <p>Dikembangkan oleh ARA Digital</p>
        </div>
      </footer>
    </div>
  );
}