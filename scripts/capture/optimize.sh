#!/usr/bin/env bash
# Turns raw captures in media-src/<slug>/ into the files the site serves:
#   *.png  -> src/assets/projects/<slug>/*.webp (lossless; Astro makes the AVIF/WebP sizes)
#   *.jpg  -> src/assets/projects/<slug>/*.webp (quality 95)
#   *.webm or *.mp4 -> public/media/<slug>/*.mp4 (H.264, no audio, starts playing while loading)
# Usage: scripts/capture/optimize.sh <slug>
set -euo pipefail
slug="$1"
src="media-src/$slug"
img="src/assets/projects/$slug"
vid="public/media/$slug"
mkdir -p "$img"
shopt -s nullglob
for f in "$src"/*.png; do
  # Lossless, so the site's own AVIF/WebP encode is the only lossy step and text stays crisp.
  name="$(basename "${f%.*}")"
  cwebp -quiet -lossless -z 9 -metadata none "$f" -o "$img/$name.webp"
  echo "$img/$name.webp"
done
for f in "$src"/*.jpg; do
  # Already lossy (a video thumbnail, say): near-lossless is plenty.
  name="$(basename "${f%.*}")"
  cwebp -quiet -q 95 -metadata none "$f" -o "$img/$name.webp"
  echo "$img/$name.webp"
done
for f in "$src"/*.webm "$src"/*.mp4; do
  mkdir -p "$vid"
  name="$(basename "${f%.*}")"
  ffmpeg -loglevel error -y -i "$f" -an -c:v libx264 -preset slow -crf 30 -pix_fmt yuv420p \
    -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -movflags +faststart "$vid/$name.mp4"
  echo "$vid/$name.mp4"
done
