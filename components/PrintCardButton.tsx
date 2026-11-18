'use client';

import { Printer } from 'lucide-react';

export function PrintCardButton({ color }: { color: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      style={{ backgroundColor: color }}
      className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:opacity-95 cursor-pointer print:hidden"
    >
      <Printer className="w-4 h-4" />
      Cetak / Simpan PDF Kartu Peserta
    </button>
  );
}