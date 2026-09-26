import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  X, 
  Camera, 
  CheckCircle2, 
  ArrowRight,
  Eye,
  Flame
} from 'lucide-react';
import { GALLERY_MUESTRAS } from '../data/galleryMuestras';

const ITEMS_PER_PAGE = 5;
const AUTO_PLAY_INTERVAL = 4500; // 4.5 seconds

interface ShowcaseGalleryProps {
  onSelectInspiration?: () => void;
}

export const ShowcaseGallery: React.FC<ShowcaseGalleryProps> = ({ onSelectInspiration }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [activePhotoModal, setActivePhotoModal] = useState<typeof GALLERY_MUESTRAS[0] | null>(null);
  const [progress, setProgress] = useState(0);

  const totalPages = Math.ceil(GALLERY_MUESTRAS.length / ITEMS_PER_PAGE);

  // Auto-play timer with smooth progress bar
  useEffect(() => {
    if (isPaused || activePhotoModal !== null) return;

    setProgress(0);
    const progressInterval = 50; // Update progress every 50ms
    const step = (progressInterval / AUTO_PLAY_INTERVAL) * 100;

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentPage((curr) => (curr + 1) % totalPages);
          return 0;
        }
        return prev + step;
      });
    }, progressInterval);

    return () => clearInterval(progressTimer);
  }, [currentPage, isPaused, activePhotoModal, totalPages]);

  const handleNext = () => {
    setProgress(0);
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const handlePrev = () => {
    setProgress(0);
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  // Get current 5 photos (looping around smoothly if needed)
  const currentPhotos = React.useMemo(() => {
    const startIdx = currentPage * ITEMS_PER_PAGE;
    const slice = GALLERY_MUESTRAS.slice(startIdx, startIdx + ITEMS_PER_PAGE);
    // If fewer than 5 at the end, fill from beginning for consistent 5-photo grid
    if (slice.length < ITEMS_PER_PAGE) {
      const needed = ITEMS_PER_PAGE - slice.length;
      return [...slice, ...GALLERY_MUESTRAS.slice(0, needed)];
    }
    return slice;
  }, [currentPage]);

  return (
    <section className="relative w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-48 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-smartgold-500/10 blur-3xl pointer-events-none rounded-full" />

      {/* Header Container */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/15 via-blue-500/15 to-purple-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-extrabold mb-2.5 shadow-inner">
            <Flame className="w-3.5 h-3.5 text-smartgold-400 animate-pulse" />
            <span>GALERÍA DE MUESTRAS REALES • ESTUDIO SMART IA</span>
          </div>

          <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-white tracking-tight">
            Resultados de Estudio en{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-smartgold-400">
              Ultra HD 8K
            </span>
          </h2>
          
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1">
            Fotos creadas 100% con nuestra Inteligencia Artificial. Pasa automáticamente de 5 en 5 o interactúa para verlas en detalle.
          </p>
        </div>

        {/* Navigation & Controls */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Page Indicators */}
          <div className="flex items-center gap-1.5 mr-2">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setProgress(0);
                  setCurrentPage(idx);
                }}
                className={'h-2 rounded-full transition-all duration-300 cursor-pointer ' + (
                  currentPage === idx 
                    ? 'w-7 bg-gradient-to-r from-cyan-400 to-blue-500 shadow-md shadow-cyan-500/40' 
                    : 'w-2 bg-slate-700 hover:bg-slate-500'
                )}
                title={`Ver grupo ${idx + 1}`}
              />
            ))}
          </div>

          {/* Prev / Next Buttons */}
          <button
            onClick={handlePrev}
            className="p-2.5 rounded-xl bg-navy-900/90 hover:bg-navy-800 text-slate-300 hover:text-white border border-slate-700/80 hover:border-cyan-400/60 shadow-lg transition-all active:scale-95 cursor-pointer"
            title="Anteriores 5 fotos"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={handleNext}
            className="p-2.5 rounded-xl bg-navy-900/90 hover:bg-navy-800 text-cyan-300 hover:text-white border border-slate-700/80 hover:border-cyan-400/60 shadow-lg transition-all active:scale-95 cursor-pointer"
            title="Siguientes 5 fotos"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5-Photo Grid / Recuadros Container */}
      <div 
        className="relative z-10"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4.5">
          {currentPhotos.map((photo, index) => (
            <div
              key={`${photo.id}-${currentPage}-${index}`}
              onClick={() => setActivePhotoModal(photo)}
              className="group relative aspect-[3/4] rounded-2xl sm:rounded-3xl overflow-hidden bg-navy-950 border-2 border-slate-800/90 hover:border-cyan-400 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/25 transition-all duration-500 cursor-pointer transform hover:-translate-y-1.5 animate-scale-in"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              {/* Image */}
              <img
                src={photo.path}
                alt={`Muestra ${photo.fileName}`}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                loading="lazy"
              />

              {/* Gradient Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/20 to-transparent opacity-60 group-hover:opacity-85 transition-opacity duration-300" />

              {/* Top Badge */}
              <div className="absolute top-2.5 left-2.5 z-10">
                <span className="px-2 py-0.5 rounded-lg bg-navy-950/80 backdrop-blur-md text-cyan-300 text-[9px] sm:text-[10px] font-bold border border-cyan-400/30 flex items-center gap-1 shadow-md">
                  <Sparkles className="w-3 h-3 text-smartgold-400" />
                  <span>Ultra HD</span>
                </span>
              </div>

              {/* Hover Details overlay button */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none">
                <div className="p-3 rounded-2xl bg-cyan-500/90 text-navy-950 font-black text-xs shadow-2xl flex items-center gap-1.5 transform scale-90 group-hover:scale-100 transition-transform">
                  <Eye className="w-4 h-4 text-navy-950" />
                  <span>Ver en Grande</span>
                </div>
              </div>

              {/* Bottom Footer Info */}
              <div className="absolute bottom-2.5 inset-x-2.5 z-10 flex items-center justify-between text-white">
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-xs font-bold truncate drop-shadow-md">
                    Estudio Smart #{photo.id}
                  </p>
                  <p className="text-[9px] text-cyan-300/90 font-medium truncate">
                    Sesión Fotográfica IA
                  </p>
                </div>
                <div className="w-6 h-6 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center text-white shrink-0 group-hover:bg-cyan-400 group-hover:text-navy-950 transition-colors">
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Auto-Slide Progress Bar Indicator */}
        <div className="mt-4 w-full bg-navy-950/90 h-1.5 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-500 transition-all duration-75 ease-linear rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Subtitle helper */}
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
          <span>Fotos {currentPage * ITEMS_PER_PAGE + 1} a {Math.min((currentPage + 1) * ITEMS_PER_PAGE, GALLERY_MUESTRAS.length)} de {GALLERY_MUESTRAS.length} muestras</span>
          <span className="text-cyan-400 font-semibold">{isPaused ? '⏸ Pausado (Pasa el cursor)' : '▶ Auto-avance activo cada 4.5s'}</span>
        </div>
      </div>

      {/* Lightbox / Zoom Modal for Clicked Photo */}
      {activePhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-navy-950/95 backdrop-blur-xl animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl max-h-[94dvh] overflow-y-auto rounded-3xl glass-panel p-4 sm:p-6 border-2 border-cyan-400/50 shadow-2xl bg-[#090E1F] flex flex-col my-auto scrollbar-none animate-scale-in text-center">
            
            {/* Close Button */}
            <button
              onClick={() => setActivePhotoModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors z-20 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Image */}
            <div className="relative w-full aspect-[4/5] sm:aspect-square rounded-2xl overflow-hidden border border-cyan-500/40 shadow-2xl mb-4 bg-navy-950">
              <img
                src={activePhotoModal.path}
                alt="Muestra ampliada"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 rounded-xl bg-black/80 backdrop-blur-md text-cyan-300 text-xs font-bold border border-cyan-400/40 flex items-center gap-1.5 shadow-lg">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Estudio Smart • Calidad Ultra HD</span>
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div>
                <h3 className="font-display font-extrabold text-lg text-white">
                  Muestra Oficial #{activePhotoModal.id}
                </h3>
                <p className="text-xs text-slate-400">
                  Preservación exacta de rasgos, iluminación de estudio profesional y estilismo temático.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  onClick={() => {
                    setActivePhotoModal(null);
                    if (onSelectInspiration) onSelectInspiration();
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 font-black text-xs sm:text-sm shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-navy-950" />
                  <span>Crear Mi Foto Ahora</span>
                  <ArrowRight className="w-4 h-4 text-navy-950" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
