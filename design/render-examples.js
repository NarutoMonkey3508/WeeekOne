// Renders each mockup in design/examples.html to assets/examples/<id>.jpg
// Usage: node design/render-examples.js
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const root = path.resolve(__dirname, '..');
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1100, height: 900 }, deviceScaleFactor: 1.6 });
  await p.goto('file://' + path.join(root, 'design/examples.html'), { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  for (const id of ['barber', 'bakery', 'cafe', 'tutor']) {
    await p.locator('#' + id).screenshot({ path: path.join(root, 'assets/examples', id + '.jpg'), type: 'jpeg', quality: 82 });
  }
  await b.close();
})();
