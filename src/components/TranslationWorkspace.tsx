import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRightLeft,
  Copy,
  Check,
  Volume2,
  Bookmark,
  BookmarkCheck,
  RotateCcw,
  Sparkles,
  Info,
  Layers,
  Languages,
  BookOpen,
  VolumeX,
} from 'lucide-react';
import { LanguageCode, TranslationTone, TranslationResponse } from '../types';
import { LANGUAGES, SOURCE_LANGUAGES } from '../data/languages';

interface TranslationWorkspaceProps {
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
  onSelectSourceLang: (lang: LanguageCode) => void;
  onSelectTargetLang: (lang: LanguageCode) => void;
  onSwapLanguages: () => void;
  inputText: string;
  onInputChange: (text: string) => void;
  result: TranslationResponse | null;
  isLoading: boolean;
  error: string | null;
  tone: TranslationTone;
  onTranslateNow: () => void;
  onSaveTranslation: () => void;
  isSaved: boolean;
}

export const TranslationWorkspace: React.FC<TranslationWorkspaceProps> = ({
  sourceLang,
  targetLang,
  onSelectSourceLang,
  onSelectTargetLang,
  onSwapLanguages,
  inputText,
  onInputChange,
  result,
  isLoading,
  error,
  tone,
  onTranslateNow,
  onSaveTranslation,
  isSaved,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedRoman, setCopiedRoman] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeScriptTab, setActiveScriptTab] = useState<'default' | 'myanmar' | 'devanagari' | 'shan' | 'mon'>('default');
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Reset script tab on target language change
  useEffect(() => {
    setActiveScriptTab('default');
  }, [targetLang]);

  const handleCopy = (text: string, isRoman: boolean = false) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (isRoman) {
      setCopiedRoman(true);
      setTimeout(() => setCopiedRoman(false), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSpeak = (text: string, langCode: string) => {
    if (!('speechSynthesis' in window) || !text) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    // Map language code to BCP 47
    const langMap: Record<string, string> = {
      en: 'en-US',
      vi: 'vi-VN',
      my: 'my-MM',
      sa: 'hi-IN',
      pi: 'hi-IN',
      shn: 'th-TH', // Closest Tai phonetic pitch match
      mnw: 'my-MM',
    };

    utterance.lang = langMap[langCode] || 'en-US';
    utterance.rate = 0.9;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const currentSourceMeta = SOURCE_LANGUAGES.find((l) => l.code === sourceLang);
  const currentTargetMeta = LANGUAGES.find((l) => l.code === targetLang);

  // Transliteration tabs availability
  const hasTransliterations =
    result?.scriptTransliterations &&
    (result.scriptTransliterations.myanmarScript ||
      result.scriptTransliterations.devanagariScript ||
      result.scriptTransliterations.shanScript ||
      result.scriptTransliterations.monScript);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 3D Glass Language Selector Bar */}
      <div className="relative z-10 glass-panel rounded-3xl p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xl">
        {/* Source Language Picker */}
        <div className="w-full md:w-5/12 flex items-center gap-2">
          <div className="relative w-full">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 pl-1 block mb-1">
              မူရင်းဘာသာ (Source Language)
            </label>
            <div className="relative">
              <select
                value={sourceLang}
                onChange={(e) => onSelectSourceLang(e.target.value as LanguageCode)}
                className="w-full appearance-none rounded-2xl bg-slate-800/80 border border-white/10 px-4 py-3 pr-10 text-sm font-semibold text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 backdrop-blur-xl transition"
              >
                {SOURCE_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                    {lang.flagEmoji} {lang.nameMy} — {lang.nativeName} ({lang.nameEn})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
                <Languages className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Swap Button with 3D Jewel Button Effect */}
        <div className="flex items-center justify-center shrink-0 my-1 md:my-0">
          <button
            onClick={onSwapLanguages}
            disabled={sourceLang === 'auto'}
            title={sourceLang === 'auto' ? 'Auto mode တွင် ဘာသာစကား လဲလှယ်၍မရပါ' : 'ဘာသာစကား အပြန်အလှန် လဲလှယ်မည်'}
            className={`p-3 rounded-2xl border transition-all duration-300 ${
              sourceLang === 'auto'
                ? 'opacity-40 cursor-not-allowed bg-slate-800/50 border-white/5 text-slate-500'
                : 'bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border-white/20 text-cyan-300 hover:scale-110 active:scale-95 hover:border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
            }`}
          >
            <ArrowRightLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Target Language Picker */}
        <div className="w-full md:w-5/12 flex items-center gap-2">
          <div className="relative w-full">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 pl-1 block mb-1">
              ဘာသာပြန်လိုသောဘာသာ (Target Language)
            </label>
            <div className="relative">
              <select
                value={targetLang}
                onChange={(e) => onSelectTargetLang(e.target.value as LanguageCode)}
                className="w-full appearance-none rounded-2xl bg-slate-800/80 border border-white/10 px-4 py-3 pr-10 text-sm font-semibold text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 backdrop-blur-xl transition"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                    {lang.flagEmoji} {lang.nameMy} — {lang.nativeName} ({lang.nameEn})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
                <Languages className="w-4 h-4 text-purple-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dual Glass Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT PANEL: Input Source Text Box */}
        <div className="relative glass-card-3d rounded-3xl p-5 sm:p-6 flex flex-col min-h-[380px] sm:min-h-[440px] shadow-2xl overflow-hidden">
          {/* Top Info Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs mb-3">
            <div className="flex items-center gap-2">
              <span className="text-base">{currentSourceMeta?.flagEmoji}</span>
              <span className="font-bold text-slate-200">{currentSourceMeta?.nameMy}</span>
              <span className="text-[11px] text-slate-400">({currentSourceMeta?.script})</span>
            </div>

            {inputText.length > 0 && (
              <button
                onClick={() => onInputChange('')}
                className="text-slate-400 hover:text-rose-400 text-xs flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ရှင်းလင်းမည်</span>
              </button>
            )}
          </div>

          {/* Text Area */}
          <textarea
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="ဤနေရာတွင် စာထည့်ပါ သို့မဟုတ် ကူးထည့်ပါ (စာထည့်လိုက်တာနဲ့ အလိုအလျောက် ဘာသာပြန်ပေးပါမည်)..."
            rows={8}
            className="w-full flex-1 bg-transparent text-slate-100 placeholder:text-slate-500 font-sans text-base sm:text-lg focus:outline-none resize-none leading-relaxed"
          />

          {/* Bottom Toolbar */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 mt-auto">
            <div className="flex items-center gap-3">
              <span>{inputText.length} စာလုံး</span>
              {isLoading && (
                <div className="flex items-center gap-1.5 text-cyan-400 font-medium animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI အော်တို ဘာသာပြန်နေသည်...</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {inputText.trim() && (
                <button
                  onClick={onTranslateNow}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 font-semibold transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>အခုပြန်မည်</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Output Translation Box */}
        <div className="relative glass-card-3d rounded-3xl p-5 sm:p-6 flex flex-col min-h-[380px] sm:min-h-[440px] shadow-2xl border-cyan-500/20 overflow-hidden">
          {/* Ambient Glow in Output Card */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Info Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs mb-3 z-10">
            <div className="flex items-center gap-2">
              <span className="text-base">{currentTargetMeta?.flagEmoji}</span>
              <span className="font-bold text-cyan-300">{currentTargetMeta?.nameMy}</span>
              {result?.detectedSourceLangName && sourceLang === 'auto' && (
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] text-cyan-300">
                  Detected: {result.detectedSourceLangName}
                </span>
              )}
            </div>

            {/* Quick Actions (Copy, TTS, Bookmark) */}
            <div className="flex items-center gap-2">
              {result?.translatedText && (
                <>
                  <button
                    onClick={() => handleSpeak(result.translatedText, targetLang)}
                    title="အသံထွက် နားထောင်မည်"
                    className={`p-2 rounded-xl border transition ${
                      isSpeaking
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-cyan-300'
                    }`}
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => handleCopy(result.translatedText)}
                    title="စာသားအား ကူးယူမည်"
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-cyan-300 transition"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={onSaveTranslation}
                    title="သိမ်းဆည်း မှတ်သားမည်"
                    className={`p-2 rounded-xl border transition ${
                      isSaved
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-cyan-300'
                    }`}
                  >
                    {isSaved ? <BookmarkCheck className="w-4 h-4 text-cyan-300" /> : <Bookmark className="w-4 h-4" />}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Main Output Content */}
          <div className="flex-1 overflow-y-auto space-y-4 py-2 z-10">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-48 space-y-3">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
                  <div className="w-9 h-9 rounded-full border-2 border-t-cyan-400 border-r-purple-400 border-b-transparent border-l-transparent animate-spin" />
                </div>
                <p className="text-xs text-slate-400 font-medium animate-pulse">
                  Gemini AI ဖြင့် အချိန်နှင့်တပြေးညီ ဘာသာပြန်နေပါသည်...
                </p>
              </div>
            ) : error ? (
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs sm:text-sm">
                <p className="font-bold mb-1">ဘာသာပြန်ရာတွင် အခက်အခဲရှိပါသည်</p>
                <p className="text-slate-300">{error}</p>
              </div>
            ) : result?.translatedText ? (
              <div className="space-y-4">
                {/* Script View Switcher (If alternative scripts exist e.g. Pali/Sanskrit in Myanmar script or Roman) */}
                {hasTransliterations && (
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/60 border border-white/10 w-fit text-[11px]">
                    <span className="text-slate-400 px-2 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-cyan-400" />
                      <span>အက္ခရာ:</span>
                    </span>
                    <button
                      onClick={() => setActiveScriptTab('default')}
                      className={`px-2.5 py-1 rounded-lg transition ${
                        activeScriptTab === 'default'
                          ? 'bg-cyan-500/30 text-cyan-300 font-bold border border-cyan-500/30'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      မူရင်းအက္ခရာ
                    </button>
                    {result.scriptTransliterations?.myanmarScript && (
                      <button
                        onClick={() => setActiveScriptTab('myanmar')}
                        className={`px-2.5 py-1 rounded-lg transition ${
                          activeScriptTab === 'myanmar'
                            ? 'bg-cyan-500/30 text-cyan-300 font-bold border border-cyan-500/30'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        မြန်မာအက္ခရာ
                      </button>
                    )}
                    {result.scriptTransliterations?.devanagariScript && (
                      <button
                        onClick={() => setActiveScriptTab('devanagari')}
                        className={`px-2.5 py-1 rounded-lg transition ${
                          activeScriptTab === 'devanagari'
                            ? 'bg-cyan-500/30 text-cyan-300 font-bold border border-cyan-500/30'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Devanagari
                      </button>
                    )}
                  </div>
                )}

                {/* Primary Translated Output Text */}
                <div className="text-lg sm:text-2xl font-medium text-white leading-relaxed select-text tracking-wide">
                  {activeScriptTab === 'myanmar' && result.scriptTransliterations?.myanmarScript
                    ? result.scriptTransliterations.myanmarScript
                    : activeScriptTab === 'devanagari' && result.scriptTransliterations?.devanagariScript
                    ? result.scriptTransliterations.devanagariScript
                    : result.translatedText}
                </div>

                {/* Romanization / Pronunciation Guide (IAST / Tai / Mon phonetics) */}
                {result.romanization && (
                  <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        <span>အသံထွက် / ရိုမန်နိုက်ဇေးရှင်း (Pronunciation / IAST)</span>
                      </span>
                      <button
                        onClick={() => handleCopy(result.romanization!, true)}
                        className="text-slate-400 hover:text-cyan-300 text-[10px] flex items-center gap-1"
                      >
                        {copiedRoman ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedRoman ? 'ကူးပြီး' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="font-mono text-cyan-200 text-xs sm:text-sm select-all">
                      {result.romanization}
                    </div>
                  </div>
                )}

                {/* Word-by-Word Breakdown / Grammar Insights */}
                {result.grammarBreakdown && result.grammarBreakdown.length > 0 && (
                  <div className="pt-2">
                    <div className="text-[11px] font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>စကားလုံး အဓိပ္ပာယ်ခွဲခြမ်းစိတ်ဖြာချက် (Word Analysis)</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.grammarBreakdown.map((item, idx) => (
                        <div
                          key={idx}
                          className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/40 text-xs flex flex-col transition"
                        >
                          <span className="font-bold text-white text-xs">{item.word}</span>
                          <span className="text-[11px] text-cyan-300">{item.meaning}</span>
                          {item.role && <span className="text-[9px] text-slate-400 font-sans">{item.role}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Alternative Translations */}
                {result.alternativeTranslations && result.alternativeTranslations.length > 0 && (
                  <div className="pt-1">
                    <div className="text-[11px] font-semibold text-slate-400 mb-1.5">
                      အခြားသော အသုံးအနှုန်းများ (Alternative Expressions):
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {result.alternativeTranslations.map((alt, i) => (
                        <span
                          key={i}
                          onClick={() => handleCopy(alt)}
                          title="Click to copy"
                          className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-slate-300 text-xs cursor-pointer transition hover:text-white"
                        >
                          {alt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cultural / Usage Context Note */}
                {result.culturalNote && (
                  <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200 flex items-start gap-2">
                    <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{result.culturalNote}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500 space-y-2">
                <Languages className="w-8 h-8 opacity-40 text-slate-400" />
                <p className="text-xs sm:text-sm">
                  စာထည့်လိုက်သည်နှင့် ဤနေရာတွင် သဘာဝကျသော AI ဘာသာပြန်ကို မြင်တွေ့ရပါမည်
                </p>
              </div>
            )}
          </div>

          {/* Bottom Indicator */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-500 mt-auto z-10">
            <span>Powered by Gemini AI Engine</span>
            <span className="text-cyan-400/80 font-medium">3D Glass Polyglot</span>
          </div>
        </div>
      </div>
    </div>
  );
};
