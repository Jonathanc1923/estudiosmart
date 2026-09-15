import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Copy, 
  Check, 
  Upload, 
  Smartphone, 
  Building, 
  ShieldCheck, 
  Bot, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  Loader2, 
  Zap, 
  Layers, 
  Users, 
  Download,
  MessageCircle,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { User } from '../types';
import { apiFetch } from '../utils/api';
import { usePromoCountdown } from '../hooks/usePromoCountdown';

interface PaymentModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onPaymentSuccess: (tokensAdded: number, newTotal: number) => void;
  onOpenAuth: () => void;
}

const PACKAGE_BENEFITS = [
  { icon: <Zap className="w-3.5 h-3.5 text-cyan-400" />, text: '50 Retratos Ultra HD 8K sin marcas de agua' },
  { icon: <Layers className="w-3.5 h-3.5 text-cyan-400" />, text: 'Acceso total a las 100+ Subtemáticas de Estudio' },
  { icon: <Users className="w-3.5 h-3.5 text-cyan-400" />, text: 'Soporte para 1 Persona, Parejas y Familias' },
  { icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" />, text: 'Crea también temáticas 100% personalizadas libres' },
  { icon: <Bot className="w-3.5 h-3.5 text-cyan-400" />, text: 'Auditoría inteligente y activación automática con IA' },
  { icon: <Download className="w-3.5 h-3.5 text-emerald-400" />, text: 'Descarga en calidad original y galería en la nube' },
];

const WHATSAPP_HUMAN_PHONE = '+51 907 318 642';
const WHATSAPP_HUMAN_CLEAN = '51907318642';

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  user,
  onClose,
  onPaymentSuccess,
  onOpenAuth,
}) => {
  const [tab, setTab] = useState<'yape' | 'bcp'>('yape');
  const [voucherPreview, setVoucherPreview] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [botStatusStep, setBotStatusStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<string | null>(null);
  const [detectedData, setDetectedData] = useState<any>(null);
  const [whatsappFallbackLink, setWhatsappFallbackLink] = useState<string | null>(null);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  const promoCountdown = usePromoCountdown(user?.createdAt);

  if (!isOpen) return null;

  const paymentData = {
    yapePhone: '917858325',
    yapeHolder: 'Jonathan Encina',
    bcpAccount: '21505929964057',
    bcpCci: '00221510592996405728',
    price: 15,
    tokens: 50,
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleVoucherFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setVoucherPreview(reader.result);
          setErrorMessage(null);
          setWhatsappFallbackLink(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerifyPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!voucherPreview) {
      setErrorMessage('Por favor sube la captura de tu comprobante de pago para que la IA lo verifique.');
      return;
    }

    setErrorMessage(null);
    setWhatsappFallbackLink(null);
    setIsVerifying(true);

    try {
      setBotStatusStep('Conectando con el sistema de verificación...');
      await new Promise((r) => setTimeout(r, 600));

      setBotStatusStep('Extrayendo monto, fecha y código de operación del comprobante...');
      await new Promise((r) => setTimeout(r, 700));

      setBotStatusStep('Verificando fecha de hoy y antigüedad no mayor a 2 horas en Perú...');
      await new Promise((r) => setTimeout(r, 700));

      setBotStatusStep('Comprobando monto de S/ 15.00 a Jonathan Encina...');

      const res = await apiFetch('/api/verify-payment', {
        method: 'POST',
        body: JSON.stringify({
          userEmail: user.email,
          method: tab === 'yape' ? 'yape' : 'bcp_transfer',
          voucherBase64: voucherPreview,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setIsVerifying(false);
        const errMsg = data.error || 'No se pudo verificar el pago automáticamente.';
        setErrorMessage(errMsg);
        setErrorType(data.errorType || (res.status === 404 ? 'AI_UNAVAILABLE_404' : 'INVALID_PAYMENT_DATA'));
        setDetectedData(data.detectedData || null);

        const waMsg = encodeURIComponent(
          `Hola Estudio Smart, solicito revisión humana de mi comprobante de pago de S/ 15.\nMi correo: ${user.email}\nMotivo: ${errMsg}`
        );
        setWhatsappFallbackLink(data.whatsappLink || `https://wa.me/${WHATSAPP_HUMAN_CLEAN}?text=${waMsg}`);
        return;
      }

      setBotStatusStep('¡Validación exitosa! Acreditando 50 fotos...');
      await new Promise((r) => setTimeout(r, 500));

      setIsVerifying(false);
      setVerifiedSuccess(true);

      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00B4D8', '#F59E0B', '#10B981', '#6366F1'],
        });
      } catch (err) {}

      onPaymentSuccess(data.tokensAdded || 50, data.newTotalTokens || 50);

      setTimeout(() => {
        setVerifiedSuccess(false);
        onClose();
      }, 2500);

    } catch (err: any) {
      setIsVerifying(false);
      const msg = err.message || 'Error al verificar el pago con el servidor.';
      setErrorMessage(msg);
      const waMsg = encodeURIComponent(
        `Hola Estudio Smart, solicito revisión humana de mi comprobante de pago de S/ 15.\nMi correo: ${user?.email || 'No registrado'}`
      );
      setWhatsappFallbackLink(`https://wa.me/${WHATSAPP_HUMAN_CLEAN}?text=${waMsg}`);
    }
  };

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

        {verifiedSuccess ? (
          /* Success Screen */
          <div className="text-center py-6 sm:py-8 animate-scale-in">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mx-auto mb-4 shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white mb-2">
              ¡Pago Verificado con Éxito!
            </h3>
            <p className="text-sm text-cyan-300 font-bold mb-4">
              Se han acreditado +50 fotos en Ultra HD 8K a tu cuenta
            </p>
            <p className="text-xs text-slate-300">
              Ya puedes crear y descargar todas tus fotos sin marcas de agua con nuestro Motor IA Ultra HD.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-4 sm:mb-5">
              <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-smartgold-500/20 text-smartgold-400 text-xs font-bold border border-smartgold-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>PAQUETE PROMO OFICIAL • 50 FOTOS ULTRA HD</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-extrabold border border-rose-500/40 animate-pulse">
                  <Clock className="w-3.5 h-3.5 text-rose-400" />
                  <span>OFERTA S/ 15 DISPONIBLE POR: <span className="font-mono text-white text-xs sm:text-sm font-black">{promoCountdown.formatted}</span></span>
                </div>
              </div>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
                50 Fotos con IA por{' '}
                <span className="text-smartgold-400 font-black">S/ 15.00</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Paga con Yape o Transferencia BCP y nuestra IA verificará tu abono de S/ 15 al instante.
              </p>
            </div>

            {/* Rich Benefits Grid */}
            <div className="mb-4 sm:mb-5 p-3 sm:p-3.5 rounded-2xl bg-navy-900/90 border border-cyan-500/20 shadow-inner">
              <div className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Beneficios incluidos en tu paquete de S/ 15:</span>
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

            {/* Payment Method Tabs */}
            <div className="flex rounded-2xl bg-navy-900 p-1.5 border border-slate-800 mb-3 sm:mb-4">
              <button
                onClick={() => setTab('yape')}
                className={'flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ' + (
                  tab === 'yape'
                    ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                <Smartphone className="w-4 h-4" />
                <span>Yape / Plin</span>
              </button>
              <button
                onClick={() => setTab('bcp')}
                className={'flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ' + (
                  tab === 'bcp'
                    ? 'bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                <Building className="w-4 h-4" />
                <span>Transferencia BCP</span>
              </button>
            </div>

            {/* Payment Details Container */}
            {tab === 'yape' ? (
              <div className="p-3.5 rounded-2xl bg-navy-900/80 border border-purple-500/30 mb-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Número Yape / Plin:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-base text-cyan-300">
                      {paymentData.yapePhone}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(paymentData.yapePhone, 'yape')}
                      className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
                      title="Copiar número"
                    >
                      {copiedField === 'yape' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Titular de la cuenta:</span>
                  <span className="font-bold text-white">{paymentData.yapeHolder}</span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Monto exacto a pagar:</span>
                  <span className="font-extrabold text-smartgold-400 text-sm">S/ 15.00</span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-navy-900/80 border border-blue-500/30 mb-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Cuenta BCP:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs sm:text-sm text-cyan-300">
                      {paymentData.bcpAccount}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(paymentData.bcpAccount, 'bcp')}
                      className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
                    >
                      {copiedField === 'bcp' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">CCI Interbancario:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-cyan-300">
                      {paymentData.bcpCci}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(paymentData.bcpCci, 'cci')}
                      className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
                    >
                      {copiedField === 'cci' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Titular / Monto:</span>
                  <span className="font-bold text-white">{paymentData.yapeHolder} • <span className="text-smartgold-400 font-extrabold">S/ 15.00</span></span>
                </div>
              </div>
            )}

            {/* Verification Form */}
            <form onSubmit={handleVerifyPayment} className="space-y-3.5 sm:space-y-4">
              
              {/* Voucher Image Upload & Live Preview Card */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center justify-between">
                  <span>Sube tu Comprobante de Pago (Máx. 3 intentos por día):</span>
                  <span className="text-[10px] text-cyan-400 font-normal">Auditoría Automática con IA</span>
                </label>

                {/* Upload Zone or Loaded Preview */}
                {voucherPreview ? (
                  /* Loaded Image Preview Card */
                  <div className="relative p-3 rounded-2xl bg-navy-900 border-2 border-cyan-400/80 shadow-lg shadow-cyan-500/20 flex items-center gap-3.5 animate-scale-in">
                    <div className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden border border-cyan-400/40 shrink-0 bg-navy-950">
                      <img
                        src={voucherPreview}
                        alt="Comprobante cargado"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] sm:text-[11px] font-bold mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Comprobante Cargado</span>
                      </div>
                      <p className="text-xs font-semibold text-white truncate">
                        Listo para auditar con Inteligencia Artificial
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
                        La IA extraerá fecha, monto y código de la captura.
                      </p>
                      
                      <div className="flex items-center gap-2 mt-1.5">
                        <label className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 underline cursor-pointer">
                          Cambiar imagen
                          <input type="file" accept="image/*" onChange={handleVoucherFile} className="hidden" />
                        </label>
                        <span className="text-slate-600">•</span>
                        <button
                          type="button"
                          onClick={() => setVoucherPreview(null)}
                          className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 cursor-pointer"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Upload Zone */
                  <label className="flex flex-col items-center justify-center gap-1.5 p-4 sm:p-5 rounded-2xl bg-navy-900/60 border-2 border-dashed border-slate-700 hover:border-cyan-400/80 hover:bg-navy-900/90 cursor-pointer text-xs text-slate-300 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-white text-xs text-center">
                      Haz clic para subir la captura de tu comprobante
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-slate-400 text-center">
                      Captura de Yape, Plin o comprobante BCP (S/ 15.00, emitido hoy)
                    </span>
                    <input type="file" accept="image/*" onChange={handleVoucherFile} className="hidden" />
                  </label>
                )}

                {/* Canal de Ayuda Directa WhatsApp por dudas o pagos atrasados */}
                <div className="mt-2.5 p-2.5 sm:p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
                      <svg className="w-4.5 h-4.5 fill-emerald-400" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">
                        ¿Dudas, preguntas o tienes un pago atrasado?
                      </p>
                      <p className="text-[11px] text-emerald-300">
                        Escríbenos a WhatsApp para ayudarte o autorizarte manualmente.
                      </p>
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/${WHATSAPP_HUMAN_CLEAN}?text=${encodeURIComponent('Hola Estudio Smart, tengo una consulta sobre mi comprobante de pago o activación.')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp 907 318 642</span>
                  </a>
                </div>
              </div>

              {/* Error Alert with Detailed Diagnostics & WhatsApp fallback */}
              {errorMessage && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs space-y-3 animate-fade-in">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <strong className="text-rose-300 font-bold text-xs sm:text-sm">
                          {errorType === 'AI_UNAVAILABLE_404'
                            ? '⚠️ Error 404: La IA no procesó la imagen'
                            : errorType === 'DAILY_LIMIT_REACHED'
                            ? '🚫 Límite de Intentos Alcanzado'
                            : '❌ Error en Datos del Comprobante'}
                        </strong>
                      </div>
                      <p className="text-xs text-rose-100 leading-relaxed font-medium">
                        {errorMessage}
                      </p>
                    </div>
                  </div>

                  {/* Diagnostic Breakdown Card if Data was Extracted */}
                  {detectedData && (
                    <div className="p-3 rounded-xl bg-navy-950/80 border border-rose-500/30 text-[11px] text-slate-300 space-y-1.5 shadow-inner">
                      <div className="font-bold text-rose-300 uppercase tracking-wider text-[10px] flex items-center gap-1 mb-1">
                        <span>Datos detectados en el comprobante:</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400">Monto detectado:</span>{' '}
                          <strong className="text-white">
                            {detectedData.monto !== undefined ? `S/ ${Number(detectedData.monto).toFixed(2)}` : 'No detectado'}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Método:</span>{' '}
                          <strong className="text-white">{detectedData.metodo || 'No especificado'}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Fecha en foto:</span>{' '}
                          <strong className="text-white">{detectedData.fecha || 'No detectada'}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Hora / Antigüedad:</span>{' '}
                          <strong className="text-white">
                            {detectedData.hora || ''} {detectedData.minutos_antiguedad !== undefined ? `(${detectedData.minutos_antiguedad} min)` : ''}
                          </strong>
                        </div>
                      </div>
                      {detectedData.numero_operacion && (
                        <div className="pt-1 border-t border-slate-800 text-[10px] text-slate-400">
                          Código Op: <span className="font-mono text-cyan-300">{detectedData.numero_operacion}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {whatsappFallbackLink && (
                    <div className="pt-2 border-t border-rose-500/30">
                      <p className="text-[11px] text-slate-300 mb-2">
                        Si tu pago es legítimo, puedes enviarlo directamente por WhatsApp para que un humano lo valide y te active tus 50 fotos:
                      </p>
                      <a
                        href={whatsappFallbackLink}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Enviar Comprobante a WhatsApp ({WHATSAPP_HUMAN_PHONE})</span>
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Bot Verification Progress or Submit Action Button */}
              {isVerifying ? (
                <div className="p-4 rounded-2xl bg-navy-900 border border-cyan-500/40 text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-cyan-400 text-xs font-bold">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <Bot className="w-4 h-4" />
                    <span>Auditoría Inteligente de Comprobante con IA</span>
                  </div>
                  <p className="text-xs text-slate-200 animate-pulse">{botStatusStep}</p>
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 font-black text-sm sm:text-base shadow-xl shadow-cyan-500/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Bot className="w-5 h-5 text-navy-950" />
                  <span>Verificar Comprobante y Acreditar 50 Fotos</span>
                </button>
              )}

            </form>

            {/* ADVERTENCIA LEGAL Y ANTIFRAUDE (UBICADA ABAJO DE TODO) */}
            <div className="mt-4 p-3 sm:p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300 font-bold block mb-0.5">⚠️ ADVERTENCIA LEGAL Y ANTIFRAUDE:</strong>
                <span>
                  Sube únicamente comprobantes reales emitidos en las últimas <strong>2 horas</strong>. La IA audita fechas, montos y códigos de operación. Todo intento de subir comprobantes falsos, antiguos o editados será registrado y denunciado ante las autoridades pertinentes.
                </span>
              </div>
            </div>

            <div className="mt-3.5 flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Auditoría y Acreditación Automática con IA • Soporte Humano: {WHATSAPP_HUMAN_PHONE}</span>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
