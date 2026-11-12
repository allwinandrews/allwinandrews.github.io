"""Export a Kadha stitch file (PES) to compact JSON for the hero scene.
Usage: python export_stitches.py <file.pes> <out.json>"""
import json, sys
import pyembroidery as p

src, out = sys.argv[1], sys.argv[2]
e = p.read(src)
colors = [t.hex_color() for t in e.threadlist]
xs, ys, col, brk = [], [], [], []
ci, pen_up = 0, True
for x, y, cmd in e.stitches:
    c = cmd & 0xFF
    if c == p.STITCH:
        if pen_up:
            brk.append(len(xs))
            pen_up = False
        xs.append(int(x)); ys.append(int(y)); col.append(ci)
    elif c == p.COLOR_CHANGE:
        ci += 1; pen_up = True
    else:  # JUMP, TRIM, STOP, END
        pen_up = True
minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
cx, cy = (minx + maxx) // 2, (miny + maxy) // 2
pts = []
for x, y in zip(xs, ys):
    pts += [x - cx, y - cy]
# run-length encode colour index
rle, prev, n = [], col[0], 0
for c in col:
    if c == prev: n += 1
    else: rle += [prev, n]; prev, n = c, 1
rle += [prev, n]
json.dump({"colors": colors[: max(col) + 1], "count": len(xs), "w": maxx - minx, "h": maxy - miny,
           "pts": pts, "colorRuns": rle, "breaks": brk}, open(out, "w"), separators=(",", ":"))
print(len(xs), "stitches", len(brk), "segments", colors[: max(col) + 1], "size(0.1mm)", maxx - minx, maxy - miny)
