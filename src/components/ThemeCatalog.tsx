import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Check, 
  Search, 
  Users, 
  UserCheck, 
  Shirt, 
  ChevronRight, 
  ChevronDown,
  Layers, 
  Briefcase, 
  Award, 
  Shield, 
  Camera, 
  Heart, 
  Activity, 
  Palette, 
  Gift,
  Zap,
  PenTool,
  Wand2,
  ShieldCheck,
  CheckCircle2,
  ListFilter
} from 'lucide-react';
import { THEMES, THEME_SECTIONS } from '../data/themes';
import { Theme, ThemeCategory } from '../types';

interface ThemeCatalogProps {
  selectedTheme: Theme;
  onSelectTheme: (theme: Theme) => void;
}

const SECTION_ICONS: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="w-4 h-4" />,
  Gift: <Gift className="w-4 h-4" />,
  Briefcase: <Briefcase className="w-4 h-4" />,
  Award: <Award className="w-4 h-4" />,
  Shield: <Shield className="w-4 h-4" />,
  Camera: <Camera className="w-4 h-4" />,
  Heart: <Heart className="w-4 h-4" />,
  Activity: <Activity className="w-4 h-4" />,
  Palette: <Palette className="w-4 h-4" />,
  Zap: <Zap className="w-4 h-4" />
};

const QUICK_CREATIVE_IDEAS = [
  { label: '👗 Gala con Escote Elegante', text: 'Retrato de gala de alta costura con vestido negro satinado de escote elegante en un salón de cristal iluminado con candelabros' },
  { label: '☕ Café en París Otoñal', text: 'En una terraza de un café parisino en otoño con boina, gabardina beige clásica y taza de café humeante' },
  { label: '🏰 Realeza en Trono Medieval', text: 'Sentado en un majestuoso trono de piedra y oro en un castillo medieval, con capa de terciopelo y corona de filigrana' },
  { label: '🏖️ Atardecer Tropical en Playa', text: 'En una playa paradisíaca al atardecer con traje de lino o traje de baño elegante y brisa marina dorada' },
  { label: '🏎️ Piloto en Paddock F1', text: 'Piloto profesional de carreras en mono ignífugo de Fórmula 1 con casco aerodinámico en mano en el pit lane' },
  { label: '🌸 Diosa Floral Primaveral', text: 'Diosa primaveral con corona de flores de cerezo, vestido de seda etéreo y pétalos flotando en el aire' },
  { label: '🌆 Noche Cyberpunk Neón', text: 'En una metrópolis futurista bajo lluvia ligera con luces de neón cian y magenta y chaqueta tecnológica reflectante' },
  { label: '🍳 Chef Estrella Michelin', text: 'Chef de alta cocina con filipina blanca impecable y delantal en una cocina profesional de restaurante de lujo' }
];

export const ThemeCatalog: React.FC<ThemeCatalogProps> = ({
  selectedTheme,
  onSelectTheme,
}) => {
  const [activeCategory, setActiveCategory] = useState<ThemeCategory>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedThemeId, setExpandedThemeId] = useState<string | null>(null);

  // Custom Prompt State
  const [customPromptText, setCustomPromptText] = useState<string>('');
  const [customStyleTag, setCustomStyleTag] = useState<string>('Estudio Fotográfico Ultra HD');

  const currentSectionInfo = useMemo(() => {
    return THEME_SECTIONS.find((s) => s.id === activeCategory) || THEME_SECTIONS[0];
  }, [activeCategory]);

  const filteredThemes = useMemo(() => {
    return THEMES.filter((theme) => {
      const matchesCategory = activeCategory === 'todos' || theme.category === activeCategory;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      const matchesSearch =
        theme.name.toLowerCase().includes(query) ||
        theme.description.toLowerCase().includes(query) ||
        theme.sectionName.toLowerCase().includes(query) ||
        theme.clothingMale.toLowerCase().includes(query) ||
        theme.clothingFemale.toLowerCase().includes(query) ||
        (theme.badge && theme.badge.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const isCustomSelected = selectedTheme.id === 'custom' || selectedTheme.category === 'personalizado';

  const scrollToPhotoUploader = () => {
    setTimeout(() => {
      const uploaderEl = document.getElementById('photo-uploader-section');
      if (uploaderEl) {
        uploaderEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 120);
  };

  const handleSelectThemeWithScroll = (theme: Theme) => {
    onSelectTheme(theme);
    scrollToPhotoUploader();
  };

  const handleApplyCustomTheme = () => {
    const textToUse = customPromptText.trim() || 'Retrato fotográfico de estudio profesional personalizado con iluminación cinematográfica y máxima nitidez.';
    const customThemeObj: Theme = {
      id: 'custom',
      name: `Personalizada: ${textToUse.slice(0, 32)}${textToUse.length > 32 ? '...' : ''}`,
      category: 'personalizado',
      sectionName: 'Temática Personalizada Libre',
      description: textToUse,
      clothingMale: 'Vestimenta adaptada exactamente a la descripción solicitada.',
      clothingFemale: 'Vestimenta adaptada exactamente a la descripción solicitada.',
      clothingKidsCouples: 'Vestimenta para parejas/niños coordinada según la temática.',
      badge: '100% Personalizado',
      gradient: 'from-fuchsia-600 via-purple-600 to-cyan-600',
      iconName: 'Sparkles',
      sampleImage: '/samples/maternity_golden_goddess.webp',
      prompt: `${textToUse}. Estilo: ${customStyleTag}. Preserve exact face features, gender, age and person count, 8k photorealistic studio photography.`,
      popular: true
    };

    onSelectTheme(customThemeObj);
    scrollToPhotoUploader();
  };

  const handleSelectQuickIdea = (ideaText: string) => {
    setCustomPromptText(ideaText);
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="font-display font-extrabold text-xl sm:text-2xl md:text-3xl text-white flex flex-wrap items-center gap-2">
            <span>1. Elige tu Sección & Subtemática</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
              {filteredThemes.length} Subtemáticas
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Selecciona una temática de nuestro catálogo en los desplegables o redacta abajo tu propia temática 100% libre.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar temática, estilo, ropa..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-900/90 border border-slate-700/80 focus:border-cyan-400 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* DROPDOWN SELECTOR DE CATEGORÍAS (Ordenado & Touch-Friendly) */}
      <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-navy-900/90 via-navy-800/80 to-navy-900/90 border border-cyan-500/30 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-2 text-white font-bold text-xs sm:text-sm">
            <ListFilter className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Desplegable de Secciones:</span>
          </div>

          {/* Desplegable Select Principal */}
          <div className="relative flex-1 sm:max-w-md">
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value as ThemeCategory)}
              className="w-full appearance-none bg-navy-950/95 text-white font-semibold text-xs sm:text-sm pl-4 pr-10 py-3 rounded-xl border-2 border-cyan-500/50 hover:border-cyan-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 transition-all cursor-pointer shadow-inner"
            >
              {THEME_SECTIONS.map((sec) => {
                const count = sec.id === 'todos' 
                  ? THEMES.length 
                  : THEMES.filter(t => t.category === sec.id).length;
                return (
                  <option key={sec.id} value={sec.id} className="bg-navy-950 text-white py-2">
                    {sec.name} ({count} estilos)
                  </option>
                );
              })}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Quick Category Pills Scroll (Alternativa táctil rápida) */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pt-3 mt-3 border-t border-slate-800/80 scrollbar-none">
          {THEME_SECTIONS.map((sec) => {
            const isSelected = activeCategory === sec.id;
            const count = sec.id === 'todos' ? THEMES.length : THEMES.filter(t => t.category === sec.id).length;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveCategory(sec.id)}
                className={'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ' + (
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25 ring-1 ring-cyan-400'
                    : 'bg-navy-950/80 hover:bg-navy-800 text-slate-300 border border-slate-800'
                )}
              >
                <span className={isSelected ? 'text-white' : 'text-cyan-400'}>
                  {SECTION_ICONS[sec.icon] || <Sparkles className="w-3.5 h-3.5" />}
                </span>
                <span className="hidden xs:inline sm:inline">{sec.name.split(' ')[0]} {sec.name.split(' ')[1] || ''}</span>
                <span className="inline xs:hidden sm:hidden">{sec.name.split(' ')[0]}</span>
                <span className={'text-[10px] px-1.5 py-0.2 rounded-full font-bold ' + (
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Section Banner with Intelligence Specs */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-navy-900/90 via-navy-800/80 to-navy-900/90 border border-cyan-500/20 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              {SECTION_ICONS[currentSectionInfo.icon] || <Layers className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <span>{currentSectionInfo.name}</span>
                <span className="text-[10px] sm:text-[11px] font-normal text-cyan-300/80 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20">
                  {filteredThemes.length} opciones
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
                {currentSectionInfo.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800 text-[10px] sm:text-[11px] text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-500/20 shrink-0">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Conserva 100% personas, edades y géneros</span>
          </div>
        </div>
      </div>

      {/* Subthemes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {filteredThemes.map((theme) => {
          const isSelected = selectedTheme.id === theme.id;
          const isExpanded = expandedThemeId === theme.id;

          return (
            <div
              key={theme.id}
              onClick={() => handleSelectThemeWithScroll(theme)}
              className={'group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col ' + (
                isSelected
                  ? 'ring-2 ring-cyan-400 shadow-2xl shadow-cyan-500/30 bg-navy-800 border-transparent'
                  : 'bg-navy-900/80 hover:bg-navy-800/90 border border-slate-800/90 hover:border-cyan-500/40 hover:-translate-y-1'
              )}
            >
              {/* Image Preview Container */}
              <div className="relative aspect-[4/4.5] w-full overflow-hidden bg-navy-950">
                <img
                  src={theme.sampleImage}
                  alt={theme.name}
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Dark Gradient Overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/50 to-transparent" />

                {/* Badge Top Left */}
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 max-w-[80%]">
                  {theme.badge && (
                    <span className="px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-black/75 backdrop-blur-md text-cyan-300 border border-cyan-400/30 shadow-md truncate">
                      {theme.badge}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-md text-[8px] sm:text-[9px] font-medium bg-navy-950/80 text-slate-300 border border-slate-700/60 backdrop-blur-sm truncate">
                    {theme.sectionName}
                  </span>
                </div>

                {/* Selected Checkmark Indicator */}
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white flex items-center justify-center shadow-lg shadow-cyan-500/50 ring-2 ring-white">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
                  </div>
                )}

                {/* Persona Adaptability Pill Bottom of image */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[9px] sm:text-[10px] text-slate-200 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                  <span className="flex items-center gap-1 text-cyan-300 font-medium">
                    <Users className="w-3 h-3" />
                    <span>1 Persona • Pareja • Grupos</span>
                  </span>
                  <span className="text-[8px] sm:text-[9px] text-amber-300 font-semibold">
                    Adaptable
                  </span>
                </div>
              </div>

              {/* Subtheme Content & Details */}
              <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-bold text-xs sm:text-sm text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {theme.name}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-300 mt-1 line-clamp-2 leading-snug">
                    {theme.description}
                  </p>
                </div>

                {/* Adaptive Clothing Accordion / Info Box */}
                <div className="mt-3 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedThemeId(isExpanded ? null : theme.id);
                    }}
                    className="w-full flex items-center justify-between text-[10px] sm:text-[11px] font-medium text-cyan-400 hover:text-cyan-300 transition-colors py-1"
                  >
                    <span className="flex items-center gap-1.5">
                      <Shirt className="w-3.5 h-3.5" />
                      <span>Ver Adaptación de Ropa</span>
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-mono bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/20">
                      {isExpanded ? 'Ocultar' : 'Ver'}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="mt-2 p-2 rounded-xl bg-navy-950/90 border border-cyan-500/20 text-[10px] sm:text-[11px] text-slate-300 space-y-1 animate-fade-in">
                      <div className="flex items-start gap-1.5">
                        <span className="text-cyan-400 font-bold shrink-0">Hombre:</span>
                        <span className="text-slate-300 leading-tight">{theme.clothingMale}</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span className="text-rose-400 font-bold shrink-0">Mujer:</span>
                        <span className="text-slate-300 leading-tight">{theme.clothingFemale}</span>
                      </div>
                      {theme.clothingKidsCouples && (
                        <div className="flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold shrink-0">Pareja/Niños:</span>
                          <span className="text-slate-300 leading-tight">{theme.clothingKidsCouples}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selection Action Button */}
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectThemeWithScroll(theme);
                    }}
                    className={'w-full py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ' + (
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-md shadow-cyan-500/30'
                        : 'bg-navy-800 hover:bg-cyan-500/20 text-slate-200 hover:text-cyan-300 border border-slate-700/80 hover:border-cyan-500/40'
                    )}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Estilo Seleccionado</span>
                      </>
                    ) : (
                      <>
                        <span>Seleccionar este Estilo</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* SECCIÓN DESTACADA: TEMÁTICA 100% PERSONALIZADA / LIBRE */}
      {/* ========================================================= */}
      <div className={'mt-10 p-4 sm:p-6 rounded-3xl transition-all duration-300 relative overflow-hidden ' + (
        isCustomSelected
          ? 'bg-gradient-to-br from-navy-900 via-purple-950/40 to-navy-900 border-2 border-purple-400 shadow-2xl shadow-purple-500/20 ring-2 ring-purple-400/50'
          : 'bg-gradient-to-br from-navy-900/90 via-navy-800/80 to-navy-900/90 border border-purple-500/40 shadow-xl'
      )}>
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 space-y-4">
          
          {/* Header of Custom Theme Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-fuchsia-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 shrink-0">
                <PenTool className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-extrabold text-base sm:text-xl text-white">
                    ¿Tienes una idea única? Escribe tu Temática 100% Libre
                  </h3>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[10px] font-bold uppercase">
                    Libertad Total
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Escribe cualquier escenario, ropa, pose o profesión que desees. La IA lo creará a tu medida.
                </p>
              </div>
            </div>

            {isCustomSelected && (
              <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 shadow-md">
                <CheckCircle2 className="w-4 h-4" />
                <span>Modo Personalizado Activo</span>
              </span>
            )}
          </div>

          {/* Guidelines & Safety Banner */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-navy-950/80 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-start sm:items-center gap-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 sm:mt-0" />
              <span>
                <strong>Reglas de contenido:</strong> Se permiten escotes elegantes, trajes de baño, vestidos de gala y moda atrevida. <span className="text-rose-300 font-semibold">Prohibido desnudos explícitos o pornografía.</span>
              </span>
            </div>
            <span className="text-[10px] text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20 shrink-0 self-start sm:self-auto">
              Calidad Ultra HD 8K
            </span>
          </div>

          {/* Quick Ideas Chips */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 block mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Ideas creativas rápidas (toca una para inspirarte o cargarla):</span>
            </span>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {QUICK_CREATIVE_IDEAS.map((idea, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectQuickIdea(idea.text)}
                  className="px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs bg-navy-950/90 hover:bg-purple-900/40 text-slate-300 hover:text-purple-200 border border-slate-700/70 hover:border-purple-400/50 transition-all cursor-pointer"
                >
                  {idea.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text Area for Custom Theme */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white flex items-center justify-between">
              <span>Describe con tus palabras la temática o foto que deseas:</span>
              <span className="text-[10px] text-slate-400">{customPromptText.length}/400 caracteres</span>
            </label>
            <textarea
              rows={3}
              maxLength={400}
              value={customPromptText}
              onChange={(e) => setCustomPromptText(e.target.value)}
              placeholder="Ej: En un balcón de París al atardecer con vestido de gala elegante y escote sofisticado con vista a la Torre Eiffel iluminada..."
              className="w-full p-3.5 rounded-2xl bg-navy-950/90 border border-slate-700 focus:border-purple-400 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all resize-none shadow-inner"
            />
          </div>

          {/* Style Selector & Apply Action Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            
            {/* Photography Finish Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium shrink-0">Estilo:</span>
              <select
                value={customStyleTag}
                onChange={(e) => setCustomStyleTag(e.target.value)}
                className="bg-navy-950 text-white text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 focus:border-purple-400 focus:outline-none cursor-pointer"
              >
                <option value="Estudio Fotográfico Ultra HD">📸 Estudio Fotográfico Clásico</option>
                <option value="Cinematográfico Iluminación de Película">🎬 Cinematográfico de Película</option>
                <option value="Moda Editorial de Revista de Lujo">✨ Moda Editorial de Revista</option>
                <option value="Fantasía Mágica Épica">🔮 Fantasía Mágica Épica</option>
                <option value="Vintage Retro Años 70s/80s">📷 Vintage Retro</option>
                <option value="Ilustración Anime Fine Art">🎨 Arte & Animación</option>
              </select>
            </div>

            {/* Apply Button */}
            <button
              type="button"
              onClick={handleApplyCustomTheme}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-purple-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Wand2 className="w-4 h-4" />
              <span>{isCustomSelected ? '✓ Actualizar Mi Temática Personalizada' : 'Usar esta Temática Personalizada'}</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
