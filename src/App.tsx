import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { TranslationWorkspace } from './components/TranslationWorkspace';
import { QuickSamplesBar } from './components/QuickSamplesBar';
import { LanguageGuideMatrix } from './components/LanguageGuideMatrix';
import { PWAInstallModal } from './components/PWAInstallModal';
import { HistoryAndFavoritesModal } from './components/HistoryAndFavoritesModal';
import { usePWAInstall } from './hooks/usePWAInstall';
import { LanguageCode, TranslationTone, TranslationResponse, SavedTranslation } from './types';

export default function App() {
  const {
    isInstallable,
    isInstalled,
    isIOS,
    showPromptOnLoad,
    install,
    dismissPrompt,
    openInstallModal,
  } = usePWAInstall();

  const [sourceLang, setSourceLang] = useState<LanguageCode>('auto');
  const [targetLang, setTargetLang] = useState<LanguageCode>('shn');
  const [tone, setTone] = useState<TranslationTone>('natural');
  const [inputText, setInputText] = useState<string>('မင်္ဂလာပါ၊ နေကောင်းကျန်းမာပါသလားခင်ဗျာ။');
  const [result, setResult] = useState<TranslationResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Saved / Favorite translations in localStorage
  const [savedList, setSavedList] = useState<SavedTranslation[]>(() => {
    try {
      const stored = localStorage.getItem('lipiai_saved_translations');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isManualInstallModalOpen, setIsManualInstallModalOpen] = useState(false);

  // Sync saved translations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('lipiai_saved_translations', JSON.stringify(savedList));
    } catch (e) {
      console.error('Failed to sync to localStorage:', e);
    }
  }, [savedList]);

  // Translation executor
  const performTranslation = useCallback(
    async (text: string, src: LanguageCode, tgt: LanguageCode, currentTone: TranslationTone) => {
      const cleanText = text.trim();
      if (!cleanText) {
        setResult(null);
        setError(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: cleanText,
            sourceLang: src,
            targetLang: tgt,
            tone: currentTone,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Server responded with status ${response.status}`);
        }

        const data: TranslationResponse = await response.json();
        setResult(data);
      } catch (err: any) {
        console.error('Translation error:', err);
        setError(err.message || 'ဘာသာပြန်ရာတွင် အခက်အခဲရှိပါသည်။');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Auto-translate as user types (debounced by 500ms)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!inputText.trim()) {
      setResult(null);
      setIsLoading(false);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      performTranslation(inputText, sourceLang, targetLang, tone);
    }, 550);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputText, sourceLang, targetLang, tone, performTranslation]);

  // Swap Languages Handler
  const handleSwapLanguages = () => {
    if (sourceLang === 'auto') return;
    const oldSource = sourceLang;
    const oldTarget = targetLang;
    setSourceLang(oldTarget);
    setTargetLang(oldSource);

    if (result?.translatedText) {
      setInputText(result.translatedText);
    }
  };

  // Check if current active translation is saved
  const isCurrentSaved = Boolean(
    result &&
      savedList.some(
        (item) =>
          item.sourceText === inputText.trim() &&
          item.translatedText === result.translatedText &&
          item.targetLang === targetLang
      )
  );

  const handleToggleSave = () => {
    if (!result || !inputText.trim()) return;

    if (isCurrentSaved) {
      setSavedList((prev) =>
        prev.filter(
          (item) =>
            !(
              item.sourceText === inputText.trim() &&
              item.translatedText === result.translatedText &&
              item.targetLang === targetLang
            )
        )
      );
    } else {
      const newEntry: SavedTranslation = {
        id: Date.now().toString(),
        sourceText: inputText.trim(),
        translatedText: result.translatedText,
        sourceLang: sourceLang === 'auto' ? result.detectedSourceLang : sourceLang,
        targetLang: targetLang,
        romanization: result.romanization,
        timestamp: Date.now(),
        favorite: true,
      };
      setSavedList((prev) => [newEntry, ...prev]);
    }
  };

  const handleDeleteSaved = (id: string) => {
    setSavedList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAllSaved = () => {
    if (window.confirm('မှတ်သားထားသည်များ အားလုံးကို ဖျက်ပစ်ရန် သေချာပါသလား?')) {
      setSavedList([]);
    }
  };

  const handleLoadSavedToWorkspace = (text: string, src: LanguageCode, tgt: LanguageCode) => {
    setSourceLang(src);
    setTargetLang(tgt);
    setInputText(text);
  };

  const handleSelectSample = (text: string, src: LanguageCode, tgt: LanguageCode) => {
    setSourceLang(src);
    setTargetLang(tgt);
    setInputText(text);
  };

  return (
    <div className="relative min-h-screen bg-[#07090e] text-slate-100 flex flex-col overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 3D Glass Ambient Background Lights */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-cyan-600/12 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed top-1/2 right-10 w-[350px] h-[350px] bg-emerald-600/8 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none -z-10" />

      {/* Header */}
      <Header
        onOpenInstallModal={() => setIsManualInstallModalOpen(true)}
        isInstalled={isInstalled}
        isInstallable={isInstallable}
        isIOS={isIOS}
        selectedTone={tone}
        onSelectTone={setTone}
        savedCount={savedList.length}
        onOpenSaved={() => setIsHistoryModalOpen(true)}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 flex flex-col">
        {/* Quick Sample Phrases Bar */}
        <QuickSamplesBar onSelectSample={handleSelectSample} />

        {/* Translation Workspace */}
        <TranslationWorkspace
          sourceLang={sourceLang}
          targetLang={targetLang}
          onSelectSourceLang={setSourceLang}
          onSelectTargetLang={setTargetLang}
          onSwapLanguages={handleSwapLanguages}
          inputText={inputText}
          onInputChange={setInputText}
          result={result}
          isLoading={isLoading}
          error={error}
          tone={tone}
          onTranslateNow={() => performTranslation(inputText, sourceLang, targetLang, tone)}
          onSaveTranslation={handleToggleSave}
          isSaved={isCurrentSaved}
        />

        {/* 7-Language Matrix Info Section */}
        <LanguageGuideMatrix
          onSelectLangPair={(src, tgt) => {
            setSourceLang(src);
            setTargetLang(tgt);
          }}
        />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/10 py-6 px-4 text-center text-xs text-slate-500 backdrop-blur-md bg-slate-950/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">LipiAI စာပေမဉ္ဇရီ</span>
            <span>•</span>
            <span>မြန်မာ • အင်္ဂလိပ် • ပါဠိ • ဗီယက်နမ် • သက္ကတ • ရှမ်း(တႆး) • မွန်</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Progressive Web App (PWA) Ready</span>
            <span>•</span>
            <span className="text-cyan-400">Powered by Gemini AI</span>
          </div>
        </div>
      </footer>

      {/* Automatic Welcome Install Modal (Triggers on load if not installed) */}
      <PWAInstallModal
        isOpen={showPromptOnLoad || isManualInstallModalOpen}
        onClose={() => {
          dismissPrompt();
          setIsManualInstallModalOpen(false);
        }}
        onInstall={install}
        isInstallable={isInstallable}
        isIOS={isIOS}
        isInstalled={isInstalled}
      />

      {/* Saved / Favorites Modal Drawer */}
      <HistoryAndFavoritesModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        savedList={savedList}
        onDelete={handleDeleteSaved}
        onClearAll={handleClearAllSaved}
        onLoadTranslation={handleLoadSavedToWorkspace}
      />
    </div>
  );
}
