# WeeekOne website

A single-page site for WeeekOne, which gets local businesses online in one week. It's built from the WeeekOne Website PRD. Colours: Midnight Black `#02070A`, Cantaloupe Orange `#FC734D` (buttons and key words) and Electric Blue `#0297DE` (support only).

The whole site is plain HTML in `index.html`, with no build step and no libraries. The only outside request is Google Fonts (Bricolage Grotesque and Figtree).

## Files

| Path | What it is |
| --- | --- |
| `index.html` | The main page: styles, content and a small script |
| `idea-assistant.html` | The AI idea assistant page, with quick picks underneath as a backup |
| `netlify/functions/idea-chat.mjs` | The server function the assistant talks to. It holds the AI instructions and safety limits |
| `netlify.toml`, `package.json` | Netlify settings and the AI SDK the function uses |
| `favicon.svg` | Browser-tab icon (the calendar icon alone) |
| `assets/logo/` | Logo set: horizontal logo (light and dark, with or without a background) and the square icon, as SVG and PNG |
| `assets/og-image.png` | Preview image shown when the link is shared |
| `assets/examples/` | Example design pictures (made-up businesses), also usable in ads and on Instagram |
| `design/examples.html` | Source for those pictures. Edit it, then run `node design/render-examples.js` (needs Playwright) to re-render |

## Before launch

1. **Contact details.** The site shows weeekone@gmail.com and (647) 960-3508. To change them, edit `EMAIL`, `PHONE` and `PHONE_LINK` near the bottom of `index.html`, and the fallback text in the HTML (search for the old value).
2. **Payments.** The FAQ says clients pay by PayPal invoice (card or PayPal) or Interac e-Transfer. Set up the PayPal Business account with a parent before the first invoice.
3. **Founding offer.** Once the 3 spots are taken, remove or update the `#founding` section.
4. **Idea Launch** is on the site at $400 (`#ideas`). Its waitlist sign-ups for clients need a working form, such as Netlify Forms.
5. **Real examples.** After the first clients, replace the made-up example designs with real before/after screenshots and quotes (see the `REAL EXAMPLES` comment). Never use made-up reviews, ratings or numbers.

## Preview locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

- **GitHub Pages:** Settings → Pages → deploy from the branch, root folder. Add a `CNAME` file with `weeekone.ca` once the domain is bought.
- **Netlify:** drag the folder into Netlify, or connect the repo with no build command and publish directory `/`.

Test on 3 phones in both light and dark mode: every button, plus the copy-email button.

## Turning on the AI idea assistant

The assistant page works without any setup: until the AI is switched on, it says so and points visitors to the quick picks under the chat. To switch the AI on:

1. **Deploy from GitHub, not by dragging a folder.** Drag-and-drop deploys can't run the server function. In Netlify: **Add new site → Import an existing project → GitHub → WeeekOne**, pick your branch, and leave the build settings as they are (they come from `netlify.toml`).
2. **Get an Anthropic API key (with a parent).** API accounts are for adults. A parent signs up at console.anthropic.com, adds a small amount of credit, and creates an API key.
3. **Set a monthly spend limit** in the Anthropic Console, for example $10, so the bill can't surprise you.
4. **Add the key to Netlify:** Site configuration → Environment variables → add `ANTHROPIC_API_KEY` with the key as its value. Never put the key in the code or on the page.
5. **Redeploy** (Deploys → Trigger deploy). The assistant now replies.

**What it costs:** the assistant uses Claude Opus 5.5 ($4 per million input tokens, $20 per million output tokens). A full chat of about 5 replies is roughly 10 to 20 cents. Each reply is capped in length and each chat is limited to about 12 back-and-forths, so one visitor can't run up a big bill. A cheaper model can be swapped in by changing `MODEL` in `netlify/functions/idea-chat.mjs`.

**To change how it talks**, edit the `SYSTEM` instructions in `netlify/functions/idea-chat.mjs`.
