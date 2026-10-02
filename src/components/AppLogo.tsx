import React from 'react';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({ size = 'md', showText = true }) => {
  const sizeMap = {
    sm: { box: 'w-9 h-9', icon: 'w-5 h-5', text: 'text-base', sub: 'text-[10px]' },
    md: { box: 'w-12 h-12', icon: 'w-7 h-7', text: 'text-lg', sub: 'text-xs' },
    lg: { box: 'w-16 h-16', icon: 'w-9 h-9', text: 'text-2xl', sub: 'text-sm' },
    xl: { box: 'w-24 h-24', icon: 'w-14 h-14', text: 'text-3xl', sub: 'text-base' },
  };

  const current = sizeMap[size];

  return (
    <div className="flex items-center gap-3 select-none group">
      {/* 3D Glass Jewel Container */}
      <div className={`relative ${current.box} rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:rotate-1`}>
        {/* Ambient neon back glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-500/40 via-indigo-500/30 to-purple-500/40 blur-md group-hover:blur-lg transition-all" />
        
        {/* Specular Glass Frame */}
        <div className="relative w-full h-full rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] flex items-center justify-center overflow-hidden">
          {/* Glass glint / sheen */}
          <div className="absolute -top-10 -left-10 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none transform rotate-12" />
          
          <img
            src="/icon.svg"
            alt="LipiAI Logo"
            className={`${current.icon} object-contain filter drop-shadow-[0_2px_8px_rgba(56,189,248,0.5)]`}
          />

          {/* Micro pulsing energy dot */}
          <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-emerald-400 border border-slate-900 shadow-[0_0_8px_#34d399] animate-pulse" />
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent font-sans ${current.text}`}>
              LipiAI
            </span>
            <span className="px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-500/30">
              POLYGLOT
            </span>
          </div>
          <span className={`text-slate-400 font-medium tracking-wide ${current.sub}`}>
            စာပေမဉ္ဇရီ • အာရှဘာသာစုံ AI
          </span>
        </div>
      )}
    </div>
  );
};
