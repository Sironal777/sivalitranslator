import React, { useState } from 'react';
import { X, Bookmark, Trash2, ArrowRight, Copy, Check, Sparkles } from 'lucide-react';
import { SavedTranslation, LanguageCode } from '../types';
import { LANGUAGES } from '../data/languages';

interface HistoryAndFavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedList: SavedTranslation[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onLoadTranslation: (text: string, src: LanguageCode, tgt: LanguageCode) => void;
}

export const HistoryAndFavoritesModal: React.FC<HistoryAndFavoritesModalProps> = ({
  isOpen,
  onClose,
  savedList,
  onDelete,
  onClearAll,
  onLoadTranslation,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [tab, setTab] = useState<'all' | 'favorites'>('all');

  if (!isOpen) return null;

  const filteredList = tab === 'favorites' ? savedList.filter((item) => item.favorite) : savedList;

  const getLangName = (code: string) => {
    return LANGUAGES.find((l) => l.code === code)?.nameMy || code;
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900/95 border border-white/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] p-6 text-slate-100 flex flex-col max-h-[85vh] overflow-hidden backdrop-blur-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">မှတ်သားထားသော ဘာသာပြန်များ</h3>
              <p className="text-xs text-slate-400">သိမ်းဆည်းထားသော အချက်အလက်များ ({savedList.length})</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls & Clear */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                tab === 'all'
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              အားလုံး ({savedList.length})
            </button>
            <button
              onClick={() => setTab('favorites')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                tab === 'favorites'
                  ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ကြိုက်နှစ်သက်ရာများ ({savedList.filter((i) => i.favorite).length})
            </button>
          </div>

          {savedList.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>အားလုံးဖျက်မည်</span>
            </button>
          )}
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1">
          {filteredList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500 space-y-2">
              <Bookmark className="w-8 h-8 opacity-40 text-slate-400" />
              <p className="text-sm">သိမ်းဆည်းထားသော အချက်အလက် မရှိသေးပါ</p>
              <p className="text-xs text-slate-500">ဘာသာပြန်ပြီးနောက် Bookmark icon ကိုနှိပ်၍ သိမ်းနိုင်ပါသည်</p>
            </div>
          ) : (
            filteredList.map((item) => (
              <div
                key={item.id}
                className="group relative p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col gap-2"
              >
                {/* Meta info & Langs */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-cyan-300">{getLangName(item.sourceLang)}</span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                    <span className="font-semibold text-purple-300">{getLangName(item.targetLang)}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(item.id, item.translatedText)}
                      title="Copy"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                    >
                      {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      title="Delete"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Source & Translated Texts */}
                <div className="text-xs text-slate-400 line-clamp-1">
                  {item.sourceText}
                </div>
                <div className="text-sm font-medium text-white line-clamp-2">
                  {item.translatedText}
                </div>
                {item.romanization && (
                  <div className="text-[11px] font-mono text-cyan-300/80 line-clamp-1">
                    {item.romanization}
                  </div>
                )}

                {/* Load to workspace button */}
                <button
                  onClick={() => {
                    onLoadTranslation(item.sourceText, item.sourceLang as LanguageCode, item.targetLang as LanguageCode);
                    onClose();
                  }}
                  className="mt-1 w-fit flex items-center gap-1.5 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>အလုပ်ခွင်သို့ ပြန်လည် ထည့်သွင်းမည်</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
