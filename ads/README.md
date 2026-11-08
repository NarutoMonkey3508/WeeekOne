# WeeekOne ads

## Launch ad (`launch-ad/`)

A 29-second 3D animated ad with an AI voiceover, 1080×1920 (9:16) for Instagram Reels, TikTok and Stories. Finished video: `launch-ad/weeekone-ad.mp4`.

The voice is made with Kokoro, an open-source neural text-to-speech model, so there's no account or cost. Each scene is timed to its spoken line.

| Scene | Voiceover | On screen |
| --- | --- | --- |
| Hook | "Customers can't find you online?" | 3D calendar spins in |
| One week | "I'm Week One. I get local businesses online in one week." | Push-in, "one week." |
| What you get | "Your website, your Google Maps listing, Instagram, even your logo and menu." | Phone with example listing, OPEN sign, chips |
| Free demo | "Here's how it works. Send me a few details, and within three days, I'll make a free demo of your own site." | Example designs fan out |
| Steps | "Love it? Pick a package, from a hundred and fifty dollars, and you're live in about a week. Don't love it? You don't pay a thing." | The 4 steps, "You pay nothing." |
| End | "Get your free demo. Just email me today." | WeeekOne, "Get a free demo", weeekone@gmail.com |

The script says "Week One" so the voice pronounces the name right. The example listing and example designs are labelled as examples, as the PRD's trust rules require.

### Change the voice or the words

1. Edit `launch-ad/voice/script.json`: the lines, the `voice` (for example `af_heart`, `af_bella`, `am_michael`, `am_puck`, `bm_george`) and the `speed`.
2. Set up Kokoro once in a Python virtual environment: `pip install kokoro-onnx soundfile`, then download `kokoro-v1.0.onnx` and `voices-v1.0.bin` from the kokoro-onnx GitHub releases into one folder.
3. Generate the lines: `python voice.py <that folder>`
4. Re-render (below). The video length and scene timing follow the new lines automatically.

### Change and re-render

1. Edit the text or timing in `launch-ad/ad.html` (`window.renderFrame` holds the timeline).
2. Install once: `npm install` in this folder (needs Node, Playwright with Chromium, and ffmpeg).
3. If the website's example listing changed: `node capture-textures.js`
4. Check a few moments as stills: `node render.js 1.5 8 14`
5. Render the video with the voiceover (about 3–4 minutes): `node render.js`
