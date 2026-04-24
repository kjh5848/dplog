#!/usr/bin/env python3
from __future__ import annotations

import argparse
import fnmatch
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


VIDEO_EXTENSIONS = {".mp4", ".mov", ".m4v", ".webm", ".avi", ".mkv"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Convert video files to lightweight GIFs with ffmpeg.")
    parser.add_argument("sources", nargs="+", help="Video file(s) or folder(s) to convert.")
    parser.add_argument("--output", help="Output GIF path. Only valid with a single input file.")
    parser.add_argument("--output-dir", help="Folder for generated GIFs. Defaults to the input folder.")
    parser.add_argument("--start", type=float, default=0.0, help="Start time in seconds.")
    parser.add_argument("--max-duration", type=float, default=6.0, help="Maximum duration in seconds.")
    parser.add_argument("--no-trim", action="store_true", help="Use the full video duration.")
    parser.add_argument("--fps", type=int, default=10, help="Output frames per second.")
    parser.add_argument("--width", type=int, default=720, help="Output width in pixels. Height keeps aspect ratio.")
    parser.add_argument("--max-mb", type=float, help="Warn when an output GIF exceeds this size.")
    parser.add_argument("--exclude", action="append", default=[], help="Filename or glob pattern to skip.")
    parser.add_argument("--overwrite", action="store_true", help="Overwrite existing GIFs.")
    parser.add_argument("--ffmpeg", default="ffmpeg", help="ffmpeg executable path.")
    parser.add_argument("--ffprobe", default="ffprobe", help="ffprobe executable path.")
    return parser.parse_args()


def find_videos(sources: list[str], excludes: list[str]) -> list[Path]:
    videos: list[Path] = []
    for source in sources:
        path = Path(source)
        if path.is_dir():
            candidates = sorted(child for child in path.iterdir() if child.suffix.lower() in VIDEO_EXTENSIONS)
        else:
            candidates = [path]
        for candidate in candidates:
            if candidate.suffix.lower() not in VIDEO_EXTENSIONS:
                continue
            if any(fnmatch.fnmatch(candidate.name, pattern) for pattern in excludes):
                continue
            videos.append(candidate)
    return videos


def probe_duration(path: Path, ffprobe: str) -> float | None:
    result = subprocess.run(
        [ffprobe, "-v", "error", "-show_entries", "format=duration", "-of", "default=nokey=1:noprint_wrappers=1", str(path)],
        text=True,
        capture_output=True,
        check=False,
    )
    if result.returncode != 0:
        return None
    try:
        return float(result.stdout.strip())
    except ValueError:
        return None


def resolve_output_path(video: Path, args: argparse.Namespace, total_inputs: int) -> Path:
    if args.output:
        if total_inputs != 1:
            raise ValueError("--output can only be used with one input video.")
        return Path(args.output)
    output_dir = Path(args.output_dir) if args.output_dir else video.parent
    return output_dir / f"{video.stem}.gif"


def run_ffmpeg(cmd: list[str]) -> None:
    result = subprocess.run(cmd, text=True, capture_output=True, check=False)
    if result.returncode != 0:
        tail = "\n".join(result.stderr.splitlines()[-12:])
        raise RuntimeError(tail)


def convert(video: Path, output: Path, args: argparse.Namespace) -> dict[str, object]:
    if not video.exists():
        raise FileNotFoundError(video)
    if output.exists() and not args.overwrite:
        return {"status": "skipped", "path": output, "size": output.stat().st_size}

    output.parent.mkdir(parents=True, exist_ok=True)
    duration = probe_duration(video, args.ffprobe)
    effective_duration = None
    if not args.no_trim and args.max_duration > 0:
        if duration is None:
            effective_duration = args.max_duration
        else:
            effective_duration = max(0.1, min(args.max_duration, duration - args.start))

    video_filter = f"fps={args.fps},scale={args.width}:-1:flags=lanczos"
    with tempfile.TemporaryDirectory(prefix="make-gif-") as temp_dir:
        palette = Path(temp_dir) / "palette.png"
        first_pass = [args.ffmpeg, "-y"]
        second_pass = [args.ffmpeg, "-y"]
        if args.start > 0:
            first_pass.extend(["-ss", str(args.start)])
            second_pass.extend(["-ss", str(args.start)])
        if effective_duration is not None:
            first_pass.extend(["-t", str(effective_duration)])
            second_pass.extend(["-t", str(effective_duration)])
        first_pass.extend(["-i", str(video), "-vf", f"{video_filter},palettegen=stats_mode=diff", str(palette)])
        second_pass.extend(
            [
                "-i",
                str(video),
                "-i",
                str(palette),
                "-lavfi",
                f"{video_filter} [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=5",
                "-loop",
                "0",
                str(output),
            ]
        )
        run_ffmpeg(first_pass)
        run_ffmpeg(second_pass)

    size = output.stat().st_size
    return {"status": "created", "path": output, "size": size}


def format_size(size: int) -> str:
    return f"{size / 1024 / 1024:.2f}MB"


def main() -> int:
    args = parse_args()
    if not shutil.which(args.ffmpeg):
        print(f"ffmpeg not found: {args.ffmpeg}", file=sys.stderr)
        return 2
    if not shutil.which(args.ffprobe):
        print(f"ffprobe not found: {args.ffprobe}", file=sys.stderr)
        return 2

    videos = find_videos(args.sources, args.exclude)
    if not videos:
        print("No video files found.", file=sys.stderr)
        return 1

    failures = 0
    for video in videos:
        try:
            output = resolve_output_path(video, args, len(videos))
            result = convert(video, output, args)
            size = int(result["size"])
            warning = ""
            if args.max_mb and size > args.max_mb * 1024 * 1024:
                warning = f" ⚠ exceeds {args.max_mb:g}MB"
            print(f"{result['status']}: {video.name} -> {Path(result['path'])} ({format_size(size)}){warning}")
        except Exception as error:
            failures += 1
            print(f"failed: {video} :: {error}", file=sys.stderr)

    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
