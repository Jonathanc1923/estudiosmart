import React from 'react';
import { Sparkles, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-navy-950 border-t border-slate-800/80 py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="Logo" className="w-10 h-10 rounded-xl object-cover border border-cyan-500/30" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-lg text-white">ESTUDIO</span>
              <span className="font-display font-extrabold text-lg text-cyan-400">SMART</span>
            </div>
            <p className="text-[11px] text-slate-400">Estudio Fotográfico con Inteligencia Artificial</p>
          </div>
        </div>

        <div className="text-center md:text-right text-xs text-slate-400">
          <p className="mb-1">
            Tecnología de Inteligencia Artificial de Estudio Smart • Ultra HD.
          </p>
          <p className="text-slate-500">
            © {new Date().getFullYear()} Estudio Smart. Todos los derechos reservados.
          </p>
        </div>

      </div>
    </footer>
  );
};