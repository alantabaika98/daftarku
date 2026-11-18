const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');
let urlSaved = false;

console.log('Menghubungkan Cloudflare Tunnel ke http://localhost:3000 ...');

const cf = spawn('npx', ['--yes', 'cloudflared', 'tunnel', '--url', 'http://localhost:3000'], {
  shell: true,
  stdio: ['ignore', 'pipe', 'pipe'],
});

function handleOutput(chunk) {
  const text = chunk.toString();
  if (!urlSaved) {
    const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
    if (match) {
      const liveUrl = match[0];
      urlSaved = true;
      let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
      if (/^NEXT_PUBLIC_APP_URL=/m.test(envContent)) {
        envContent = envContent.replace(/^NEXT_PUBLIC_APP_URL=.*$/m, `NEXT_PUBLIC_APP_URL="${liveUrl}"`);
      } else {
        envContent = envContent.trimEnd() + `\nNEXT_PUBLIC_APP_URL="${liveUrl}"\n`;
      }
      fs.writeFileSync(envPath, envContent, 'utf8');
      console.log('\n==================================================================');
      console.log('BERHASIL! TUNNEL AKTIF & OTOMATIS TERPASANG KE DAFTARKU:');
      console.log('Portal Pendaftar : ' + liveUrl + '/daftar/sma-nusantara');
      console.log('Dashboard Admin  : ' + liveUrl + '/dashboard');
      console.log('Biarkan tab ini tetap terbuka selama pengujian!');
      console.log('==================================================================\n');
    }
  }
}

cf.stdout.on('data', handleOutput);
cf.stderr.on('data', handleOutput);
cf.on('close', (code) => {
  console.log('Koneksi tunnel terhenti (kode: ' + code + '). Jalankan ulang jika masih diperlukan.');
});