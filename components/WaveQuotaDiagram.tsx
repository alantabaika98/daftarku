'use client';

import { PieChart, BarChart3, Users, CheckCircle2, UserCheck } from 'lucide-react';
import { WaveQuotaSummary } from './SchoolApplicantsTab';

export function WaveQuotaDiagram({
  waves,
  brandColor,
}: {
  waves: WaveQuotaSummary[];
  brandColor: string;
}) {
  const totalQuotaAll = waves.reduce((sum, w) => sum + w.quota, 0);
  const totalApplicantsAll = waves.reduce((sum, w) => sum + w.applicantCount, 0);
  const overallPct =
    totalQuotaAll > 0 ? Math.min(100, Math.round((totalApplicantsAll / totalQuotaAll) * 100)) : 0;

  const radius = 34;
  const circumference = 2 * Math.PI * radius;

  return (
    <section className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-xs space-y-5">
      {/* Header Diagram */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div
            style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          >
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Diagram Persentase Keterisian Kuota Gelombang
            </h3>
            <p className="text-xs text-slate-500">
              Perbandingan jumlah pendaftar masuk terhadap kapasitas kuota kursi di setiap
              gelombang SPMB.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-200/80 px-4 py-2.5 shrink-0">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">
              Total Seluruh Gelombang
            </span>
            <span className="text-xs font-extrabold text-slate-900">
              {totalApplicantsAll} / {totalQuotaAll} Kursi Terisi
            </span>
          </div>
          <span
            style={{ backgroundColor: brandColor }}
            className="text-xs font-extrabold text-white px-2.5 py-1 rounded-lg font-mono"
          >
            {overallPct}%
          </span>
        </div>
      </div>

      {/* Grid Donut Chart per Gelombang */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {waves.map((w) => {
          const pct =
            w.quota > 0 ? Math.min(100, Math.round((w.applicantCount / w.quota) * 100)) : 0;
          const sisa = Math.max(0, w.quota - w.applicantCount);
          const strokeDashoffset = circumference - (pct / 100) * circumference;

          return (
            <div
              key={w.id}
              className={`rounded-2xl border p-4 transition-all flex items-center gap-4 ${
                w.isActive
                  ? 'bg-slate-50/70 border-teal-500/60 ring-1 ring-teal-500/15'
                  : 'bg-white border-slate-200/90'
              }`}
            >
              {/* SVG Donut Ring Chart */}
              <div className="relative w-22 h-22 shrink-0 flex items-center justify-center">
                <svg className="w-22 h-22 -rotate-90" viewBox="0 0 84 84">
                  <circle
                    cx="42"
                    cy="42"
                    r={radius}
                    fill="transparent"
                    stroke="#E2E8F0"
                    strokeWidth="8"
                  />
                  <circle
                    cx="42"
                    cy="42"
                    r={radius}
                    fill="transparent"
                    stroke={w.isActive ? brandColor : '#0EA5E9'}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-base font-extrabold text-slate-900 font-mono leading-none">
                    {pct}%
                  </span>
                  <span className="text-[9px] font-semibold text-slate-400 uppercase mt-0.5">
                    Terisi
                  </span>
                </div>
              </div>

              {/* Detail Angka & Bar Gelombang */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    style={w.isActive ? { backgroundColor: brandColor } : undefined}
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      w.isActive ? 'text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Gelombang {w.waveNumber}
                  </span>
                  {w.isActive && (
                    <span className="text-[10px] font-bold text-emerald-700">● Aktif</span>
                  )}
                </div>

                <p className="text-sm font-bold text-slate-900 truncate">{w.name}</p>

                <div className="text-xs text-slate-600 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <strong>{w.applicantCount}</strong> / {w.quota} kuota
                  </span>
                  <span className="font-semibold text-teal-700">Sisa {sisa}</span>
                </div>

                <div className="pt-1 flex items-center gap-3 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Diterima: <strong>{w.acceptedCount}</strong>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-sky-600" />
                    Daftar Ulang: <strong>{w.reRegisteredCount}</strong>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grafik Batang Perbandingan Antar Gelombang */}
      {waves.length > 0 && (
        <div className="rounded-xl bg-slate-50/80 border border-slate-200/80 p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 inline-flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
              Grafik Perbandingan Rasio Pendaftar vs Kuota Kursi
            </span>
            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1">
                <span
                  style={{ backgroundColor: brandColor }}
                  className="w-2.5 h-2.5 rounded-xs inline-block"
                />
                Terisi (%)
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-200 inline-block" />
                Sisa Kuota
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {waves.map((w) => {
              const pct =
                w.quota > 0 ? Math.min(100, Math.round((w.applicantCount / w.quota) * 100)) : 0;
              return (
                <div key={w.id} className="grid grid-cols-12 items-center gap-3 text-xs">
                  <span className="col-span-4 sm:col-span-3 font-semibold text-slate-700 truncate">
                    Gel. {w.waveNumber} ({w.name})
                  </span>
                  <div className="col-span-6 sm:col-span-7 h-3 rounded-full bg-slate-200/90 overflow-hidden">
                    <div
                      style={{
                        width: `${pct}%`,
                        backgroundColor: w.isActive ? brandColor : '#0EA5E9',
                      }}
                      className="h-full rounded-full transition-all duration-700"
                    />
                  </div>
                  <span className="col-span-2 text-right font-mono font-bold text-slate-800">
                    {pct}% ({w.applicantCount}/{w.quota})
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}