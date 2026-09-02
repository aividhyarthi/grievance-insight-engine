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

# 2c. Symptom quiz page
echo "→ Quiz page..."
cp "$SRC/ss-quiz.astro" "src/pages/quiz.astro"

# 2d. Favicon
echo "→ Favicon..."
cp "$SRC/ss-favicon.svg" "public/favicon.svg"

# 2e. Rebrand fix — pages with page-specific hardcoded colors
echo "→ Rebranded pages..."
mkdir -p src/pages/guide src/pages/community
cp "$SRC/ss-page-index.astro"                  "src/pages/index.astro"
cp "$SRC/ss-page-menopause.astro"              "src/pages/menopause.astro"
cp "$SRC/ss-page-guide-sexual-wellness.astro"  "src/pages/guide/sexual-wellness.astro"
cp "$SRC/ss-page-guide-hair-skin.astro"        "src/pages/guide/hair-skin.astro"
cp "$SRC/ss-page-guide-mood-memory.astro"      "src/pages/guide/mood-memory.astro"
cp "$SRC/ss-page-guide-sleep.astro"            "src/pages/guide/sleep.astro"
cp "$SRC/ss-page-guide-weight.astro"           "src/pages/guide/weight.astro"
cp "$SRC/ss-page-guide-symptoms.astro"         "src/pages/guide/symptoms.astro"
cp "$SRC/ss-page-guide-talk-to-doctor.astro"   "src/pages/guide/talk-to-doctor.astro"
cp "$SRC/ss-page-myths.astro"                  "src/pages/myths.astro"
cp "$SRC/ss-page-community-index.astro"        "src/pages/community/index.astro"
cp "$SRC/ss-page-privacy.astro"                "src/pages/privacy.astro"
cp "$SRC/ss-page-terms.astro"                  "src/pages/terms.astro"
cp "$SRC/ss-page-for-employers.astro"          "src/pages/for-employers.astro"
cp "$SRC/ss-page-how-it-works.astro"           "src/pages/how-it-works.astro"
mkdir -p src/pages/blog
cp "$SRC/ss-page-blog-index.astro"             "src/pages/blog/index.astro"

# 2f. Chat page + chat API (rebrand fix + Failed-to-fetch hardening)
echo "→ Chat page + API..."
mkdir -p src/pages/api
cp "$SRC/ss-chat.astro"                        "src/pages/chat.astro"
cp "$SRC/ss-chat-api.ts"                       "src/pages/api/chat.ts"

# 3. Voices — remove old flat file to avoid routing conflict, then create subdirectory pages
echo "→ Voices pages..."
rm -f src/pages/voices.astro
mkdir -p src/pages/voices
cp "$SRC/ss-voices-index.astro" "src/pages/voices/index.astro"
cp "$SRC/ss-voices-slug.astro"  "src/pages/voices/[slug].astro"

# 3b. Blog post template (rebrand fix — was never wired into this script before)
echo "→ Blog post template..."
cp "$SRC/ss-blog-slug.astro" "src/pages/blog/[slug].astro"

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
