import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ThemeCatalog } from './components/ThemeCatalog';
import { PhotoUploader } from './components/PhotoUploader';
import { AuthModal } from './components/AuthModal';
import { GenerationModal } from './components/GenerationModal';
import { ResultViewer } from './components/ResultViewer';
import { PaymentModal } from './components/PaymentModal';
import { GalleryModal } from './components/GalleryModal';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import { THEMES } from './data/themes';
import { Theme, User, Generation } from './types';
import { apiFetch } from './utils/api';
import { Sparkles, Wand2, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('estudio_smart_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [selectedTheme, setSelectedTheme] = useState<Theme>(THEMES[0]);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [customDetails, setCustomDetails] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [queueStatus, setQueueStatus] = useState<'queued' | 'processing' | 'succeeded' | 'failed'>('processing');
  const [queuePosition, setQueuePosition] = useState<number>(1);
  const [estimatedSeconds, setEstimatedSeconds] = useState<number>(15);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [adminDashboardOpen, setAdminDashboardOpen] = useState(false);
  const [generations, setGenerations] = useState<Generation[]>([]);

  // Result state
  const [currentResult, setCurrentResult] = useState<{
    resultImage: string;
    isWatermarked: boolean;
    theme: Theme;
    originalImage: string | null;
  } | null>(null);

  const studioRef = useRef<HTMLDivElement>(null);

  // Synchronize user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('estudio_smart_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('estudio_smart_user');
    }
  }, [user]);

  // Check URL query parameters for Google OAuth callback redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authUserParam = urlParams.get('auth_user');
    const authErrorParam = urlParams.get('auth_error');

    if (authUserParam) {
      try {
        const loggedUser = JSON.parse(decodeURIComponent(authUserParam));
        setUser(loggedUser);
        localStorage.setItem('estudio_smart_user', JSON.stringify(loggedUser));
        window.history.replaceState({}, '', window.location.pathname);
        setSuccessToast(`¡Sesión iniciada con Google como ${loggedUser.name}! Tienes ${loggedUser.tokens} ${loggedUser.tokens === 1 ? 'foto gratis' : 'fotos'}.`);
        setTimeout(() => setSuccessToast(null), 4000);
      } catch (e) {
        console.error('Failed to parse auth_user parameter:', e);
      }
    } else if (authErrorParam) {
      setErrorMessage(decodeURIComponent(authErrorParam));
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Detect /admi or /admin route
  useEffect(() => {
    const checkAdminRoute = () => {
      const pathname = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (
        pathname === '/admi' || 
        pathname === '/admin' || 
        pathname === '/admi/' || 
        pathname === '/admin/' || 
        hash === '#admi' || 
        hash === '#admin'
      ) {
        setAdminDashboardOpen(true);
      }
    };

    checkAdminRoute();
    window.addEventListener('popstate', checkAdminRoute);
    window.addEventListener('hashchange', checkAdminRoute);
    return () => {
      window.removeEventListener('popstate', checkAdminRoute);
      window.removeEventListener('hashchange', checkAdminRoute);
    };
  }, []);

  // Load latest profile from server
  useEffect(() => {
    if (user?.email) {
      apiFetch(`/api/user/${encodeURIComponent(user.email)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.user) {
            setUser(data.user);
            setGenerations(data.generations || []);
          }
        })
        .catch(() => {});
    }
  }, []);

  const scrollToStudio = () => {
    if (studioRef.current) {
      studioRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAuthSuccess = async (authPayload: { credential?: string; user?: User; generations?: Generation[] }) => {
    try {
      if (authPayload.user) {
        setUser(authPayload.user);
        setGenerations(authPayload.generations || []);
        setAuthModalOpen(false);
        const msg = authPayload.user.tokens > 0 
          ? `¡Bienvenido, ${authPayload.user.name}! Tienes 1 foto gratis disponible.`
          : `¡Bienvenido de nuevo, ${authPayload.user.name}!`;
        setSuccessToast(msg);
        setTimeout(() => setSuccessToast(null), 4000);
        return;
      }

      const res = await apiFetch('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify(authPayload),
      });

      const data = await res.json();
      if (!res.ok || !data.user) {
        throw new Error(data.error || 'Error al autenticar con Google');
      }

      setUser(data.user);
      setGenerations(data.generations || []);
      setAuthModalOpen(false);

      const msg = data.user.tokens > 0 
        ? `¡Bienvenido, ${data.user.name}! Tienes 1 foto gratis disponible.`
        : `¡Bienvenido de nuevo, ${data.user.name}!`;
      
      setSuccessToast(msg);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMessage(err.message || 'Error al verificar con Google');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentResult(null);
    localStorage.removeItem('estudio_smart_user');
    setSuccessToast('Has cerrado sesión.');
    setTimeout(() => setSuccessToast(null), 2500);
  };

  const handlePaymentSuccess = (tokensAdded: number, newTotal: number) => {
    if (user) {
      const updated = { ...user, tokens: newTotal };
      setUser(updated);
      localStorage.setItem('estudio_smart_user', JSON.stringify(updated));
    }
  };

  // Generate Image Flow
  const handleStartGeneration = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (!userPhoto) {
      setErrorMessage('Por favor sube una foto tuya primero.');
      scrollToStudio();
      return;
    }

    if (user.tokens <= 0) {
      setPaymentModalOpen(true);
      return;
    }

    setErrorMessage(null);
    setIsGenerating(true);
    setQueueStatus('queued');
    setQueuePosition(1);

    try {
      const res = await apiFetch('/api/generate', {
        method: 'POST',
        body: JSON.stringify({
          userEmail: user.email,
          userPhoto: userPhoto,
          themeId: selectedTheme.id,
          themeName: selectedTheme.name,
          themePrompt: selectedTheme.prompt,
          customDetails: customDetails,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.needsRecharge) {
          setIsGenerating(false);
          setPaymentModalOpen(true);
          return;
        }
        throw new Error(data.error || 'Error al iniciar generación');
      }

      const jobId = data.jobId || data.predictionId;
      if (data.queuePosition) setQueuePosition(data.queuePosition);
      if (data.estimatedSeconds) setEstimatedSeconds(data.estimatedSeconds);
      if (data.status) setQueueStatus(data.status);

      const pollInterval = setInterval(async () => {
        try {
          const pollRes = await apiFetch(`/api/queue/${jobId}`);
          const pollData = await pollRes.json();

          if (pollData.queuePosition !== undefined) setQueuePosition(pollData.queuePosition);
          if (pollData.estimatedSeconds !== undefined) setEstimatedSeconds(pollData.estimatedSeconds);
          if (pollData.status) setQueueStatus(pollData.status);

          if (pollData.status === 'succeeded' && pollData.output) {
            clearInterval(pollInterval);
            setIsGenerating(false);

            if (typeof pollData.tokensRemaining === 'number') {
              setUser((prev) => (prev ? { ...prev, tokens: pollData.tokensRemaining, hasUsedFreeTrial: true } : null));
            }

            setCurrentResult({
              resultImage: pollData.output,
              isWatermarked: pollData.isWatermarked,
              theme: selectedTheme,
              originalImage: userPhoto,
            });

            if (pollData.generation) {
              setGenerations((prev) => [pollData.generation, ...prev]);
            }

            setTimeout(() => {
              window.scrollTo({ top: 300, behavior: 'smooth' });
            }, 300);
          } else if (pollData.status === 'failed' || pollData.status === 'canceled') {
            clearInterval(pollInterval);
            setIsGenerating(false);
            setErrorMessage(pollData.error || 'Hubo un error al procesar tu imagen.');
          }
        } catch (pollErr) {
          console.error('Polling error:', pollErr);
        }
      }, 1500);

    } catch (err: any) {
      setIsGenerating(false);
      setErrorMessage(err.message || 'Error al conectar con el servidor.');
    }
  };

  const handleResetForNew = () => {
    setCurrentResult(null);
    scrollToStudio();
  };

  const handleCloseAdmin = () => {
    setAdminDashboardOpen(false);
    if (
      window.location.pathname.toLowerCase().startsWith('/admi') || 
      window.location.pathname.toLowerCase().startsWith('/admin') ||
      window.location.hash.toLowerCase().includes('admi')
    ) {
      window.history.pushState({}, '', '/');
    }
  };

  return (
    <div className="min-h-screen bg-[#070C18] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white relative">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-24 right-4 z-50 p-4 rounded-2xl bg-emerald-500/90 text-navy-950 font-extrabold text-sm shadow-2xl flex items-center gap-2 backdrop-blur-md animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-navy-950" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenPayment={() => setPaymentModalOpen(true)}
        onOpenGallery={() => setGalleryModalOpen(true)}
        onScrollToStudio={scrollToStudio}
        onOpenAdmin={() => setAdminDashboardOpen(true)}
      />

      {/* Hero Section */}
      <Hero
        onStartClick={scrollToStudio}
        onOpenPricing={() => setPaymentModalOpen(true)}
      />

      {/* Main Studio Interactive Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10" ref={studioRef}>
        
        {/* If showing Result */}
        {currentResult ? (
          <ResultViewer
            resultImage={currentResult.resultImage}
            originalImage={currentResult.originalImage}
            theme={currentResult.theme}
            isWatermarked={currentResult.isWatermarked}
            user={user}
            onOpenPayment={() => setPaymentModalOpen(true)}
            onNewGeneration={handleResetForNew}
          />
        ) : (
          /* Step-by-Step Creation Studio */
          <div className="space-y-8 sm:space-y-12 animate-fade-in">
            
            {/* Step 1: Theme Catalog with Dropdowns and Custom Prompt */}
            <ThemeCatalog
              selectedTheme={selectedTheme}
              onSelectTheme={(theme) => setSelectedTheme(theme)}
            />

            {/* Step 2: Photo Uploader */}
            <div id="photo-uploader-section" className="scroll-mt-24">
              <PhotoUploader
                userPhoto={userPhoto}
                customDetails={customDetails}
                onPhotoSelected={(b64) => setUserPhoto(b64)}
                onRemovePhoto={() => setUserPhoto(null)}
                onCustomDetailsChange={setCustomDetails}
              />
            </div>

            {/* Error message alert */}
            {errorMessage && (
              <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs sm:text-sm flex items-center gap-2.5 sm:gap-3">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Step 3: Big Generate Action Button */}
            <div className="pt-4 sm:pt-6 text-center">
              <button
                onClick={handleStartGeneration}
                disabled={isGenerating}
                className="relative group overflow-hidden w-full max-w-xl mx-auto py-4 sm:py-5 px-4 sm:px-8 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 font-black text-sm sm:text-lg md:text-xl shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-400/50 hover:scale-[1.01] sm:hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 sm:gap-3 cursor-pointer"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <Wand2 className="w-5 h-5 sm:w-6 sm:h-6 text-navy-950 group-hover:rotate-45 transition-transform shrink-0" />
                <span className="truncate">
                  {user
                    ? user.tokens > 0
                      ? `Generar Retrato (${user.tokens} ${user.tokens === 1 ? 'Foto' : 'Fotos'} disp.)`
                      : 'Recargar 50 Fotos por S/ 15'
                    : 'Continuar con Google y Crear Foto Gratis'}
                </span>
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-navy-950 group-hover:translate-x-1.5 transition-transform shrink-0" />
              </button>

              <p className="text-[11px] sm:text-xs text-slate-400 mt-3 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
                <span>Tecnología de Inteligencia Artificial Estudio Smart • Calidad Ultra HD</span>
              </p>
            </div>

          </div>
        )}

      </main>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccessAuth={handleAuthSuccess}
      />

      <GenerationModal
        isOpen={isGenerating}
        theme={selectedTheme}
        userPhoto={userPhoto}
        queueStatus={queueStatus}
        queuePosition={queuePosition}
        estimatedSeconds={estimatedSeconds}
      />

      <PaymentModal
        isOpen={paymentModalOpen}
        user={user}
        onClose={() => setPaymentModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        onOpenAuth={() => {
          setPaymentModalOpen(false);
          setAuthModalOpen(true);
        }}
      />

      <GalleryModal
        isOpen={galleryModalOpen}
        onClose={() => setGalleryModalOpen(false)}
        generations={generations}
      />

      <AdminDashboard
        isOpen={adminDashboardOpen}
        onClose={handleCloseAdmin}
        currentUser={user}
      />

      {/* Footer */}
      <Footer />

    </div>
  );
}