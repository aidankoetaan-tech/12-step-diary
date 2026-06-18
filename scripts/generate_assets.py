#!/usr/bin/env python3
"""Generate app icon assets without external image libraries.

Motif: 12 dots in a ring (one per step) with the top dot emphasized and a
center dot, on the app's deep indigo background. Outputs:
  assets/icon.png                       1024x1024, full background
  assets/android-icon-foreground.png    1024x1024, transparent, safe-zone scaled
  assets/android-icon-background.png    1024x1024, solid background
  assets/android-icon-monochrome.png    1024x1024, white motif on transparent
  assets/favicon.png                    64x64
  store/play-icon.png                   512x512 Play Store listing icon
  store/feature-graphic.png             1024x500 Play Store feature graphic
"""
import math
import os
import struct
import zlib

BG_TOP = (17, 17, 58)
BG_BOTTOM = (10, 10, 33)
BG_FLAT = (13, 13, 43)  # #0D0D2B
PRIMARY = (124, 111, 247)  # #7C6FF7
LIGHT = (234, 234, 255)  # #EAEAFF
GOLD = (244, 197, 107)  # #F4C56B — milestone medallion accent
WHITE = (255, 255, 255)

OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets')


def write_png(path, width, height, pixels):
    """pixels: flat list of (r, g, b, a) tuples, row-major."""
    raw = bytearray()
    for y in range(height):
        raw.append(0)  # no filter
        for x in range(width):
            raw.extend(pixels[y * width + x])

    def chunk(tag, data):
        block = tag + data
        return struct.pack('>I', len(data)) + block + struct.pack('>I', zlib.crc32(block))

    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    png = (
        b'\x89PNG\r\n\x1a\n'
        + chunk(b'IHDR', ihdr)
        + chunk(b'IDAT', zlib.compress(bytes(raw), 9))
        + chunk(b'IEND', b'')
    )
    with open(path, 'wb') as f:
        f.write(png)
    print(f'wrote {os.path.relpath(path)} ({width}x{height})')


def gradient_canvas(size, top, bottom):
    pixels = []
    for y in range(size):
        t = y / (size - 1)
        row = (
            round(top[0] + (bottom[0] - top[0]) * t),
            round(top[1] + (bottom[1] - top[1]) * t),
            round(top[2] + (bottom[2] - top[2]) * t),
            255,
        )
        pixels.extend([row] * size)
    return pixels


def flat_canvas(size, color, alpha):
    return [(color[0], color[1], color[2], alpha)] * (size * size)


def blend_dot(pixels, size, cx, cy, r, color, opacity=1.0):
    """Draw an antialiased filled circle, only touching its bounding box."""
    feather = max(1.5, size / 512)
    x0 = max(0, int(cx - r - feather - 1))
    x1 = min(size - 1, int(cx + r + feather + 1))
    y0 = max(0, int(cy - r - feather - 1))
    y1 = min(size - 1, int(cy + r + feather + 1))
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            dist = math.hypot(x + 0.5 - cx, y + 0.5 - cy)
            cov = min(1.0, max(0.0, (r + feather / 2 - dist) / feather))
            if cov <= 0:
                continue
            a = cov * opacity
            pr, pg, pb, pa = pixels[y * size + x]
            na = a + (pa / 255) * (1 - a)
            if na <= 0:
                continue
            nr = (color[0] * a + pr * (pa / 255) * (1 - a)) / na
            ng = (color[1] * a + pg * (pa / 255) * (1 - a)) / na
            nb = (color[2] * a + pb * (pa / 255) * (1 - a)) / na
            pixels[y * size + x] = (round(nr), round(ng), round(nb), round(na * 255))


def draw_motif(pixels, size, scale, color, accent):
    """12 dots in a ring, top dot emphasized, plus a center dot."""
    center = size / 2
    ring_r = size * 0.30 * scale
    dot_r = size * 0.052 * scale
    for i in range(12):
        angle = math.radians(i * 30 - 90)  # start at 12 o'clock
        cx = center + ring_r * math.cos(angle)
        cy = center + ring_r * math.sin(angle)
        if i == 0:
            blend_dot(pixels, size, cx, cy, dot_r * 1.45, accent)
        else:
            blend_dot(pixels, size, cx, cy, dot_r, color, opacity=0.55 + 0.038 * (12 - i))
    blend_dot(pixels, size, center, center, dot_r * 1.15, accent)


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    size = 1024

    # Main icon: gradient background + glow + motif
    icon = gradient_canvas(size, BG_TOP, BG_BOTTOM)
    blend_dot(icon, size, size / 2, size / 2, size * 0.40, (32, 30, 88), opacity=0.85)
    draw_motif(icon, size, 1.0, PRIMARY, GOLD)
    write_png(os.path.join(OUT_DIR, 'icon.png'), size, size, icon)

    # Adaptive foreground: transparent, scaled into the ~66% safe zone
    fg = flat_canvas(size, (0, 0, 0), 0)
    draw_motif(fg, size, 0.62, PRIMARY, GOLD)
    write_png(os.path.join(OUT_DIR, 'android-icon-foreground.png'), size, size, fg)

    # Adaptive background: solid brand color
    bg = flat_canvas(size, BG_FLAT, 255)
    write_png(os.path.join(OUT_DIR, 'android-icon-background.png'), size, size, bg)

    # Monochrome: white motif on transparent
    mono = flat_canvas(size, (0, 0, 0), 0)
    draw_motif(mono, size, 0.62, WHITE, WHITE)
    write_png(os.path.join(OUT_DIR, 'android-icon-monochrome.png'), size, size, mono)

    # Favicon
    fav_size = 64
    fav = gradient_canvas(fav_size, BG_TOP, BG_BOTTOM)
    draw_motif(fav, fav_size, 1.0, PRIMARY, GOLD)
    write_png(os.path.join(OUT_DIR, 'favicon.png'), fav_size, fav_size, fav)

    # Play Store listing assets
    store_dir = os.path.join(os.path.dirname(__file__), '..', 'store')
    os.makedirs(store_dir, exist_ok=True)

    play_size = 512
    play = gradient_canvas(play_size, BG_TOP, BG_BOTTOM)
    blend_dot(play, play_size, play_size / 2, play_size / 2, play_size * 0.40, (32, 30, 88), opacity=0.85)
    draw_motif(play, play_size, 1.0, PRIMARY, GOLD)
    write_png(os.path.join(store_dir, 'play-icon.png'), play_size, play_size, play)

    # Feature graphic 1024x500: motif on the left, glow on the right where
    # the Play listing overlays the app name
    fw, fh = 1024, 500
    feature = []
    for y in range(fh):
        t = y / (fh - 1)
        row_color = (
            round(BG_TOP[0] + (BG_BOTTOM[0] - BG_TOP[0]) * t),
            round(BG_TOP[1] + (BG_BOTTOM[1] - BG_TOP[1]) * t),
            round(BG_TOP[2] + (BG_BOTTOM[2] - BG_TOP[2]) * t),
            255,
        )
        feature.extend([row_color] * fw)

    def blend_dot_rect(cx, cy, r, color, opacity=1.0):
        feather = 2.0
        x0, x1 = max(0, int(cx - r - 3)), min(fw - 1, int(cx + r + 3))
        y0, y1 = max(0, int(cy - r - 3)), min(fh - 1, int(cy + r + 3))
        for yy in range(y0, y1 + 1):
            for xx in range(x0, x1 + 1):
                dist = math.hypot(xx + 0.5 - cx, yy + 0.5 - cy)
                cov = min(1.0, max(0.0, (r + feather / 2 - dist) / feather))
                if cov <= 0:
                    continue
                a = cov * opacity
                pr, pg, pb, pa = feature[yy * fw + xx]
                na = a + (pa / 255) * (1 - a)
                nr = (color[0] * a + pr * (pa / 255) * (1 - a)) / na
                ng = (color[1] * a + pg * (pa / 255) * (1 - a)) / na
                nb = (color[2] * a + pb * (pa / 255) * (1 - a)) / na
                feature[yy * fw + xx] = (round(nr), round(ng), round(nb), round(na * 255))

    mcx, mcy = 250, 250
    blend_dot_rect(mcx, mcy, 200, (32, 30, 88), opacity=0.9)
    ring_r, dot_r = 130, 22
    for i in range(12):
        angle = math.radians(i * 30 - 90)
        dx = mcx + ring_r * math.cos(angle)
        dy = mcy + ring_r * math.sin(angle)
        if i == 0:
            blend_dot_rect(dx, dy, dot_r * 1.45, GOLD)
        else:
            blend_dot_rect(dx, dy, dot_r, PRIMARY, opacity=0.55 + 0.038 * (12 - i))
    blend_dot_rect(mcx, mcy, dot_r * 1.15, GOLD)
    write_png(os.path.join(store_dir, 'feature-graphic.png'), fw, fh, feature)


if __name__ == '__main__':
    main()
