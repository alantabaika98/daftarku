import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/daftarku-edtech-v3',
    name: 'DaftarKu — Daftar Mudah, Masa Depan Cerah',
    short_name: 'DaftarKu',
    description: 'Platform Digital Sistem Penerimaan Murid Baru (SPMB) Modern & Terpercaya',
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    background_color: '#F5F8FF',
    theme_color: '#155EEF',
    orientation: 'portrait',
    icons: [
      { src: '/dk-brand-icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/dk-brand-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/dk-brand-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}