# WeeekOne ads

## Launch ad (`launch-ad/`)

A 15-second 3D animated ad, 1080×1920 (9:16) for Instagram Reels, TikTok and Stories. Finished video: `launch-ad/weeekone-ad.mp4` (no sound, so you can add music in the app).

| Time | What's on screen |
| --- | --- |
| 0–3 s | 3D WeeekOne calendar spins in: "Customers can't find you online?" |
| 3–6 s | Camera pushes in: "Get your business online in one week." |
| 6–9.5 s | Phone with the example listing rises, OPEN sign swings in, with what you get |
| 9.5–12.5 s | Example designs fan out: "See a free demo of your own site. Pay only if you love it. From $150." |
| 12.5–15 s | End card: WeeekOne, "Get a free demo", weeekone@gmail.com |

The example listing and example designs are labelled as examples, as the PRD's trust rules require.

### Change and re-render

1. Edit the text or timing in `launch-ad/ad.html` (`window.renderFrame` holds the timeline).
2. Install once: `npm install` in this folder (needs Node, Playwright with Chromium, and ffmpeg).
3. If the website's example listing changed: `node capture-textures.js`
4. Check a few moments as stills: `node render.js 1.5 8 14`
5. Render the video (about 2–3 minutes): `node render.js`
