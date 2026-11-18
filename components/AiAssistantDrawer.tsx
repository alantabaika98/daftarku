'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Copy,
  Check,
  MessageCircle,
  BookOpen,
  Bot,
  Wand2,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  text: string;
}

interface PromptPreset {
  id: string;
  title: string;
  badge: string;
  prompt: string;
}

const ADMIN_PROMPTS: PromptPreset[] = [
  {
    id: 'seluk-beluk',
    title: 'Jelaskan Seluk-Beluk Semua Fitur DaftarKu',
    badge: 'Master Guide',
    prompt: 'Jelaskan secara lengkap seluk-beluk semua fitur, alur kerja 6 menu dashboard, dan cara kerja aplikasi DaftarKu.',
  },
  {
    id: 'wa-promo',
    title: 'Buat Broadcast WA Promosi SPMB',
    badge: 'Marketing WA',
    prompt:
      'Buatkan teks broadcast WhatsApp yang menarik dan sopan untuk mengajak orang tua mendaftar di gelombang aktif lembaga kami, lengkap dengan benefit gelombang, rincian biaya, dan link pendaftaran.',
  },
  {
    id: 'wa-lulus',
    title: 'Draf Pengumuman Kelulusan & Daftar Ulang',
    badge: 'Administrasi',
    prompt:
      'Buatkan draf pengumuman resmi untuk wali murid bahwa seleksi gelombang telah selesai, cara mengecek kartu peserta, dan pengingat proses daftar ulang.',
  },
  {
    id: 'analisis-kuota',
    title: 'Analisis Keterisian Kuota & Strategi',
    badge: 'Strategi',
    prompt:
      'Analisis persentase keterisian kuota gelombang aktif kami saat ini dan berikan 3 strategi praktis untuk memenuhi sisa kursi yang tersedia.',
  },
  {
    id: 'info-biaya',
    title: 'Aturan Bagi Hasil, QRIS, VA & Saldo Yayasan',
    badge: 'Keuangan',
    prompt:
      'Jelaskan secara rinci aturan bagi hasil dan potongan untuk Transfer Bank, QRIS lembaga, Virtual Account (VA), serta cara penarikan Saldo Yayasan.',
  },
  {
    id: 'sop-verifikasi',
    title: 'SOP Verifikasi Panitia & Ekspor Dapodik/EMIS',
    badge: 'Panduan Admin',
    prompt:
      'Jelaskan langkah-langkah lengkap verifikasi berkas, pencocokan kode unik, daftar ulang, dan ekspor data ke Excel Dapodik/EMIS.',
  },
];

const PUBLIC_PROMPTS: PromptPreset[] = [
  {
    id: 'pub-syarat',
    title: 'Apa saja syarat berkas yang wajib disiapkan?',
    badge: 'Syarat Berkas',
    prompt: 'Apa saja berkas persyaratan yang wajib saya siapkan untuk mendaftar?',
  },
  {
    id: 'pub-biaya',
    title: 'Berapa biaya pendaftaran & apakah bisa dicicil?',
    badge: 'Biaya',
    prompt: 'Berapa biaya pendaftarannya dan bagaimana cara pembayarannya?',
  },
  {
    id: 'pub-jadwal',
    title: 'Kapan batas akhir pendaftaran & sisa kuota?',
    badge: 'Jadwal',
    prompt: 'Kapan batas akhir pendaftaran gelombang ini dan berapa sisa kuotanya?',
  },
  {
    id: 'pub-kartu',
    title: 'Bagaimana cara cek status & cetak kartu?',
    badge: 'Kartu Peserta',
    prompt: 'Bagaimana cara mengecek status pendaftaran dan mencetak kartu peserta?',
  },
];

export function AiAssistantDrawer({
  mode,
  schoolName,
  schoolSlug,
  brandColor,
  bottomOffsetClass = 'bottom-5 right-5',
}: {
  mode: 'ADMIN' | 'PUBLIC';
  schoolName: string;
  schoolSlug?: string;
  brandColor: string;
  bottomOffsetClass?: string;
}) {
  const presets = mode === 'ADMIN' ? ADMIN_PROMPTS : PUBLIC_PROMPTS;
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'prompts'>('chat');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text:
        mode === 'ADMIN'
          ? `Halo Admin ${schoolName}! Saya Asisten AI SPMB Anda. Tanya apa saja seputar pengelolaan pendaftaran, atau pilih template di tab "Pustaka Prompt" untuk membuat pesan WA & pengumuman dalam 1 klik.`
          : `Halo! Saya Asisten Informasi Pendaftaran ${schoolName}. Ada yang bisa saya bantu seputar syarat berkas, jadwal, biaya, atau cara cetak kartu peserta?`,
    },
  ]);

  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, activeTab]);

  async function sendPrompt(textToSend: string) {
    const clean = textToSend.trim();
    if (!clean || loading) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      text: clean,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setActiveTab('chat');
    setLoading(true);

    try {
      const originUrl =
        typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          slug: schoolSlug,
          prompt: clean,
          originUrl,
        }),
      });
      const data = await res.json();
      const replyText = res.ok
        ? data.reply
        : data.error || 'Maaf, asisten AI belum dapat menjawab saat ini.';

      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          role: 'assistant',
          text: replyText,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          text: 'Koneksi ke server terputus. Silakan periksa jaringan Anda dan coba lagi.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleShareWa(text: string) {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  }

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{ backgroundColor: brandColor }}
          className={`fixed ${bottomOffsetClass} z-40 inline-flex items-center gap-2 rounded-full px-4 py-3 text-xs font-bold text-white shadow-lg transition-transform hover:scale-105 cursor-pointer print:hidden`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{mode === 'ADMIN' ? 'Asisten AI & Prompt' : 'Tanya AI Pendaftaran'}</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[82vh] print:hidden">
          <div
            style={{ backgroundColor: brandColor }}
            className="px-5 py-4 text-white flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-extrabold truncate">
                  {mode === 'ADMIN' ? 'Asisten AI Panitia SPMB' : `Asisten AI ${schoolName}`}
                </p>
                <p className="text-[11px] text-white/85 truncate">
                  {mode === 'ADMIN'
                    ? 'Tanya & Generator Teks Siap Pakai'
                    : 'Info Syarat, Jadwal & Biaya 24/7'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-xl bg-white/15 hover:bg-white/25 p-1.5 text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 bg-slate-50 border-b border-slate-200 p-1.5 gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              Tanya Asisten AI
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('prompts')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'prompts'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-teal-600" />
              Pustaka Prompt ({presets.length})
            </button>
          </div>

          {activeTab === 'chat' && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FAFC] min-h-[260px]">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      m.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      style={m.role === 'user' ? { backgroundColor: brandColor } : undefined}
                      className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-line ${
                        m.role === 'user'
                          ? 'text-white rounded-br-xs shadow-xs'
                          : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs shadow-2xs'
                      }`}
                    >
                      {m.text}
                    </div>

                    {m.role === 'assistant' && m.id !== 'welcome' && (
                      <div className="flex items-center gap-2 mt-1.5 px-1">
                        <button
                          type="button"
                          onClick={() => handleCopy(m.id, m.text)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
                        >
                          {copiedId === m.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700">Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Salin Teks</span>
                            </>
                          )}
                        </button>

                        {mode === 'ADMIN' && (
                          <button
                            type="button"
                            onClick={() => handleShareWa(m.text)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:underline cursor-pointer"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>Kirim ke WA</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="inline-flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-4 py-2.5 text-xs text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" />
                    <span>Asisten AI sedang menyusun jawaban...</span>
                  </div>
                )}
                <div ref={endRef} />
              </div>

              <div className="px-3 pt-2 pb-1 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto">
                {presets.slice(0, 2).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => sendPrompt(p.prompt)}
                    className="shrink-0 rounded-full bg-slate-100 hover:bg-slate-200/80 px-3 py-1 text-[11px] font-semibold text-slate-700 cursor-pointer"
                  >
                    ✨ {p.title}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendPrompt(input);
                }}
                className="p-3 bg-white flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    mode === 'ADMIN'
                      ? 'Ketik pertanyaan atau perintah prompt...'
                      : 'Tanya syarat, biaya, atau jadwal...'
                  }
                  className="flex-1 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-teal-600 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  style={{ backgroundColor: brandColor }}
                  className="rounded-xl p-2.5 text-white hover:opacity-95 disabled:opacity-40 cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}

          {activeTab === 'prompts' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FAFC] min-h-[320px]">
              <p className="text-xs text-slate-500">
                Pilih salah satu perintah siap pakai di bawah ini untuk langsung dijalankan oleh
                Asisten AI, atau ubah kalimatnya sesuai kebutuhan Anda:
              </p>

              {presets.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-white border border-slate-200/90 p-3.5 space-y-2 shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900">{item.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/70 shrink-0">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                    “{item.prompt}”
                  </p>
                  <div className="flex items-center justify-end gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setInput(item.prompt);
                        setActiveTab('chat');
                      }}
                      className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-700 cursor-pointer"
                    >
                      Ubah Prompt
                    </button>
                    <button
                      type="button"
                      onClick={() => sendPrompt(item.prompt)}
                      style={{ backgroundColor: brandColor }}
                      className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-bold text-white hover:opacity-95 cursor-pointer"
                    >
                      <Wand2 className="w-3 h-3" />
                      Jalankan Sekarang
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}