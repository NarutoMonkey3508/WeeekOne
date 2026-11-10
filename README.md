# WeeekOne website

A single-page site for WeeekOne, which gets local businesses online in one week. It's built from the WeeekOne Website PRD. Colours: Midnight Black `#02070A`, Cantaloupe Orange `#FC734D` (buttons and key words) and Electric Blue `#0297DE` (support only).

The whole site is plain HTML in `index.html`, with no build step and no libraries. The only outside request is Google Fonts (Bricolage Grotesque and Figtree).

## How the site is organised

The home page asks one question: **do you have a business, or an idea?** Each visitor then sees only their path.

| Link | What it shows |
| --- | --- |
| `/` | Home: the two choices |
| `/#business` | Business path: free demo, examples, Starter and Launch prices, founding offer. **Use this link in ads for local businesses.** |
| `/#idea` | Idea path: Idea Launch, the AI idea assistant, idea questions |
| `/idea-assistant.html` | The AI idea assistant |

In `index.html`, every section is tagged `data-for="business"`, `data-for="idea"` or both. A link to any section (like `/#prices`) opens the right path automatically.

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

1. **Contact details.** The site shows weeekone@gmail.com, and no phone number, so nobody calls out of the blue. To change the email, edit `EMAIL` near the bottom of `index.html` and `idea-assistant.html`, and the fallback text in the HTML (search for the old value).
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

## Booking a time to talk

The site never shows a phone number. Instead, people book a call at a time you've chosen. Until a booking link is set, the site asks them to email you to pick a time.

To turn on booking (free, with the WeeekOne Gmail account):

1. Open **Google Calendar** on a computer, signed in as weeekone@gmail.com.
2. Click **Create → Appointment schedule**.
3. Name it "Free 15-minute chat with WeeekOne" and set **15 minutes**.
4. Under **General availability**, add only times you're really free (for example, weekdays 4–6 PM).
5. In **Booking window**, set the **minimum notice to 24 hours**, so nobody can book a call in the next hour.
6. Add **buffer time** of 10 minutes and a **maximum of 2 bookings per day**.
7. Under **Location**, choose **Google Meet video conferencing** (or "phone call: I'll call you", if you prefer to make the call yourself).
8. Under **Booking form**, keep name and email, and add a question: "What's your business or idea?"
9. Save, click **Share → Copy link**, and paste the link between the quotes in `const BOOKING_URL = "";` in both `index.html` and `idea-assistant.html`.

Google sends you and the visitor a confirmation and a reminder, and the call shows up in your calendar.

## Instagram

The WeeekOne Instagram is **@weeek_one**. To change it, edit the username (without the @) in `const INSTAGRAM = "weeek_one";` in both `index.html` and `idea-assistant.html`. A "Message @username" button then appears in the contact section, the send box and the footer. It opens a direct message on Instagram.

Use the calendar icon (`assets/logo/weeekone-icon.png`) as the profile picture, as the PRD's logo rules say.
