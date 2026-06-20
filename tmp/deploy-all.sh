#!/usr/bin/env bash
# deploy-all.sh — run this from inside the thesecondspring repo directory
# Usage: bash deploy-all.sh

set -e

BASE="https://raw.githubusercontent.com/aividhyarthi/grievance-insight-engine/claude/perimenopause-chat-app-kgml4/tmp"

echo "=== Deploying The Second Spring updates ==="

# 1. Layout — Journal nav dropdown
echo "→ Layout..."
curl -sL "$BASE/ss-layout.astro" -o "src/layouts/Layout.astro"

# 2. Symptoms page
echo "→ Symptoms page..."
curl -sL "$BASE/ss-symptoms-cards.astro" -o "src/pages/symptoms.astro"

# 3. Voices — remove old flat file to avoid routing conflict, then create subdirectory pages
echo "→ Voices pages..."
rm -f src/pages/voices.astro
mkdir -p src/pages/voices
curl -sL "$BASE/ss-voices-index.astro" -o "src/pages/voices/index.astro"
curl -sL "$BASE/ss-voices-slug.astro"  -o "src/pages/voices/[slug].astro"

# 4. Blog categories — updated with new sections (Body & Pain, Cycles & Bleeding, Sexual & Intimate Health)
echo "→ Blog categories..."
curl -sL "$BASE/ss-blog-categories.ts" -o "src/lib/blog-categories.ts"

# 5. All blog posts
echo "→ Blog posts..."
mkdir -p src/content/blog

BLOG_BASE="$BASE/blog"

curl -sL "$BLOG_BASE/can-perimenopause-cause-depression.md"              -o "src/content/blog/can-perimenopause-cause-depression.md"
curl -sL "$BLOG_BASE/can-i-get-pregnant-during-perimenopause.md"         -o "src/content/blog/can-i-get-pregnant-during-perimenopause.md"
curl -sL "$BLOG_BASE/can-perimenopause-cause-acne.md"                    -o "src/content/blog/can-perimenopause-cause-acne.md"
curl -sL "$BLOG_BASE/blood-clots-periods-perimenopause.md"               -o "src/content/blog/blood-clots-periods-perimenopause.md"
curl -sL "$BLOG_BASE/can-perimenopause-cause-dizziness.md"               -o "src/content/blog/can-perimenopause-cause-dizziness.md"
curl -sL "$BLOG_BASE/can-perimenopause-cause-back-pain.md"               -o "src/content/blog/can-perimenopause-cause-back-pain.md"
curl -sL "$BLOG_BASE/can-perimenopause-cause-breathing-problems.md"      -o "src/content/blog/can-perimenopause-cause-breathing-problems.md"
curl -sL "$BLOG_BASE/anovulation-perimenopause-link.md"                  -o "src/content/blog/anovulation-perimenopause-link.md"
curl -sL "$BLOG_BASE/can-perimenopause-cause-bloating.md"                -o "src/content/blog/can-perimenopause-cause-bloating.md"
curl -sL "$BLOG_BASE/anovulation-perimenopause.md"                       -o "src/content/blog/anovulation-perimenopause.md"
curl -sL "$BLOG_BASE/can-perimenopause-cause-water-retention.md"         -o "src/content/blog/can-perimenopause-cause-water-retention.md"
curl -sL "$BLOG_BASE/does-perimenopause-cause-water-retention.md"        -o "src/content/blog/does-perimenopause-cause-water-retention.md"
curl -sL "$BLOG_BASE/first-signs-of-perimenopause.md"                    -o "src/content/blog/first-signs-of-perimenopause.md"
curl -sL "$BLOG_BASE/does-perimenopause-make-you-hornier.md"             -o "src/content/blog/does-perimenopause-make-you-hornier.md"
curl -sL "$BLOG_BASE/can-perimenopause-cause-high-blood-pressure.md"     -o "src/content/blog/can-perimenopause-cause-high-blood-pressure.md"
curl -sL "$BLOG_BASE/how-long-does-perimenopause-last.md"                -o "src/content/blog/how-long-does-perimenopause-last.md"
curl -sL "$BLOG_BASE/heavy-periods-perimenopause-treatment.md"           -o "src/content/blog/heavy-periods-perimenopause-treatment.md"
curl -sL "$BLOG_BASE/hormonal-symptom-treatments-perimenopause.md"       -o "src/content/blog/hormonal-symptom-treatments-perimenopause.md"
curl -sL "$BLOG_BASE/how-long-heavy-periods-perimenopause.md"            -o "src/content/blog/how-long-heavy-periods-perimenopause.md"
curl -sL "$BLOG_BASE/how-to-test-for-perimenopause.md"                   -o "src/content/blog/how-to-test-for-perimenopause.md"
curl -sL "$BLOG_BASE/natural-remedies-perimenopause-depression.md"       -o "src/content/blog/natural-remedies-perimenopause-depression.md"
curl -sL "$BLOG_BASE/natural-remedies-perimenopause-anxiety.md"          -o "src/content/blog/natural-remedies-perimenopause-anxiety.md"
curl -sL "$BLOG_BASE/low-progesterone-symptoms-perimenopause.md"         -o "src/content/blog/low-progesterone-symptoms-perimenopause.md"
curl -sL "$BLOG_BASE/natural-remedies-perimenopause-brain-fog.md"        -o "src/content/blog/natural-remedies-perimenopause-brain-fog.md"
curl -sL "$BLOG_BASE/is-spotting-common-in-perimenopause.md"             -o "src/content/blog/is-spotting-common-in-perimenopause.md"
curl -sL "$BLOG_BASE/manage-perimenopause-naturally.md"                  -o "src/content/blog/manage-perimenopause-naturally.md"
curl -sL "$BLOG_BASE/lifestyle-changes-perimenopause-symptoms.md"        -o "src/content/blog/lifestyle-changes-perimenopause-symptoms.md"
curl -sL "$BLOG_BASE/natural-remedies-perimenopause-hair-loss.md"        -o "src/content/blog/natural-remedies-perimenopause-hair-loss.md"
curl -sL "$BLOG_BASE/oestrogen-vs-progesterone-perimenopause.md"         -o "src/content/blog/oestrogen-vs-progesterone-perimenopause.md"
curl -sL "$BLOG_BASE/natural-remedies-perimenopause.md"                  -o "src/content/blog/natural-remedies-perimenopause.md"
curl -sL "$BLOG_BASE/perimenopausal-bleeding-evaluation-tests.md"        -o "src/content/blog/perimenopausal-bleeding-evaluation-tests.md"
curl -sL "$BLOG_BASE/natural-remedies-perimenopause-weight-gain.md"      -o "src/content/blog/natural-remedies-perimenopause-weight-gain.md"
curl -sL "$BLOG_BASE/natural-remedies-perimenopause-mood-swings.md"      -o "src/content/blog/natural-remedies-perimenopause-mood-swings.md"
curl -sL "$BLOG_BASE/natural-remedies-perimenopause-heavy-bleeding.md"   -o "src/content/blog/natural-remedies-perimenopause-heavy-bleeding.md"
curl -sL "$BLOG_BASE/natural-remedies-perimenopause-fatigue.md"          -o "src/content/blog/natural-remedies-perimenopause-fatigue.md"
curl -sL "$BLOG_BASE/natural-remedies-perimenopause-hot-flashes.md"      -o "src/content/blog/natural-remedies-perimenopause-hot-flashes.md"
curl -sL "$BLOG_BASE/perimenopause-symptoms-45-50.md"                    -o "src/content/blog/perimenopause-symptoms-45-50.md"
curl -sL "$BLOG_BASE/perimenopause-working-women-india.md"               -o "src/content/blog/perimenopause-working-women-india.md"
curl -sL "$BLOG_BASE/perimenopause-symptoms-30s.md"                      -o "src/content/blog/perimenopause-symptoms-30s.md"
curl -sL "$BLOG_BASE/perimenopause-stories-support-community.md"         -o "src/content/blog/perimenopause-stories-support-community.md"
curl -sL "$BLOG_BASE/perimenopause-weight-gain-belly-fat.md"             -o "src/content/blog/perimenopause-weight-gain-belly-fat.md"
curl -sL "$BLOG_BASE/perimenopause-symptoms-40s.md"                      -o "src/content/blog/perimenopause-symptoms-40s.md"
curl -sL "$BLOG_BASE/perimenopause-age-india.md"                         -o "src/content/blog/perimenopause-age-india.md"
curl -sL "$BLOG_BASE/perimenopause-anxiety-mood-swings.md"               -o "src/content/blog/perimenopause-anxiety-mood-swings.md"
curl -sL "$BLOG_BASE/what-happens-to-fibroids-during-perimenopause.md"   -o "src/content/blog/what-happens-to-fibroids-during-perimenopause.md"
curl -sL "$BLOG_BASE/seven-signs-of-perimenopause.md"                    -o "src/content/blog/seven-signs-of-perimenopause.md"
curl -sL "$BLOG_BASE/reliable-information-menopause-perimenopause.md"    -o "src/content/blog/reliable-information-menopause-perimenopause.md"
curl -sL "$BLOG_BASE/signs-perimenopause-starting.md"                    -o "src/content/blog/signs-perimenopause-starting.md"
curl -sL "$BLOG_BASE/what-is-oestrogen-perimenopause.md"                 -o "src/content/blog/what-is-oestrogen-perimenopause.md"
curl -sL "$BLOG_BASE/what-causes-hair-loss-in-perimenopause.md"          -o "src/content/blog/what-causes-hair-loss-in-perimenopause.md"
curl -sL "$BLOG_BASE/should-i-take-estrogen-perimenopause.md"            -o "src/content/blog/should-i-take-estrogen-perimenopause.md"
curl -sL "$BLOG_BASE/what-does-progesterone-do-perimenopause.md"         -o "src/content/blog/what-does-progesterone-do-perimenopause.md"
curl -sL "$BLOG_BASE/when-to-see-doctor-perimenopause.md"                -o "src/content/blog/when-to-see-doctor-perimenopause.md"
curl -sL "$BLOG_BASE/what-is-perimenopause.md"                           -o "src/content/blog/what-is-perimenopause.md"
curl -sL "$BLOG_BASE/coping-emotionally-perimenopause.md"                -o "src/content/blog/coping-emotionally-perimenopause.md"
curl -sL "$BLOG_BASE/hormone-fluctuations-perimenopause.md"              -o "src/content/blog/hormone-fluctuations-perimenopause.md"
curl -sL "$BLOG_BASE/interpret-perimenopause-hormone-graph.md"           -o "src/content/blog/interpret-perimenopause-hormone-graph.md"
curl -sL "$BLOG_BASE/hormone-replacement-therapy-after-menopause.md"     -o "src/content/blog/hormone-replacement-therapy-after-menopause.md"
curl -sL "$BLOG_BASE/joint-pain-muscle-aches-perimenopause.md"           -o "src/content/blog/joint-pain-muscle-aches-perimenopause.md"
curl -sL "$BLOG_BASE/urinary-symptoms-perimenopause.md"                  -o "src/content/blog/urinary-symptoms-perimenopause.md"
curl -sL "$BLOG_BASE/talking-to-husband-perimenopause-india.md"          -o "src/content/blog/talking-to-husband-perimenopause-india.md"
curl -sL "$BLOG_BASE/perimenopause-and-pcos.md"                          -o "src/content/blog/perimenopause-and-pcos.md"
curl -sL "$BLOG_BASE/perimenopause-thyroid-difference.md"                -o "src/content/blog/perimenopause-thyroid-difference.md"
curl -sL "$BLOG_BASE/heart-health-after-menopause-india.md"              -o "src/content/blog/heart-health-after-menopause-india.md"
curl -sL "$BLOG_BASE/perimenopause-sex-painful-intercourse.md"           -o "src/content/blog/perimenopause-sex-painful-intercourse.md"
curl -sL "$BLOG_BASE/indian-diet-perimenopause.md"                       -o "src/content/blog/indian-diet-perimenopause.md"
curl -sL "$BLOG_BASE/false-positive-pregnancy-test-perimenopause.md"     -o "src/content/blog/false-positive-pregnancy-test-perimenopause.md"
curl -sL "$BLOG_BASE/perimenopause-symptoms-between-periods.md"          -o "src/content/blog/perimenopause-symptoms-between-periods.md"
curl -sL "$BLOG_BASE/how-long-hormonal-fluctuations-perimenopause.md"    -o "src/content/blog/how-long-hormonal-fluctuations-perimenopause.md"
curl -sL "$BLOG_BASE/balancing-hormones-perimenopause-pregnancy.md"      -o "src/content/blog/balancing-hormones-perimenopause-pregnancy.md"
# New blogs — 13 added in recent sessions
curl -sL "$BLOG_BASE/perimenopause-allergy-flare-ups.md"                 -o "src/content/blog/perimenopause-allergy-flare-ups.md"
curl -sL "$BLOG_BASE/perimenopause-heavy-bleeding-extreme-hunger.md"     -o "src/content/blog/perimenopause-heavy-bleeding-extreme-hunger.md"
curl -sL "$BLOG_BASE/perimenopause-flushed-cheeks.md"                    -o "src/content/blog/perimenopause-flushed-cheeks.md"
curl -sL "$BLOG_BASE/perimenopause-breast-pain.md"                       -o "src/content/blog/perimenopause-breast-pain.md"
curl -sL "$BLOG_BASE/perimenopause-joint-pain.md"                        -o "src/content/blog/perimenopause-joint-pain.md"
curl -sL "$BLOG_BASE/perimenopause-breast-tenderness.md"                 -o "src/content/blog/perimenopause-breast-tenderness.md"
curl -sL "$BLOG_BASE/perimenopause-painful-ovulation.md"                 -o "src/content/blog/perimenopause-painful-ovulation.md"
curl -sL "$BLOG_BASE/perimenopause-nipple-pain.md"                       -o "src/content/blog/perimenopause-nipple-pain.md"
curl -sL "$BLOG_BASE/perimenopause-hip-pain.md"                          -o "src/content/blog/perimenopause-hip-pain.md"
curl -sL "$BLOG_BASE/perimenopause-ear-pain.md"                          -o "src/content/blog/perimenopause-ear-pain.md"
curl -sL "$BLOG_BASE/ovulation-during-perimenopause.md"                  -o "src/content/blog/ovulation-during-perimenopause.md"
curl -sL "$BLOG_BASE/perimenopause-abdominal-pain.md"                    -o "src/content/blog/perimenopause-abdominal-pain.md"
curl -sL "$BLOG_BASE/perimenopause-vaginal-dryness.md"                   -o "src/content/blog/perimenopause-vaginal-dryness.md"

echo ""
echo "=== All files downloaded. Committing... ==="
git add -A
git commit -m "Deploy all 83 blogs, voices pages, updated layout and categories"
git push
echo ""
echo "=== Done! Railway will pick up the push and redeploy. ==="
