import React, { useState } from 'react';
import { 
  Download, 
  Sparkles, 
  Share2, 
  RefreshCw, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Maximize2, 
  Camera,
  MessageCircle,
  Coins,
  Layers
} from 'lucide-react';
import { Theme, User } from '../types';

interface ResultViewerProps {
  resultImage: string;
  originalImage: string | null;
  theme: Theme;
  isWatermarked: boolean;
  user: User | null;
  onOpenPayment: () => void;
  onNewGeneration: () => void;
}

const WHATSAPP_HUMAN_CLEAN = '51907318642';

export const ResultViewer: React.FC<ResultViewerProps> = ({
  resultImage,
  originalImage,
  theme,
  isWatermarked,
  user,
  onOpenPayment,
  onNewGeneration,
}) => {
  const [showOriginal, setShowOriginal] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `EstudioSmart-${theme.id}-${Date.now()}.webp`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent('¡Mira el increíble retrato fotográfico con IA que me generó ESTUDIO SMART! Pruébalo tú también: ' + window.location.origin);
    window.open('https://api.whatsapp.com/send?text=' + text, '_blank');
  };

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in px-1 sm:px-2 py-2 sm:py-4 space-y-6 sm:space-y-8">
      
      {/* 1. Header con Badge de Éxito y Título */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border border-emerald-400/40 text-emerald-300 text-xs sm:text-sm font-extrabold shadow-lg shadow-emerald-500/10">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>¡Retrato Fotográfico Generado en Ultra HD!</span>
        </div>
        <h2 className="font-display font-black text-2xl sm:text-4xl md:text-5xl text-white tracking-tight">
          Tu Retrato <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400">{theme.name}</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto">
          La Inteligencia Artificial adaptó la iluminación de estudio, vestuario y fisonomía con máxima resolución.
        </p>
      </div>

      {/* 2. Visualizador y Panel de Detalles */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* Columna Izquierda: FOTO EN GRANDE */}
        <div className="lg:col-span-7 flex flex-col items-center space-y-3 sm:space-y-4">
          
          <div className="relative w-full max-w-xl aspect-[4/5] sm:aspect-square rounded-3xl overflow-hidden border-2 border-cyan-400/50 shadow-2xl shadow-cyan-500/30 bg-navy-950 group">
            
            {/* Imagen Principal (Resultado o Foto Original) */}
            <img
              src={showOriginal && originalImage ? originalImage : resultImage}
              alt="Retrato Generado"
              className={'w-full h-full object-cover transition-all duration-500 ' + (isZoomed ? 'scale-125 cursor-zoom-out' : 'group-hover:scale-[1.02] cursor-pointer')}
              onClick={() => setIsZoomed(!isZoomed)}
            />

            {/* Badges Flotantes sobre la Imagen */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
              <span className="px-3 py-1 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider bg-black/80 backdrop-blur-md text-cyan-300 border border-cyan-400/40 shadow-lg flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                <span>{showOriginal ? 'Foto Original' : theme.name}</span>
              </span>
              <span className="px-2.5 py-1 rounded-xl text-[10px] sm:text-xs font-bold bg-emerald-500/90 text-navy-950 shadow-lg flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ultra HD 8K</span>
              </span>
            </div>

            {/* Controles sobre la Imagen (Zoom & Toggle Original) */}
            <div className="absolute bottom-3 inset-x-3 flex items-center justify-between gap-2 z-10">
              {originalImage && (
                <button
                  type="button"
                  onMouseDown={() => setShowOriginal(true)}
                  onMouseUp={() => setShowOriginal(false)}
                  onTouchStart={() => setShowOriginal(true)}
                  onTouchEnd={() => setShowOriginal(false)}
                  className="px-3.5 py-2 rounded-xl bg-navy-950/85 hover:bg-navy-900 border border-cyan-400/50 text-white font-bold text-xs backdrop-blur-md shadow-lg transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Mantén presionado para ver Foto Original</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsZoomed(!isZoomed)}
                className="p-2 rounded-xl bg-navy-950/80 hover:bg-navy-900 text-slate-300 hover:text-white border border-slate-700 backdrop-blur-md shadow-md ml-auto"
                title="Ampliar / Zoom"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Actions debajo de la foto */}
          <div className="w-full max-w-xl flex flex-wrap items-center justify-between gap-2 pt-1">
            <button
              onClick={handleShareWhatsApp}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Compartir en WhatsApp</span>
            </button>

            <button
              onClick={handleDownload}
              className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Download className="w-4 h-4 text-navy-950" />
              <span>Descargar Foto Ultra HD</span>
            </button>

            <button
              onClick={onNewGeneration}
              className="py-2.5 px-4 rounded-2xl bg-navy-900 hover:bg-navy-800 border border-slate-700 text-slate-300 hover:text-cyan-300 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-cyan-400" />
              <span>Probar Otra Temática</span>
            </button>
          </div>

        </div>

        {/* Columna Derecha: PANEL DE SESIÓN Y CRÉDITOS */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          
          {/* Card de Detalles de Retrato */}
          <div className="relative rounded-3xl p-5 sm:p-6 bg-navy-900/90 border border-cyan-500/30 shadow-xl space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Detalles de la Sesión</h3>
                  <p className="text-xs text-slate-400">Estudio Smart AI</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                Renderizado Exitoso
              </span>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-navy-950 border border-slate-800">
                <span className="text-slate-400">Temática aplicada:</span>
                <strong className="text-white">{theme.name}</strong>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-navy-950 border border-slate-800">
                <span className="text-slate-400">Categoría:</span>
                <span className="text-cyan-300 font-semibold capitalize">{theme.category}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-navy-950 border border-slate-800">
                <span className="text-slate-400">Resolución de Salida:</span>
                <span className="text-emerald-400 font-bold">Ultra HD 8K (WebP Fotográfico)</span>
              </div>
            </div>

            {/* Balance Card */}
            <div className="p-4 rounded-2xl bg-navy-950 border border-smartgold-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Balance en tu cuenta</span>
                <span className="text-lg font-black text-smartgold-400">
                  {user ? `${user.tokens} ${user.tokens === 1 ? 'Foto disponible' : 'Fotos disponibles'}` : 'Inicia sesión'}
                </span>
              </div>

              <button
                onClick={onOpenPayment}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-smartgold-500 to-amber-500 hover:from-smartgold-400 hover:to-amber-400 text-navy-950 font-extrabold text-xs transition-all shadow-md cursor-pointer"
              >
                Recargar
              </button>
            </div>

            {/* Create next action */}
            <div className="pt-2 space-y-2">
              <button
                onClick={onNewGeneration}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 font-black text-sm transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-navy-950" />
                <span>Crear Siguiente Retrato con Otra Temática</span>
              </button>
            </div>
          </div>

          {/* Soporte Directo */}
          <div className="p-3.5 rounded-2xl bg-navy-900/60 border border-slate-800 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-300">¿Consultas o pedidos especiales?</span>
            </div>
            <a
              href={`https://wa.me/${WHATSAPP_HUMAN_CLEAN}?text=${encodeURIComponent('Hola Estudio Smart, tengo una consulta sobre mis fotos generadas.')}`}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-bold underline shrink-0"
            >
              WhatsApp Soporte
            </a>
          </div>

        </div>

      </div>

    </div>
  );
};