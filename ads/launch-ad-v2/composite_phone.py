# Puts the website's example Google listing onto the blank phone screen in scene 2.
# Usage: python3 ads/launch-ad-v2/composite_phone.py
import os
from PIL import Image, ImageDraw

here = os.path.dirname(os.path.abspath(__file__))
scene = Image.open(os.path.join(here, 'scenes', 'scene2.png')).convert('RGB')
listing = Image.open(os.path.join(here, '..', 'launch-ad', 'textures', 'listing.png')).convert('RGB')
W, H = scene.size
px = scene.load()

# Find the bright white screen: the largest run of near-white pixels around the centre.
def white(p): return p[0] > 225 and p[1] > 225 and p[2] > 225
cx, cy = W // 2, int(H * 0.40)
assert white(px[cx, cy]), 'centre of the screen is not white'
left = cx
while left > 0 and white(px[left - 1, cy]): left -= 1
right = cx
while right < W - 1 and white(px[right + 1, cy]): right += 1
top = cy
while top > 0 and white(px[cx, top - 1]): top -= 1
bottom = cy
while bottom < H - 1 and white(px[cx, bottom + 1]): bottom += 1
# Keep the phone's own camera pill: start the listing just below it, and paint the strip above white.
inset = 6
screen = (left + inset, top + inset, right - inset, bottom - inset)
island_gap = 95                                   # space left at the top for the phone's camera pill
listing = listing.crop((0, 100, listing.width, listing.height))   # drop the listing's own status bar and notch
box = (screen[0], screen[1] + island_gap, screen[2], screen[3])
bw, bh = box[2] - box[0], box[3] - box[1]
print('screen', screen, 'listing box', box, 'size', bw, bh)

# Fit the listing to the screen width, cropping the bottom if needed.
scale = bw / listing.width
lw, lh = bw, int(listing.height * scale)
fitted = listing.resize((lw, lh), Image.LANCZOS).crop((0, 0, bw, min(bh, lh)))
fh = fitted.height

# Round only the bottom corners to match the screen.
mask = Image.new('L', (bw, fh), 255)
r = int(bw * 0.09)
corner = Image.new('L', (r * 2, r * 2), 0)
ImageDraw.Draw(corner).pieslice((0, 0, r * 2 - 1, r * 2 - 1), 0, 360, fill=255)
mask.paste(Image.new('L', (r, r), 0), (0, fh - r)); mask.paste(Image.new('L', (r, r), 0), (bw - r, fh - r))
mask.paste(corner.crop((0, r, r, r * 2)), (0, fh - r)); mask.paste(corner.crop((r, r, r * 2, r * 2)), (bw - r, fh - r))
scene.paste(fitted, box[:2], mask)
out = os.path.join(here, 'scenes', 'scene2-listing.png')
scene.save(out)
print('saved', out)
