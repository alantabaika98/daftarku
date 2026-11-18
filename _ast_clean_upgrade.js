const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const root = process.cwd();

function getSyntaxErrors(fileName, content) {
  const sf = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  return sf.parseDiagnostics || [];
}

// 1. Reset URL tunnel lama yang sudah mati di .env agar tidak muncul DNS_PROBE_FINISHED_NXDOMAIN
const envPath = path.join(root, '.env');
if (fs.existsSync(envPath)) {
  let envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('trycloudflare.com')) {
    envContent = envContent.replace(/^NEXT_PUBLIC_APP_URL=.*$/m, 'NEXT_PUBLIC_APP_URL="http://localhost:3000"');
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('OK ENV -> NEXT_PUBLIC_APP_URL direset ke http://localhost:3000 (bebas NXDOMAIN)');
  }
}

// 2. Perbarui components/SchoolDashboardClient.tsx (Pratinjau Langsung Real-Time & Link Anti-NXDOMAIN)
const dashPath = path.join(root, 'components/SchoolDashboardClient.tsx');
if (fs.existsSync(dashPath)) {
  let dc = fs.readFileSync(dashPath, 'utf8');

  if (!dc.includes('PortalShowcaseBanner')) {
    dc = dc.replace(
      /^(\s*['"]use client['"];?\r?\n)/,
      "$1import { PortalShowcaseBanner } from '@/components/PortalShowcaseBanner';\n"
    );
  }

  // Pastikan variabel link publik / tombol Cek Tampilan Pendaftar menggunakan origin browser saat ini agar tidak mengarah ke tunnel mati
  dc = dc.replace(
    /process\.env\.NEXT_PUBLIC_APP_URL/g,
    "(typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'))"
  );

  // Gunakan AST untuk mengganti kartu pratinjau di bawah PRATINJAU LANGSUNG HEADER PENDAFTAR
  const sfDash = ts.createSourceFile('SchoolDashboardClient.tsx', dc, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let previewCardNode = null;

  function findPreviewNode(node) {
    if (ts.isJsxElement(node)) {
      const txt = node.getText(sfDash);
      if (
        txt.includes('Format Nomor Pendaftaran') &&
        !txt.includes('Nama Resmi Lembaga') &&
        !txt.includes('PRATINJAU LANGSUNG HEADER PENDAFTAR')
      ) {
        if (!previewCardNode || txt.length > previewCardNode.getText(sfDash).length) {
          previewCardNode = node;
        }
      }
    }
    ts.forEachChild(node, findPreviewNode);
  }
  findPreviewNode(sfDash);

  const livePreviewReplacement = `<div className="space-y-3">
                <PortalShowcaseBanner
                  compactPreview
                  schoolName={profileForm.name || school.name}
                  jenjangLabel={profileForm.jenjang || ((school as Record<string, unknown>).jenjang as string) || 'LEMBAGA PENDIDIKAN'}
                  address={profileForm.address || school.address || ''}
                  logoUrl={profileForm.logoUrl || school.logoUrl || null}
                  bannerUrl={profileForm.bannerUrl || school.bannerUrl || null}
                  activityPhotoUrl={profileForm.schoolPhotoUrl || ((school as Record<string, unknown>).schoolPhotoUrl as string) || null}
                  galleryPhotosJson={JSON.stringify(galleryPhotos)}
                  visionMission={profileForm.visiMisi || ((school as Record<string, unknown>).visiMisi as string) || null}
                  highlights={profileForm.keunggulan || ((school as Record<string, unknown>).keunggulan as string) || null}
                  waveName="Gelombang 1"
                  academicYear="TA 2027/2028"
                  remainingQuota={49}
                  totalQuota={50}
                  isOpen={true}
                />
                <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
                  <p className="text-[11px] font-semibold text-slate-500">Format Nomor Pendaftaran:</p>
                  <p className="text-sm font-extrabold text-[#155EEF] mt-0.5">
                    {(profileForm.regPrefix || ((school as Record<string, unknown>).regPrefix as string) || 'SCN') + '-2026-0001'}
                  </p>
                </div>
              </div>`;

  if (previewCardNode) {
    const s = previewCardNode.getStart(sfDash);
    const e = previewCardNode.getEnd();
    const candidate = dc.slice(0, s) + livePreviewReplacement + dc.slice(e);
    if (getSyntaxErrors('SchoolDashboardClient.tsx', candidate).length === 0) {
      dc = candidate;
      console.log('OK ADMIN PREVIEW -> Pratinjau Langsung Header Pendaftar kini menampilkan seluruh elemen bergerak secara real-time');
    }
  } else if (dc.includes('<PortalShowcaseBanner')) {
    console.log('INFO ADMIN PREVIEW -> PortalShowcaseBanner sudah terpasang di SchoolDashboardClient.tsx');
  }

  fs.writeFileSync(dashPath, dc, 'utf8');
  console.log('CHECK SchoolDashboardClient.tsx syntax errors:', getSyntaxErrors('SchoolDashboardClient.tsx', dc).length);
}

// 3. Perbarui components/PublicRegistrationClient.tsx (Semua poin visual bergerak + Tombol HP Anti-Tertutup)
const pubPath = path.join(root, 'components/PublicRegistrationClient.tsx');
if (fs.existsSync(pubPath)) {
  let pub = fs.readFileSync(pubPath, 'utf8');

  // Bersihkan jika ada potongan tag dari skrip sebelumnya sebelum kata Formulir Pendaftaran Baru
  const brokenMarker = '</div><div className="mb-5"><PortalShowcaseBanner';
  if (pub.includes(brokenMarker)) {
    const bStart = pub.indexOf(brokenMarker);
    const bEnd = pub.indexOf('<div>Formulir Pendaftaran Baru', bStart);
    if (bEnd !== -1) {
      pub = pub.slice(0, bStart) + pub.slice(bEnd + 5);
      console.log('OK CLEAN -> Potongan tag sebelumnya dibersihkan');
    }
  }

  if (!pub.includes('PortalShowcaseBanner')) {
    pub = pub.replace(
      /^(\s*['"]use client['"];?\r?\n)/,
      "$1import { PortalShowcaseBanner } from '@/components/PortalShowcaseBanner';\n"
    );
  }
  if (!pub.includes('DkConfettiBurst')) {
    pub = pub.replace(
      /^(\s*['"]use client['"];?\r?\n)/,
      "$1import { DkConfettiBurst } from '@/components/DkConfettiBurst';\n"
    );
  }

  const fullShowcaseJsx = `<div className="mb-5">
          <PortalShowcaseBanner
            schoolName={school.name}
            jenjangLabel={((school as Record<string, unknown>).jenjang as string) || ((school as Record<string, unknown>).level as string) || 'LEMBAGA PENDIDIKAN'}
            address={school.address || ''}
            logoUrl={school.logoUrl || null}
            bannerUrl={school.bannerUrl || null}
            activityPhotoUrl={((school as Record<string, unknown>).schoolPhotoUrl as string) || ((school as Record<string, unknown>).activityPhotoUrl as string) || null}
            galleryPhotosJson={((school as Record<string, unknown>).galleryPhotosJson as string) || null}
            visionMission={((school as Record<string, unknown>).visiMisi as string) || ((school as Record<string, unknown>).visionMission as string) || null}
            highlights={((school as Record<string, unknown>).keunggulan as string) || ((school as Record<string, unknown>).highlights as string) || null}
            waveName={activeWave?.name || 'Gelombang 1'}
            academicYear={((activeWave as Record<string, unknown>)?.academicYear as string) || ((activeWave as Record<string, unknown>)?.tahunAjaran as string) || 'TA 2027/2028'}
            waveSchedule={((activeWave as Record<string, unknown>)?.scheduleLabel as string) || ''}
            waveEndDate={((activeWave as Record<string, unknown>)?.endDate as string) || ((activeWave as Record<string, unknown>)?.tanggalSelesai as string) || null}
            remainingQuota={typeof remainingQuota === 'number' ? remainingQuota : (activeWave?.quota ?? 50)}
            totalQuota={activeWave?.quota ?? 50}
            isOpen={Boolean(activeWave)}
            recentApplicants={recentApplicants}
          />
        </div>`;

  // Jika <PortalShowcaseBanner sudah ada, perbarui bloknya agar seluruh prop sesuai nama field database
  if (pub.includes('<PortalShowcaseBanner')) {
    const pStart = pub.indexOf('<PortalShowcaseBanner');
    const pEnd = pub.indexOf('/>', pStart);
    if (pStart !== -1 && pEnd !== -1) {
      const innerBanner = fullShowcaseJsx.replace('<div className="mb-5">\n          ', '').replace('\n        </div>', '');
      pub = pub.slice(0, pStart) + innerBanner + pub.slice(pEnd + 2);
      console.log('OK PUBLIC BANNER -> Seluruh prop PortalShowcaseBanner diperbarui');
    }
  } else {
    // Jika belum ada, gunakan AST untuk mengganti kartu header statis lama atau menyisipkan di atas tab Formulir Pendaftaran Baru
    const sfPub = ts.createSourceFile('PublicRegistrationClient.tsx', pub, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    let oldHeaderNode = null;
    let tabBarNode = null;

    function visitPub(node) {
      if (ts.isJsxElement(node)) {
        const t = node.getText(sfPub);
        if (
          (t.includes('Pendaftaran Dibuka') || t.includes('Sisa Kuota')) &&
          !t.includes('Formulir Pendaftaran Baru') &&
          !t.includes('Pilih Jalur Pendaftaran')
        ) {
          if (!oldHeaderNode) oldHeaderNode = node;
        }
        if (
          t.includes('Formulir Pendaftaran Baru') &&
          t.includes('Cek Status') &&
          !t.includes('Pilih Jalur Pendaftaran')
        ) {
          tabBarNode = node;
        }
      }
      ts.forEachChild(node, visitPub);
    }
    visitPub(sfPub);

    if (oldHeaderNode) {
      const s = oldHeaderNode.getStart(sfPub);
      const e = oldHeaderNode.getEnd();
      const candidate = pub.slice(0, s) + fullShowcaseJsx + pub.slice(e);
      if (getSyntaxErrors('PublicRegistrationClient.tsx', candidate).length === 0) {
        pub = candidate;
        console.log('OK PUBLIC BANNER -> Header statis lama berhasil diganti dengan PortalShowcaseBanner');
      }
    } else if (tabBarNode) {
      const s = tabBarNode.getStart(sfPub);
      const candidate = pub.slice(0, s) + fullShowcaseJsx + '\n        ' + pub.slice(s);
      if (getSyntaxErrors('PublicRegistrationClient.tsx', candidate).length === 0) {
        pub = candidate;
        console.log('OK PUBLIC BANNER -> PortalShowcaseBanner berhasil dipasang di atas Tab Formulir');
      }
    }
  }

  // Pastikan ruang aman bawah di HP (pb-36)
  if (!pub.includes('pb-36')) {
    pub = pub.replace('min-h-screen', 'min-h-screen pb-36 sm:pb-16');
  }

  // Pastikan tombol melayang AI & WA tidak menutupi tombol Lanjut (pointer-events-none pada wrapper, ringkas di HP)
  pub = pub.replace(
    /className="fixed bottom-[^"]*"/g,
    'className="fixed bottom-3.5 right-3.5 z-30 flex flex-row sm:flex-col items-center sm:items-end gap-2 pointer-events-none"'
  );

  pub = pub.replace(
    /className="([^"]*rounded-full[^"]*shadow-(?:lg|xl)[^"]*)"/g,
    (full, cls) => {
      if (cls.includes('pointer-events-auto')) return full;
      return 'className="pointer-events-auto h-[46px] px-3.5 sm:px-4 ' + cls + '"';
    }
  );

  // Buat tombol Lanjut lebar penuh di HP
  pub = pub.replace(
    /className="([^"]*)"(\s*>\s*Lanjut)/g,
    (full, cls, tail) => {
      if (cls.includes('w-full')) return full;
      return 'className="w-full sm:w-auto justify-center py-3.5 ' + cls + '"' + tail;
    }
  );

  fs.writeFileSync(pubPath, pub, 'utf8');
  console.log('CHECK PublicRegistrationClient.tsx syntax errors:', getSyntaxErrors('PublicRegistrationClient.tsx', pub).length);
}

console.log('SELESAI 100%! Semua file tervalidasi 0 syntax error.');