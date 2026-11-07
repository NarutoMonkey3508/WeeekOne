// Renders ads/launch-ad/ad.html to ads/launch-ad/weeekone-ad.mp4 (1080x1920, 30 fps, 15 s).
// Usage: node render.js            full video
//        node render.js 1.5 4.5    just those moments, as PNG stills (for checking)
const { chromium } = require('playwright'); const serve = require('./serve');
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const FPS = 30, SECONDS = 15, dir = path.join(__dirname, 'launch-ad');
(async () => {
  const srv = await serve();
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.error('page error:', e.message));
  await p.goto('http://localhost:8799/ads/launch-ad/ad.html', { waitUntil: 'networkidle' });
  await p.evaluate(() => window.ready);
  const stills = process.argv.slice(2).map(Number);
  if (stills.length) {
    for (const t of stills) { await p.evaluate(t => renderFrame(t), t); await p.screenshot({ path: path.join(dir, `still-${t}.png`) }); }
  } else {
    const fdir = path.join(dir, 'frames'); fs.rmSync(fdir, { recursive: true, force: true }); fs.mkdirSync(fdir);
    const n = FPS * SECONDS, t0 = Date.now();
    for (let i = 0; i < n; i++) {
      await p.evaluate(t => renderFrame(t), i / FPS);
      await p.screenshot({ path: path.join(fdir, `f${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 92 });
      if (i % 60 === 0) console.log(`frame ${i}/${n} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
    }
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(fdir, 'f%04d.jpg'),
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(dir, 'weeekone-ad.mp4')]);
    console.log('done:', path.join(dir, 'weeekone-ad.mp4'));
  }
  await b.close(); srv.close();
})();
