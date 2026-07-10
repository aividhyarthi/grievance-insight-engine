#!/usr/bin/env bash
# deploy-all.sh — run this from inside the thesecondspring repo directory
# Usage: bash deploy-all.sh
#
# Downloads the staging repo as ONE tarball (not 90 separate curl calls, which
# hit GitHub rate limits and saved "400: Invalid request" into the blog files).

set -e

BRANCH="claude/perimenopause-chat-app-kgml4"
REPO="aividhyarthi/grievance-insight-engine"
WORK="$(mktemp -d)"

echo "=== Deploying The Second Spring updates ==="
echo "→ Downloading staging repo (single tarball)..."
curl -fsSL "https://codeload.github.com/$REPO/tar.gz/refs/heads/$BRANCH" -o "$WORK/repo.tar.gz"

echo "→ Extracting..."
tar xzf "$WORK/repo.tar.gz" -C "$WORK"
SRC="$WORK/$(tar tzf "$WORK/repo.tar.gz" | head -1)tmp"

# Sanity check — make sure the blog files are real markdown, not error pages
if ! head -1 "$SRC/blog/blood-clots-periods-perimenopause.md" | grep -q "^---"; then
  echo "ERROR: downloaded blog files look corrupt. Aborting."
  exit 1
fi

# 1. Layout — Journal nav dropdown
echo "→ Layout..."
cp "$SRC/ss-layout.astro" "src/layouts/Layout.astro"

# 1b. AdSense ads.txt (served at site root via public/)
echo "→ ads.txt..."
mkdir -p public
cp "$SRC/ss-ads.txt" "public/ads.txt"

# 2. Symptoms page
echo "→ Symptoms page..."
cp "$SRC/ss-symptoms-cards.astro" "src/pages/symptoms.astro"

# 2b. Interactive body-map check page
echo "→ Interactive check page..."
cp "$SRC/ss-check.astro" "src/pages/check.astro"

# 3. Voices — remove old flat file to avoid routing conflict, then create subdirectory pages
echo "→ Voices pages..."
rm -f src/pages/voices.astro
mkdir -p src/pages/voices
cp "$SRC/ss-voices-index.astro" "src/pages/voices/index.astro"
cp "$SRC/ss-voices-slug.astro"  "src/pages/voices/[slug].astro"

# 4. Blog categories — updated with new sections
echo "→ Blog categories..."
cp "$SRC/ss-blog-categories.ts" "src/lib/blog-categories.ts"

# 5. All blog posts — copy the whole folder at once
echo "→ Blog posts ($(ls "$SRC/blog" | wc -l | tr -d ' ') files)..."
mkdir -p src/content/blog
cp "$SRC"/blog/*.md src/content/blog/

# Clean up
rm -rf "$WORK"

echo ""
echo "=== Committing... ==="
git add -A
git commit -m "Deploy all blogs, voices pages, updated layout and categories"
git push

echo ""
echo "=== Done! Railway will pick up the push and redeploy. ==="
