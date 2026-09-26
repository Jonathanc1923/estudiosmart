import React from 'react';
import { 
  Sparkles, 
  Camera, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  HeartHandshake, 
  Layers, 
  Palette, 
  SlidersHorizontal,
  Flame,
  Award,
  Crown
} from 'lucide-react';
import { Hero } from './Hero';
import { ShowcaseGallery } from './ShowcaseGallery';
import { THEMES } from '../data/themes';
import { Theme } from '../types';

interface HomePageProps {
  onNavigateToCreate: (preselectedTheme?: Theme) => void;
  onOpenPricing: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigateToCreate,
  onOpenPricing,
}) => {
  // Select top featured theme inspirations from THEMES catalog
  const featuredThemes = React.useMemo(() => {
    return THEMES.filter((t) => t.popular || ['graduacion-elegante', 'navidad-estudio-dorado', 'ejecutivo-premium', 'maternidad-angelical', 'bebe-fantasioso', 'pareja-boda-vintage'].includes(t.id)).slice(0, 6);
  }, []);

  return (
    <div className="w-full flex flex-col gap-8 sm:gap-14 animate-fade-in pb-20 sm:pb-12">
      
      {/* 1. Hero Section */}
      <Hero
        onStartClick={() => onNavigateToCreate()}
        onOpenPricing={onOpenPricing}
      />

      {/* 2. Main Auto-Cycling Showcase Gallery (5 photos per page) */}
      <div id="galeria-muestras" className="scroll-mt-24">
        <ShowcaseGallery 
          onSelectInspiration={() => onNavigateToCreate()} 
        />
      </div>

      {/* 3. How It Works (3 Steps) */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-smartgold-400" />
            <span>FÁCIL, RÁPIDO Y PROFESIONAL</span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight">
            ¿Cómo funciona <span className="bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent">Estudio Smart</span>?
          </h2>
          <p className="text-xs sm:text-base text-slate-300 mt-2">
            Obtén fotos de nivel profesional en 3 sencillos pasos sin salir de casa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Step 1 */}
          <div className="relative p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-navy-800/80 to-navy-900/90 border border-cyan-500/20 hover:border-cyan-400/40 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 font-display font-black text-xl mb-4 group-hover:scale-110 transition-transform">
              1
            </div>
            <h3 className="font-display font-bold text-lg sm:text-xl text-white mb-2">
              Elige tu Temática o Estilo
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Explora más de 100 estilos de catálogo (Navidad, Graduación, Moda, Corporativo) o escribe tu temática 100% personalizada.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-navy-800/80 to-navy-900/90 border border-cyan-500/20 hover:border-cyan-400/40 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-smartgold-500/20 border border-smartgold-400/30 flex items-center justify-center text-smartgold-400 font-display font-black text-xl mb-4 group-hover:scale-110 transition-transform">
              2
            </div>
            <h3 className="font-display font-bold text-lg sm:text-xl text-white mb-2">
              Sube tu Foto
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Sube cualquier foto desde tu celular o computadora. Asegúrate de que tu rostro sea visible y esté bien iluminado.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-navy-800/80 to-navy-900/90 border border-cyan-500/20 hover:border-cyan-400/40 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400 font-display font-black text-xl mb-4 group-hover:scale-110 transition-transform">
              3
            </div>
            <h3 className="font-display font-bold text-lg sm:text-xl text-white mb-2">
              Genera y Descarga en Ultra HD
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Nuestra Inteligencia Artificial crea tu sesión fotográfica en segundos con calidad 8K para compartir o imprimir.
            </p>
          </div>

        </div>
      </section>

      {/* 4. Featured Styles Grid (Direct access to Crea tus fotos) */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-bold mb-2">
              <Crown className="w-3.5 h-3.5 text-smartgold-400" />
              <span>ESTILOS POPULARES</span>
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
              Inspiración de Retratos
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Haz clic en cualquier estilo para abrir el estudio y crear tu versión al instante.
            </p>
          </div>

          <button
            onClick={() => onNavigateToCreate()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 font-black text-xs sm:text-sm shadow-md transition-all self-start sm:self-auto cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Ver Todos los 100+ Estilos</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Grid of Styles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {featuredThemes.map((theme) => (
            <div
              key={theme.id}
              onClick={() => onNavigateToCreate(theme)}
              className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-navy-900/80 border border-slate-800 hover:border-cyan-400/60 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20 cursor-pointer flex flex-col"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-navy-950">
                <img
                  src={theme.sampleImage}
                  alt={theme.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/20 to-transparent" />
                
                {theme.badge && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-black bg-cyan-500 text-navy-950 uppercase tracking-wider">
                    {theme.badge}
                  </span>
                )}
              </div>

              <div className="p-2.5 sm:p-3 flex flex-col flex-1 justify-between bg-navy-900/90">
                <div>
                  <h4 className="font-display font-bold text-xs sm:text-sm text-white group-hover:text-cyan-300 transition-colors truncate">
                    {theme.name}
                  </h4>
                  <p className="text-[10px] sm:text-xs text-slate-400 line-clamp-2 mt-0.5">
                    {theme.description}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-cyan-400 text-[10px] sm:text-xs font-bold">
                  <span>Probar estilo</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Big Call-To-Action Banner */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
        <div className="relative rounded-3xl overflow-hidden p-6 sm:p-12 bg-gradient-to-r from-navy-900 via-navy-800 to-cyan-950 border border-cyan-500/30 shadow-2xl shadow-cyan-500/10 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          
          {/* Background Glow */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold mb-3 border border-cyan-400/30">
              <Sparkles className="w-3.5 h-3.5 text-smartgold-400" />
              <span>TU PRÓXIMO RETRATO TE ESPERA</span>
            </div>
            <h3 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight">
              ¿Listo para transformar tus fotos?
            </h3>
            <p className="text-xs sm:text-base text-slate-300 mt-2">
              Ingresa al estudio ahora mismo, elige tu estilo y crea recuerdos inolvidables con la mejor tecnología de IA.
            </p>
          </div>

          <div className="relative z-10 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => onNavigateToCreate()}
              className="w-full sm:w-auto px-7 sm:px-9 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-300 to-smartgold-400 hover:brightness-110 text-navy-950 font-black text-sm sm:text-base lg:text-lg shadow-xl shadow-cyan-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Camera className="w-5 h-5 text-navy-950" />
              <span>Ir a "Crea tus fotos"</span>
              <ArrowRight className="w-5 h-5 text-navy-950" />
            </button>
          </div>

        </div>
      </section>

    </div>
  );
};
