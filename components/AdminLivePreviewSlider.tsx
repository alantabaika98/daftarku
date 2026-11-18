'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { GalleryPhotoItem } from '@/components/SchoolGalleryUploader';

export function AdminLivePreviewSlider({
  activityPhotoUrl,
  galleryPhotos,
  schoolName,
}: {
  activityPhotoUrl?: string | null;
  galleryPhotos: GalleryPhotoItem[];
  schoolName: string;
}) {
  const slides = useMemo(() => {
    const list: Array<{ url: string; caption: string }> = [];
    if (activityPhotoUrl) {
      list.push({ url: activityPhotoUrl, caption: 'Foto Utama Kegiatan ' + schoolName });
    }
    for (const g of galleryPhotos) {
      if (g && g.url) {
        list.push({ url: g.url, caption: g.caption || 'Dokumentasi Kegiatan & Fasilitas' });
      }
    }
    return list;
  }, [activityPhotoUrl, galleryPhotos, schoolName]);

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (idx >= slides.length) setIdx(0);
  }, [slides.length, idx]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => {
      setIdx((p) => (p + 1) % slides.length);
    }, 3000);
    return () => clearInterval(t);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const current = slides[idx] || slides[0];

  return (
    <div className="relative rounded-xl overflow-hidden border border-[#155EEF]/20 bg-slate-100 my-2">
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <img
          key={current.url + '-' + idx}
          src={current.url}
          alt={current.caption}
          className="dk-ken-burns w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#102B56]/80 via-transparent to-transparent" />
        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between gap-2 text-white">
          <span className="text-[10px] font-bold truncate">{current.caption}</span>
          <span className="rounded-full bg-[#FF9F1C] text-[#102B56] px-2 py-0.5 text-[9px] font-extrabold shrink-0">
            Slide {idx + 1}/{slides.length}
          </span>
        </div>
      </div>
    </div>
  );
}