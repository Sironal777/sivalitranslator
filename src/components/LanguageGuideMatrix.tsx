import React, { useState } from 'react';
import { BookOpen, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { LANGUAGES } from '../data/languages';
import { LanguageCode } from '../types';

interface LanguageGuideMatrixProps {
  onSelectLangPair: (src: LanguageCode, tgt: LanguageCode) => void;
}

export const LanguageGuideMatrix: React.FC<LanguageGuideMatrixProps> = ({ onSelectLangPair }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="glass-panel rounded-3xl p-5 sm:p-6 transition-all">
        {/* Header Toggle */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>ဘာသာစကား ၇ မျိုး အသေးစိတ် မိတ်ဆက် & အက္ခရာများ</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase font-semibold">
                  7 Languages
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                မြန်မာ • အင်္ဂလိပ် • ပါဠိ • ဗီယက်နမ် • သက္ကတ • ရှမ်း(တႆး) • မွန်
              </p>
            </div>
          </div>

          <button
            aria-label="Toggle details"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition"
          >
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {/* Expanded Grid */}
        {isOpen && (
          <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fadeIn">
            {LANGUAGES.map((lang) => (
              <div
                key={lang.code}
                className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{lang.flagEmoji}</span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/10 text-cyan-200">
                      Code: {lang.code}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{lang.nameMy} ({lang.nameEn})</h4>
                  <p className="text-xs text-cyan-300 font-medium mt-0.5">{lang.nativeName}</p>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{lang.description}</p>
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs">
                    <span className="text-[10px] text-slate-400 block font-semibold">နမူနာ အသုံးအနှုန်း:</span>
                    <span className="text-slate-200 mt-0.5 block font-medium">{lang.sample}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <button
                    onClick={() => onSelectLangPair('my', lang.code)}
                    className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>မြန်မာ → {lang.nameMy} စမ်းမည်</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
