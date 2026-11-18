'use client';

import React, { useRef, useState } from 'react';
import { ImagePlus, Trash2, Sparkles, GripHorizontal, Loader2 } from 'lucide-react';

export interface GalleryPhotoItem {
  id: string;
  url: string;
  caption?: string;
}

export function SchoolGalleryUploader({ items, onChange, maxPhotos = 10 }: any) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [compressing, setCompressing] = useState(false);
  const remaining = Math.max(0, maxPhotos - (items?.length || 0));

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length || remaining <= 0) return;
    setCompressing(true);
    try {
      const uploaded: GalleryPhotoItem[] = [];
      for (const f of files.slice(0, remaining)) {
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const img = new Image();
            img.onload = () => {
              const scale = img.width > 1200 ? 1200 / img.width : 1;
              const canvas = document.createElement('canvas');
              canvas.width = Math.round(img.width * scale);
              canvas.height = Math.round(img.height * scale);
              const ctx = canvas.getContext('2d');
              if (ctx) ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.src = String(reader.result);
          };
          reader.readAsDataURL(f);
        });
        uploaded.push({ id: 'gal-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7), url: dataUrl, caption: '' });
      }
      onChange([...(items || []), ...uploaded]);
    } finally {
      setCompressing(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="mt-5 rounded-3xl border border-[#155EEF]/20 bg-white/60 backdrop-blur-xl p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#102B56]">Galeri Kegiatan & Fasilitas</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#155EEF]/10 to-[#FF9F1C]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#155EEF] border border-[#155EEF]/10">
              <Sparkles className="w-3 h-3 text-[#FF9F1C]" /> Slide Otomatis
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Unggah hingga {maxPhotos} foto terbaik lembaga Anda (Otomatis dikompresi).</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-bold text-[#102B56]">
            Terpasang: <span className="text-[#155EEF]">{items?.length || 0}</span> / {maxPhotos}
          </span>
          <button type="button" disabled={remaining === 0 || compressing} onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#155EEF] to-[#102B56] hover:from-[#102B56] hover:to-[#0a1b36] px-4 py-2 text-xs font-bold text-white shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 cursor-pointer">
            {compressing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
            {compressing ? 'Memproses...' : 'Tambah Foto'}
          </button>
          <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
        </div>
      </div>

      {(!items || items.length === 0) ? (
        <div onClick={() => inputRef.current?.click()} className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#155EEF]/25 bg-[#F5F8FF]/50 py-10 px-4 text-center cursor-pointer transition-all hover:bg-[#F5F8FF] hover:border-[#155EEF]/50">
          <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <ImagePlus className="w-6 h-6 text-[#155EEF]" />
          </div>
          <p className="text-xs font-bold text-[#102B56] mb-1">Klik di sini untuk memilih foto</p>
          <p className="text-[10px] text-slate-500">Mendukung format JPG, PNG (Maks 10 foto)</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {items.map((item: GalleryPhotoItem, idx: number) => (
            <div key={item.id} className="group relative rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all hover:border-[#155EEF]/30">
              <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
                <img src={item.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#102B56]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-lg bg-[#102B56]/90 backdrop-blur px-2 py-1 text-[10px] font-bold text-white shadow-sm">
                  <GripHorizontal className="w-3 h-3 text-[#FF9F1C]" /> Slide {idx + 1}
                </span>
                <button type="button" onClick={() => onChange(items.filter((it: GalleryPhotoItem) => it.id !== item.id))} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-rose-500/90 text-white flex items-center justify-center shadow-sm backdrop-blur hover:bg-rose-600 transition-transform hover:scale-110 cursor-pointer opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <input type="text" maxLength={60} value={item.caption || ''} onChange={(e) => onChange(items.map((it: GalleryPhotoItem) => (it.id === item.id ? { ...it, caption: e.target.value } : it)))} placeholder="Tambahkan caption..." className="w-full border-t border-slate-100 px-3 py-2.5 text-[11px] font-semibold text-[#172B4D] focus:outline-none focus:bg-[#F5F8FF] transition-colors placeholder:font-normal" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}