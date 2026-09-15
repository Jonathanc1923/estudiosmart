import React from 'react';
import { Sparkles, Camera, Zap, CheckCircle2, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';

interface HeroProps {
  onStartClick: () => void;
  onOpenPricing: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartClick, onOpenPricing }) => {
  return (
    <section className="relative overflow-hidden pt-4 sm:pt-8 pb-10 sm:pb-16 lg:py-20">
      
      {/* Background Studio Light Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[600px] h-[250px] sm:h-[350px] bg-cyan-500/15 blur-[100px] sm:blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[250px] sm:w-[350px] h-[250px] sm:h-[350px] bg-blue-600/15 blur-[90px] sm:blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-smartgold-500/10 blur-[80px] sm:blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Header Container */}
        <div className="text-center max-w-4xl mx-auto">
          
          {/* Top Pill */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] sm:text-xs md:text-sm font-semibold mb-4 sm:mb-6 shadow-inner animate-pulse-slow">
            <Sparkles className="w-3.5 h-3.5 text-smartgold-400 shrink-0" />
            <span className="truncate">Estudio Fotográfico IA Ultra HD • 100% Retratos</span>
          </div>

          {/* Main Title */}
          <h1 className="font-display font-black text-2xl xs:text-3xl sm:text-5xl lg:text-7xl text-white tracking-tight leading-[1.15] mb-3 sm:mb-6">
            Transforma tus fotos en{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-smartgold-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(34,204,226,0.4)]">
              Retratos de Estudio
            </span>{' '}
            con Inteligencia Artificial
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 text-xs sm:text-base md:text-xl max-w-2xl mx-auto mb-6 sm:mb-10 leading-relaxed font-normal px-2">
            Sube cualquier foto tuya y obtén al instante sesiones fotográficas de nivel profesional: estilos de catálogo o escribe tu propia temática 100% personalizada.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-4 mb-8 sm:mb-12 w-full max-w-md sm:max-w-none mx-auto">
            <button
              onClick={onStartClick}
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 font-extrabold text-sm sm:text-base lg:text-lg shadow-xl shadow-cyan-500/30 hover:shadow-cyan-400/50 hover:scale-[1.02] transition-all flex items-center justify-center gap-2.5 group cursor-pointer"
            >
              <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-navy-950 group-hover:rotate-12 transition-transform" />
              <span>Crear Mi Foto Gratis</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-navy-950 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onOpenPricing}
              className="w-full sm:w-auto px-5 sm:px-7 py-3 sm:py-4 rounded-2xl bg-navy-900/80 hover:bg-navy-800 text-white font-bold text-xs sm:text-sm md:text-base border border-cyan-500/30 hover:border-cyan-400 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>50 Fotos por S/ 15</span>
              <span className="px-2 py-0.5 rounded bg-smartgold-500/20 text-smartgold-400 text-[10px] sm:text-xs font-bold">
                Yape / BCP
              </span>
            </button>
          </div>

          {/* Highlights Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 max-w-4xl mx-auto pt-4 border-t border-slate-800/80 text-left">
            <div className="flex items-center gap-2 p-2 sm:p-2.5 rounded-xl bg-navy-900/50 border border-slate-800/90">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0" />
              <span className="text-[11px] sm:text-xs md:text-sm font-medium text-slate-300 leading-tight">1 Foto Gratis con Google</span>
            </div>
            <div className="flex items-center gap-2 p-2 sm:p-2.5 rounded-xl bg-navy-900/50 border border-slate-800/90">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-smartgold-400 shrink-0" />
              <span className="text-[11px] sm:text-xs md:text-sm font-medium text-slate-300 leading-tight">Motor IA Ultra HD</span>
            </div>
            <div className="flex items-center gap-2 p-2 sm:p-2.5 rounded-xl bg-navy-900/50 border border-slate-800/90">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
              <span className="text-[11px] sm:text-xs md:text-sm font-medium text-slate-300 leading-tight">Bot Yape / Plin / BCP</span>
            </div>
            <div className="flex items-center gap-2 p-2 sm:p-2.5 rounded-xl bg-navy-900/50 border border-slate-800/90">
              <HeartHandshake className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-400 shrink-0" />
              <span className="text-[11px] sm:text-xs md:text-sm font-medium text-slate-300 leading-tight">Catálogo & Temas Libres</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};