---
name: make-gif
description: Convert local video files such as MP4, MOV, or WEBM into lightweight GIF files for blog publishing, previews, and SNS posts using ffmpeg.
---

# Make GIF

Use this skill when the user asks to create GIFs from videos, replace video uploads with GIFs, or prepare short animated media for Naver Blog/SNS publishing.

## Workflow

1. Identify source videos and exclude known test files unless the user explicitly asks to include them.
2. Create GIFs with `scripts/make_gif.py`, which uses `ffmpeg` palette generation for better color and smaller files.
3. Keep blog GIFs short and light:
   - default width: `720`
   - default fps: `10`
   - default max duration: `6` seconds
   - long videos may be trimmed automatically unless `--no-trim` is used.
4. Replace draft media links from `.mp4`, `.mov`, or `.webm` to generated `.gif` when the user wants video slots to publish as image-style GIFs.
5. Rebuild the HTML preview and verify generated GIF paths exist.

## Commands

Create one GIF:

```bash
scripts/.venv/bin/python .agents/skills/make-gif/scripts/make_gif.py input.mp4 --output output.gif
```

Batch convert a folder:

```bash
scripts/.venv/bin/python .agents/skills/make-gif/scripts/make_gif.py scripts/asset/이조갈비/동영상 --output-dir scripts/asset/이조갈비/GIF --exclude test_desktop.mp4
```

Use `--fps`, `--width`, `--max-duration`, and `--overwrite` to tune output quality and regeneration.
