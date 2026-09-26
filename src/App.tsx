import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { CreateStudio } from './components/CreateStudio';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AuthModal } from './components/AuthModal';
import { GenerationModal } from './components/GenerationModal';
import { PaymentModal } from './components/PaymentModal';
import { GalleryModal } from './components/GalleryModal';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import { THEMES } from './data/themes';
import { Theme, User, Generation } from './types';
import { apiFetch } from './utils/api';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'create'>('home');
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

  // Synchronize user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('estudio_smart_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('estudio_smart_user');
    }
  }, [user]);

  // Detect URL routes and hash navigation
  useEffect(() => {
    const handleRoute = () => {
      const pathname = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();

      // Admin route detection
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

      // Tab routes
      if (pathname.includes('/crear') || hash.includes('crear')) {
        setCurrentTab('create');
      } else if (hash.includes('inicio') || hash.includes('galeria')) {
        setCurrentTab('home');
      }
    };

    handleRoute();
    window.addEventListener('popstate', handleRoute);
    window.addEventListener('hashchange', handleRoute);
    return () => {
      window.removeEventListener('popstate', handleRoute);
      window.removeEventListener('hashchange', handleRoute);
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

  // Switch between tabs
  const handleSelectTab = (tab: 'home' | 'create') => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (tab === 'create') {
      window.history.pushState({}, '', '#crear');
    } else {
      window.history.pushState({}, '', '#inicio');
    }
  };

  const handleNavigateToCreate = (preselectedTheme?: Theme) => {
    if (preselectedTheme) {
      setSelectedTheme(preselectedTheme);
    }
    handleSelectTab('create');
  };

  const handleAuthSuccess = (authPayload: { user: User; generations?: Generation[] }) => {
    if (authPayload.user) {
      setUser(authPayload.user);
      setGenerations(authPayload.generations || []);
      setAuthModalOpen(false);
      setSuccessToast(`¡Bienvenido, ${authPayload.user.name}! Tienes ${authPayload.user.tokens} ${authPayload.user.tokens === 1 ? 'foto disponible' : 'fotos disponibles'}.`);
      setTimeout(() => setSuccessToast(null), 4000);
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
      const uploaderEl = document.getElementById('photo-uploader-section');
      if (uploaderEl) {
        uploaderEl.scrollIntoView({ behavior: 'smooth' });
      }
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
              setUser((prev) => (prev ? { ...prev, tokens: pollData.tokensRemaining } : null));
            }

            setCurrentResult({
              resultImage: pollData.output,
              isWatermarked: false,
              theme: selectedTheme,
              originalImage: userPhoto,
            });

            if (pollData.generation) {
              setGenerations((prev) => [pollData.generation, ...prev]);
            }

            setTimeout(() => {
              window.scrollTo({ top: 100, behavior: 'smooth' });
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseAdmin = () => {
    setAdminDashboardOpen(false);
    if (
      window.location.pathname.toLowerCase().startsWith('/admi') || 
      window.location.pathname.toLowerCase().startsWith('/admin') ||
      window.location.hash.toLowerCase().includes('admi')
    ) {
      window.history.pushState({}, '', '#inicio');
    }
  };

  return (
    <div className="min-h-screen bg-[#070C18] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white relative font-sans">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 sm:top-24 right-4 z-50 p-3 sm:p-4 rounded-2xl bg-emerald-500/90 text-navy-950 font-extrabold text-xs sm:text-sm shadow-2xl flex items-center gap-2 backdrop-blur-md animate-bounce">
          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-navy-950 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        user={user}
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenPayment={() => setPaymentModalOpen(true)}
        onOpenGallery={() => setGalleryModalOpen(true)}
        onOpenAdmin={() => setAdminDashboardOpen(true)}
      />

      {/* Main Content Area: Tab-based Routing */}
      <main className="flex-1 w-full">
        {currentTab === 'home' ? (
          /* PAGE 1: INICIO & GALERÍA */
          <HomePage
            onNavigateToCreate={handleNavigateToCreate}
            onOpenPricing={() => setPaymentModalOpen(true)}
          />
        ) : (
          /* PAGE 2: SUBPÁGINA "CREA TUS FOTOS" */
          <CreateStudio
            user={user}
            selectedTheme={selectedTheme}
            onSelectTheme={(theme) => setSelectedTheme(theme)}
            userPhoto={userPhoto}
            onPhotoSelected={(b64) => setUserPhoto(b64)}
            onRemovePhoto={() => setUserPhoto(null)}
            customDetails={customDetails}
            onCustomDetailsChange={setCustomDetails}
            isGenerating={isGenerating}
            onStartGeneration={handleStartGeneration}
            errorMessage={errorMessage}
            currentResult={currentResult}
            onResetForNew={handleResetForNew}
            onOpenPayment={() => setPaymentModalOpen(true)}
            onOpenAuth={() => setAuthModalOpen(true)}
            onBackToHome={() => handleSelectTab('home')}
          />
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <MobileBottomNav
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenGallery={() => setGalleryModalOpen(true)}
        onOpenPayment={() => setPaymentModalOpen(true)}
      />

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