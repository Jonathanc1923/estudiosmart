import React from 'react';
import { 
  Sparkles, 
  Wand2, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  AlertCircle, 
  Coins
} from 'lucide-react';
import { ThemeCatalog } from './ThemeCatalog';
import { PhotoUploader } from './PhotoUploader';
import { ResultViewer } from './ResultViewer';
import { Theme, User } from '../types';

interface CreateStudioProps {
  user: User | null;
  selectedTheme: Theme;
  onSelectTheme: (theme: Theme) => void;
  userPhoto: string | null;
  onPhotoSelected: (b64: string) => void;
  onRemovePhoto: () => void;
  customDetails: string;
  onCustomDetailsChange: (val: string) => void;
  isGenerating: boolean;
  onStartGeneration: () => void;
  errorMessage: string | null;
  currentResult: {
    resultImage: string;
    isWatermarked: boolean;
    theme: Theme;
    originalImage: string | null;
  } | null;
  onResetForNew: () => void;
  onOpenPayment: () => void;
  onOpenAuth: () => void;
  onBackToHome: () => void;
}

export const CreateStudio: React.FC<CreateStudioProps> = ({
  user,
  selectedTheme,
  onSelectTheme,
  userPhoto,
  onPhotoSelected,
  onRemovePhoto,
  customDetails,
  onCustomDetailsChange,
  isGenerating,
  onStartGeneration,
  errorMessage,
  currentResult,
  onResetForNew,
  onOpenPayment,
  onOpenAuth,
  onBackToHome
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 animate-fade-in pb-24 sm:pb-12">
      
      {/* Subpage Header & Navigation Bar */}
      <div className="mb-6 sm:mb-10 pb-4 sm:pb-6 border-b border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-800/80 hover:bg-navy-700 text-cyan-300 text-xs sm:text-sm font-semibold border border-cyan-500/30 hover:border-cyan-400 transition-all cursor-pointer mb-2.5 shadow-sm group"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Volver a la Galería de Inicio</span>
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight">
              Crea tus{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-smartgold-400 bg-clip-text text-transparent">
                Fotos Profesionales
              </span>
            </h1>
            <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 uppercase tracking-wider">
              Estudio IA Ultra HD
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Sigue los 3 sencillos pasos: selecciona tu temática favorita, sube tu foto y genera tu retrato en segundos.
          </p>
        </div>

        {/* User Balance / Quick Info in Studio Header */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {user ? (
            <div 
              onClick={onOpenPayment}
              className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-navy-900/90 border border-cyan-500/40 shadow-lg cursor-pointer hover:border-cyan-300 transition-all group"
            >
              <div className="w-8 h-8 rounded-xl bg-smartgold-500/20 flex items-center justify-center text-smartgold-400">
                <Coins className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {user.tokens} {user.tokens === 1 ? 'Foto disponible' : 'Fotos disponibles'}
                </div>
                <div className="text-[10px] text-cyan-400 font-medium">
                  {user.tokens > 0 ? '✓ Listo para generar' : '¡Solicitar recarga!'}
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/40 text-cyan-300 text-xs sm:text-sm font-bold hover:bg-cyan-500/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-smartgold-400" />
              <span>Iniciar Sesión para Crear</span>
            </button>
          )}
        </div>
      </div>

      {/* If showing generated result */}
      {currentResult ? (
        <ResultViewer
          resultImage={currentResult.resultImage}
          originalImage={currentResult.originalImage}
          theme={currentResult.theme}
          isWatermarked={currentResult.isWatermarked}
          user={user}
          onOpenPayment={onOpenPayment}
          onNewGeneration={onResetForNew}
        />
      ) : (
        /* Studio Step by Step Flow */
        <div className="space-y-8 sm:space-y-12">
          
          {/* Quick Step Visual Indicator */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-3xl mx-auto text-center">
            <div className={`p-2.5 sm:p-3 rounded-2xl border transition-all ${
              selectedTheme 
                ? 'bg-cyan-500/15 border-cyan-400/50 text-cyan-300 shadow-sm' 
                : 'bg-navy-900/50 border-slate-800 text-slate-400'
            }`}>
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Paso 1</div>
              <div className="text-xs sm:text-sm font-black text-white truncate">Elige tu Estilo</div>
            </div>

            <div className={`p-2.5 sm:p-3 rounded-2xl border transition-all ${
              userPhoto 
                ? 'bg-cyan-500/15 border-cyan-400/50 text-cyan-300 shadow-sm' 
                : 'bg-navy-900/50 border-slate-800 text-slate-400'
            }`}>
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Paso 2</div>
              <div className="text-xs sm:text-sm font-black text-white truncate">Sube tu Foto</div>
            </div>

            <div className="p-2.5 sm:p-3 rounded-2xl border bg-navy-900/50 border-slate-800 text-slate-400">
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Paso 3</div>
              <div className="text-xs sm:text-sm font-black text-white truncate">Genera con IA</div>
            </div>
          </div>

          {/* STEP 1: Theme Catalog */}
          <div className="relative">
            <ThemeCatalog
              selectedTheme={selectedTheme}
              onSelectTheme={onSelectTheme}
            />
          </div>

          {/* STEP 2: Photo Uploader & Custom Details */}
          <div id="photo-uploader-section" className="scroll-mt-24">
            <PhotoUploader
              userPhoto={userPhoto}
              customDetails={customDetails}
              onPhotoSelected={onPhotoSelected}
              onRemovePhoto={onRemovePhoto}
              onCustomDetailsChange={onCustomDetailsChange}
            />
          </div>

          {/* Error message alert */}
          {errorMessage && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs sm:text-sm flex items-center gap-2.5 sm:gap-3 max-w-2xl mx-auto">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 3: Action Button */}
          <div className="pt-2 sm:pt-4 text-center">
            <button
              onClick={onStartGeneration}
              disabled={isGenerating}
              className="relative group overflow-hidden w-full max-w-xl mx-auto py-4 sm:py-5 px-4 sm:px-8 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 font-black text-sm sm:text-lg md:text-xl shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-400/50 hover:scale-[1.01] sm:hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 sm:gap-3 cursor-pointer"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <Wand2 className="w-5 h-5 sm:w-6 sm:h-6 text-navy-950 group-hover:rotate-45 transition-transform shrink-0" />
              <span className="truncate">
                {user
                  ? user.tokens > 0
                    ? `Generar Retrato (${user.tokens} ${user.tokens === 1 ? 'Foto disp.' : 'Fotos disp.'})`
                    : 'Sin fotos disponibles • Solicitar Recarga'
                  : 'Iniciar Sesión para Generar'}
              </span>
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-navy-950 group-hover:translate-x-1.5 transition-transform shrink-0" />
            </button>

            <p className="text-[11px] sm:text-xs text-slate-400 mt-3 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
              <span>Tecnología de Inteligencia Artificial Estudio Smart • Calidad Ultra HD 8K</span>
            </p>
          </div>

        </div>
      )}

    </div>
  );
};
