import React from 'react';
import { X, Download, Images, Sparkles, Calendar } from 'lucide-react';
import { Generation } from '../types';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  generations: Generation[];
}

export const GalleryModal: React.FC<GalleryModalProps> = ({
  isOpen,
  onClose,
  generations,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-navy-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90dvh] rounded-3xl glass-panel p-4 sm:p-8 border-cyan-500/40 shadow-2xl flex flex-col my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 mb-3 sm:mb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <Images className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base sm:text-xl text-white">
                Mis Fotos Creadas
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-400">
                {generations.length} {generations.length === 1 ? 'foto guardada' : 'fotos guardadas'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gallery Content */}
        <div className="flex-1 overflow-y-auto pr-1 scrollbar-none">
          {generations.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-xs sm:text-sm font-semibold text-slate-300">
                Aún no has generado fotos.
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
                Elige una temática y sube tu foto para comenzar.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4">
              {generations.map((gen) => (
                <div
                  key={gen.id}
                  className="group relative rounded-2xl overflow-hidden bg-navy-900 border border-slate-800 hover:border-cyan-500/50 transition-all shadow-md"
                >
                  <div className="aspect-square w-full relative">
                    <img
                      src={gen.resultImage || gen.originalImage}
                      alt={gen.themeName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {gen.isWatermarked && (
                      <div className="watermark-overlay opacity-80 scale-75">
                        <div className="watermark-text text-sm">MUESTRA</div>
                      </div>
                    )}
                  </div>

                  <div className="p-2.5 bg-navy-950/90 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white line-clamp-1">{gen.themeName}</p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(gen.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {gen.resultImage && (
                      <a
                        href={gen.resultImage}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-navy-800 hover:bg-cyan-500 hover:text-navy-950 text-cyan-300 transition-colors"
                        title="Descargar"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};