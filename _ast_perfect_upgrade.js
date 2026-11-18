const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const root = process.cwd();

function countSyntaxErrors(fileName, content) {
  const sf = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  return sf.parseDiagnostics ? sf.parseDiagnostics.length : 0;
}

// A. Bersihkan URL tunnel mati di .env agar localhost:3000 tidak mengarah ke domain NXDOMAIN
const envPath = path.join(root, '.env');
if (fs.existsSync(envPath)) {
  let envContent = fs.readFileSync(envPath, 'utf8');
  if (/trycloudflare\.com/.test(envContent)) {
    envContent = envContent.replace(/^NEXT_PUBLIC_APP_URL=.*$/m, 'NEXT_PUBLIC_APP_URL="http://localhost:3000"');
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('OK ENV -> NEXT_PUBLIC_APP_URL direset ke http://localhost:3000 (bebas NXDOMAIN)');
  }
}

// B. Perbaiki & Sinkronkan components/SchoolDashboardClient.tsx dengan validasi AST
const dashPath = path.join(root, 'components/SchoolDashboardClient.tsx');
if (fs.existsSync(dashPath)) {
  let dc = fs.readFileSync(dashPath, 'utf8');

  if (!dc.includes('PortalShowcaseBanner')) {
    dc = dc.replace(
      /^(\s*['"]use client['"];?\r?\n)/,
      "$1import { PortalShowcaseBanner } from '@/components/PortalShowcaseBanner';\n"
    );
  }

  // Pastikan semua link /daftar/ di tombol Cek Tampilan Pendaftar menggunakan path relatif /daftar/${school.slug}
  dc = dc.replace(
    /href=\{`https?:\/\/[^`]*\/daftar\/\$\{school\.slug\}`\}/g,
    'href={`/daftar/${school.slug}`}'
  );
  dc = dc.replace(
    /href=\{`\$\{[a-zA-Z0-9_.]+\}\/daftar\/\$\{school\.slug\}`\}/g,
    'href={`/daftar/${school.slug}`}'
  );

  // Ganti blok PRATINJAU LANGSUNG HEADER PENDAFTAR dengan PortalShowcaseBanner yang 100% tervalidasi tag div-nya oleh TypeScript compiler
  const pIdx = dc.search(/PRATINJAU LANGSUNG HEADER PENDAFTAR/i);
  const fIdx = pIdx !== -1 ? dc.slice(pIdx).search(/Format Nomor Pendaftaran/i) : -1;

  if (pIdx !== -1 && fIdx !== -1) {
    const start = pIdx;
    const end = pIdx + fIdx;
    const before = dc.slice(0, start);
    const sectionOrig = dc.slice(start, end);
    const lastTagOpen = sectionOrig.lastIndexOf('<');
    const after = sectionOrig.slice(lastTagOpen) + dc.slice(end);

    const coreBanner = [
      'PRATINJAU LANGSUNG HEADER PENDAFTAR</p>',
      '              <div className="mb-3">',
      '                <PortalShowcaseBanner',
      '                  compactPreview',
      '                  schoolName={profileForm.name || school.name}',
      '                  jenjangLabel={profileForm.jenjang || ((school as Record<string, unknown>).jenjang as string) || "LEMBAGA PENDIDIKAN"}',
      '                  address={profileForm.address || school.address || ""}',
      '                  logoUrl={profileForm.logoUrl || school.logoUrl || null}',
      '                  bannerUrl={profileForm.bannerUrl || school.bannerUrl || null}',
      '                  activityPhotoUrl={profileForm.schoolPhotoUrl || ((school as Record<string, unknown>).schoolPhotoUrl as string) || null}',
      '                  galleryPhotosJson={JSON.stringify(galleryPhotos)}',
      '                  visionMission={profileForm.visiMisi || ((school as Record<string, unknown>).visiMisi as string) || null}',
      '                  highlights={profileForm.keunggulan || ((school as Record<string, unknown>).keunggulan as string) || null}',
      '                  waveName="Gelombang 1"',
      '                  academicYear="TA 2027/2028"',
      '                  remainingQuota={49}',
      '                  totalQuota={50}',
      '                  isOpen={true}',
      '                />',
      '              </div>',
    ].join('\n');

    // Uji otomatis jumlah pembungkus <div> yang tepat agar jumlah tag <div> dan </div> seimbang (0 syntax error)
    let bestCode = dc;
    for (let openDivs = 0; openDivs <= 4; openDivs++) {
      const wrappers = Array(openDivs).fill('<div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">').join('\n');
      const candidate = before + coreBanner + '\n' + wrappers + '\n' + after;
      if (countSyntaxErrors('SchoolDashboardClient.tsx', candidate) === 0) {
        bestCode = candidate;
        console.log('OK AST -> SchoolDashboardClient.tsx tervalidasi 0 syntax error (wrappers: ' + openDivs + ')');
        break;
      }
    }
    dc = bestCode;
  }

  fs.writeFileSync(dashPath, dc, 'utf8');
}

// C. Perbaiki & Terapkan Semua Poin ke components/PublicRegistrationClient.tsx dengan AST
const pubPath = path.join(root, 'components/PublicRegistrationClient.tsx');
if (fs.existsSync(pubPath)) {
  let pub = fs.readFileSync(pubPath, 'utf8');

  // 1. Bersihkan sisa injeksi rusak di dalam tombol Formulir Pendaftaran Baru (jika ada)
  pub = pub.replace(/<\/div><div className="mb-5"><PortalShowcaseBanner[\s\S]*?\/></div><div>(?=Formulir Pendaftaran Baru)/g, '');

  // Pastikan import PortalShowcaseBanner & DkConfettiBurst ada
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

  const bannerComponentJsx = `<div className="mb-5">
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

  // 2. Gunakan AST untuk mencari JsxElement header statis lama (yang memuat "Pendaftaran Dibuka" / "Sisa Kuota" tapi BUKAN "Formulir Pendaftaran Baru")
  if (!pub.includes('<PortalShowcaseBanner')) {
    const sf = ts.createSourceFile('PublicRegistrationClient.tsx', pub, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    let oldHeaderNode = null;
    let tabSwitcherNode = null;

    function visit(node) {
      if (ts.isJsxElement(node)) {
        const text = node.getText(sf);
        if (
          text.includes('Pendaftaran Dibuka') &&
          !text.includes('Formulir Pendaftaran Baru') &&
          !text.includes('Pilih Jalur Pendaftaran')
        ) {
          if (!oldHeaderNode) oldHeaderNode = node;
        }
        if (
          text.includes('Formulir Pendaftaran Baru') &&
          text.includes('Cek Status') &&
          !text.includes('Pilih Jalur Pendaftaran')
        ) {
          tabSwitcherNode = node;
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(sf);

    if (oldHeaderNode) {
      const s = oldHeaderNode.getStart(sf);
      const e = oldHeaderNode.getEnd();
      const candidate = pub.slice(0, s) + bannerComponentJsx + pub.slice(e);
      if (countSyntaxErrors('PublicRegistrationClient.tsx', candidate) === 0) {
        pub = candidate;
        console.log('OK AST -> Header statis lama diganti dengan PortalShowcaseBanner di PublicRegistrationClient.tsx');
      }
    } else if (tabSwitcherNode) {
      const s = tabSwitcherNode.getStart(sf);
      const candidate = pub.slice(0, s) + bannerComponentJsx + '\n        ' + pub.slice(s);
      if (countSyntaxErrors('PublicRegistrationClient.tsx', candidate) === 0) {
        pub = candidate;
        console.log('OK AST -> PortalShowcaseBanner disisipkan di atas Tab Switcher di PublicRegistrationClient.tsx');
      }
    }
  }

  // 3. Gunakan AST untuk memperbaiki tombol Lanjut (lebar penuh di HP) & tombol melayang AI/WA (bulat 46x46 px anti-tertutup)
  // Ringkas teks label di dalam tombol AI & WA jika masih teks panjang biasa
  if (!pub.includes('<span className="sm:hidden text-xs font-extrabold">AI</span>')) {
    pub = pub.replace(
      />\s*Tanya AI Pendaftaran\s*</g,
      '><span className="hidden sm:inline">Tanya AI Pendaftaran</span><span className="sm:hidden text-xs font-extrabold">AI</span><'
    );
  }
  if (!pub.includes('<span className="sm:hidden text-xs font-extrabold">WA</span>')) {
    pub = pub.replace(
      />\s*Bantuan Panitia \(WA\)\s*</g,
      '><span className="hidden sm:inline">Bantuan Panitia (WA)</span><span className="sm:hidden text-xs font-extrabold">WA</span><'
    );
  }

  // Pastikan container tombol melayang berada di pojok kanan bawah dengan pointer-events-none dan tombol di dalamnya pointer-events-auto
  pub = pub.replace(
    /className="fixed bottom-[^"]*"/g,
    'className="fixed bottom-3.5 right-3.5 z-30 flex flex-row sm:flex-col items-center sm:items-end gap-2 pointer-events-none"'
  );

  // Pastikan semua tombol yang berada di area floating memiliki pointer-events-auto & ukuran ringkas di HP
  pub = pub.replace(
    /className="([^"]*rounded-full[^"]*shadow-(?:lg|xl)[^"]*)"/g,
    (full, cls) => {
      if (cls.includes('pointer-events-auto')) return full;
      return 'className="pointer-events-auto h-[46px] px-3.5 sm:px-4 ' + cls + '"';
    }
  );

  // Buat tombol Lanjut -> lebar penuh di layar HP (w-full sm:w-auto justify-center)
  pub = pub.replace(
    /className="([^"]*)"(\s*>\s*Lanjut)/g,
    (full, cls, tail) => {
      if (cls.includes('w-full')) return full;
      return 'className="w-full sm:w-auto justify-center py-3.5 ' + cls + '"' + tail;
    }
  );

  console.log('FINAL CHECK PublicRegistrationClient.tsx syntax errors:', countSyntaxErrors('PublicRegistrationClient.tsx', pub));
  console.log('FINAL CHECK SchoolDashboardClient.tsx syntax errors:', countSyntaxErrors('SchoolDashboardClient.tsx', fs.readFileSync(dashPath, 'utf8')));

  fs.writeFileSync(pubPath, pub, 'utf8');
}