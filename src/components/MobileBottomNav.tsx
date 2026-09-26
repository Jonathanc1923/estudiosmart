import React from 'react';
import { Home, Wand2, Images, Sparkles, User as UserIcon, Coins } from 'lucide-react';
import { User } from '../types';

interface MobileBottomNavProps {
  currentTab: 'home' | 'create';
  onSelectTab: (tab: 'home' | 'create') => void;
  user: User | null;
  onOpenAuth: () => void;
  onOpenGallery: () => void;
  onOpenPayment: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  user,
  onOpenAuth,
  onOpenGallery,
  onOpenPayment
}) => {
  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070C18]/95 backdrop-blur-xl border-t border-cyan-500/20 px-2 py-1.5 shadow-[0_-8px_25px_rgba(0,0,0,0.5)] safe-area-pb">
      <div className="grid grid-cols-4 items-center justify-around gap-1 max-w-md mx-auto">
        
        {/* 1. Inicio */}
        <button
          onClick={() => {
            onSelectTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer ${
            currentTab === 'home'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className={`w-5 h-5 ${currentTab === 'home' ? 'text-cyan-400 scale-110' : 'text-slate-400'}`} />
          <span className="text-[10px] mt-0.5">Inicio</span>
        </button>

        {/* 2. Crea tus fotos (Destacado central) */}
        <button
          onClick={() => {
            onSelectTab('create');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`relative flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
            currentTab === 'create'
              ? 'text-cyan-300 font-extrabold'
              : 'text-white font-bold'
          }`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-transform ${
            currentTab === 'create'
              ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-navy-950 scale-110 shadow-cyan-500/50'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-navy-950 shadow-cyan-500/30'
          }`}>
            <Wand2 className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-0.5 truncate max-w-full">Crear Fotos</span>
        </button>

        {/* 3. Mis Fotos (o Recargar) */}
        {user ? (
          <button
            onClick={onOpenGallery}
            className="flex flex-col items-center justify-center py-1 rounded-xl text-slate-400 hover:text-cyan-300 transition-all cursor-pointer"
          >
            <Images className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Mis Fotos</span>
          </button>
        ) : (
          <button
            onClick={onOpenPayment}
            className="flex flex-col items-center justify-center py-1 rounded-xl text-slate-400 hover:text-cyan-300 transition-all cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-smartgold-400" />
            <span className="text-[10px] mt-0.5">Servicio</span>
          </button>
        )}

        {/* 4. Cuenta / Tokens / Login */}
        {user ? (
          <button
            onClick={onOpenPayment}
            className="flex flex-col items-center justify-center py-1 rounded-xl text-slate-400 hover:text-cyan-300 transition-all cursor-pointer"
          >
            <div className="relative">
              <Coins className="w-5 h-5 text-smartgold-400" />
              <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-cyan-500 text-navy-950 text-[8px] font-black rounded-full">
                {user.tokens}
              </span>
            </div>
            <span className="text-[10px] mt-0.5">Créditos</span>
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex flex-col items-center justify-center py-1 rounded-xl text-slate-400 hover:text-cyan-300 transition-all cursor-pointer"
          >
            <UserIcon className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Acceso</span>
          </button>
        )}

      </div>
    </div>
  );
};
