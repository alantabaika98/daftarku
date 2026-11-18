'use client';
import { DaftarKuLogo } from '@/components/DaftarKuLogo';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotInfo, setShowForgotInfo] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || 'Gagal masuk. Periksa kembali data Anda.');
        setLoading(false);
        return;
      }

      router.push(data.redirectTo || '/dashboard');
      router.refresh();
    } catch {
      setErrorMessage('Koneksi ke server terputus. Pastikan aplikasi berjalan dengan normal.');
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali ke Beranda
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-lg shadow-slate-200/40 p-7 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-sm">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex justify-center mb-4"><DaftarKuLogo variant="full" size="lg" showTagline /></div>
          <h1 className="text-xl font-bold text-slate-900">Masuk ke DaftarKu</h1>
            <p className="text-xs text-slate-500">Portal Admin Sekolah & Super Admin</p>
          </div>
        </div>

        {reason === 'license_inactive' && !errorMessage && (
          <div className="mb-5 rounded-xl bg-amber-50 border border-amber-200 p-3.5 flex items-start gap-2.5 text-xs text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Sesi berakhir karena lisensi sekolah belum aktif atau dinonaktifkan. Hubungi ARA Digital.
            </span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-5 rounded-xl bg-rose-50 border border-rose-200 p-3.5 flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sekolah.sch.id"
                className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
                Kata Sandi
              </label>
              <button
                type="button"
                onClick={() => setShowForgotInfo(!showForgotInfo)}
                className="text-xs font-medium text-teal-700 hover:text-teal-800"
              >
                Lupa kata sandi?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2"
                aria-label="Tampilkan atau sembunyikan kata sandi"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {showForgotInfo && (
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600 leading-relaxed">
              Demi keamanan data sekolah, pemulihan kata sandi Admin Sekolah dilakukan melalui
              <strong> Super Admin ARA Digital</strong> di panel manajemen lisensi.
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-teal-700 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Memeriksa Akun...' : 'Masuk ke Sistem'}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-xs text-slate-400">
        DaftarKu • Produk Digital oleh ARA Digital
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50">
      <Suspense fallback={<div className="text-sm text-slate-500">Memuat halaman masuk...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}