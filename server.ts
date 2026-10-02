import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '2mb' }));

// In-memory cache for fast auto-translation requests
const translationCache = new Map<string, any>();
const MAX_CACHE_SIZE = 500;

function getCacheKey(text: string, src: string, tgt: string, tone: string) {
  return `${src.toLowerCase()}_${tgt.toLowerCase()}_${tone.toLowerCase()}_${text.trim()}`;
}

function setCache(key: string, data: any) {
  if (translationCache.size >= MAX_CACHE_SIZE) {
    const firstKey = translationCache.keys().next().value;
    if (firstKey) translationCache.delete(firstKey);
  }
  translationCache.set(key, data);
}

// Server-side Gemini AI initialization
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Language metadata for system prompts
const LANGUAGE_GUIDES: Record<string, { name: string; nativeName: string; scriptDesc: string }> = {
  my: {
    name: 'Myanmar (Burmese)',
    nativeName: 'မြန်မာစာ',
    scriptDesc: 'Use standard modern Myanmar Unicode script. Use natural Burmese grammatical particles (တယ်၊ ပါတယ်၊ ၏၊ ၌၊ စသည်) and culturally authentic idioms.',
  },
  en: {
    name: 'English',
    nativeName: 'English',
    scriptDesc: 'Use natural, fluent contemporary English with appropriate tone and idiomatic nuance.',
  },
  pi: {
    name: 'Pali (Pāḷi)',
    nativeName: 'ပါဠိ (မာဂဓ)',
    scriptDesc: 'Sacred Buddhist canonical language. Provide both Pali in Myanmar script (e.g. ဓမ္မ၊ သံဃ၊ နိဗ္ဗာန၊ သဗ္ဗေ သတ္တာ သုခိတာ ဟောန္တု) AND standard IAST romanization. Respect Vibhatti (grammatical cases) and canonical Theravada usage.',
  },
  vi: {
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    scriptDesc: 'Standard Vietnamese with proper tone diacritics (dấu thanh), natural phrasing, and polite pronouns (e.g. bạn, tôi, xin chào).',
  },
  sa: {
    name: 'Sanskrit (Saṃskṛta)',
    nativeName: 'သက္ကတ (संस्कृतम्)',
    scriptDesc: 'Classical and Vedic Sanskrit. Provide standard Devanagari script, standard IAST romanization, and Myanmar script transliteration if helpful.',
  },
  shn: {
    name: 'Shan (Tai Yai)',
    nativeName: 'တႆး (လိၵ်ႈတႆး)',
    scriptDesc: 'Use authentic Shan script (Unicode U+1000..U+109F Shan block e.g., မႂ်ႇသုင်ၶႃႈ, ၶွပ်ႈၸႂ်, ၵိၼ်ၶဝ်ႈ). Provide Shan romanized phonetics for clarity.',
  },
  mnw: {
    name: 'Mon (Raman)',
    nativeName: 'ဘာသာမန် (မွန်စာ)',
    scriptDesc: 'Use authentic Mon language with Mon script characters (e.g. မာန်, တင်ဂုဏ်ရအဴ, မင်္ဂလာရအဴ). Provide phonetic guide.',
  },
};

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    supportedLanguages: Object.keys(LANGUAGE_GUIDES),
  });
});

// Polyglot Translation API Endpoint
app.post('/api/translate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, sourceLang = 'auto', targetLang = 'my', tone = 'natural' } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      res.status(400).json({ error: 'Text is required for translation.' });
      return;
    }

    const trimmedText = text.trim();

    // Check Cache
    const cacheKey = getCacheKey(trimmedText, sourceLang, targetLang, tone);
    if (translationCache.has(cacheKey)) {
      res.json(translationCache.get(cacheKey));
      return;
    }

    if (!ai) {
      if (!process.env.GEMINI_API_KEY) {
        res.status(500).json({
          error: 'GEMINI_API_KEY is not configured on the server. Please verify your environment secrets.',
        });
        return;
      }
      ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }

    const targetInfo = LANGUAGE_GUIDES[targetLang] || LANGUAGE_GUIDES.my;
    const sourceInfo = sourceLang !== 'auto' ? LANGUAGE_GUIDES[sourceLang] : null;

    const toneDescription =
      tone === 'formal'
        ? 'Polite, official, respectful, and formally proper tone.'
        : tone === 'dhamma'
        ? 'Literary, Buddhist canonical (Dhamma / Tipitaka), classical theological and scholarly tone.'
        : 'Natural conversational, modern, idiomatic colloquial everyday tone.';

    const systemInstruction = `You are "LipiAI Polyglot Engine" - an elite linguist and master polyglot translator specializing in Southeast Asian and Indic languages:
Myanmar (Burmese), English, Pali (Pāḷi/Magadha), Vietnamese (Tiếng Việt), Sanskrit (Saṃskṛta), Shan (လိၵ်ႈတႆး Tai Yai), and Mon (ဘာသာမန်).

Target Language: ${targetInfo.name} (${targetInfo.nativeName}).
${targetInfo.scriptDesc}
${sourceInfo ? `Source Language specified: ${sourceInfo.name} (${sourceInfo.nativeName}).` : 'Detect source language automatically.'}
Tone Requirement: ${toneDescription}

Instructions:
1. Translate accurately, naturally, and culturally faithfully into the requested target language.
2. If translating to Pali or Sanskrit, make sure canonical vocabulary and correct sandhi/grammar are applied.
3. If translating to Shan, use genuine Tai Shan words (e.g. မႂ်ႇသုင်, ယူႇလီယူႇႁႃႉ, ၶွပ်ႈၸႂ်) in Shan script (လိၵ်ႈတႆး).
4. If translating to Mon, use authentic Mon script and phrasing (e.g. မင်္ဂလာရအဴ, တင်ဂုဏ်ရအဴ).
5. Provide a Romanized reading / phonetic pronunciation guide for the translated text (especially vital for Pali IAST, Sanskrit IAST, Shan phonetics, Mon phonetics, and Vietnamese/Burmese).
6. Provide script transliterations where applicable (e.g. Pali in Myanmar script and Roman IAST; Sanskrit in Devanagari and Myanmar transliteration).
7. Provide a detailed word-by-word or grammatical breakdown explaining root words, particles, and meaning.
8. Provide 1 to 3 natural alternative expressions or synonyms in the target language.
9. Provide a concise cultural or linguistic usage note in Myanmar/English.`;

    const prompt = `Translate the following text into ${targetInfo.name}:
"""
${trimmedText}
"""`;

    let response;
    const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.3,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                translatedText: {
                  type: Type.STRING,
                  description: 'The translated text in the target language script',
                },
                detectedSourceLang: {
                  type: Type.STRING,
                  description: 'Code of detected source language: my, en, pi, vi, sa, shn, mnw, or other',
                },
                detectedSourceLangName: {
                  type: Type.STRING,
                  description: 'Human-readable name of the detected source language',
                },
                romanization: {
                  type: Type.STRING,
                  description: 'Phonetic romanization or IAST transcription of the translated text',
                },
                alternativeTranslations: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Alternative phrasing or variations in the target language',
                },
                scriptTransliterations: {
                  type: Type.OBJECT,
                  properties: {
                    myanmarScript: { type: Type.STRING, description: 'Text represented in Myanmar script' },
                    devanagariScript: { type: Type.STRING, description: 'Text represented in Devanagari if applicable' },
                    shanScript: { type: Type.STRING, description: 'Text represented in Shan script if applicable' },
                    monScript: { type: Type.STRING, description: 'Text represented in Mon script if applicable' },
                  },
                },
                grammarBreakdown: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      word: { type: Type.STRING, description: 'Target or source token' },
                      meaning: { type: Type.STRING, description: 'Definition or gloss' },
                      role: { type: Type.STRING, description: 'Part of speech, root, particle, or grammatical case' },
                    },
                  },
                  description: 'Word-by-word breakdown for educational learning',
                },
                culturalNote: {
                  type: Type.STRING,
                  description: 'Linguistic, cultural, or canonical tip explaining tone or historical context',
                },
              },
              required: ['translatedText', 'detectedSourceLang', 'detectedSourceLangName'],
            },
          },
        });
        if (response?.text) break;
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} failed or throttled, trying next candidate...`, err?.message || err);
      }
    }

    if (!response?.text) {
      throw lastError || new Error('All translation models are currently unavailable.');
    }

    const rawResult = response.text?.trim() || '{}';
    let parsedResult;
    try {
      parsedResult = JSON.parse(rawResult);
    } catch {
      parsedResult = {
        translatedText: rawResult,
        detectedSourceLang: sourceLang === 'auto' ? 'my' : sourceLang,
        detectedSourceLangName: 'Auto Detected',
      };
    }

    setCache(cacheKey, parsedResult);
    res.json(parsedResult);
  } catch (error: any) {
    console.error('Translation error:', error);
    res.status(500).json({
      error: error?.message || 'Translation failed. Please try again.',
    });
  }
});

// Quick Sample Quotes & Common Phrases API
app.get('/api/samples', (req: Request, res: Response) => {
  res.json([
    {
      category: 'မင်္ဂလာနှုတ်ခွန်း (Greetings)',
      sourceLang: 'my',
      targetLang: 'shn',
      text: 'မင်္ဂလာပါ၊ နေကောင်းကျန်းမာပါသလားခင်ဗျာ။',
    },
    {
      category: 'တႆး (Shan Daily)',
      sourceLang: 'shn',
      targetLang: 'my',
      text: 'မႂ်ႇသုင်ၶႃႈ၊ ပီႈၼွင်ႉတႆး ယူႇလီၵိၼ်ဝၢၼ်ယူႇႁႃႉ။',
    },
    {
      category: 'မွန် (Mon Phrase)',
      sourceLang: 'mnw',
      targetLang: 'my',
      text: 'မင်္ဂလာရအဴ၊ မာန်ပၠန်ရောင် တင်ဂုဏ်ရအဴ။',
    },
    {
      category: 'ပါဠိတော် (Pāli Dhamma)',
      sourceLang: 'pi',
      targetLang: 'my',
      text: 'သဗ္ဗေ သတ္တာ သုခိတာ ဟောန္တု၊ သဗ္ဗေ သတ္တာ အဝေရာ ဟောန္တု။',
    },
    {
      category: 'သက္ကတ (Sanskrit Stotra)',
      sourceLang: 'sa',
      targetLang: 'en',
      text: 'सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः।',
    },
    {
      category: 'အင်္ဂလိပ် (English Wisdom)',
      sourceLang: 'en',
      targetLang: 'pi',
      text: 'Peace comes from within. Do not seek it without.',
    },
    {
      category: 'ဗီယက်နမ် (Vietnamese)',
      sourceLang: 'vi',
      targetLang: 'my',
      text: 'Chúc bạn một ngày làm việc tràn đầy năng lượng và bình an!',
    },
  ]);
});

// Mount Vite or serve static assets
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LipiAI Polyglot Translator Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
