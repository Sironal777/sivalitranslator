import React from 'react';
import { Download, Smartphone, Sparkles, X, Share2, PlusSquare, CheckCircle2 } from 'lucide-react';
import { AppLogo } from './AppLogo';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => Promise<boolean>;
  isInstallable: boolean;
  isIOS: boolean;
  isInstalled: boolean;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  onInstall,
  isInstallable,
  isIOS,
  isInstalled,
}) => {
  if (!isOpen || isInstalled) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-all animate-fadeIn">
      {/* 3D Glass Modal Box */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-slate-900/90 border border-white/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_30px_rgba(56,189,248,0.2)] p-6 sm:p-7 text-slate-100 backdrop-blur-2xl">
        {/* Decorative Ambient Radial Gradient Glows */}
        <div className="absolute -top-24 -left-24 w-52 h-52 bg-cyan-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-52 h-52 bg-purple-500/25 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with App Logo */}
        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/15 shadow-inner mb-3">
            <AppLogo size="lg" showText={false} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>တရားဝင် Web App အဖြစ် အသုံးပြုရန်</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            LipiAI App အား စက်ထဲသို့ ထည့်သွင်းမလား
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xs">
            ဖုန်း သို့မဟုတ် ကွန်ပျူတာ Home Screen မှ အင်တာနက် browser မလိုဘဲ တစ်ချက်နှိပ်ရုံဖြင့် တိုက်ရိုက် လျင်မြန်စွာ အသုံးပြုနိုင်ပါသည်။
          </p>
        </div>

        {/* Key Feature Perks with Glass Pills */}
        <div className="space-y-2.5 mb-6 text-xs sm:text-sm">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-200">စာရိုက်လိုက်တာနဲ့ အလိုအလျောက် အချိန်နဲ့တပြေးညီ ဘာသာပြန်ခြင်း</span>
          </div>
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-slate-200">မြန်မာ၊ အင်္ဂလိပ်၊ ပါဠိ၊ တႆး၊ မွန်၊ သက္ကတ၊ ဗီယက်နမ် ၇ မျိုး အပြန်အလှန်</span>
          </div>
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
            <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="text-slate-200">Offline Cache & ပေါ့ပါးသွက်လက်သော 3D Glass UI</span>
          </div>
        </div>

        {/* Action Button: Chrome / Android / Desktop vs iOS Safari */}
        {isInstallable ? (
          <div className="space-y-3">
            <button
              onClick={async () => {
                const res = await onInstall();
                if (res) onClose();
              }}
              className="w-full relative group overflow-hidden rounded-2xl p-[1px] shadow-[0_10px_25px_rgba(6,182,212,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-600 rounded-2xl transition-all group-hover:opacity-90" />
              <div className="relative flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-white text-sm sm:text-base">
                <Download className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
                <span>အခုပဲ စက်ထဲသို့ ထည့်သွင်းမည် (Install App)</span>
              </div>
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 transition"
            >
              နောက်မှ ထည့်သွင်းမည် (Not Now)
            </button>
          </div>
        ) : isIOS ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-left space-y-3">
              <div className="flex items-center gap-2 text-cyan-300 font-semibold text-xs sm:text-sm">
                <Smartphone className="w-4 h-4" />
                <span>iOS (iPhone / iPad) တွင် ထည့်သွင်းရန် လမ်းညွှန်:</span>
              </div>
              <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside pl-1">
                <li>
                  Safari အောက်ခြေရှိ <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-white/10 text-cyan-200 font-mono text-[11px]"><Share2 className="w-3 h-3 inline mr-1" /> Share</span> ခလုတ်ကို နှိပ်ပါ။
                </li>
                <li>
                  အောက်သို့ အနည်းငယ်ဆွဲချပြီး <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-white/10 text-cyan-200 font-mono text-[11px]"><PlusSquare className="w-3 h-3 inline mr-1" /> Add to Home Screen</span> ကို နှိပ်ပါ။
                </li>
                <li>ညာဘက်အပေါ်ထောင့်မှ <strong>Add</strong> ကို နှိပ်ပြီး ပြီးစီးပါပြီ။</li>
              </ol>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 font-semibold text-sm transition"
            >
              နားလည်ပါပြီ (Got It)
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
              💡 Browser ၏ Address Bar (URL Bar) အစွန်းရှိ Install icon သို့မဟုတ် Menu ထဲမှ <strong>Install LipiAI</strong> ကို နှိပ်၍ အလွယ်တကူ ထည့်သွင်းနိုင်ပါသည်။
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 font-bold text-white text-sm hover:brightness-110 transition shadow-lg"
            >
              အသုံးပြုမည် (Start Using)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
