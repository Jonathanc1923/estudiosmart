import React from 'react';
import { 
  X, 
  Sparkles, 
  Copy, 
  Check, 
  Smartphone, 
  Building, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Users, 
  Download,
  MessageCircle,
  Coins
} from 'lucide-react';
import { User } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onPaymentSuccess?: (tokensAdded: number, newTotal: number) => void;
  onOpenAuth: () => void;
}

const PACKAGE_BENEFITS = [
  { icon: <Zap className="w-3.5 h-3.5 text-cyan-400" />, text: 'Retratos Ultra HD 8K de máxima definición' },
  { icon: <Layers className="w-3.5 h-3.5 text-cyan-400" />, text: 'Acceso total a las 100+ Temáticas de Catálogo' },
  { icon: <Users className="w-3.5 h-3.5 text-cyan-400" />, text: 'Soporte para 1 Persona, Parejas y Familias' },
  { icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" />, text: 'Crea también temáticas 100% personalizadas libres' },
  { icon: <Download className="w-3.5 h-3.5 text-emerald-400" />, text: 'Descarga en calidad original y galería en la nube' },
];

const WHATSAPP_HUMAN_PHONE = '+51 907 318 642';
const WHATSAPP_HUMAN_CLEAN = '51907318642';

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  user,
  onClose,
  onOpenAuth,
}) => {
  const [tab, setTab] = React.useState<'yape' | 'bcp'>('yape');
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const paymentData = {
    yapePhone: '917858325',
    yapeHolder: 'Jonathan Encina',
    bcpAccount: '21505929964057',
    bcpCci: '00221510592996405728',
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const whatsappMsg = encodeURIComponent(
    `Hola Estudio Smart, deseo recargar fotos para mi cuenta: ${user?.email || 'No registrado'}`
  );
  const whatsappUrl = `https://wa.me/${WHATSAPP_HUMAN_CLEAN}?text=${whatsappMsg}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-navy-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl max-h-[92dvh] overflow-y-auto rounded-3xl glass-panel p-4 sm:p-7 border-cyan-500/40 shadow-2xl my-auto sm:my-8 scrollbar-none">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-4 sm:mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/30 mb-2">
            <Coins className="w-3.5 h-3.5 text-smartgold-400" />
            <span>CRÉDITOS Y RECARGA DE FOTOS</span>
          </div>

          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            Recarga de Fotos en <span className="text-cyan-400">Estudio Smart</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Los créditos y autorizaciones son asignados directamente por la administración.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="mb-4 sm:mb-5 p-3 sm:p-3.5 rounded-2xl bg-navy-900/90 border border-cyan-500/20 shadow-inner">
          <div className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Ventajas incluidas con tus fotos:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 text-xs text-slate-200">
            {PACKAGE_BENEFITS.map((b, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="shrink-0">{b.icon}</span>
                <span className="leading-tight">{b.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Direct Contact Button */}
        <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 to-teal-950/70 border border-emerald-500/50 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm">
            <MessageCircle className="w-5 h-5" />
            <span>Solicitar Recarga Directa por WhatsApp</span>
          </div>
          <p className="text-xs text-slate-300">
            Escríbenos a WhatsApp indicando tu correo para que el administrador te asigne tus fotos de inmediato.
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-navy-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-navy-950" />
            <span>Chatear con el Administrador ({WHATSAPP_HUMAN_PHONE})</span>
          </a>
        </div>

        {/* Payment Data Options */}
        <div className="space-y-3">
          <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider text-left">
            Cuentas Oficiales para Transferencias:
          </div>

          <div className="flex rounded-2xl bg-navy-900 p-1 border border-slate-800">
            <button
              onClick={() => setTab('yape')}
              className={'flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ' + (
                tab === 'yape'
                  ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Yape / Plin</span>
            </button>
            <button
              onClick={() => setTab('bcp')}
              className={'flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ' + (
                tab === 'bcp'
                  ? 'bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Transferencia BCP</span>
            </button>
          </div>

          {tab === 'yape' ? (
            <div className="p-3 rounded-2xl bg-navy-900/80 border border-purple-500/30 space-y-2 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Número Yape / Plin:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-extrabold text-sm text-cyan-300">
                    {paymentData.yapePhone}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(paymentData.yapePhone, 'yape')}
                    className="p-1 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
                  >
                    {copiedField === 'yape' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Titular de la cuenta:</span>
                <span className="font-bold text-white">{paymentData.yapeHolder}</span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-navy-900/80 border border-blue-500/30 space-y-2 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Cuenta BCP:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-cyan-300">
                    {paymentData.bcpAccount}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(paymentData.bcpAccount, 'bcp')}
                    className="p-1 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
                  >
                    {copiedField === 'bcp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">CCI Interbancario:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-cyan-300">
                    {paymentData.bcpCci}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(paymentData.bcpCci, 'cci')}
                    className="p-1 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
                  >
                    {copiedField === 'cci' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Titular:</span>
                <span className="font-bold text-white">{paymentData.yapeHolder}</span>
              </div>
            </div>
          )}
        </div>

        {!user && (
          <div className="mt-4 pt-3 border-t border-slate-800 text-center">
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="text-xs text-cyan-400 hover:text-cyan-300 underline font-semibold cursor-pointer"
            >
              ¿Ya tienes cuenta autorizada? Inicia sesión aquí
            </button>
          </div>
        )}

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Atención personalizada • Soporte directo de Estudio Smart</span>
        </div>

      </div>
    </div>
  );
};
