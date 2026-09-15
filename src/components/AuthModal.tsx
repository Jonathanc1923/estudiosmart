import React, { useState } from 'react';
import { X, Sparkles, ShieldCheck, AlertCircle, Loader2, Mail, ArrowRight } from 'lucide-react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { apiFetch } from '../utils/api';
import { User, Generation } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessAuth: (authPayload: { credential?: string; user?: User; generations?: Generation[] }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccessAuth,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [directEmail, setDirectEmail] = useState('');
  const [directName, setDirectName] = useState('');

  if (!isOpen) return null;

  const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      setLoading(true);
      setErrorMessage(null);
      onSuccessAuth({ credential: credentialResponse.credential });
    } else {
      setErrorMessage('No se recibió la credencial de Google. Inténtalo de nuevo o ingresa tu correo abajo.');
    }
  };

  const handleGoogleError = () => {
    setErrorMessage('Google bloqueó el popup (origin_mismatch). Puedes ingresar tu correo abajo o usar el botón directo.');
  };

  const handleRedirectOAuth = () => {
    setLoading(true);
    window.location.href = '/auth/google';
  };

  const handleQuickEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directEmail.trim() || !directEmail.includes('@')) {
      setErrorMessage('Por favor ingresa un correo electrónico válido.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await apiFetch('/api/auth/quick-login', {
        method: 'POST',
        body: JSON.stringify({
          email: directEmail.trim(),
          name: directName.trim() || directEmail.split('@')[0],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.user) {
        throw new Error(data.error || 'Error al iniciar sesión con correo');
      }

      onSuccessAuth({ user: data.user, generations: data.generations });
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err.message || 'Error al conectar con el servidor.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md max-h-[92dvh] overflow-y-auto rounded-3xl glass-panel p-5 sm:p-8 border-cyan-500/40 shadow-2xl shadow-cyan-500/20 text-center my-auto scrollbar-none">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="w-14 h-14 rounded-2xl overflow-hidden border border-cyan-400/40 shadow-lg shadow-cyan-500/20 mx-auto mb-2.5">
          <img src="/logo.jpg" alt="Estudio Smart" className="w-full h-full object-cover" />
        </div>
        
        <h2 className="font-display font-black text-2xl sm:text-3xl text-white mb-1">
          Acceso a <span className="text-cyan-400">Estudio Smart</span>
        </h2>
        
        <p className="text-xs sm:text-sm text-slate-300 mb-4">
          Inicia sesión para recibir tu <strong className="text-smartgold-400 font-bold">1 Foto Gratis</strong> y acceder a tus retratos.
        </p>

        {/* Benefit Highlight */}
        <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center gap-2.5 mb-4 text-left">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <Sparkles className="w-4 h-4 text-smartgold-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">1 Imagen Gratis de Muestra</p>
            <p className="text-[11px] text-slate-300">Guarda tus fotos generadas en tu galería en la nube.</p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 text-left animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Auth Options */}
        <div className="space-y-3.5 mb-4">
          {loading ? (
            <div className="flex items-center justify-center gap-2 text-cyan-400 text-sm font-bold py-4">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Iniciando sesión...</span>
            </div>
          ) : (
            <>
              {/* Google One-Tap / Popup Widget */}
              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                  theme="filled_blue"
                  size="large"
                  shape="pill"
                  text="continue_with"
                  width="320"
                />
              </div>

              {/* Direct Full Redirect button */}
              <button
                type="button"
                onClick={handleRedirectOAuth}
                className="w-full py-2.5 px-4 rounded-full bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-md transition-all active:scale-95 border border-slate-200 cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Acceso directo con Google OAuth</span>
              </button>

              <div className="flex items-center gap-3 my-2 text-slate-500 text-xs">
                <div className="flex-1 h-px bg-slate-800" />
                <span>O ingresa tu correo directamente</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              {/* Direct Email Form */}
              <form onSubmit={handleQuickEmailLogin} className="space-y-2.5 text-left">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Tu Correo Electrónico:
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={directEmail}
                      onChange={(e) => setDirectEmail(e.target.value)}
                      placeholder="ejemplo@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 shadow-inner"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Tu Nombre (opcional):
                  </label>
                  <input
                    type="text"
                    value={directName}
                    onChange={(e) => setDirectName(e.target.value)}
                    placeholder="Tu nombre o alias"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 shadow-inner"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 font-black text-xs sm:text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Ingresar y Recibir 1 Foto Gratis</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 pt-2.5 border-t border-slate-800/80">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Acceso seguro • Protección y privacidad garantizada</span>
        </div>

      </div>
    </div>
  );
};