#!/usr/bin/env bash
# Turns raw captures in media-src/<slug>/ into the files the site serves:
#   *.png  -> src/assets/projects/<slug>/*.webp (quality 90; Astro makes the AVIF/WebP sizes)
#   *.webm or *.mp4 -> public/media/<slug>/*.mp4 (H.264, no audio, starts playing while loading)
# Usage: scripts/capture/optimize.sh <slug>
set -euo pipefail
slug="$1"
src="media-src/$slug"
img="src/assets/projects/$slug"
vid="public/media/$slug"
mkdir -p "$img"
shopt -s nullglob
for f in "$src"/*.png "$src"/*.jpg; do
  name="$(basename "${f%.*}")"
  cwebp -quiet -q 90 -metadata none "$f" -o "$img/$name.webp"
  echo "$img/$name.webp"
done
for f in "$src"/*.webm "$src"/*.mp4; do
  mkdir -p "$vid"
  name="$(basename "${f%.*}")"
  ffmpeg -loglevel error -y -i "$f" -an -c:v libx264 -preset slow -crf 30 -pix_fmt yuv420p \
    -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -movflags +faststart "$vid/$name.mp4"
  echo "$vid/$name.mp4"
done
