---
name: naver-blog-writing
description: Use when drafting, revising, or validating Naver Blog posts in this project, especially for SEO-safe Korean writing, headings, quotes, bold/underline, image/GIF ordering, 2-column grids, 3-column grids, and slide-style media galleries.
---

# Naver Blog Writing

Use this skill before creating or revising `blog_draft.md` for a Naver Blog post.

## Required References

- Read `docs/03_가이드라인/네이버블로그_미디어_레이아웃_글쓰기_규칙.md` before arranging media.
- Read `docs/03_가이드라인/SNS가이드/네이버블로그_가이드.md` before SEO checks.
- Read `docs/03_가이드라인/네이버블로그_휴머나이징_글쓰기_가이드.md` before polishing Korean copy.

## Workflow

1. Inspect the store `media_index.md` and use only media whose role matches the paragraph.
2. Write with Naver-friendly structure: `##` headings, `###` subheadings, `>` quotes, `**bold**`, and `__underline__`.
3. Arrange image/GIF blocks by consecutive count:
   - 1 item: single image
   - 2 or 4 items: 2-column grid
   - 3 items: 3-column grid
   - 5+ items: slide-style gallery
4. Keep alt text concrete and honest. Do not stuff keywords into alt text.
5. Convert publishing videos to GIF with `make-gif` when the post should avoid MP4 slots.
6. Run `build-html-preview` after edits and verify no missing media paths.
