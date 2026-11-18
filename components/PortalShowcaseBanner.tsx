'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Users,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Award,
  MapPin,
} from 'lucide-react';
import { DaftarKuLogo } from '@/components/DaftarKuLogo';

export interface SlideItem {
  url: string;
  caption?: string;
}

interface PortalShowcaseBannerProps {
  schoolName: string;
  jenjangLabel?: string;
  address?: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  activityPhotoUrl?: string | null;
  galleryPhotosJson?: string | null;
  visionMission?: string | null;
  highlights?: any;
  waveName?: string;
  academicYear?: string;
  waveSchedule?: string;
  waveEndDate?: string | null;
  remainingQuota: number;
  totalQuota: number;
  isOpen: boolean;
  recentApplicants?: Array<{ name: string; track: string; timeAgo?: string }>;
  compactPreview?: boolean;
}

const ROTATING_WORDS = ['Unggul', 'Berkarakter', 'Berprestasi', 'Siap Masa Depan'];

export function PortalShowcaseBanner({
  schoolName,
  jenjangLabel = 'LEMBAGA PENDIDIKAN',
  address,
  logoUrl,
  bannerUrl,
  activityPhotoUrl,
  galleryPhotosJson,
  visionMission,
  highlights,
  waveName = 'Gelombang 1',
  academicYear = 'TA 2027/2028',
  waveSchedule,
  waveEndDate,
  remainingQuota,
  totalQuota,
  isOpen,
  recentApplicants = [],
  compactPreview = false,
}: PortalShowcaseBannerProps) {
  const slides: SlideItem[] = useMemo(() => {
    const list: SlideItem[] = [];
    if (activityPhotoUrl) {
      list.push({ url: activityPhotoUrl, caption: 'Kegiatan Siswa ' + schoolName });
    }
    try {
      if (galleryPhotosJson) {
        const parsed = typeof galleryPhotosJson === 'string' ? JSON.parse(galleryPhotosJson) : galleryPhotosJson;
        if (Array.isArray(parsed)) {
          for (const it of parsed) {
            if (it && typeof it.url === 'string' && it.url.trim()) {
              list.push({ url: it.url, caption: it.caption || 'Fasilitas ' + schoolName });
            }
          }
        }
      }
    } catch {}
    if (list.length === 0 && bannerUrl) {
      list.push({ url: bannerUrl, caption: 'Lingkungan ' + schoolName });
    }
    return list;
  }, [activityPhotoUrl, galleryPhotosJson, bannerUrl, schoolName]);

  const [slideIdx, setSlideIdx] = useState(0);
  const [wordIdx, setWordIdx] = useState(0);
  const [expandVision, setExpandVision] = useState(false);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % slides.length);
    }, 3500);
    return () => clearInterval(t);
  }, [slides.length]);

  useEffect(() => {
    const t = setInterval(() => {
      setWordIdx((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 2800);
    return () => clearInterval(t);
  }, []);

  const highlightCards = useMemo(() => {
    if (!highlights) return [];
    let textStr = '';
    if (typeof highlights === 'string') {
      textStr = highlights;
    } else if (Array.isArray(highlights)) {
      return highlights.map(String).filter((s) => s.trim().length > 0);
    } else {
      try {
        textStr = String(highlights);
      } catch {
        return [];
      }
    }
    const parts = textStr
      .split(/\n|•|;|\.(?=\s+[A-Z])/)
      .map((s) => s.replace(/^[-*]\s*/, '').trim())
      .filter((s) => s.length > 3);
    return parts.length > 0 ? parts.slice(0, 6) : [textStr];
  }, [highlights]);

  const quotaPercent = totalQuota > 0 ? Math.min(100, Math.round((remainingQuota / totalQuota) * 100)) : 100;
  const heroBg = bannerUrl || (slides[0] && slides[0].url) || '';
  const activeSlide = slides[slideIdx] || slides[0];

  return (
    <div className={compactPreview ? 'space-y-2.5 text-left' : 'space-y-3.5 text-left'}>
      <div className="flex items-center justify-between rounded-2xl bg-white/95 backdrop-blur-md border border-[#155EEF]/15 px-3.5 py-2 shadow-xs">
        <DaftarKuLogo variant="full" size="sm" />
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F5F8FF] border border-[#155EEF]/20 px-2.5 py-1 text-[10px] font-bold text-[#102B56]">
          <span className="w-2 h-2 rounded-full bg-[#FF9F1C] animate-pulse" />
          Portal SPMB Resmi
        </span>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-[#102B56] text-white shadow-md border border-[#155EEF]/20">
        {heroBg && <img src={heroBg} alt={schoolName} className="absolute inset-0 w-full h-full object-cover opacity-30" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#102B56] via-[#102B56]/80 to-[#155EEF]/40" />

        <div className={compactPreview ? 'relative p-4' : 'relative p-5 sm:p-6'}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-2.5 py-1 text-[10px] font-bold">
              <span className={'w-2 h-2 rounded-full ' + (isOpen ? 'bg-emerald-400 animate-ping' : 'bg-amber-400')} />
              {isOpen ? 'Pendaftaran Dibuka' : 'Informasi SPMB'}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF9F1C] text-[#102B56] px-2.5 py-1 text-[11px] font-extrabold shadow-sm">
              Sisa {remainingQuota} / {totalQuota} Kursi
            </span>
          </div>

          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className={compactPreview ? 'w-12 h-12 rounded-xl bg-white p-1 object-contain shadow shrink-0' : 'w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-1.5 object-contain shadow-md shrink-0'} />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shrink-0 border border-white/20">
                <DaftarKuLogo variant="icon" size="md" />
              </div>
            )}

            <div className="min-w-0">
              <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest text-blue-200 mb-0.5">
                {jenjangLabel}
              </span>
              <h1 className={compactPreview ? 'text-base font-extrabold tracking-tight text-white leading-snug' : 'text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-snug'}>
                {schoolName}
              </h1>
              <p className="text-xs font-semibold text-blue-100 mt-0.5">
                Mencetak Generasi{' '}
                <span className="inline-block rounded-md bg-[#FF9F1C]/20 border border-[#FF9F1C]/50 px-2 py-0.5 text-[#FF9F1C] font-extrabold">
                  {ROTATING_WORDS[wordIdx]}
                </span>
              </p>
              {address && (
                <p className="flex items-center gap-1 text-[11px] text-blue-200/90 mt-1 truncate">
                  <MapPin className="w-3 h-3 text-[#FF9F1C] shrink-0" />
                  <span className="truncate">{address}</span>
                </p>
              )}
            </div>
          </div>

          <div className="mt-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-2.5">
            <div className="flex items-center justify-between text-[11px] mb-1.5 font-bold text-white">
              <span>{waveName} • {academicYear}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/20 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[#2589FF] to-[#FF9F1C]" style={{ width: quotaPercent + '%' }} />
            </div>
          </div>
        </div>
      </div>

      {slides.length > 0 && activeSlide && (
        <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/80 shadow-sm">
          <div className={compactPreview ? 'relative aspect-[16/9] w-full bg-[#F5F8FF] overflow-hidden' : 'relative aspect-[16/9] sm:aspect-[21/9] w-full bg-[#F5F8FF] overflow-hidden'}>
            <img src={activeSlide.url} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#102B56]/85 via-transparent to-transparent" />
            <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between gap-2">
              <div className="rounded-xl bg-[#102B56]/85 px-2.5 py-1 text-white max-w-[78%]">
                <p className="text-[11px] font-bold truncate">{activeSlide.caption || 'Dokumentasi Kegiatan'}</p>
              </div>
              <span className="rounded-full bg-[#FF9F1C] text-[#102B56] px-2.5 py-0.5 text-[10px] font-extrabold">
                {slideIdx + 1} / {slides.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {highlightCards.length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {highlightCards.map((item: string, idx: number) => (
            <div key={idx} className="min-w-[210px] max-w-[255px] shrink-0 rounded-2xl bg-white border border-[#155EEF]/15 p-3 shadow-xs">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 w-6 h-6 rounded-lg bg-[#155EEF]/10 text-[#155EEF] flex items-center justify-center shrink-0">
                  <Award className="w-3.5 h-3.5 text-[#FF9F1C]" />
                </span>
                <p className="text-[11px] font-semibold text-[#172B4D] leading-relaxed line-clamp-3">{item}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {visionMission && (
        <div className="rounded-2xl bg-white border border-slate-200/80 p-3 shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-[#102B56]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#155EEF]" /> Visi & Misi Lembaga
            </span>
            <button type="button" onClick={() => setExpandVision((v) => !v)} className="text-[11px] font-bold text-[#155EEF] hover:underline cursor-pointer">
              {expandVision ? 'Ringkas' : 'Selengkapnya'}
            </button>
          </div>
          <p className={'text-[11px] text-[#172B4D]/85 leading-relaxed ' + (expandVision ? '' : 'line-clamp-2')}>{visionMission}</p>
        </div>
      )}
    </div>
  );
}

export default PortalShowcaseBanner;