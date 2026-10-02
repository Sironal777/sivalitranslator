import React from 'react';
import { Sparkles } from 'lucide-react';
import { SAMPLE_QUOTES } from '../data/languages';
import { LanguageCode } from '../types';

interface QuickSamplesBarProps {
  onSelectSample: (text: string, src: LanguageCode, tgt: LanguageCode) => void;
}

export const QuickSamplesBar: React.FC<QuickSamplesBarProps> = ({ onSelectSample }) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-400">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
        <span>နမူနာစာသားများဖြင့် ချက်ချင်း စမ်းသပ်ကြည့်ပါ (Quick Try):</span>
      </div>

      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        {SAMPLE_QUOTES.map((sample) => (
          <button
            key={sample.id}
            onClick={() => onSelectSample(sample.text, sample.sourceLang as LanguageCode, sample.targetLang as LanguageCode)}
            className="group shrink-0 px-3.5 py-2 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-white transition-all duration-200 flex items-center gap-2 backdrop-blur-md shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 group-hover:scale-125 transition-transform" />
            <span className="font-semibold text-cyan-300 text-[11px]">{sample.category}</span>
            <span className="text-slate-400 group-hover:text-slate-200 truncate max-w-[200px]">
              {sample.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
