import React, { useState } from 'react';
import { 
  Download, 
  Sparkles, 
  Share2, 
  RefreshCw, 
  Lock, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Star, 
  Flame, 
  Maximize2, 
  Layers, 
  Clock, 
  Camera 
} from 'lucide-react';
import { Theme, User } from '../types';
import { usePromoCountdown } from '../hooks/usePromoCountdown';

interface ResultViewerProps {
  resultImage: string;
  originalImage: string | null;
  theme: Theme;
  isWatermarked: boolean;
  user: User | null;
  onOpenPayment: () => void;
  onNewGeneration: () => void;
}

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
  const promoCountdown = usePromoCountdown(user?.createdAt);

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
    const text = encodeURIComponent('¡Mira el increíble retrato fotográfico con IA que me generó ESTUDIO SMART! Pruébalo gratis tú también aquí: ' + window.location.origin);
    window.open('https://api.whatsapp.com/send?text=' + text, '_blank');
  };

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in px-1 sm:px-2 py-2 sm:py-4 space-y-6 sm:space-y-8">
      
      {/* 1. Header con Badge de Éxito y Título */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border border-emerald-400/40 text-emerald-300 text-xs sm:text-sm font-extrabold shadow-lg shadow-emerald-500/10 animate-bounce">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>¡Retrato Fotográfico Generado con Máxima Calidad!</span>
        </div>
        <h2 className="font-display font-black text-2xl sm:text-4xl md:text-5xl text-white tracking-tight">
          Tu Retrato <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400">{theme.name}</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto">
          La IA adaptó tu iluminación de estudio, vestuario y fisonomía con resolución Ultra HD.
        </p>
      </div>

      {/* 2. Visualizador en Grande (Hero Card) & Comparador Antes/Después */}
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

            {/* Overlay de Marca de Agua (Si es cuenta gratuita) */}
            {isWatermarked && !showOriginal && (
              <div className="watermark-overlay pointer-events-none">
                <div className="watermark-text text-sm sm:text-lg">
                  ESTUDIO SMART • MUESTRA OFICIAL
                </div>
              </div>
            )}

            {/* Badges Flotantes sobre la Imagen */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
              <span className="px-3 py-1 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider bg-black/80 backdrop-blur-md text-cyan-300 border border-cyan-400/40 shadow-lg flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                <span>{showOriginal ? 'Foto Original' : theme.name}</span>
              </span>
              {!isWatermarked && (
                <span className="px-2.5 py-1 rounded-xl text-[10px] sm:text-xs font-bold bg-emerald-500/90 text-navy-950 shadow-lg flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ultra HD 8K</span>
                </span>
              )}
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

            {/* Aviso de Marca de Agua al pie */}
            {isWatermarked && (
              <div className="absolute top-3 right-3 z-10">
                <span className="px-3 py-1 rounded-full bg-smartgold-500 text-navy-950 font-black text-[10px] sm:text-xs shadow-xl flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Muestra Gratis</span>
                </span>
              </div>
            )}
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
              className="py-2.5 px-4 rounded-2xl bg-navy-900 hover:bg-navy-800 border border-slate-700 text-slate-200 hover:text-white font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Descargar {isWatermarked ? 'Muestra' : 'Ultra HD'}</span>
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

        {/* Columna Derecha: BLOQUE DE VENTAS MARKETERISIMO (UPSELL S/ 15) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          
          {/* Tarjeta de Oferta VIP / Mega Pack S/ 15 */}
          <div className="relative rounded-3xl p-5 sm:p-7 bg-gradient-to-br from-navy-900 via-navy-800/90 to-navy-900 border-2 border-smartgold-400 shadow-2xl shadow-smartgold-500/20 overflow-hidden group">
            
            {/* Luz ambiental dorada de fondo */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-smartgold-500/20 to-amber-500/10 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />

            <div className="relative z-10 space-y-4">
              
              {/* Badge Top de Oferta con Urgencia */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-smartgold-500 to-amber-500 text-navy-950 font-black text-xs tracking-wider uppercase flex items-center gap-1.5 shadow-md">
                  <Flame className="w-4 h-4 fill-navy-950" />
                  <span>OFERTA ESPECIAL S/ 15</span>
                </span>
                <span className="text-[11px] text-rose-300 font-extrabold flex items-center gap-1.5 bg-rose-950/60 px-3 py-1 rounded-full border border-rose-500/40 animate-pulse">
                  <Clock className="w-3.5 h-3.5 text-rose-400" />
                  <span>Expira en: <strong className="font-mono text-white text-xs">{promoCountdown.formatted}</strong></span>
                </span>
              </div>

              {/* Título de Impacto & Promoción de S/ 15 */}
              <div>
                <h3 className="font-display font-black text-2xl sm:text-3xl text-white leading-tight">
                  Desbloquea este Retrato sin Marcas y Llévate{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-smartgold-400 via-amber-300 to-yellow-400">
                    50 Fotos Ultra HD
                  </span>
                </h3>
                
                {/* Comparación de Precio / Price Anchoring */}
                <div className="mt-3 flex items-baseline gap-2.5 bg-navy-950/90 p-3 rounded-2xl border border-smartgold-500/30">
                  <div className="text-3xl sm:text-4xl font-black text-smartgold-400">
                    S/ 15.00 <span className="text-xs text-slate-300 font-medium">PEN</span>
                  </div>
                  <div className="text-xs text-slate-400 line-through">
                    S/ 120.00 (Estudio Tradicional)
                  </div>
                  <span className="ml-auto px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 text-[11px] font-extrabold border border-rose-500/30">
                    -88% OFF
                  </span>
                </div>
                <p className="text-[11px] text-cyan-300 mt-1 font-semibold text-center sm:text-left">
                  ⚡ Menos de S/ 0.30 céntimos por cada foto profesional de alta costura
                </p>
              </div>

              {/* Todos los Beneficios Exclusivos (Stack de Valor) */}
              <div className="space-y-2 pt-1 border-t border-slate-800 text-xs sm:text-sm text-slate-200">
                
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white">50 Retratos de Calidad Estudio 8K:</strong>
                    <span className="text-slate-300 block text-[11px] sm:text-xs">Descarga todas tus fotos en nitidez fotográfica profesional.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white">100% Sin Marcas de Agua:</strong>
                    <span className="text-slate-300 block text-[11px] sm:text-xs">Listas para imprimir, cuadros, perfil de LinkedIn, redes y regalos.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white">Acceso a las 100+ Temáticas de Catálogo:</strong>
                    <span className="text-slate-300 block text-[11px] sm:text-xs">Navidad, Profesiones, Retratos Elegantes, Fantasía, Bebés, Retro y más.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white">Crea Temáticas 100% Libres y Personalizadas:</strong>
                    <span className="text-slate-300 block text-[11px] sm:text-xs">Describe cualquier vestuario, pose o locación y la IA lo materializa.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white">Soporta Fotos de 1 Persona, Parejas y Familias:</strong>
                    <span className="text-slate-300 block text-[11px] sm:text-xs">Preserva exactamente rostros, edades, personas y género.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white">Verificación Instantánea y Acreditación con IA:</strong>
                    <span className="text-slate-300 block text-[11px] sm:text-xs">Pagas con Yape o BCP y tus 50 fotos se activan en segundos.</span>
                  </div>
                </div>

              </div>

              {/* BOTÓN DE LLAMADA A LA ACCIÓN (CTA PRINCIPAL PERSUASIVO) */}
              <div className="pt-2">
                <button
                  onClick={onOpenPayment}
                  className="w-full py-4 sm:py-4.5 px-6 rounded-2xl bg-gradient-to-r from-smartgold-500 via-amber-400 to-orange-500 hover:from-smartgold-400 hover:to-orange-400 text-navy-950 font-black text-sm sm:text-lg shadow-2xl shadow-smartgold-500/40 hover:shadow-smartgold-400/60 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 sm:gap-3 cursor-pointer animate-pulse"
                >
                  <Zap className="w-5 h-5 fill-navy-950" />
                  <span className="truncate">DESBLOQUEAR 50 FOTOS AHORA (S/ 15)</span>
                  <ArrowRight className="w-5 h-5 stroke-[3]" />
                </button>
              </div>

              {/* Social Proof & Garantía */}
              <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5 text-amber-300">
                  <div className="flex -space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="font-bold text-white">4.9/5</span>
                  <span>(1,400+ clientes)</span>
                </div>
                <div className="flex items-center gap-1 text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Garantía & Soporte Humano</span>
                </div>
              </div>

            </div>

          </div>

          {/* Botón secundario para seguir creando si ya tiene créditos */}
          {user && user.tokens > 0 && (
            <div className="p-4 rounded-2xl bg-navy-900/90 border border-cyan-500/30 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-300">Tienes <strong className="text-cyan-300">{user.tokens} fotos disponibles</strong> en tu cuenta.</p>
              </div>
              <button
                onClick={onNewGeneration}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs transition-all cursor-pointer"
              >
                Crear Siguiente Foto
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};