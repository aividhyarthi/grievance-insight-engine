# Retrofit Done Log

One line per post processed, oldest-first, newest entries at the bottom.
Format: `YYYY-MM-DD — vertical/filename.md — what changed (or "reviewed, no changes needed")`

2026-10-27 — blog/what-is-perimenopause.md — tone/title/meta already strong; added FAQ section (4 Q&A) + 3 internal links/CTA (none existed before)
2026-10-27 — blog/perimenopause-anxiety-mood-swings.md — tone/title/meta already strong; added FAQ section (4 Q&A) + internal links/CTA (none existed before)
2026-10-27 — blog/perimenopause-weight-gain-belly-fat.md — tone/title/meta already strong; added FAQ section (4 Q&A) + internal links/CTA (none existed before)
2026-10-27 — blog/heavy-periods-perimenopause-treatment.md — removed drug/device brand names (Cyklokapron, Trenaxa, Ponstan, Meftal, Susten, Gestofit, Duphaston, Mirena/Bayer) that violated house style, replaced with generic names throughout; added FAQ section (4 Q&A) + internal links/CTA
2026-10-27 — blog/perimenopausal-bleeding-evaluation-tests.md — tone/title/meta already strong; added FAQ section (4 Q&A) + internal links/CTA (none existed before)
2026-10-28 — blog/what-is-oestrogen-perimenopause.md — tone/title/meta already strong; added FAQ section (4 Q&A) + internal links/CTA (none existed before)
2026-10-28 — blog/how-long-does-perimenopause-last.md — tone/title/meta already strong; added FAQ section (4 Q&A) + internal links/CTA (none existed before)
2026-10-28 — blog/lifestyle-changes-perimenopause-symptoms.md — tone/title/meta already strong, supplement table already generic/clean; added FAQ section (4 Q&A) + internal links/CTA (none existed before)
2026-10-28 — blog/perimenopause-stories-support-community.md — already had one internal link (/community); added FAQ section (4 Q&A) + one cross-link to what-is-perimenopause
2026-10-28 — blog/anovulation-perimenopause.md — FAQ already strong, left as-is; removed brand names (Susten, Lutein, Gestofit, Mirena) that violated house style, replaced with generic names; added interlinking (had none)
2026-10-29 — blog/first-signs-of-perimenopause.md — title/meta/tone/FAQ already strong; added one cross-link (had only /quiz CTAs, no links to other posts)
2026-10-29 — blog/hormonal-symptom-treatments-perimenopause.md — worst brand-name violation found so far: 11 distinct brand/manufacturer mentions (Susten, Lutein, Gestofit, Estradot, Climara, Nexito, S-Citadep, Catapres, Gabapin/Intas, Gabantin/Sun Pharma, Mirena, Trenaxa, Pause 500, Primolut N, Progynova, Oestrogel, Paxidep) across body and FAQ; replaced all with generic drug names, kept the genuine tamoxifen-paroxetine interaction warning; added one cross-link (had none)
2026-10-29 — blog/how-to-test-for-perimenopause.md — title/meta/tone/FAQ already strong, lab-chain names (Thyrocare/SRL/Apollo) are informational not promotional, left as-is; added one cross-link (had only /quiz CTAs)
2026-10-29 — blog/natural-remedies-perimenopause.md — reviewed, no changes needed; title/meta/tone/FAQ already strong, supplement/herb names are all generic (not brands), and it already links out to 9 sibling symptom-specific posts, verified all 9 targets exist
2026-10-29 — blog/reliable-information-menopause-perimenopause.md — title/meta/tone/FAQ already strong; added one cross-link (had only /quiz CTAs, book titles are not brand violations)
2026-10-30 — blog/seven-signs-of-perimenopause.md — title/meta/tone/FAQ already strong; added one cross-link (had only /quiz CTAs, no links to other posts)
2026-10-30 — blog/should-i-take-estrogen-perimenopause.md — removed brand names from 3 pricing-table rows (Estradot, Climara, Oestrogel, Progynova, Susten); stripped stray "Q:" prefixes from visible FAQ questions
2026-10-30 — blog/what-does-progesterone-do-perimenopause.md — removed Indian brand-name list (Susten/Sun Pharma, Gestofit/Cipla, Lutein/Lupin) replaced with generic prose; FAQ changed Mirena IUS reference to generic levonorgestrel IUD (LNG-IUS)
2026-10-30 — blog/oestrogen-vs-progesterone-perimenopause.md — removed two Susten/Gestofit brand mentions, replaced with generic "body-identical/micronised" language
2026-10-30 — blog/can-i-get-pregnant-during-perimenopause.md — fixed pubDate typo (2026→2025); removed contraceptive brand names (Copper T, Multiload, Cerazette, Yasmin, Diane-35, Novelon, Mirena/Kyleena) replaced with generic names; added one cross-link to perimenopause-explained guide

Infrastructure fix (not part of the 5/day content quota): rewrote parseFaqFromBody() in ss-schema.ts as a state machine to handle all 4 FAQ markdown formats in use site-wide (previously only recognised one), fixing FAQPage structured data for 14/832 affected posts across all three verticals. Shipped as standalone commit.
