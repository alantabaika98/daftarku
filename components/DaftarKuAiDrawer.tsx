'use client';

import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  X,
  Send,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Megaphone,
  BarChart3,
  Sliders,
  ShieldCheck,
  Copy,
  Check,
  Zap,
} from 'lucide-react';

export interface ProposedAiAction {
  id: string;
  title: string;
  description: string;
  actionType: 'ADD_QUOTA' | 'EXTEND_WAVE' | 'VERIFY_ALL_READY' | 'ADJUST_FEE';
  payload?: any;
}

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
  copyableText?: string;
  proposedAction?: ProposedAiAction;
  actionExecuted?: boolean;
}

interface DaftarKuAiDrawerProps {
  schoolName: string;
  activeTab: string;
  planTier: 'starter' | 'standard' | 'jumbo';
  totalApplicants: number;
  totalQuota: number;
  pendingDocsCount: number;
  activeWaveName: string;
  registrationFee: number;
  onExecuteApprovedAction: (action: ProposedAiAction) => void;
}

export function DaftarKuAiDrawer({
  schoolName,
  activeTab,
  planTier,
  totalApplicants,
  totalQuota,
  pendingDocsCount,
  activeWaveName,
  registrationFee,
  onExecuteApprovedAction,
}: DaftarKuAiDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputPrompt, setInputPrompt] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isPro = planTier === 'standard' || planTier === 'jumbo';
  const maxQuota = isPro ? 500 : 25;
  const [usedQuota, setUsedQuota] = useState(4);

  const remainingSeats = Math.max(0, totalQuota - totalApplicants);
  const fillRate = totalQuota > 0 ? Math.round((totalApplicants / totalQuota) * 100) : 0;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `Halo Admin **${schoolName}**! Saya **DaftarKu AI**. Saat ini Anda berada di menu **${activeTab.toUpperCase()}**.\n\nRingkasan cepat lembaga Anda:\n• Pendaftar masuk: **${totalApplicants} dari ${totalQuota} kursi (${fillRate}%)**\n• Berkas menunggu cek: **${pendingDocsCount} dokumen**\n\nApa yang ingin Anda analisis atau siapkan hari ini?`,
      timestamp: 'Baru saja',
    },
  ]);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generateContextualResponse = (query: string): ChatMessage => {
    const q = query.toLowerCase();
    const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    if (q.includes('analisis') || q.includes('kuota') || q.includes('rekomendasi')) {
      return {
        id: 'ai-' + Date.now(),
        role: 'assistant',
        timestamp: now,
        content:
          `Berdasarkan data aktual **${schoolName}**, keterisian kuota pada **${activeWaveName}** saat ini mencapai **${fillRate}%** (tersisa **${remainingSeats} kursi**).\n\n` +
          (isPro
            ? `**Analisis Mendalam (PRO):** Tren pendaftaran meningkat pada akhir pekan. Agar calon siswa potensial tidak tertolak saat kuota penuh, saya merekomendasikan penambahan **20 kursi cadangan** pada Jalur Reguler.`
            : `**Rekomendasi Operasional:** Kuota masih tersedia ${remainingSeats} kursi. Jika mendekati penuh, Anda dapat menambah kuota jalur.`),
        proposedAction: {
          id: 'act-quota-' + Date.now(),
          title: 'Tambah +20 Kuota Kursi pada Jalur Reguler',
          description: `Kapasitas total akan ditingkatkan dari ${totalQuota} menjadi ${totalQuota + 20} kursi. Perubahan ini memerlukan persetujuan Anda.`,
          actionType: 'ADD_QUOTA',
          payload: 20,
        },
      };
    }

    if (q.includes('pengumuman') || q.includes('whatsapp') || q.includes('broadcast') || q.includes('info')) {
      const draftWa =
        `📢 *INFORMASI RESMI SPMB ${schoolName.toUpperCase()}*\n\n` +
        `Assalamu’alaikum Ayah/Bunda,\n` +
        `Pendaftaran Peserta Didik Baru periode *${activeWaveName}* saat ini masih dibuka! Mengingat sisa kuota tinggal *${remainingSeats} kursi*, segera lengkapi formulir dan berkas melalui portal resmi kami.\n\n` +
        `💰 Biaya Pendaftaran: ${registrationFee === 0 ? 'GRATIS (Rp 0)' : 'Rp ' + registrationFee.toLocaleString('id-ID')}\n` +
        `📌 Cek & Daftar Sekarang di Portal Resmi ${schoolName}.\n\n` +
        `Terima kasih,\n*Panitia SPMB ${schoolName}*`;

      return {
        id: 'ai-' + Date.now(),
        role: 'assistant',
        timestamp: now,
        content: `Berikut draf pengumuman resmi siap kirim untuk grup WhatsApp maupun sosial media **${schoolName}**:`,
        copyableText: draftWa,
      };
    }

    if (q.includes('berkas') || q.includes('dokumen') || q.includes('verifikasi')) {
      return {
        id: 'ai-' + Date.now(),
        role: 'assistant',
        timestamp: now,
        content:
          pendingDocsCount > 0
            ? `Saat ini terdapat **${pendingDocsCount} dokumen calon siswa** yang berstatus *Menunggu Verifikasi*.\n\nTips Pemeriksaan Cepat:\n1. Pastikan NIK pada KK sesuai dengan Akta Kelahiran.\n2. Pastikan foto/scan tidak buram.\n\nApakah Anda ingin langsung menuju ke Meja Verifikasi Berkas?`
            : `Luar biasa! Seluruh dokumen calon siswa di **${schoolName}** sudah selesai diperiksa (0 berkas antre).`,
        proposedAction:
          pendingDocsCount > 0
            ? {
                id: 'act-verify-' + Date.now(),
                title: 'Buka Meja Pemeriksaan Berkas Sekarang',
                description: `Arahkan halaman langsung ke antrean ${pendingDocsCount} dokumen yang menunggu verifikasi.`,
                actionType: 'VERIFY_ALL_READY',
              }
            : undefined,
      };
    }

    if (q.includes('jadwal') || q.includes('gelombang') || q.includes('perpanjang')) {
      return {
        id: 'ai-' + Date.now(),
        role: 'assistant',
        timestamp: now,
        content: `Gelombang aktif saat ini adalah **${activeWaveName}**. Jika Anda ingin memberikan waktu tambahan bagi wali murid yang belum melengkapi berkas, saya dapat membantu memperpanjang masa pendaftaran gelombang ini selama 14 hari.`,
        proposedAction: {
          id: 'act-wave-' + Date.now(),
          title: `Perpanjang Masa Aktif ${activeWaveName}`,
          description: 'Tanggal penutupan gelombang akan dimundurkan otomatis selama 14 hari ke depan.',
          actionType: 'EXTEND_WAVE',
        },
      };
    }

    return {
      id: 'ai-' + Date.now(),
      role: 'assistant',
      timestamp: now,
      content: `Saya mencatat pertanyaan Anda terkait **"${query}"** untuk **${schoolName}**.\n\nSebagai asisten cerdas SPMB, saya menjaga agar data sekolah Anda tetap terisolasi dan aman. Anda dapat meminta saya untuk:\n• Menganalisis sisa kuota & tren pendaftar\n• Membuat pengumuman WhatsApp otomatis\n• Memeriksa antrean berkas (${pendingDocsCount} menunggu)\n• Memberikan rekomendasi penyesuaian kuota/jadwal.`,
    };
  };

  const handleSendPrompt = (customText?: string) => {
    const textToSend = (customText ?? inputPrompt).trim();
    if (!textToSend) return;

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    const aiReply = generateContextualResponse(textToSend);
    setMessages((prev) => [...prev, userMsg, aiReply]);
    setUsedQuota((q) => Math.min(maxQuota, q + 1));
    if (!customText) setInputPrompt('');
  };

  const handleApproveAction = (msgId: string, action: ProposedAiAction) => {
    onExecuteApprovedAction(action);
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, actionExecuted: true } : m))
    );
  };

  const quickChips = [
    { label: 'Analisis Kuota & Tren', prompt: 'Analisis data pendaftar dan rekomendasi kuota saat ini', icon: BarChart3 },
    { label: 'Buat Pengumuman WA', prompt: 'Buatkan draf pengumuman WhatsApp gelombang aktif', icon: Megaphone },
    { label: 'Cek Antrean Berkas', prompt: 'Bantu pemeriksaan dokumen pendaftar yang menunggu', icon: FileCheck },
    { label: 'Rekomendasi Jadwal', prompt: 'Berikan rekomendasi jadwal gelombang pendaftaran', icon: Sliders },
  ];

  return (
    <>
      {/* TOMBOL MENGAMBANG (FLOATING BUTTON) TERSEDIA DI SELURUH HALAMAN ADMIN */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#102B56] to-[#155EEF] hover:from-[#155EEF] hover:to-[#102B56] text-white pl-4 pr-5 py-3 shadow-xl border border-white/20 transition-all duration-300 hover:scale-[1.03] cursor-pointer"
        >
          <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-[#FF9F1C]">
            <Bot className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#102B56]" />
          </span>
          <div className="text-left">
            <p className="text-xs font-extrabold leading-none flex items-center gap-1">
              <span>DaftarKu AI</span>
              <Sparkles className="w-3 h-3 text-[#FF9F1C]" />
            </p>
            <p className="text-[10px] text-blue-200 font-medium mt-0.5">Asisten Cerdas SPMB</p>
          </div>
        </button>
      </div>

      {/* PANEL PERCAKAPAN SISI KANAN (SLIDE-OVER DRAWER) & RESPONSIVE MOBILE */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-[#102B56]/40 backdrop-blur-xs transition-opacity"
          />

          {/* Panel Drawer Kanan */}
          <aside className="relative z-10 w-full sm:max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-hidden">
            {/* Header Drawer */}
            <div className="bg-gradient-to-r from-[#102B56] to-[#155EEF] p-4 sm:p-5 text-white">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-[#FF9F1C]">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold">DaftarKu AI Assistant</h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                          isPro
                            ? 'bg-[#FF9F1C] text-[#102B56]'
                            : 'bg-white/20 text-white'
                        }`}
                      >
                        {isPro ? 'PRO AI' : 'FREE TIER'}
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-100 truncate">
                      Konteks Terisolasi: {schoolName}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Indikator Kuota AI (Strategi Free vs Pro) */}
              <div className="mt-3 pt-2.5 border-t border-white/15 flex items-center justify-between text-[11px]">
                <span className="text-blue-100 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-[#FF9F1C]" />
                  Kuota AI: <strong>{usedQuota} / {maxQuota}</strong> respons
                </span>
                <span className="text-emerald-300 font-bold">Mode Aman (Persetujuan Aktif)</span>
              </div>
            </div>

            {/* Area Percakapan */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F5F8FF]">
              {/* Chips Pintasan Kontekstual */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Bantuan Cepat Sesuai Konteks Sekolah:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {quickChips.map((chip) => {
                    const Icon = chip.icon;
                    return (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => handleSendPrompt(chip.prompt)}
                        className="flex items-center gap-2 rounded-xl bg-white hover:bg-blue-50/80 border border-slate-200/90 p-2.5 text-left text-[11px] font-bold text-[#102B56] shadow-2xs transition cursor-pointer"
                      >
                        <Icon className="w-3.5 h-3.5 text-[#155EEF] shrink-0" />
                        <span className="truncate">{chip.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Daftar Pesan */}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-2xs ${
                      msg.role === 'user'
                        ? 'bg-[#155EEF] text-white rounded-br-none font-medium'
                        : 'bg-white border border-slate-200/90 text-[#172B4D] rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.content}</p>

                    {/* Kotak Teks Pengumuman yang Bisa Disalin */}
                    {msg.copyableText && (
                      <div className="mt-3 rounded-xl bg-[#F5F8FF] border border-[#155EEF]/20 p-3 text-[11px] text-[#102B56]">
                        <pre className="whitespace-pre-wrap font-sans leading-relaxed">{msg.copyableText}</pre>
                        <button
                          type="button"
                          onClick={() => handleCopyText(msg.id, msg.copyableText!)}
                          className="mt-2.5 w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#155EEF] text-white py-1.5 text-[11px] font-extrabold cursor-pointer"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5" /> Berhasil Disalin
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" /> Salin Teks Pengumuman
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Kotak Persetujuan Tindakan (Human-in-the-loop Confirmation) */}
                    {msg.proposedAction && (
                      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3 space-y-2">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[11px] font-extrabold text-[#102B56]">
                              Usulan Tindakan: {msg.proposedAction.title}
                            </p>
                            <p className="text-[10px] text-slate-600 mt-0.5">
                              {msg.proposedAction.description}
                            </p>
                          </div>
                        </div>

                        {msg.actionExecuted ? (
                          <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-700 bg-emerald-100/80 px-3 py-1.5 rounded-lg w-full justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Disetujui & Berhasil Diterapkan
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleApproveAction(msg.id, msg.proposedAction!)}
                              className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-[#155EEF] hover:bg-[#102B56] text-white py-1.5 px-3 text-[11px] font-extrabold transition cursor-pointer"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-[#FF9F1C]" /> Setujui & Terapkan
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}
            </div>

            {/* Footer Input Chat */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendPrompt();
              }}
              className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Tanya AI seputar SPMB, kuota, pengumuman..."
                className="flex-1 rounded-xl border border-slate-200 bg-[#F5F8FF] px-3.5 py-2.5 text-xs font-semibold text-[#172B4D] focus:border-[#155EEF] focus:bg-white focus:outline-none"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-[#155EEF] hover:bg-[#102B56] text-white transition cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </aside>
        </div>
      )}
    </>
  );
}

export default DaftarKuAiDrawer;