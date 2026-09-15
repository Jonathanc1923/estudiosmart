import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  UploadCloud, 
  Camera, 
  X, 
  CheckCircle2, 
  Sparkles, 
  MessageSquarePlus 
} from 'lucide-react';

interface PhotoUploaderProps {
  userPhoto: string | null;
  customDetails: string;
  onPhotoSelected: (base64: string) => void;
  onRemovePhoto: () => void;
  onCustomDetailsChange: (details: string) => void;
}

const QUICK_SUGGESTIONS = [
  { label: '☕ Sosteniendo una taza de café', value: 'Sosteniendo una elegante taza de café en la mano' },
  { label: '🕶️ Con lentes oscuros de sol', value: 'Con elegantes lentes oscuros de sol tipo aviador' },
  { label: '✨ Sonrisa cálida y alegre', value: 'Con una sonrisa cálida, radiante y natural mirando a la cámara' },
  { label: '🌆 Mirando al horizonte', value: 'Pose de perfil mirando inspiradamente hacia el horizonte' },
  { label: '🐕 Junto a una mascota', value: 'Acompañado de su adorable mascota fiel a su lado' },
  { label: '⌚ Reloj de lujo en muñeca', value: 'Con un lujoso reloj metálico visible en la muñeca' },
  { label: '🎧 Con audífonos de diadema', value: 'Con audífonos premium de diadema colocados sobre el cuello' },
  { label: '💼 Portando maletín ejecutivo', value: 'Sosteniendo un sofisticado maletín de cuero fino' },
];

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  userPhoto,
  customDetails,
  onPhotoSelected,
  onRemovePhoto,
  onCustomDetailsChange,
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onPhotoSelected(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  }, [onPhotoSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleSuggestionClick = (val: string) => {
    if (!customDetails.trim()) {
      onCustomDetailsChange(val);
    } else if (!customDetails.includes(val)) {
      onCustomDetailsChange(customDetails.trim() + ', ' + val);
    }
  };

  return (
    <div className="w-full space-y-4 sm:space-y-5">
      {/* Step Title Header */}
      <div>
        <h2 className="font-display font-extrabold text-xl sm:text-2xl md:text-3xl text-white flex flex-wrap items-center gap-2">
          <span>2. Sube tu Foto</span>
          {userPhoto && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Foto Lista</span>
            </span>
          )}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Sube un selfie, foto individual, de pareja o familiar. La IA preservará exactamente a las personas y adaptará su estilismo.
        </p>
      </div>

      {/* Upload Zone or Uploaded Preview */}
      {userPhoto ? (
        <div className="relative rounded-3xl overflow-hidden glass-panel p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 border border-cyan-500/30 shadow-2xl bg-navy-900/80">
          <div className="relative w-32 h-32 sm:w-44 sm:h-44 rounded-2xl overflow-hidden border-2 border-cyan-400/60 shadow-lg group shrink-0">
            <img
              src={userPhoto}
              alt="Foto del usuario"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-cyan-950/20 group-hover:bg-cyan-950/5 transition-colors" />
            <button
              onClick={onRemovePhoto}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-md transition-transform hover:scale-110"
              title="Quitar foto"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] sm:text-xs font-semibold mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Rostros Reconocidos y Listos</span>
            </div>
            <h3 className="font-display font-bold text-base sm:text-lg text-white mb-1">
              Foto cargada con éxito
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mb-3 sm:mb-4 max-w-md">
              El motor de IA fusionará tu fisonomía respetando la cantidad exacta de personas, edades, identidades y género.
            </p>
            <div className="flex flex-wrap items-center gap-2.5 justify-center sm:justify-start">
              <div {...getRootProps()} className="cursor-pointer">
                <input {...getInputProps()} />
                <button
                  type="button"
                  className="px-3.5 sm:px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-cyan-300 border border-cyan-500/30 text-xs font-semibold hover:border-cyan-400 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Cambiar Foto</span>
                </button>
              </div>
              <button
                onClick={onRemovePhoto}
                className="px-3.5 sm:px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={'relative rounded-3xl border-2 border-dashed p-5 sm:p-10 text-center cursor-pointer transition-all duration-300 ' + (
            isDragActive
              ? 'border-cyan-400 bg-cyan-500/10 shadow-xl shadow-cyan-500/20 scale-[1.01]'
              : 'border-slate-700 hover:border-cyan-400/60 bg-navy-900/40 hover:bg-navy-900/70'
          )}
        >
          <input {...getInputProps()} />
          <div className="max-w-md mx-auto flex flex-col items-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-navy-800 to-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 sm:mb-4 shadow-lg shadow-cyan-500/10 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6 sm:w-8 sm:h-8 animate-pulse" />
            </div>

            <h3 className="font-display font-extrabold text-base sm:text-xl text-white mb-1">
              Arrastra tu foto aquí o{' '}
              <span className="text-cyan-400 underline underline-offset-4 decoration-cyan-500/40 hover:decoration-cyan-400">
                toca para seleccionar
              </span>
            </h3>
            
            <p className="text-[11px] sm:text-xs text-slate-400 mb-3 sm:mb-4">
              Acepta JPG, PNG o WebP. Soporta retratos individuales, de pareja y familiares.
            </p>

            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 text-left pt-3 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>1 Persona, Pareja o Grupos</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Preserva exactamente cantidad de personas</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Adapta vestuario a edad y género</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Fisonomía e identidad 100% conservada</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Elements & Pose Customizer */}
      <div className="p-3.5 sm:p-5 rounded-2xl bg-gradient-to-r from-navy-900/90 via-navy-800/80 to-navy-900/90 border border-cyan-500/25 shadow-lg">
        <div className="flex items-center justify-between gap-2 mb-2">
          <label className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 sm:gap-2">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
            <span>¿Deseas agregar algún accesorio o pose adicional? (Opcional)</span>
          </label>
          <span className="text-[10px] sm:text-[11px] text-cyan-300/80 font-medium bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20 shrink-0">
            Detalles
          </span>
        </div>

        <p className="text-[11px] sm:text-xs text-slate-400 mb-2.5">
          Escribe aquí si quieres que se agregue algún elemento en especial, accesorios específicos o tu pose preferida:
        </p>

        {/* Text Input / Textarea */}
        <div className="relative">
          <input
            type="text"
            value={customDetails}
            onChange={(e) => onCustomDetailsChange(e.target.value)}
            placeholder="Ej: Con lentes oscuros, sosteniendo una taza de café, mirando de perfil..."
            className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-navy-950/90 border border-slate-700 focus:border-cyan-400 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner"
          />
          {customDetails && (
            <button
              onClick={() => onCustomDetailsChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              title="Borrar texto"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="mt-2.5 sm:mt-3">
          <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
            <MessageSquarePlus className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Sugerencias rápidas (toca para añadir):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_SUGGESTIONS.map((sug, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSuggestionClick(sug.value)}
                className="px-2.5 py-1 rounded-lg text-[11px] sm:text-xs bg-navy-800/90 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700/70 hover:border-cyan-500/40 transition-all duration-150 flex items-center gap-1 cursor-pointer"
              >
                <span>{sug.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
