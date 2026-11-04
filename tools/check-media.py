"""
game-nights · media checker
===========================
Checks every YouTube video and image an event uses, so a dead link shows up
before game night instead of as "Video unavailable" on the big screen.

  YouTube    asks YouTube's oEmbed endpoint about each video id: it answers only
             for videos that exist, are public and allow embedding. The title is
             printed so you can eyeball that the id is the clip you meant. A video
             with backups (alts) passes if any of its uploads plays: the failing
             ones show as "alt" (the board skips them on its own).
  images     fetches each image URL (Wikimedia Special:FilePath links included)
             and confirms it returns an image; local paths must exist on disk.

RUN (needs internet; standard library only):
  python tools/check-media.py --event 2025-10-20-diwali-trivia
  python tools/check-media.py                 # every event with a config.js

Exits 1 if anything failed, so it can gate a deploy.
"""

import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.normpath(os.path.join(HERE, ".."))
EVENTS_DIR = os.path.join(REPO, "events")
UA = "game-nights-media-check/1.0 (+https://github.com/pvgupta24/game-nights)"
YT_ID = r"[A-Za-z0-9_-]{11}"
IMG_EXT = r"\.(?:jpe?g|png|gif|webp|svg)"


def fetch(url, method="GET"):
    """Return (status, content_type, body_bytes or b"")."""
    req = urllib.request.Request(url, method=method, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            body = r.read(200_000) if method == "GET" else b""
            return r.status, r.headers.get("Content-Type", ""), body
    except urllib.error.HTTPError as e:
        return e.code, e.headers.get("Content-Type", "") if e.headers else "", b""
    except Exception as e:  # DNS, timeout, TLS…
        return 0, str(e), b""


def check_youtube(vid):
    url = "https://www.youtube.com/oembed?format=json&url=" + urllib.parse.quote(
        f"https://www.youtube.com/watch?v={vid}", safe="")
    status, _, body = fetch(url)
    if status == 200:
        try:
            return True, json.loads(body.decode("utf-8")).get("title", "")
        except ValueError:
            return True, ""
    reason = {
        400: "bad video id",
        401: "the owner doesn't allow embedding",
        403: "the owner doesn't allow embedding",
        404: "removed, private or never existed",
        0: "couldn't reach YouTube",
    }.get(status, f"HTTP {status}")
    return False, reason


def check_image(url):
    status, ctype, _ = fetch(url, "HEAD")
    if status in (405, 403) or (status == 200 and not ctype):
        status, ctype, _ = fetch(url, "GET")
    if status == 200 and ctype.startswith("image/"):
        return True, ctype
    if status == 0:
        return False, "couldn't reach the host"
    return False, f"HTTP {status}" + (f" ({ctype})" if ctype and status == 200 else "")


def scan_config(path):
    """Yield (kind, value, line_no) for every video id and image reference in config.js."""
    text = open(path, encoding="utf-8").read()
    commons = re.search(r'const\s+COMMONS\s*=\s*"([^"]+)"', text)
    commons = commons.group(1) if commons else "https://commons.wikimedia.org/wiki/Special:FilePath/"
    seen = set()
    for no, line in enumerate(text.splitlines(), 1):
        code = line.split("//", 1)[0] if not line.lstrip().startswith("http") else line
        for vid in re.findall(rf'\bid:\s*"({YT_ID})"', code) + re.findall(rf'\byt:\s*"({YT_ID})"', code):
            if ("yt", vid) not in seen:
                seen.add(("yt", vid)); yield "yt", vid, no
        imgs = [commons + m + "?width=960" for m in re.findall(r'photo\("([^"]+)"\)', code)]
        imgs += [commons + m for m in re.findall(r'COMMONS\s*\+\s*"([^"]+)"', code)]
        imgs += re.findall(rf'"(https?://[^"\s]+?{IMG_EXT}[^"\s]*)"', code)
        imgs += re.findall(rf'"((?:\.\./|assets/|clips/)[^"\s]+?{IMG_EXT})"', code)
        for src in imgs:
            if ("img", src) not in seen:
                seen.add(("img", src)); yield "img", src, no


def scan_songs(path):
    for item in json.load(open(path, encoding="utf-8")):
        m = re.search(rf"v=({YT_ID})", item.get("url", ""))
        if m:
            yield "yt", m.group(1), item.get("out", "songs.json")


def check_event(slug):
    folder = os.path.join(EVENTS_DIR, slug)
    cfg = os.path.join(folder, "config.js")
    items = list(scan_config(cfg))
    songs = os.path.join(folder, "songs.json")
    if os.path.exists(songs):
        known = {(k, v) for k, v, _ in items}
        items += [(k, v, f"songs.json:{w}") for k, v, w in scan_songs(songs) if (k, v) not in known]

    print(f"\n== {slug} · {len(items)} links ==")
    results = []
    for kind, value, where in items:
        where = f"config.js:{where}" if isinstance(where, int) else where
        if kind == "yt":
            ok, info = check_youtube(value)
            label = f"youtube {value}"
        elif value.startswith("http"):
            ok, info = check_image(value)
            label = "image " + urllib.parse.unquote(value.rsplit("/", 1)[-1].split("?")[0])
        else:
            ok = os.path.exists(os.path.normpath(os.path.join(folder, value)))
            info, label = ("" if ok else "file not found"), f"file {value}"
        results.append((kind, label, where, ok, info))
    # a video listed with backups (all on one config line) is fine while any of its uploads plays
    covered = {w for k, _, w, ok, _ in results if k == "yt" and ok}
    bad = 0
    for kind, label, where, ok, info in results:
        tag = "ok  " if ok else ("alt " if kind == "yt" and where in covered else "FAIL")
        bad += tag == "FAIL"
        print(f"  {tag}  {label:<60}  {where:<16}  {info}")
    print(f"  → {len(results) - bad} fine, {bad} failed" + ("  (alt = a backup on the same line plays instead)" if any(
        not ok and k == "yt" and w in covered for k, _, w, ok, _ in results) else ""))
    return bad


def main():
    ap = argparse.ArgumentParser(description="Check an event's YouTube videos and images.")
    ap.add_argument("--event", help="event folder name under events/ (default: all)")
    args = ap.parse_args()
    if args.event:
        slugs = [args.event]
    else:
        slugs = sorted(d for d in os.listdir(EVENTS_DIR) if os.path.exists(os.path.join(EVENTS_DIR, d, "config.js")))
    failed = sum(check_event(s) for s in slugs)
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
