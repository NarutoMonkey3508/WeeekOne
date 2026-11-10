// Renders ads/launch-ad/ad.html to ads/launch-ad/weeekone-ad.mp4 (1080x1920, 30 fps) with the voiceover in launch-ad/voice/.
// Usage: node render.js            full video (AD=launch-ad-v2 node render.js for the v2 ad)
//        node render.js 1.5 4.5    just those moments, as PNG stills (for checking)
const { chromium } = require('playwright'); const serve = require('./serve');
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const FPS = 30, AD = process.env.AD || 'launch-ad', dir = path.join(__dirname, AD);
(async () => {
  const srv = await serve();
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.error('page error:', e.message));
  await p.goto(`http://localhost:8799/ads/${AD}/ad.html`, { waitUntil: 'networkidle' });
  await p.evaluate(() => window.ready);
  const { DURATION, VOICE_STARTS } = await p.evaluate(() => ({ DURATION: window.DURATION, VOICE_STARTS: window.VOICE_STARTS }));
  console.log('duration', DURATION.toFixed(2), 's');
  const stills = process.argv.slice(2).map(Number);
  if (stills.length) {
    for (const t of stills) { await p.evaluate(t => renderFrame(t), t); await p.screenshot({ path: path.join(dir, `still-${t}.png`) }); }
  } else {
    const fdir = path.join(dir, 'frames'); fs.rmSync(fdir, { recursive: true, force: true }); fs.mkdirSync(fdir);
    const n = Math.round(FPS * DURATION), t0 = Date.now();
    for (let i = 0; i < n; i++) {
      await p.evaluate(t => renderFrame(t), i / FPS);
      await p.screenshot({ path: path.join(fdir, `f${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 92 });
      if (i % 60 === 0) console.log(`frame ${i}/${n} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
    }
    // Voiceover: each line placed at its start time, mixed, then normalised to social-media loudness
    const ids = Object.keys(VOICE_STARTS), vdir = path.join(dir, 'voice');
    const inputs = ids.flatMap(id => ['-i', path.join(vdir, id + '.wav')]);
    const delays = ids.map((id, i) => `[${i + 1}]adelay=${Math.round(VOICE_STARTS[id] * 1000)}:all=1[a${i}]`).join(';');
    const mix = `${delays};${ids.map((_, i) => `[a${i}]`).join('')}amix=inputs=${ids.length}:normalize=0,apad,loudnorm=I=-14:TP=-1.5:LRA=11[aout]`;
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(fdir, 'f%04d.jpg'), ...inputs,
      '-filter_complex', mix, '-map', '0:v', '-map', '[aout]', '-t', DURATION.toFixed(3),
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
      '-movflags', '+faststart', path.join(dir, 'weeekone-ad.mp4')]);
    console.log('done:', path.join(dir, 'weeekone-ad.mp4'));
  }
  await b.close(); srv.close();
})();
