import React from 'react';
import { Sparkles, Coins, LogIn, LogOut, Images, PlusCircle, Shield } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenPayment: () => void;
  onOpenGallery: () => void;
  onScrollToStudio: () => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenAuth,
  onLogout,
  onOpenPayment,
  onOpenGallery,
  onScrollToStudio,
  onOpenAdmin,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#070C18]/90 border-b border-cyan-500/20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2">
        
        {/* Brand Logo & Name */}
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2 sm:gap-3.5 cursor-pointer group shrink-0"
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
            <p className="text-[9px] sm:text-[11px] text-slate-400 font-medium tracking-wider uppercase truncate max-w-[120px] sm:max-w-none">
              Estudio Fotográfico IA
            </p>
          </div>
        </div>

        {/* Action Buttons & User Menu */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          
          {user ? (
            <>
              {/* Token Balance Badge */}
              <div 
                onClick={onOpenPayment}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-navy-800 to-navy-700 border border-cyan-500/30 hover:border-cyan-400 cursor-pointer shadow-md transition-all group shrink-0"
                title="Haz clic para recargar más fotos"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-smartgold-500/20 flex items-center justify-center text-smartgold-400 shrink-0">
                  <Coins className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[11px] sm:text-xs font-bold text-white group-hover:text-cyan-300 transition-colors whitespace-nowrap">
                    {user.tokens} <span className="hidden xs:inline">{user.tokens === 1 ? 'Foto' : 'Fotos'}</span>
                  </span>
                  <span className="text-[8px] sm:text-[9px] text-cyan-400/90 font-medium hidden xs:block">
                    {user.tokens > 0 ? 'Disponibles' : 'Recargar'}
                  </span>
                </div>
                <PlusCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400 opacity-70 group-hover:opacity-100 group-hover:rotate-90 transition-all shrink-0" />
              </div>

              {/* My Gallery */}
              <button
                onClick={onOpenGallery}
                className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-navy-800/80 hover:bg-navy-700 text-slate-200 border border-slate-700/60 hover:border-cyan-500/50 text-xs sm:text-sm font-medium transition-all shrink-0"
                title="Ver mis fotos generadas"
              >
                <Images className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0" />
                <span className="hidden md:inline">Mis Fotos</span>
              </button>

              {/* Pack 50 S/ 15 Promo CTA */}
              <button
                onClick={onOpenPayment}
                className="relative group overflow-hidden px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-md sm:shadow-lg shadow-cyan-500/25 transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-smartgold-400 animate-spin hidden xs:inline-block" style={{ animationDuration: '6s' }} />
                <span className="hidden sm:inline">50 Fotos x S/15</span>
                <span className="inline sm:hidden">S/15</span>
              </button>

              {/* User Avatar & Logout */}
              <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-slate-700/60 shrink-0">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-cyan-400/50 object-cover bg-navy-800 shrink-0"
                  title={user.name + ' (' + user.email + ')'}
                />
                <button
                  onClick={onLogout}
                  className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Promo button */}
              <button
                onClick={onScrollToStudio}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold text-smartgold-400 bg-smartgold-500/10 border border-smartgold-500/30"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>1 Foto Gratis</span>
              </button>

              {/* Login Button */}
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs sm:text-sm shadow-md sm:shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all active:scale-95 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Ingresar</span>
              </button>
            </>
          )}

        </div>
      </div>
    </header>
  );
};