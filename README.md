# WeeekOne website

A single-page site for WeeekOne, which gets local businesses online in one week. It's built from the WeeekOne Website PRD. Colours: Midnight Black `#02070A`, Cantaloupe Orange `#FC734D` (buttons and key words) and Electric Blue `#0297DE` (support only).

The whole site is plain HTML in `index.html`, with no build step and no libraries. The only outside request is Google Fonts (Bricolage Grotesque and Figtree).

## Files

| Path | What it is |
| --- | --- |
| `index.html` | The page: styles, content and a small script |
| `favicon.svg` | Browser-tab icon (the calendar icon alone) |
| `assets/logo/` | Logo set: horizontal logo (light and dark, with or without a background) and the square icon, as SVG and PNG |
| `assets/og-image.png` | Preview image shown when the link is shared |
| `assets/examples/` | Example design pictures (made-up businesses), also usable in ads and on Instagram |
| `design/examples.html` | Source for those pictures. Edit it, then run `node design/render-examples.js` (needs Playwright) to re-render |

## Before launch

1. **Contact details.** The site shows weeekone@gmail.com and (647) 960-3508. To change them, edit `EMAIL`, `PHONE` and `PHONE_LINK` near the bottom of `index.html`, and the fallback text in the HTML (search for the old value).
2. **Payments.** The FAQ says clients pay by PayPal invoice (card or PayPal) or Interac e-Transfer. Set up the PayPal Business account with a parent before the first invoice.
3. **Founding offer.** Once the 3 spots are taken, remove or update the `#founding` section.
4. **Idea Launch.** Once the first local clients are done and the price is decided ($400 or $600), add it where the `IDEA LAUNCH` comment is.
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
