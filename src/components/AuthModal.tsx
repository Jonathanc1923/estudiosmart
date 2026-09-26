import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  KeyRound, 
  MessageCircle, 
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import { apiFetch } from '../utils/api';
import { User, Generation } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessAuth: (authPayload: { user: User; generations?: Generation[] }) => void;
}

const WHATSAPP_ADMIN_PHONE = '+51 907 318 642';
const WHATSAPP_ADMIN_CLEAN = '51907318642';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccessAuth,
}) => {
  const [tab, setTab] = useState<'login' | 'set_password'>('login');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Por favor ingresa un correo electrónico válido.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Por favor ingresa tu contraseña.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.user) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      onSuccessAuth({ user: data.user, generations: data.generations });
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err.message || 'Error al conectar con el servidor.');
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Por favor ingresa un correo electrónico válido.');
      return;
    }
    if (!password.trim() || password.length < 3) {
      setErrorMessage('La contraseña debe tener al menos 3 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await apiFetch('/api/auth/set-password', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          name: name.trim() || email.split('@')[0],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.user) {
        throw new Error(data.error || 'Error al establecer tu contraseña');
      }

      setSuccessMessage('¡Contraseña guardada con éxito! Iniciando sesión...');
      setTimeout(() => {
        onSuccessAuth({ user: data.user, generations: data.generations });
      }, 900);
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err.message || 'Error al procesar tu solicitud.');
    }
  };

  const whatsappRequestUrl = `https://wa.me/${WHATSAPP_ADMIN_CLEAN}?text=${encodeURIComponent(
    `Hola Estudio Smart, solicito habilitación de acceso para mi correo: ${email || ''}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md max-h-[92dvh] overflow-y-auto rounded-3xl glass-panel p-5 sm:p-7 border-cyan-500/40 shadow-2xl shadow-cyan-500/20 text-center my-auto scrollbar-none">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border border-cyan-400/40 shadow-lg shadow-cyan-500/20 mx-auto mb-2.5">
          <img src="/logo.jpg" alt="Estudio Smart" className="w-full h-full object-cover" />
        </div>
        
        <h2 className="font-display font-black text-2xl sm:text-3xl text-white mb-1">
          Acceso a <span className="text-cyan-400">Estudio Smart</span>
        </h2>
        
        <p className="text-xs text-slate-300 mb-3.5">
          Ingresa con tu correo autorizado y tu contraseña para gestionar tus retratos.
        </p>

        {/* Tab Selection */}
        <div className="flex rounded-2xl bg-navy-900/90 p-1 border border-slate-800 mb-4">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={'flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ' + (
              tab === 'login'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Iniciar Sesión</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab('set_password');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={'flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ' + (
              tab === 'set_password'
                ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Crear mi Contraseña</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-3.5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 text-left animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{errorMessage}</span>
              {errorMessage.includes('no está registrado') || errorMessage.includes('autorización') ? (
                <div className="mt-2 pt-2 border-t border-rose-500/30">
                  <a
                    href={whatsappRequestUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 underline"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Pedir autorización por WhatsApp ({WHATSAPP_ADMIN_PHONE})</span>
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-3.5 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 text-left animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Forms */}
        {tab === 'login' ? (
          /* 1. LOGIN FORM */
          <form onSubmit={handleLogin} className="space-y-3 text-left">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Correo Electrónico:
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 shadow-inner"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-slate-300">
                  Contraseña (creada por ti o dada por interno):
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña de acceso"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-cyan-400" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 font-black text-xs sm:text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-navy-950" />
                  <span>Verificando acceso...</span>
                </>
              ) : (
                <>
                  <span>Ingresar a Estudio Smart</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setTab('set_password')}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
              >
                ¿Deseas definir o cambiar tu propia contraseña? Haz clic aquí
              </button>
            </div>
          </form>
        ) : (
          /* 2. SET / CREATE CLIENT PASSWORD FORM */
          <form onSubmit={handleSetPassword} className="space-y-2.5 text-left">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Tu Correo Autorizado por Administración:
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Tu Nombre o Alias (opcional):
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre para tus retratos"
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 shadow-inner"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Nueva Contraseña que deseas usar:
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Crea tu contraseña"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-purple-400" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Confirmar Contraseña:
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 shadow-inner"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-black text-xs sm:text-sm shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Guardando contraseña...</span>
                </>
              ) : (
                <>
                  <span>Guardar Contraseña y Acceder</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* WhatsApp Request Help Card */}
        <div className="mt-4 p-2.5 rounded-2xl bg-navy-900/60 border border-slate-800 text-left flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <MessageCircle className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-white leading-tight">¿Aún no tienes acceso?</p>
              <p className="text-[10px] text-slate-400">Solicita tu cuenta al administrador</p>
            </div>
          </div>
          <a
            href={whatsappRequestUrl}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>WhatsApp</span>
          </a>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 pt-3 mt-3 border-t border-slate-800/80">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Acceso seguro • Autorización directa de Estudio Smart</span>
        </div>

      </div>
    </div>
  );
};