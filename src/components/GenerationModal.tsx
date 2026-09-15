import React, { useEffect, useState } from 'react';
import { Loader2, Sparkles, Wand2, Zap, Clock, Users, Flame } from 'lucide-react';
import { Theme } from '../types';

interface GenerationModalProps {
  isOpen: boolean;
  theme: Theme;
  userPhoto: string | null;
  queueStatus?: 'queued' | 'processing' | 'succeeded' | 'failed';
  queuePosition?: number;
  estimatedSeconds?: number;
  onCancel?: () => void;
}

export const GenerationModal: React.FC<GenerationModalProps> = ({
  isOpen,
  theme,
  userPhoto,
  queueStatus = 'processing',
  queuePosition = 1,
  estimatedSeconds = 15,
}) => {
  const [seconds, setSeconds] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  const tips = [
    'Analizando fisonomía e iluminación de tu retrato...',
    'Aplicando iluminación cinematográfica y sombras de estudio...',
    'Integrando la temática seleccionada con tu fisonomía...',
    'Refinando detalles de piel, ojos y textura de alta definición...',
    'Renderizado final: optimizando nitidez y color...',
  ];

  useEffect(() => {
    if (!isOpen) {
      setSeconds(0);
      setTipIndex(0);
      return;
    }

    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    const tipTimer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 3500);

    return () => {
      clearInterval(timer);
      clearInterval(tipTimer);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isWaitingInQueue = queueStatus === 'queued' && queuePosition > 1;
  const estimatedTotal = Math.max(15, estimatedSeconds || 20);
  const progressPercent = Math.min(95, Math.floor((seconds / estimatedTotal) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/85 backdrop-blur-lg animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg max-h-[92dvh] overflow-y-auto rounded-3xl glass-panel p-5 sm:p-8 border-cyan-500/40 shadow-2xl text-center my-auto scrollbar-none">
        
        {/* Animated AI Halo */}
        <div className="relative w-20 h-20 sm:w-28 sm:h-28 mx-auto mb-4 sm:mb-6">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-smartgold-400 animate-spin blur-md opacity-75" style={{ animationDuration: '3s' }} />
          <div className="relative w-full h-full rounded-full bg-navy-950 border-2 border-cyan-400/80 flex items-center justify-center text-cyan-400 shadow-inner">
            <Wand2 className="w-8 h-8 sm:w-12 sm:h-12 text-cyan-400 animate-bounce" />
          </div>
        </div>

        {/* Queue Waiting Room Status Badge */}
        {isWaitingInQueue ? (
          <div className="mb-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black animate-pulse">
            <Users className="w-4 h-4 text-amber-400" />
            <span>ESTÁS EN LA COLA DE ESPERA • TURNO #{queuePosition}</span>
          </div>
        ) : (
          <div className="mb-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-black">
            <Flame className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span>RENDERIZANDO TU RETRATO EN ALTA RESOLUCIÓN</span>
          </div>
        )}

        {/* Title */}
        <h3 className="font-display font-black text-xl sm:text-3xl text-white mb-1.5 sm:mb-2">
          {isWaitingInQueue ? 'Tu Turno en Cola de Espera' : 'Creando tu Retrato con IA'}
        </h3>
        
        <p className="text-sm text-cyan-300 font-semibold mb-4">
          Temática: <span className="text-white">{theme.name}</span>
        </p>

        {/* Reassuring Queue Message */}
        {isWaitingInQueue && (
          <div className="p-3 rounded-2xl bg-navy-900/90 border border-amber-500/30 text-xs text-slate-200 mb-4 text-left leading-relaxed">
            <p className="font-bold text-amber-300 mb-1 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>El motor IA está trabajando con otros retratos</span>
            </p>
            <p className="text-[11px] text-slate-300">
              Hay <strong className="text-white">{queuePosition - 1} persona(s)</strong> antes de tu turno. Tu lugar está 100% asegurado y tu retrato se procesará automáticamente en breve.
            </p>
          </div>
        )}

        {/* Timer & Estimated Time */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-navy-900 border border-slate-700 text-xs font-semibold text-slate-300 mb-5">
          <Clock className="w-3.5 h-3.5 text-smartgold-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span>Tiempo: <strong className="text-cyan-400">{seconds}s</strong></span>
          <span className="text-slate-500">|</span>
          <span>Falta poco: <strong className="text-emerald-400">~{Math.max(3, estimatedTotal - seconds)}s</strong></span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-navy-900 rounded-full h-3.5 p-0.5 border border-slate-700/80 mb-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-500 h-full rounded-full transition-all duration-500 shadow-lg shadow-cyan-500/50"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Rotating Tip */}
        <div className="h-12 flex items-center justify-center">
          <p className="text-xs sm:text-sm text-slate-300 italic animate-pulse">
            "{tips[tipIndex]}"
          </p>
        </div>

      </div>
    </div>
  );
};