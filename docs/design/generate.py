"""Rebuild the SVG experiments and overview. Standard-library Python only.

Optional PNG exports: python docs/design/generate.py --png (requires Inkscape).
All experimental logo lettering is drawn as paths, with no font dependency.
"""
from pathlib import Path
from html import escape
import argparse
import json
import subprocess
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent
LIGHT, DARK = '#f6f4f8', '#0f1419'
INK, MUTED = '#25222e', '#67616f'


def path(d, **attrs):
    return '<path d="' + d + '" ' + ' '.join(f'{k.replace("_", "-")}="{v}"' for k, v in attrs.items()) + '/>'


def circle(x, y, r, **attrs):
    return f'<circle cx="{x}" cy="{y}" r="{r}" ' + ' '.join(f'{k.replace("_", "-")}="{v}"' for k, v in attrs.items()) + '/>'


def group(body, **attrs):
    return '<g ' + ' '.join(f'{k.replace("_", "-")}="{v}"' for k, v in attrs.items()) + '>' + body + '</g>'


def stroke(body, width=6):
    return group(body, fill='none', stroke='currentColor', stroke_width=width, stroke_linecap='round', stroke_linejoin='round')


def leaf(d):
    return path(d, fill='currentColor')


def bloom(cx=50, cy=50, r=17):
    petal = f'<ellipse cx="{cx}" cy="{cy-r}" rx="10" ry="17" fill="currentColor"/>'
    return ''.join(group(petal, transform=f'rotate({a} {cx} {cy})') for a in range(0, 360, 60))


GLYPHS = {
    'a': 'M34 23V57 M34 40C34 17 4 17 4 40C4 63 34 63 34 40',
    'n': 'M4 57V23 M4 38C4 17 34 17 34 38V57',
    't': 'M13 8V44Q13 58 29 55 M3 24H29',
    'h': 'M4 57V6 M4 38C4 17 34 17 34 38V57',
    'o': 'M34 40C34 17 4 17 4 40C4 63 34 63 34 40Z',
    's': 'M32 27C24 18 4 22 5 32C6 43 31 35 32 46C33 59 12 62 4 53',
}


def lettering(variant='plain'):
    result = ''
    for i, char in enumerate('anthos'):
        drawing = stroke(path(GLYPHS[char]), 5.6)
        if variant == 'bloom' and char == 'o':
            drawing = group(bloom(), transform='translate(-12 9.5) scale(.61)')
            drawing += circle(18.5, 40, 6.5, fill='var(--paper)')
        if variant == 'seed' and i == 0:
            drawing = leaf('M4 57V38C4 21 22 15 34 7V40C34 55 21 64 4 57Z')
            drawing += stroke(path('M12 51L26 27'), 4).replace('currentColor', 'var(--paper)')
        if variant == 'sprout' and char == 't':
            drawing += leaf('M13 17C-1 17 -4 9 -3 2C8 1 15 6 13 17Z')
            drawing += leaf('M14 12C13 0 24 -6 32 -4C31 7 23 14 14 12Z')
        result += group(drawing, transform=f'translate({i*45} 0)')
    return result


MARKS = [
    # 01: the asymmetric silhouette and terminal from the existing logo.
    stroke(path('M28 76C5 47 29 28 48 25C65 22 76 17 83 9C96 40 89 71 64 82C51 88 37 87 28 76Z') + path('M13 92C21 71 43 65 66 42') + path('M43 66L42 49L49 43'), 6) + circle(68, 39, 7, fill='currentColor'),
    # 02: deliberate, sparse circuit branches in an upright leaf.
    stroke(path('M50 8C24 26 12 47 22 69C27 82 39 88 50 88C62 88 76 79 80 66C87 44 71 23 50 8Z') + path('M50 29V95 M50 56L67 43 M50 72L33 59'), 5.8) + circle(67, 43, 5, fill='currentColor') + circle(33, 59, 5, fill='currentColor'),
    # 03: broad leaf, open central trace, one sampled endpoint.
    leaf('M17 78C4 34 43 13 84 14C91 54 74 84 38 85L69 37L59 32L17 91Z') + circle(54, 53, 5, fill='var(--paper)'),
    # 04-06: companion marks taken directly from the custom wordmarks.
    stroke(path('M48 32V78Q48 90 66 85 M28 50H71'), 8) + leaf('M47 33C24 34 16 19 18 9C38 7 50 17 47 33Z M51 26C49 8 64 1 79 5C77 20 65 30 51 26Z'),
    bloom() + circle(50, 50, 11, fill='var(--paper)'),
    leaf('M21 86V49C21 24 51 19 77 6V57C77 82 55 96 21 86Z') + stroke(path('M35 75L63 33'), 7).replace('currentColor', 'var(--paper)'),
    # 07: a leaf is literally the crossbar of the A.
    stroke(path('M13 87L49 12Q51 8 53 13L88 87'), 8) + leaf('M33 63C36 42 55 43 70 43C66 62 53 70 33 63Z'),
    # 08: a solid A with a leaf cut from its counter.
    path('M8 88L43 13Q50 0 57 13L92 88H70L61 67H38L29 88Z M43 54C41 36 53 27 62 26C64 44 56 54 43 54Z', fill='currentColor', fill_rule='evenodd'),
    # 09: a growing stem closes the left leg of a low, round A.
    stroke(path('M21 88L42 38Q49 21 59 40L79 88 M32 66H68'), 7) + leaf('M46 31C26 34 19 22 22 9C38 9 49 16 46 31Z M51 26C47 12 57 4 72 6C72 18 65 26 51 26Z'),
    # 10: an unfurling frond, with a single young leaf.
    stroke(path('M46 91V50C46 26 80 21 81 44C82 61 57 66 57 48C57 42 64 39 68 44'), 7) + leaf('M44 70C20 70 13 54 15 39C35 39 47 50 44 70Z'),
    # 11: a friendly planter with one discrete monitoring indicator.
    stroke(path('M49 56V33 M24 62L30 88H69L75 62Z'), 6) + leaf('M47 45C24 45 20 27 23 17C40 17 51 27 47 45Z M52 35C49 15 64 8 79 11C80 26 67 38 52 35Z') + circle(85, 57, 6, fill='currentColor'),
    # 12: a top-down plant with five leaves, open spaces around the center.
    ''.join(group(leaf('M48 42C31 35 29 18 38 7C54 13 61 27 48 42Z'), transform=f'rotate({a} 50 50)') for a in range(0, 360, 72)) + circle(50, 50, 6, fill='currentColor'),
]

DATA = [
    ('01', 'Signal leaf', 'existing', 'Fewer traces. The familiar silhouette.', '#7940bb', '#dcb8ff', 'plain'),
    ('02', 'Living circuit', 'existing', 'An upright leaf with two sensing points.', '#7940bb', '#dcb8ff', 'plain'),
    ('03', 'Leaf / trace', 'existing', 'A bold silhouette with a single open vein.', '#7940bb', '#dcb8ff', 'plain'),
    ('04', 'Growing type', 'anthos', 'A sprouting t brings the name to life.', '#35634c', '#b9d9b3', 'sprout'),
    ('05', 'In bloom', 'anthos', 'A flower takes the place of the o.', '#984655', '#f0b0ba', 'bloom'),
    ('06', 'Seed letter', 'anthos', 'A leaf-shaped a starts a custom wordmark.', '#7940bb', '#dcb8ff', 'seed'),
    ('07', 'Leafbar A', 'initial', 'A botanical crossbar in an open initial.', '#7940bb', '#dcb8ff', 'plain'),
    ('08', 'Cut-leaf A', 'initial', 'One leaf carved into a compact, solid A.', '#35634c', '#b9d9b3', 'plain'),
    ('09', 'Growing A', 'initial', 'A soft arch with a young shoot at its apex.', '#9b4e34', '#efbd9e', 'plain'),
    ('10', 'Unfurl', 'plant', 'A curling frond suggests growth over time.', '#35634c', '#b9d9b3', 'plain'),
    ('11', 'Plant companion', 'plant', 'A familiar pot with a small sensing dot.', '#7940bb', '#dcb8ff', 'plain'),
    ('12', 'Canopy', 'plant', 'A plant seen from above, gathered around a center.', '#35634c', '#b9d9b3', 'plain'),
]
ROUTES = [
    ('existing', '01', 'Evolve the existing logo', 'Circuit veins / purple / botanical hardware'),
    ('anthos', '02', 'Play with Anthos', 'Custom lettering / shoots / flowers / seeds'),
    ('initial', '03', 'An A with a little life', 'Initials / leaf counters / living crossbars'),
    ('plant', '04', 'Let the plant speak', 'Fronds / pots / canopies / care'),
]


def svg(body, w, h, title, paper=LIGHT):
    body = body.replace('var(--paper)', paper)
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="{escape(title)}"><title>{escape(title)}</title>{body}</svg>\n'


def rect(x, y, w, h, color, rx=0):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{color}"/>'


def label(text, x, y, size=20, color=INK, weight=400):
    return f'<text x="{x}" y="{y}" font-family="Noto Sans, sans-serif" font-size="{size}" font-weight="{weight}" fill="{color}">{escape(text)}</text>'


def lockup(index):
    item = DATA[index]
    if item[2] == 'anthos':
        return group(lettering(item[6]), transform='translate(101 65) scale(1.7)')
    return group(MARKS[index], transform='translate(51 51) scale(1.36)') + group(lettering(), transform='translate(215 65) scale(1.34)')


def panel(index, theme, x=0, y=0, w=276, h=194):
    paper = LIGHT if theme == 'light' else DARK
    color = DATA[index][4 if theme == 'light' else 5]
    body = rect(0, 0, w, h, paper)
    if DATA[index][2] == 'anthos':
        body += group(lettering(DATA[index][6]), transform=f'translate(21 43) scale({(w-42)/265})', color=color)
        body += group(MARKS[index], transform=f'translate({w/2-16} 139) scale(.32)', color=color)
    else:
        body += group(MARKS[index], transform=f'translate({w/2-44} 18) scale(.88)', color=color)
        body += group(lettering(), transform=f'translate({w/2-93} 111) scale(.71)', color=color)
    body += label(theme.upper(), 15, h-13, 10, '#76707f' if theme == 'light' else '#aba6b2', 500)
    return group(body.replace('var(--paper)', paper), transform=f'translate({x} {y})')


def build():
    (ROOT / 'logos').mkdir(exist_ok=True)
    for i, item in enumerate(DATA):
        ident, name, route, desc, light, dark, variant = item
        slug = ident + '-' + name.lower().replace(' / ', '-').replace(' ', '-')
        for theme, paper, color in [('light', LIGHT, light), ('dark', DARK, dark)]:
            body = rect(0, 0, 640, 240, paper) + group(lockup(i), color=color)
            (ROOT / 'logos' / f'{slug}-{theme}.svg').write_text(svg(body, 640, 240, f'Anthos {name}, {theme} background', paper))
        # Transparent, genuinely single-ink masters. Knockouts use masks, not background paint.
        for kind, body, w, h in [('mark', MARKS[i], 100, 100), ('lockup', lockup(i), 640, 240)]:
            content = group(body, color=light)
            # All dark cuts are white elsewhere and black here in an alpha mask.
            if 'var(--paper)' in content:
                mask = content.replace(light, '#ffffff').replace('var(--paper)', '#000000')
                content = f'<defs><mask id="cut" maskUnits="userSpaceOnUse" x="0" y="0" width="{w}" height="{h}">{mask}</mask></defs><g mask="url(#cut)">{rect(0, 0, w, h, light)}</g>'
            (ROOT / 'logos' / f'{slug}-{kind}.svg').write_text(svg(content, w, h, f'Anthos {name}, transparent {kind}'))
    build_board()
    build_html()
    (ROOT / 'concepts.json').write_text(json.dumps([dict(id=d[0], name=d[1], route=d[2], description=d[3], light_ink=d[4], dark_ink=d[5]) for d in DATA], indent=2) + '\n')


def build_board():
    w, h = 1800, 2410
    body = rect(0, 0, w, h, '#eae6ee')
    body += label('ANTHOS   /   IDENTITY EXPLORATIONS', 60, 61, 16, MUTED, 600)
    body += label('A little life. A clearer signal.', 60, 137, 60, INK, 600)
    body += label('Twelve logo studies for a plant monitoring app. Four routes. Every idea in light and dark.', 62, 187, 23, MUTED)
    # Reference: actual current shared SVG, embedded so the board is portable.
    root = ET.parse(ROOT / 'references/current-app-logo.svg').getroot()
    old = ET.tostring(root, encoding='unicode')
    old = old.replace('<ns0:svg', '<svg').replace('</ns0:svg>', '</svg>').replace('ns0:', '')
    oldroot = ET.fromstring(old)
    oldroot.set('x', '80'); oldroot.set('y', '250'); oldroot.set('width', '140'); oldroot.set('height', '140')
    body += rect(60, 224, 1680, 210, LIGHT, 10)
    body += ET.tostring(oldroot, encoding='unicode')
    body += label('THE STARTING POINT', 262, 268, 14, MUTED, 600)
    body += label('Your circuit leaf', 262, 310, 30, INK, 600)
    body += label('Purple, organic outline, electronic veins.', 262, 352, 20, MUTED)
    body += label('Current shared app asset, preserved as a reference.', 262, 382, 17, MUTED)
    for j, (name, color, pale) in enumerate([('Orchid', '#7940bb', '#dcb8ff'), ('Fern', '#35634c', '#b9d9b3'), ('Petal', '#984655', '#f0b0ba'), ('Clay', '#9b4e34', '#efbd9e')]):
        x = 1090 + j * 153
        body += rect(x, 263, 62, 62, color, 31) + rect(x+43, 285, 40, 40, pale, 20)
        body += label(name, x, 359, 18, INK, 500)
    body += label('COLOR STUDIES, NOT FINAL BRAND TOKENS', 1090, 397, 12, MUTED)
    for row, (route, num, title, subtitle) in enumerate(ROUTES):
        y = 494 + row * 454
        body += label(num, 60, y+24, 19, '#7940bb', 600)
        body += label(title, 112, y+25, 30, INK, 600)
        body += label(subtitle, 112, y+61, 18, MUTED)
        for col in range(3):
            i = row * 3 + col
            item = DATA[i]
            x = 60 + col * 572
            body += panel(i, 'light', x, y+88) + panel(i, 'dark', x+276, y+88)
            body += label(f'{item[0]}  {item[1]}', x, y+319, 23, INK, 600)
            # Break the longest descriptive line to keep generous side margins.
            words, lines, line = item[3].split(), [], ''
            for word in words:
                if len(line + ' ' + word) > 49:
                    lines.append(line); line = word
                else:
                    line = (line + ' ' + word).strip()
            lines.append(line)
            for k, line in enumerate(lines):
                body += label(line, x, y+350+k*24, 17, MUTED)
            body += group(MARKS[i].replace('var(--paper)', '#eae6ee'), transform=f'translate({x} {y+389}) scale(.16)', color=INK)
            body += group(MARKS[i].replace('var(--paper)', '#eae6ee'), transform=f'translate({x+34} {y+385}) scale(.24)', color=INK)
            body += group(MARKS[i].replace('var(--paper)', '#eae6ee'), transform=f'translate({x+78} {y+381}) scale(.32)', color=INK)
            body += label('16 / 24 / 32 px · single-ink study', x+126, y+402, 13, MUTED)
    body += label('WORKING SET 01', 60, 2370, 14, MUTED, 600)
    body += label('Compare the idea first, then silhouette, small-size clarity, and color. No direction selected yet.', 284, 2370, 17, MUTED)
    (ROOT / 'moodboard.svg').write_text(svg(body, w, h, 'Anthos logo moodboard: twelve concepts across four directions'))


def build_html():
    rows = ''
    for route, num, title, subtitle in ROUTES:
        rows += f'<section id="{route}"><header><span>{num}</span><div><h2>{title}</h2><p>{subtitle}</p></div></header><div class="studies">'
        for i, item in enumerate(DATA):
            if item[2] != route:
                continue
            ident, name = item[:2]
            slug = ident + '-' + name.lower().replace(' / ', '-').replace(' ', '-')
            pair = svg(panel(i, 'light') + panel(i, 'dark', 276), 552, 194, name + ', light and dark comparison')
            rows += f'<article><div class="pair">{pair}</div><h3>{ident} · {name}</h3><p>{item[3]}</p><div class="sizes">'
            for size in (16, 24, 32):
                rows += f'<img src="logos/{slug}-mark.svg" width="{size}" height="{size}" alt="{name} at {size} pixels">'
            rows += '<span>16 / 24 / 32 px</span></div><div class="downloads">'
            for kind in ('light', 'dark', 'mark', 'lockup'):
                rows += f'<a href="logos/{slug}-{kind}.svg" download>{kind.capitalize()} SVG</a>'
            rows += '</div></article>'
        rows += '</div></section>'
    html = '''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Anthos · Logo explorations</title>
<style>
:root{color-scheme:light;--ink:oklch(26% .022 305);--paper:oklch(93% .012 305);--accent:oklch(48% .18 305)}
*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:system-ui,sans-serif}main{max-width:1800px;margin:auto;padding:40px clamp(20px,4vw,70px) 60px}a{color:#7033ad;text-underline-offset:4px}a:focus-visible{outline:3px solid #7033ad;outline-offset:5px}.eyebrow{font-size:12px;letter-spacing:.13em;font-weight:650}h1{font-size:clamp(36px,4.5vw,72px);letter-spacing:-.05em;line-height:1.1;margin:24px 0}p{line-height:1.6;max-width:72ch;color:#67616f}nav{display:flex;flex-wrap:wrap;gap:14px 26px;margin:30px 0 40px}.reference{display:flex;align-items:center;gap:32px;background:#f6f4f8;padding:28px;border-radius:10px}.reference img{width:120px;height:120px;object-fit:contain}.reference h2{margin:0;font-size:24px}.reference p{margin:8px 0}.reference small{color:#67616f}section{margin-top:60px}section>header{display:flex;gap:24px;align-items:baseline;margin-bottom:24px}header>span{color:var(--accent);font-size:18px;font-weight:650}h2{font-size:28px;letter-spacing:-.025em;margin:0}header p{margin:6px 0}.studies{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:28px}.pair svg{width:100%;height:auto;display:block}h3{font-size:21px;margin:20px 0 6px}article p{font-size:15px;min-height:48px;margin:0}.sizes{display:flex;align-items:center;gap:18px;height:54px}.sizes span{font-size:12px;color:#67616f}.downloads{display:flex;gap:10px 17px;flex-wrap:wrap;font-size:13px}footer{margin-top:64px;padding-top:20px;border-top:1px solid #cdc5d4}footer p{font-size:14px}@media(max-width:1150px){.studies{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:700px){.studies{grid-template-columns:1fr}.reference{gap:20px;align-items:flex-start}.reference img{width:72px;height:72px}h2{font-size:24px}article p{min-height:0}.downloads{margin-top:10px}}@media print{main{padding:10px}.studies{grid-template-columns:repeat(3,minmax(0,1fr))}section,article{break-inside:avoid}nav,.downloads{display:none}body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body><main><div class="eyebrow">ANTHOS / IDENTITY EXPLORATIONS / WORKING SET 01</div><h1>A little life.<br>A clearer signal.</h1><p>Twelve logo studies for a plant monitoring app. Compare the four routes, their light and dark treatments, and their small-size silhouettes.</p>
<nav aria-label="Moodboard navigation"><a href="#existing">Existing logo</a><a href="#anthos">Anthos</a><a href="#initial">A + plant</a><a href="#plant">Plant icons</a><a href="moodboard.png">Full moodboard PNG</a><a href="moodboard.svg">Vector moodboard</a></nav>
<aside class="reference"><img src="references/current-app-logo.svg" alt="The existing purple circuit leaf used by Anthos"><div><h2>Your circuit leaf</h2><p>The starting point: an organic outline, purple ink, and electronic veins.</p><small>Found in shared/src/logo.svg. <a href="references/original-inspiration.png">View your earlier inspiration</a>.</small></div></aside>
''' + rows + '''<footer><p>Exploratory directions, not a final identity. The orchid palette follows the current brand; fern, petal, and clay explore alternatives. Logo lettering is custom vector geometry. All marks also have transparent SVG masters.</p><p><a href="README.md">Notes, original asset locations, and regeneration instructions</a></p></footer></main></body></html>\n'''
    (ROOT / 'index.html').write_text(html)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--png', action='store_true')
    args = parser.parse_args()
    build()
    if args.png:
        files = [ROOT / 'moodboard.svg'] + sorted((ROOT / 'logos').glob('*-light.svg')) + sorted((ROOT / 'logos').glob('*-dark.svg'))
        for file in files:
            subprocess.run(['inkscape', str(file), '--export-type=png', f'--export-filename={file.with_suffix(".png")}'], check=True, capture_output=True)
        print(f'Exported {len(files)} PNGs.')
    print('Built 12 concepts, 48 SVG assets, SVG moodboard, and HTML overview.')
