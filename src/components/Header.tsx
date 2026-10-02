import React from 'react';
import { Download, Bookmark, Sparkles, BookOpen, MessageSquare, Feather } from 'lucide-react';
import { AppLogo } from './AppLogo';
import { TranslationTone } from '../types';

interface HeaderProps {
  onOpenInstallModal: () => void;
  isInstalled: boolean;
  isInstallable: boolean;
  isIOS: boolean;
  selectedTone: TranslationTone;
  onSelectTone: (tone: TranslationTone) => void;
  savedCount: number;
  onOpenSaved: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenInstallModal,
  isInstalled,
  isInstallable,
  isIOS,
  selectedTone,
  onSelectTone,
  savedCount,
  onOpenSaved,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-slate-950/70 border-b border-white/10 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* Left: App Logo & Polyglot Brand */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <AppLogo size="md" />

          {/* Mobile buttons group */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onOpenSaved}
              aria-label="Saved Translations"
              className="relative p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition"
            >
              <Bookmark className="w-4 h-4 text-cyan-400" />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 text-[10px] font-bold text-slate-950 flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </button>

            {!isInstalled && (
              <button
                onClick={onOpenInstallModal}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-xs shadow-md shadow-cyan-500/20 active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
            )}
          </div>
        </div>

        {/* Center: Tone Preset Selector with 3D Pill Toggle */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-900/90 border border-white/10 shadow-inner max-w-full overflow-x-auto">
          <span className="text-[11px] font-medium text-slate-400 px-2.5 hidden sm:inline-flex items-center gap-1">
            <Feather className="w-3 h-3 text-cyan-400" />
            <span>လေသံ:</span>
          </span>

          <button
            onClick={() => onSelectTone('natural')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              selectedTone === 'natural'
                ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-300 border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3 h-3" />
            <span>သဘာဝ စကားပြော</span>
          </button>

          <button
            onClick={() => onSelectTone('formal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              selectedTone === 'formal'
                ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-300 border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>ယဉ်ကျေး တရားဝင်</span>
          </button>

          <button
            onClick={() => onSelectTone('dhamma')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              selectedTone === 'dhamma'
                ? 'bg-gradient-to-r from-amber-500/30 to-yellow-500/30 text-amber-300 border border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3 h-3" />
            <span>စာပေ / ဓမ္မ / ပါဠိတော်</span>
          </button>
        </div>

        {/* Right Desktop: Saved translations & PWA Install Button */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onOpenSaved}
            className="relative flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-medium transition-all hover:border-cyan-500/40"
          >
            <Bookmark className="w-4 h-4 text-cyan-400" />
            <span>မှတ်သားထားသည်များ</span>
            {savedCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold">
                {savedCount}
              </span>
            )}
          </button>

          {/* In-App Install Button */}
          {isInstalled ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <span>စက်ထဲထည့်သွင်းပြီး</span>
            </div>
          ) : (
            <button
              onClick={onOpenInstallModal}
              className="relative group flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white font-bold text-xs tracking-wide shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all hover:scale-105 active:scale-95"
            >
              <Download className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
              <span>{isIOS ? 'Install on iOS' : 'Install App'}</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
