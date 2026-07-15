"""
game-nights · music clip downloader
====================================
Downloads and trims the short audio question-clips for an event's music round,
straight into that event's clips/ folder with the exact filenames its config.js
expects. Answers in the app are embedded YouTube videos, so only audio question
clips are produced.

Each event owns a songs.json describing its clips:

    events/<slug>/songs.json
    [
      { "out": "M2.mp3",
        "title": "Seven Nation Army - The White Stripes",
        "url": "https://www.youtube.com/watch?v=0J2QdDbelmY",
        "question_start": 0, "question_duration": 11 }
    ]

  out                filename config.js loads from clips/ (don't change casually)
  url                the YouTube video to pull audio from
  question_start     where the clip STARTS, in seconds
  question_duration  how long the clip is, in seconds

SETUP (run once):
  pip install "yt-dlp[default]" ffmpeg-downloader
  ffdl install               # downloads ffmpeg+ffprobe
  # or: brew install ffmpeg  /  sudo apt install ffmpeg

RUN:
  python yt-download.py --event 2026-06-15-rvt-trivia
  python yt-download.py                 # lists events that have a songs.json

To re-cut a clip: edit question_start/duration in songs.json, delete the old
clips/<out>, and re-run (existing files are skipped).
"""

import argparse
import json
import os
import shutil
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.normpath(os.path.join(HERE, ".."))
EVENTS_DIR = os.path.join(REPO, "events")


# ── ffmpeg discovery ─────────────────────────────────────────────────────────
def _find_ffmpeg_dir():
    """Find directory containing ffmpeg+ffprobe, checking PATH then known install locations."""
    path = shutil.which("ffmpeg")
    if path and shutil.which("ffprobe"):
        return os.path.dirname(path)
    # Check ffmpeg-downloader install location
    ffdl_dir = os.path.join(
        os.environ.get("LOCALAPPDATA", ""),
        "ffmpegio", "ffmpeg-downloader", "ffmpeg", "bin",
    )
    if os.path.isfile(os.path.join(ffdl_dir, "ffmpeg.exe")):
        return ffdl_dir
    # Check imageio_ffmpeg fallback (ffmpeg only, no ffprobe)
    try:
        import imageio_ffmpeg
        return os.path.dirname(imageio_ffmpeg.get_ffmpeg_exe())
    except ImportError:
        return None


FFMPEG_DIR = _find_ffmpeg_dir()


def get_ffmpeg():
    return os.path.join(FFMPEG_DIR, "ffmpeg") if FFMPEG_DIR else "ffmpeg"


def yt_dlp_base():
    cmd = ["yt-dlp", "--no-playlist"]
    if FFMPEG_DIR:
        cmd += ["--ffmpeg-location", FFMPEG_DIR]
    return cmd


# ── event / songs.json helpers ───────────────────────────────────────────────
def events_with_songs():
    if not os.path.isdir(EVENTS_DIR):
        return []
    return sorted(
        name for name in os.listdir(EVENTS_DIR)
        if os.path.isfile(os.path.join(EVENTS_DIR, name, "songs.json"))
    )


def load_songs(slug):
    with open(os.path.join(EVENTS_DIR, slug, "songs.json"), encoding="utf-8") as f:
        return json.load(f)


# ── download + trim ──────────────────────────────────────────────────────────
def download_and_trim(url, temp_prefix, out_file, start, duration):
    """Download audio from YouTube and trim to a clip. Returns True on success."""
    if os.path.exists(out_file):
        print(f"  [OK] Already exists: {os.path.basename(out_file)}")
        return True

    temp_pattern = f"{temp_prefix}.%(ext)s"

    cmd = yt_dlp_base() + ["-x", "--audio-format", "mp3", "--audio-quality", "0",
                           "-o", temp_pattern, url]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"  [FAIL] Download failed: {result.stderr[-300:]}")
        return False

    temp_file = f"{temp_prefix}.mp3"
    if not os.path.exists(temp_file):
        parent = os.path.dirname(temp_prefix)
        base = os.path.basename(temp_prefix)
        candidates = [f for f in os.listdir(parent) if f.startswith(base) and not f.endswith(".part")]
        if not candidates:
            print("  [FAIL] Could not find downloaded file")
            return False
        temp_file = os.path.join(parent, candidates[0])

    trim_cmd = [get_ffmpeg(), "-y", "-i", temp_file, "-ss", str(start), "-t", str(duration),
                "-acodec", "libmp3lame", "-q:a", "2", out_file]
    result = subprocess.run(trim_cmd, capture_output=True, text=True)

    if os.path.exists(temp_file):
        os.remove(temp_file)

    if result.returncode != 0:
        print(f"  [FAIL] Trim failed: {result.stderr[-300:]}")
        return False
    return True


def download_song(song, clips_dir, idx, total):
    out = song["out"]
    print(f"\n[{idx}/{total}] {song.get('title', out)}  ->  clips/{out}")
    print(f"  audio: {song['question_duration']}s from {song['question_start']}s")
    return download_and_trim(
        song["url"],
        os.path.join(clips_dir, f"_temp_q_{idx}"),
        os.path.join(clips_dir, out),
        song["question_start"], song["question_duration"],
    )


# ── entry point ──────────────────────────────────────────────────────────────
def print_event_list():
    slugs = events_with_songs()
    if slugs:
        print("Events with a songs.json:")
        for s in slugs:
            print(f"  - {s}")
        print("\nRun:  python yt-download.py --event <slug>")
    else:
        print("No events with a songs.json found under events/.")


def main():
    parser = argparse.ArgumentParser(description="Download an event's music-round question clips.")
    parser.add_argument("--event", help="event slug under events/ (folder containing songs.json)")
    args = parser.parse_args()

    if not args.event:
        print_event_list()
        return

    slugs = events_with_songs()
    if args.event not in slugs:
        print(f"No songs.json for event '{args.event}'.\n")
        print_event_list()
        return

    if not FFMPEG_DIR:
        print("ERROR: ffmpeg not found. Install with: pip install ffmpeg-downloader && ffdl install")
        return

    songs = load_songs(args.event)
    clips_dir = os.path.join(EVENTS_DIR, args.event, "clips")
    os.makedirs(clips_dir, exist_ok=True)

    print(f"Event: {args.event}")
    print(f"Clips -> {clips_dir}")
    print("=" * 50)

    ok = 0
    for i, song in enumerate(songs, 1):
        try:
            ok += download_song(song, clips_dir, i, len(songs))
        except Exception as e:
            print(f"  [FAIL] Error on {song.get('out', '?')}: {e}")

    print("\n" + "=" * 50)
    print(f"Done! Audio clips: {ok}/{len(songs)} in {clips_dir}")


if __name__ == "__main__":
    main()
