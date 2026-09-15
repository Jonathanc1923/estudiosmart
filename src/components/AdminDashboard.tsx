import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Sparkles, 
  Shield, 
  TrendingUp, 
  PlusCircle, 
  MinusCircle, 
  Search, 
  RefreshCw, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Coins, 
  Sliders, 
  CreditCard, 
  Camera, 
  Layers, 
  UserCheck, 
  UserX, 
  Award, 
  Zap, 
  Flame, 
  Calendar,
  DollarSign,
  Bot
} from 'lucide-react';
import { AdminUser, AdminAnalytics, ThemeStat, PaymentRequest } from '../types';
import { apiFetch } from '../utils/api';

const ADMIN_SECURITY_PASSWORD = '273203';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('estudio_smart_admin_auth') === ADMIN_SECURITY_PASSWORD;
    } catch {
      return false;
    }
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'users' | 'themes' | 'payments'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [customCreditAmount, setCustomCreditAmount] = useState<number>(50);

  // Load data
  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, analyticsRes] = await Promise.all([
        apiFetch('/api/admin/users'),
        apiFetch('/api/admin/analytics')
      ]);

      const usersData = await usersRes.json();
      const analyticsData = await analyticsRes.json();

      if (usersData.success && usersData.users) {
        setUsers(usersData.users);
      }
      if (analyticsData.success && analyticsData.analytics) {
        setAnalytics(analyticsData.analytics);
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadAdminData();
    }
  }, [isOpen, isAuthenticated]);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === ADMIN_SECURITY_PASSWORD) {
      setIsAuthenticated(true);
      setPinError(null);
      try {
        sessionStorage.setItem('estudio_smart_admin_auth', ADMIN_SECURITY_PASSWORD);
      } catch {}
      loadAdminData();
    } else {
      setPinError('Contraseña incorrecta. Acceso denegado.');
    }
  };

  const handleAdminLogout = () => {
    try {
      sessionStorage.removeItem('estudio_smart_admin_auth');
    } catch {}
    setIsAuthenticated(false);
    setPinInput('');
    onClose();
  };

  // Actions
  const handleGrantCredits = async (email: string, tokensToAdd: number, note?: string) => {
    try {
      const res = await apiFetch(`/api/admin/users/${encodeURIComponent(email)}/credits`, {
        method: 'POST',
        body: JSON.stringify({ tokensToAdd, note }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`✓ Se acreditaron +${tokensToAdd} fotos a ${email}`);
        setTimeout(() => setActionMessage(null), 4000);
        loadAdminData();
      } else {
        alert(data.error || 'Error al asignar créditos');
      }
    } catch (err: any) {
      alert(err.message || 'Error de conexión');
    }
  };

  const handleSetExactCredits = async (email: string, exactTokens: number) => {
    try {
      const res = await apiFetch(`/api/admin/users/${encodeURIComponent(email)}/credits`, {
        method: 'POST',
        body: JSON.stringify({ exactTokens, note: 'Ajuste manual de créditos por administrador' }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`✓ Balance fijado en ${exactTokens} fotos para ${email}`);
        setTimeout(() => setActionMessage(null), 4000);
        setEditingUser(null);
        loadAdminData();
      } else {
        alert(data.error || 'Error al fijar balance');
      }
    } catch (err: any) {
      alert(err.message || 'Error de conexión');
    }
  };

  const handleRevokeAccess = async (email: string, name: string) => {
    if (!confirm(`¿Estás seguro de revocar todo el acceso y poner 0 créditos a ${name} (${email})?`)) {
      return;
    }
    try {
      const res = await apiFetch(`/api/admin/users/${encodeURIComponent(email)}/revoke`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`✓ Se revocó el acceso a ${email}`);
        setTimeout(() => setActionMessage(null), 4000);
        loadAdminData();
      } else {
        alert(data.error || 'Error al revocar acceso');
      }
    } catch (err: any) {
      alert(err.message || 'Error al revocar');
    }
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return users;
    return users.filter(
      u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  if (!isOpen) return null;

  // Render PIN Gate if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/95 backdrop-blur-md animate-fade-in">
        <div className="relative w-full max-w-md rounded-3xl glass-panel p-6 sm:p-8 border-2 border-purple-500/50 shadow-2xl bg-[#090E1F] space-y-5">
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-cyan-500 flex items-center justify-center text-white mx-auto shadow-xl shadow-purple-500/30">
              <Shield className="w-8 h-8" />
            </div>
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white">
              Acceso Restringido • Administrador
            </h2>
            <p className="text-xs text-slate-400">
              Ingresa la contraseña de seguridad para acceder al panel de control de clientes y métricas.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Contraseña de Administrador:
              </label>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(null);
                }}
                autoFocus
                placeholder="Ingresa la contraseña..."
                className="w-full px-4 py-3 rounded-2xl bg-navy-950 border border-slate-700 focus:border-purple-400 text-center font-mono font-bold text-lg text-white tracking-widest placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all shadow-inner"
              />
            </div>

            {pinError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-black text-sm shadow-xl shadow-purple-500/30 transition-all cursor-pointer"
            >
              Ingresar al Panel Administrador
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Volver a la Tienda
            </button>
          </form>

        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-navy-950/90 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-6xl max-h-[94dvh] overflow-y-auto rounded-3xl glass-panel p-4 sm:p-7 border-2 border-cyan-500/40 shadow-2xl bg-[#090E1F] flex flex-col my-auto scrollbar-none">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-navy-950 font-black shadow-lg shadow-cyan-500/20 shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white">
                  Panel de Administración & Control de Clientes
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                  PIN Verificado
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gestiona créditos, autoriza paquetes manualmente y analiza métricas de fotos creadas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={loadAdminData}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Refrescar datos"
            >
              <RefreshCw className={'w-4 h-4 ' + (isLoading ? 'animate-spin' : '')} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
            <button
              onClick={handleAdminLogout}
              className="px-3 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors cursor-pointer"
              title="Cerrar sesión de administrador"
            >
              Cerrar Admin
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Cerrar panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Success Toast */}
        {actionMessage && (
          <div className="my-3 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* 1. Metric Overview Cards */}
        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 my-4">
            
            <div className="p-3.5 sm:p-4 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Clientes Registrados</span>
                <Users className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">
                {analytics.totalUsers}
              </div>
              <div className="text-[10px] text-cyan-300/80 mt-0.5">Vía Google OAuth 2.0</div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Fotos Creadas</span>
                <Camera className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400">
                {analytics.totalGenerations}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {analytics.succeededGenerations} completadas con éxito
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Recaudación Aprobada</span>
                <DollarSign className="w-4 h-4 text-smartgold-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-smartgold-400">
                S/ {analytics.totalRevenue.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {analytics.totalPayments} pagos de S/ 15 verificados
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Fotos en Circulación</span>
                <Coins className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-purple-300">
                {analytics.totalTokensInCirculation}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Créditos disponibles en cuentas</div>
            </div>

          </div>
        )}

        {/* 2. Tabs Selector */}
        <div className="flex rounded-2xl bg-navy-950 p-1.5 border border-slate-800 mb-4">
          <button
            onClick={() => setActiveTab('users')}
            className={'flex-1 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ' + (
              activeTab === 'users'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <Users className="w-4 h-4" />
            <span>Gestión de Clientes ({users.length})</span>
          </button>
          
          <button
            onClick={() => setActiveTab('themes')}
            className={'flex-1 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ' + (
              activeTab === 'themes'
                ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Ranking de Temáticas Más Creadas</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={'flex-1 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ' + (
              activeTab === 'payments'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <CreditCard className="w-4 h-4" />
            <span>Auditoría de Pagos</span>
          </button>
        </div>

        {/* 3. Tab Contents */}
        <div className="flex-1 min-h-[300px]">

          {/* TAB 1: GESTIÓN DE CLIENTES */}
          {activeTab === 'users' && (
            <div className="space-y-3.5">
              
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre o correo de Google..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 shadow-inner"
                />
              </div>

              {/* Users List / Cards */}
              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                {filteredUsers.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs sm:text-sm">
                    No se encontraron usuarios registrados con esa búsqueda.
                  </div>
                ) : (
                  filteredUsers.map((u) => (
                    <div
                      key={u.id}
                      className="p-3.5 sm:p-4 rounded-2xl bg-navy-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md"
                    >
                      {/* User Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={u.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + u.email}
                          alt={u.name}
                          className="w-11 h-11 rounded-2xl bg-navy-950 border border-cyan-500/30 object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-white truncate">{u.name}</h4>
                            <span className="px-2 py-0.2 rounded-md bg-cyan-950/60 text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
                              OAuth
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 truncate">{u.email}</p>
                          <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                            <span>Reg: {new Date(u.createdAt || Date.now()).toLocaleDateString('es-PE')}</span>
                            <span>•</span>
                            <span className="text-emerald-400 font-bold">
                              📸 {u.totalGenerated || 0} fotos creadas
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* User Credits & Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 border-t md:border-t-0 pt-2.5 md:pt-0 border-slate-800">
                        
                        {/* Token Badge */}
                        <div className="px-3 py-1.5 rounded-xl bg-navy-950 border border-smartgold-500/30 text-center shrink-0">
                          <span className="text-[10px] text-slate-400 block uppercase">Créditos</span>
                          <span className="text-sm font-black text-smartgold-400">{u.tokens} fotos</span>
                        </div>

                        {/* Quick Add +50 Tokens (Pack Oficial) */}
                        <button
                          onClick={() => handleGrantCredits(u.email, 50, 'Autorización manual de Pack 50 Fotos por Admin')}
                          className="px-3 py-2 rounded-xl bg-gradient-to-r from-smartgold-500 to-amber-500 hover:from-smartgold-400 hover:to-amber-400 text-navy-950 font-black text-xs transition-all shadow-md active:scale-95 flex items-center gap-1 cursor-pointer"
                          title="Añadir paquete oficial de 50 fotos"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>+50 Fotos (S/15)</span>
                        </button>

                        {/* Quick Add +15 Tokens */}
                        <button
                          onClick={() => handleGrantCredits(u.email, 15, 'Autorización de +15 fotos por Admin')}
                          className="px-2.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all cursor-pointer"
                          title="Añadir 15 fotos"
                        >
                          +15
                        </button>

                        {/* Custom Credits Modifier */}
                        <button
                          onClick={() => setEditingUser(u)}
                          className="p-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition-all cursor-pointer"
                          title="Fijar cantidad exacta de créditos"
                        >
                          <Sliders className="w-4 h-4" />
                        </button>

                        {/* Revoke / Zero Credits */}
                        <button
                          onClick={() => handleRevokeAccess(u.email, u.name)}
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs transition-all cursor-pointer"
                          title="Revocar acceso / 0 créditos"
                        >
                          <UserX className="w-4 h-4" />
                        </button>

                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* TAB 2: RANKING DE TEMÁTICAS MÁS CREADAS */}
          {activeTab === 'themes' && (
            <div className="space-y-4">
              <div className="p-3 sm:p-4 rounded-2xl bg-navy-900/80 border border-purple-500/30 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>Estilos y Temáticas Más Populares entre los Clientes</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Muestra el volumen y porcentaje de fotos generadas por temática.
                  </p>
                </div>
                <span className="text-xs text-purple-300 font-bold bg-purple-950/80 px-3 py-1 rounded-xl border border-purple-500/30">
                  {analytics?.totalGenerations || 0} fotos totales
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
                {analytics?.popularThemes && analytics.popularThemes.length > 0 ? (
                  analytics.popularThemes.map((stat, index) => (
                    <div
                      key={stat.themeId}
                      className="p-3.5 rounded-2xl bg-navy-900/90 border border-slate-800 hover:border-purple-400/40 transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={'w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ' + (
                            index === 0
                              ? 'bg-amber-400 text-navy-950'
                              : index === 1
                              ? 'bg-slate-300 text-navy-950'
                              : index === 2
                              ? 'bg-amber-700 text-white'
                              : 'bg-navy-950 text-slate-400'
                          )}>
                            #{index + 1}
                          </span>
                          <h4 className="font-bold text-xs sm:text-sm text-white truncate">
                            {stat.themeName}
                          </h4>
                        </div>
                        <span className="text-xs font-extrabold text-cyan-300 shrink-0">
                          {stat.count} {stat.count === 1 ? 'foto' : 'fotos'}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-navy-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          className="bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(stat.percentage, 5)}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5">
                        <span>Preferencia del cliente</span>
                        <span className="font-bold text-purple-300">{stat.percentage}% del total</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 p-8 text-center text-slate-400 text-xs sm:text-sm">
                    Aún no se registran fotos generadas en el sistema.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: AUDITORÍA DE PAGOS */}
          {activeTab === 'payments' && (
            <div className="space-y-3">
              <div className="p-3 sm:p-4 rounded-2xl bg-navy-900/80 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Bot className="w-4 h-4 text-emerald-400" />
                    <span>Registro de Comprobantes Auditados por IA & Manual</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Historial de todas las verificaciones automáticas de Yape/BCP y autorizaciones manuales.
                  </p>
                </div>
              </div>

              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {analytics?.recentPayments && analytics.recentPayments.length > 0 ? (
                  analytics.recentPayments.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-2xl bg-navy-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{p.userEmail}</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                            +{p.packageTokens} Fotos
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Método: <strong className="text-slate-200 uppercase">{p.method}</strong> • Código OP: <code className="text-cyan-300 font-mono">{p.operationCode}</code>
                        </p>
                      </div>

                      <div className="text-right sm:text-right text-[11px] text-slate-400">
                        <div className="text-smartgold-400 font-bold">
                          {p.amount > 0 ? `S/ ${p.amount.toFixed(2)}` : 'Manual Admin'}
                        </div>
                        <div>{new Date(p.verifiedAt || p.createdAt).toLocaleString('es-PE')}</div>
                        <div className="text-[10px] text-cyan-400 font-semibold">{p.verifiedBy || 'IA Automática'}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs sm:text-sm">
                    No hay pagos registrados aún en el historial.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal para fijar créditos exactos */}
        {editingUser && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-sm rounded-3xl p-5 bg-navy-900 border-2 border-cyan-400 shadow-2xl space-y-4">
              <h3 className="font-bold text-base text-white">
                Fijar Créditos para {editingUser.name}
              </h3>
              <p className="text-xs text-slate-300">
                Correo: <strong className="text-cyan-300">{editingUser.email}</strong>
              </p>

              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-1">
                  Cantidad exacta de fotos disponibles:
                </label>
                <input
                  type="number"
                  min="0"
                  max="9999"
                  value={customCreditAmount}
                  onChange={(e) => setCustomCreditAmount(Number(e.target.value))}
                  className="w-full p-3 rounded-xl bg-navy-950 border border-slate-700 text-white font-mono font-bold text-base focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleSetExactCredits(editingUser.email, customCreditAmount)}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-navy-950 font-black text-xs cursor-pointer shadow-md"
                >
                  Guardar Balance
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
