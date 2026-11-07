// Captures the example listing phone screen from the website as a texture for the ad.
const { chromium } = require('playwright'); const serve = require('./serve');
(async () => {
  const srv = await serve(); const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 1000 }, deviceScaleFactor: 3, colorScheme: 'light' });
  await p.goto('http://localhost:8799/index.html', { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready);
  await p.addStyleTag({ content: '.open-sign, .example-tag { display: none !important; }' });
  const box = await p.locator('.screen').boundingBox(); console.log('screen size', box.width, box.height);
  await p.locator('.screen').screenshot({ path: __dirname + '/launch-ad/textures/listing.png', omitBackground: true });
  await b.close(); srv.close();
})();
