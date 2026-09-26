import React from 'react';
import { Sparkles, Coins, LogIn, LogOut, Images, PlusCircle, Home, Camera, Wand2 } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  currentTab: 'home' | 'create';
  onSelectTab: (tab: 'home' | 'create') => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenPayment: () => void;
  onOpenGallery: () => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentTab,
  onSelectTab,
  onOpenAuth,
  onLogout,
  onOpenPayment,
  onOpenGallery,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#070C18]/95 border-b border-cyan-500/20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand Logo & Name */}
        <div 
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0"
        >
          <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-cyan-400/40 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300 shrink-0">
            <img 
              src="/logo.jpg" 
              alt="Estudio Smart Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-display font-extrabold text-sm sm:text-lg lg:text-xl tracking-wider text-white">
                ESTUDIO
              </span>
              <span className="font-display font-extrabold text-sm sm:text-lg lg:text-xl tracking-wider text-cyan-400 drop-shadow-[0_0_12px_rgba(34,204,226,0.6)]">
                SMART
              </span>
              <Sparkles className="w-3.5 h-3.5 text-smartgold-400 animate-pulse hidden xs:inline-block" />
            </div>
            <p className="text-[9px] sm:text-[11px] text-slate-400 font-medium tracking-wider uppercase truncate max-w-[110px] sm:max-w-none">
              Estudio Fotográfico IA
            </p>
          </div>
        </div>

        {/* Central Main Navigation Tabs (Desktop & Tablet) */}
        <nav className="hidden sm:flex items-center gap-1.5 p-1 rounded-2xl bg-navy-900/90 border border-slate-800">
          <button
            onClick={() => onSelectTab('home')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              currentTab === 'home'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Inicio & Galería</span>
          </button>

          <button
            onClick={() => onSelectTab('create')}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              currentTab === 'create'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-navy-950 shadow-md shadow-cyan-500/25'
                : 'text-white bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30'
            }`}
          >
            <Wand2 className={`w-4 h-4 ${currentTab === 'create' ? 'text-navy-950' : 'text-cyan-400 animate-pulse'}`} />
            <span>Crea tus fotos</span>
            {currentTab !== 'create' && (
              <span className="w-2 h-2 rounded-full bg-smartgold-400 animate-ping absolute -top-0.5 -right-0.5" />
            )}
          </button>
        </nav>

        {/* Action Buttons & User Menu */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          
          {/* Quick "Crea tus fotos" button on mobile header if on home tab */}
          {currentTab === 'home' && (
            <button
              onClick={() => onSelectTab('create')}
              className="sm:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-navy-950 font-black text-xs shadow-md active:scale-95 cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5 text-navy-950" />
              <span>Crear Fotos</span>
            </button>
          )}

          {/* Quick "Inicio" button on mobile header if on create tab */}
          {currentTab === 'create' && (
            <button
              onClick={() => onSelectTab('home')}
              className="sm:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-navy-800 border border-cyan-500/30 text-cyan-300 font-bold text-xs active:scale-95 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Galería</span>
            </button>
          )}

          {user ? (
            <>
              {/* Token Balance Badge */}
              <div 
                onClick={onOpenPayment}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-navy-800 to-navy-700 border border-cyan-500/30 hover:border-cyan-400 cursor-pointer shadow-md transition-all group shrink-0"
                title="Haz clic para ver tus créditos o solicitar recarga"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-smartgold-500/20 flex items-center justify-center text-smartgold-400 shrink-0">
                  <Coins className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[11px] sm:text-xs font-bold text-white group-hover:text-cyan-300 transition-colors whitespace-nowrap">
                    {user.tokens} <span className="hidden md:inline">{user.tokens === 1 ? 'Foto' : 'Fotos'}</span>
                  </span>
                </div>
                <PlusCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400 opacity-70 group-hover:opacity-100 group-hover:rotate-90 transition-all shrink-0" />
              </div>

              {/* My Gallery (Desktop) */}
              <button
                onClick={onOpenGallery}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-navy-800/80 hover:bg-navy-700 text-slate-200 border border-slate-700/60 hover:border-cyan-500/50 text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer"
                title="Ver mis fotos generadas"
              >
                <Images className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0" />
                <span>Mis Fotos</span>
              </button>

              {/* User Avatar & Logout */}
              <div className="flex items-center gap-1 sm:gap-2 pl-1 sm:pl-2 border-l border-slate-700/60 shrink-0">
                <img
                  src={user.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + user.email}
                  alt={user.name}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-cyan-400/50 object-cover bg-navy-800 shrink-0"
                  title={user.name + ' (' + user.email + ')'}
                />
                <button
                  onClick={onLogout}
                  className="p-1 sm:p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0 cursor-pointer"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Login Button */}
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all active:scale-95 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Iniciar Sesión</span>
                <span className="xs:hidden">Entrar</span>
              </button>
            </>
          )}

        </div>
      </div>
    </header>
  );
};