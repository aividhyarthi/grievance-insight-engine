const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// POST /api/analyze  — send captured image to Claude Vision for medicine analysis
app.post('/api/analyze', async (req, res) => {
  const { imageBase64, language } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ success: false, error: 'Image is required' });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ success: false, error: 'ANTHROPIC_API_KEY is not configured on the server.' });
  }

  // Strip data-URI prefix if present and detect media type
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  const mediaType = imageBase64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
  const targetLanguage = language || 'English';

  const prompt = `You are a medical information assistant. Carefully examine this image of a medicine (tablet, syrup, capsule, cream, injection, drops, or other pharmaceutical product).

Your job:
1. Read all visible text on the label/packaging (brand name, generic name, composition, instructions, warnings, etc.).
2. Identify the medicine from its appearance, colour, shape, and label.
3. Use your medical knowledge to fill in any information not visible on the label.

IMPORTANT: Respond ENTIRELY in ${targetLanguage}. Every field must be written in ${targetLanguage} — not in English (unless ${targetLanguage} is English).

Return ONLY a valid JSON object with exactly these keys. Do not include any text outside the JSON:
{
  "name": "Brand name and generic/chemical name of the medicine",
  "type": "Form of the medicine — tablet / syrup / capsule / injection / cream / drops / etc.",
  "use": "What this medicine is used to treat or its primary indication",
  "ingredients": "Active ingredient(s) with strength/amount if visible",
  "dosage": "Recommended dose, frequency, and duration (standard adult dose if not visible on label)",
  "sideEffects": "Common and notable side effects the patient should know about",
  "warnings": "Important warnings, contraindications, drug interactions, and special precautions",
  "storage": "How and where to store this medicine (temperature, light, moisture, etc.)"
}

If you cannot identify the medicine at all, still return the JSON but set "name" to a phrase in ${targetLanguage} meaning "Medicine not identified — please scan again clearly" and leave other fields as empty strings.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64Data },
            },
            { type: 'text', text: prompt },
          ],
        },
      ],
    });

    const raw = message.content[0].text.trim();

    // Extract JSON — Claude may wrap it in markdown code fences
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.json({ success: false, error: 'Could not parse medicine information from AI response.' });
    }

    const medicineData = JSON.parse(jsonMatch[0]);

    // Optionally enrich with OpenFDA data (English names only — best-effort)
    try {
      const firstWord = encodeURIComponent((medicineData.name || '').split(/\s+/)[0]);
      if (firstWord && firstWord.length > 2) {
        const fdaUrl = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${firstWord}"&limit=1`;
        const fdaRes = await fetch(fdaUrl, { signal: AbortSignal.timeout(4000) });
        const fdaJson = await fdaRes.json();
        if (fdaJson.results?.[0]) {
          const fda = fdaJson.results[0];
          // Only append if the warnings field is empty — keep user's language data
          if (!medicineData.warnings && fda.warnings?.[0]) {
            medicineData.fdaNote = fda.warnings[0].substring(0, 400);
          }
        }
      }
    } catch {
      // OpenFDA is optional — silently skip on error
    }

    res.json({ success: true, data: medicineData });
  } catch (err) {
    console.error('[/api/analyze] Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/health — simple health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Catch-all: serve index.html (SPA)
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n  Medicine Scanner is running at http://localhost:${PORT}\n`);
});
