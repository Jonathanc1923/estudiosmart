import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Sparkles, 
  Shield, 
  TrendingUp, 
  PlusCircle, 
  Search, 
  RefreshCw, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Coins, 
  Sliders, 
  Camera, 
  UserCheck, 
  UserX, 
  KeyRound, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  MessageCircle, 
  Flame, 
  Edit3, 
  Trash2,
  Lock,
  UserPlus
} from 'lucide-react';
import { AdminUser, AdminAnalytics } from '../types';
import { apiFetch } from '../utils/api';

const ADMIN_SECURITY_PASSWORD = '273203';
const WHATSAPP_SUPPORT_PHONE = '51907318642';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
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

  const [activeTab, setActiveTab] = useState<'users' | 'grant' | 'themes'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // New Client Form State
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newTokens, setNewTokens] = useState<number>(50);
  const [newNotes, setNewNotes] = useState('');
  const [isSubmittingNewUser, setIsSubmittingNewUser] = useState(false);

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editPassword, setEditPassword] = useState('');
  const [editTokens, setEditTokens] = useState<number>(50);
  const [editName, setEditName] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Password Visibility & Copied map
  const [visiblePasswords, setVisiblePasswords] = useState<{ [email: string]: boolean }>({});
  const [copiedMap, setCopiedMap] = useState<{ [key: string]: boolean }>({});

  // Generate a random user friendly password
  const generateRandomPassword = () => {
    const chars = '23456789abcdefghjkmnpqrstuvwxyz';
    let res = 'smart';
    for (let i = 0; i < 4; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };

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

  const togglePasswordVisibility = (email: string) => {
    setVisiblePasswords(prev => ({ ...prev, [email]: !prev[email] }));
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMap(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedMap(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  // Grant Access / Add New User
  const handleGrantAccessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newEmail.includes('@')) {
      alert('Por favor ingresa un correo electrónico válido');
      return;
    }

    setIsSubmittingNewUser(true);
    try {
      const res = await apiFetch('/api/admin/users/grant-access', {
        method: 'POST',
        body: JSON.stringify({
          email: newEmail.trim(),
          name: newName.trim(),
          password: newPassword.trim() || generateRandomPassword(),
          tokens: newTokens,
          notes: newNotes.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al autorizar cliente');
      }

      setActionMessage(`✓ Acceso concedido exitosamente a ${data.user.email} con ${data.user.tokens} fotos.`);
      setTimeout(() => setActionMessage(null), 5000);

      // Reset form
      setNewEmail('');
      setNewName('');
      setNewPassword('');
      setNewTokens(50);
      setNewNotes('');
      setActiveTab('users');
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Error de conexión');
    } finally {
      setIsSubmittingNewUser(false);
    }
  };

  // Open Edit User Modal
  const handleStartEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setEditName(user.name || '');
    setEditPassword(user.password || '');
    setEditTokens(user.tokens || 0);
    setEditNotes(user.notes || '');
  };

  // Save Edit User
  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const res = await apiFetch(`/api/admin/users/${encodeURIComponent(editingUser.email)}/edit`, {
        method: 'POST',
        body: JSON.stringify({
          name: editName.trim(),
          password: editPassword.trim(),
          tokens: editTokens,
          notes: editNotes.trim(),
          isAuthorized: true
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al actualizar usuario');
      }

      setActionMessage(`✓ Datos de ${editingUser.email} actualizados.`);
      setTimeout(() => setActionMessage(null), 4000);
      setEditingUser(null);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Error al guardar cambios');
    }
  };

  // Quick Add Credits
  const handleQuickAddTokens = async (email: string, tokensToAdd: number) => {
    try {
      const res = await apiFetch(`/api/admin/users/${encodeURIComponent(email)}/credits`, {
        method: 'POST',
        body: JSON.stringify({ tokensToAdd }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`✓ Se sumaron +${tokensToAdd} fotos a ${email}`);
        setTimeout(() => setActionMessage(null), 4000);
        loadAdminData();
      } else {
        alert(data.error || 'Error al asignar fotos');
      }
    } catch (err: any) {
      alert(err.message || 'Error de conexión');
    }
  };

  // Revoke Access (0 tokens & disabled)
  const handleRevokeAccess = async (email: string, name: string) => {
    if (!confirm(`¿Estás seguro de revocar el acceso a ${name} (${email})? Se pondrá en 0 fotos.`)) {
      return;
    }
    try {
      const res = await apiFetch(`/api/admin/users/${encodeURIComponent(email)}/revoke`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`✓ Acceso revocado a ${email}`);
        setTimeout(() => setActionMessage(null), 4000);
        loadAdminData();
      } else {
        alert(data.error || 'Error al revocar acceso');
      }
    } catch (err: any) {
      alert(err.message || 'Error al revocar');
    }
  };

  // Delete User Permanently
  const handleDeleteUser = async (email: string) => {
    if (!confirm(`¿Eliminar permanentemente a ${email} del sistema?`)) {
      return;
    }
    try {
      const res = await apiFetch(`/api/admin/users/${encodeURIComponent(email)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`✓ Usuario ${email} eliminado.`);
        setTimeout(() => setActionMessage(null), 4000);
        loadAdminData();
      } else {
        alert(data.error || 'Error al eliminar');
      }
    } catch (err: any) {
      alert(err.message || 'Error al eliminar');
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
        (u.password && u.password.toLowerCase().includes(q)) ||
        (u.notes && u.notes.toLowerCase().includes(q))
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
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-cyan-500 flex items-center justify-center text-white mx-auto shadow-xl shadow-purple-500/30">
              <Shield className="w-8 h-8" />
            </div>
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white">
              Panel de Administración
            </h2>
            <p className="text-xs text-slate-400">
              Ingresa la contraseña de seguridad para autorizar correos, detallar contraseñas y asignar tokens a clientes.
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
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Volver al Estudio
            </button>
          </form>

        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-navy-950/90 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-6xl max-h-[95dvh] overflow-y-auto rounded-3xl glass-panel p-4 sm:p-7 border-2 border-cyan-500/40 shadow-2xl bg-[#090E1F] flex flex-col my-auto scrollbar-none">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-navy-950 font-black shadow-lg shadow-cyan-500/20 shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white">
                  Panel de Control • Clientes & Tokens
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                  Admin Activo
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Autoriza correos, asigna contraseñas por interno y gestiona los tokens de tus clientes.
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
            >
              Cerrar Admin
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4 my-4">
            
            <div className="p-3.5 sm:p-4 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Clientes Autorizados</span>
                <Users className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">
                {analytics.totalUsers}
              </div>
              <div className="text-[10px] text-cyan-300/80 mt-0.5">Acceso directo por correo</div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Fotos Creadas en Estudio</span>
                <Camera className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400">
                {analytics.totalGenerations}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {analytics.succeededGenerations} completadas en Ultra HD
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-md col-span-2 md:col-span-1">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Tokens Totales en Cuentas</span>
                <Coins className="w-4 h-4 text-smartgold-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-smartgold-400">
                {analytics.totalTokensInCirculation} fotos
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Créditos disponibles asignados</div>
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
            onClick={() => {
              setActiveTab('grant');
              if (!newPassword) setNewPassword(generateRandomPassword());
            }}
            className={'flex-1 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ' + (
              activeTab === 'grant'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Dar Acceso a Nuevo Correo</span>
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
            <span>Temáticas Populares</span>
          </button>
        </div>

        {/* 3. Tab Contents */}
        <div className="flex-1 min-h-[300px]">

          {/* TAB 1: LISTADO Y CONTROL DE CLIENTES */}
          {activeTab === 'users' && (
            <div className="space-y-3.5">
              
              {/* Search & Quick Actions Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por correo, nombre o contraseña..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 shadow-inner"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('grant');
                    if (!newPassword) setNewPassword(generateRandomPassword());
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Dar Acceso a Correo</span>
                </button>
              </div>

              {/* Users List */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {filteredUsers.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs sm:text-sm rounded-2xl bg-navy-900/40 border border-slate-800">
                    No se encontraron clientes registrados con esa búsqueda.
                  </div>
                ) : (
                  filteredUsers.map((u) => {
                    const isPassVisible = visiblePasswords[u.email] || false;
                    const isCopied = copiedMap[`pass_${u.email}`] || false;
                    const passText = u.password || '(Sin contraseña)';
                    const whatsappMsg = encodeURIComponent(
                      `Hola ${u.name || 'Cliente'}, tu acceso a Estudio Smart está activo.\n\n🌐 Enlace: ${window.location.origin}\n📧 Correo: ${u.email}\n🔑 Contraseña: ${u.password || 'Define tu contraseña al ingresar'}\n📸 Fotos disponibles: ${u.tokens}`
                    );

                    return (
                      <div
                        key={u.id}
                        className="p-3.5 sm:p-4 rounded-2xl bg-navy-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 shadow-md"
                      >
                        {/* User Identity Details */}
                        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                          <img
                            src={u.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + u.email}
                            alt={u.name}
                            className="w-11 h-11 rounded-2xl bg-navy-950 border border-cyan-500/30 object-cover shrink-0 mt-0.5 sm:mt-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-sm text-white truncate">{u.name || u.email.split('@')[0]}</h4>
                              <span className="px-2 py-0.2 rounded-md bg-cyan-950/80 text-cyan-300 text-[10px] font-semibold border border-cyan-500/30">
                                Autorizado
                              </span>
                            </div>

                            <p className="text-xs text-slate-300 font-mono select-all truncate">{u.email}</p>

                            {/* Credentials Detail Card for Internal Distribution */}
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                              {/* Password Display */}
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-navy-950 border border-purple-500/40 text-xs">
                                <KeyRound className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                <span className="text-[10px] text-slate-400">Clave:</span>
                                <span className="font-mono font-bold text-purple-300">
                                  {isPassVisible ? passText : '••••••••'}
                                </span>
                                
                                <button
                                  type="button"
                                  onClick={() => togglePasswordVisibility(u.email)}
                                  className="text-slate-400 hover:text-white p-0.5 ml-0.5 cursor-pointer"
                                  title={isPassVisible ? 'Ocultar clave' : 'Ver clave'}
                                >
                                  {isPassVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3 text-purple-400" />}
                                </button>

                                {u.password && (
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(u.password || '', `pass_${u.email}`)}
                                    className="text-slate-400 hover:text-emerald-400 p-0.5 cursor-pointer"
                                    title="Copiar contraseña"
                                  >
                                    {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                  </button>
                                )}
                              </div>

                              {/* WhatsApp Direct Share Button */}
                              <a
                                href={`https://wa.me/?text=${whatsappMsg}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold transition-colors cursor-pointer"
                                title="Enviar credenciales al cliente por WhatsApp"
                              >
                                <MessageCircle className="w-3 h-3" />
                                <span>Enviar por WhatsApp</span>
                              </a>

                              <span className="text-[10px] text-slate-400">
                                📸 {u.totalGenerated || 0} fotos creadas
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Credits & Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2 border-t lg:border-t-0 pt-2.5 lg:pt-0 border-slate-800 shrink-0">
                          
                          {/* Current Tokens Badge */}
                          <div className="px-3 py-1.5 rounded-xl bg-navy-950 border border-smartgold-500/40 text-center min-w-[90px]">
                            <span className="text-[9px] text-slate-400 block uppercase font-bold">Disponibles</span>
                            <span className="text-sm font-black text-smartgold-400">{u.tokens} fotos</span>
                          </div>

                          {/* Quick Add +50 Tokens */}
                          <button
                            onClick={() => handleQuickAddTokens(u.email, 50)}
                            className="px-2.5 py-2 rounded-xl bg-smartgold-500/20 hover:bg-smartgold-500/30 text-smartgold-300 border border-smartgold-500/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                            title="Añadir +50 fotos"
                          >
                            <PlusCircle className="w-3.5 h-3.5 text-smartgold-400" />
                            <span>+50</span>
                          </button>

                          {/* Quick Add +20 Tokens */}
                          <button
                            onClick={() => handleQuickAddTokens(u.email, 20)}
                            className="px-2.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all cursor-pointer"
                            title="Añadir +20 fotos"
                          >
                            +20
                          </button>

                          {/* Edit User Button */}
                          <button
                            onClick={() => handleStartEditUser(u)}
                            className="p-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition-all cursor-pointer"
                            title="Editar contraseña o saldo"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Revoke / Set to 0 */}
                          <button
                            onClick={() => handleRevokeAccess(u.email, u.name)}
                            className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs transition-all cursor-pointer"
                            title="Poner en 0 créditos"
                          >
                            <UserX className="w-4 h-4" />
                          </button>

                          {/* Delete User */}
                          <button
                            onClick={() => handleDeleteUser(u.email)}
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs transition-all cursor-pointer"
                            title="Eliminar usuario del sistema"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}

          {/* TAB 2: DAR ACCESO A NUEVO CORREO */}
          {activeTab === 'grant' && (
            <div className="max-w-2xl mx-auto p-4 sm:p-6 rounded-3xl bg-navy-900/90 border-2 border-emerald-500/40 shadow-xl space-y-4 animate-scale-in">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-white">
                    Autorizar Acceso a Nuevo Cliente
                  </h3>
                  <p className="text-xs text-slate-400">
                    Ingresa el correo, define la contraseña que le darás por interno y ajusta la cantidad de fotos (por defecto 50).
                  </p>
                </div>
              </div>

              <form onSubmit={handleGrantAccessSubmit} className="space-y-3.5 text-left">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Correo Electrónico del Cliente (requerido):
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="cliente@gmail.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-navy-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Nombre del Cliente (opcional):
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nombre completo o alias"
                    className="w-full px-4 py-2.5 rounded-xl bg-navy-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-200">
                        Contraseña Asignada:
                      </label>
                      <button
                        type="button"
                        onClick={() => setNewPassword(generateRandomPassword())}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-semibold cursor-pointer"
                      >
                        Generar aleatoria
                      </button>
                    </div>
                    <input
                      type="text"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Ej: smart1234"
                      className="w-full px-4 py-2.5 rounded-xl bg-navy-950 border border-slate-700 text-sm font-mono font-bold text-purple-300 placeholder-slate-500 focus:outline-none focus:border-emerald-400 shadow-inner"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Esta es la clave que le entregarás por interno al cliente.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1">
                      Cantidad de Fotos / Tokens Iniciales:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="9999"
                      value={newTokens}
                      onChange={(e) => setNewTokens(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl bg-navy-950 border border-slate-700 text-sm font-mono font-bold text-smartgold-400 placeholder-slate-500 focus:outline-none focus:border-emerald-400 shadow-inner"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Por defecto <strong>50 fotos</strong> (puedes modificarlo libremente).
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Nota interna (opcional):
                  </label>
                  <input
                    type="text"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Ej: Cliente VIP contactado por WhatsApp"
                    className="w-full px-4 py-2.5 rounded-xl bg-navy-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 shadow-inner"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('users')}
                    className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmittingNewUser}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-navy-950 font-black text-sm shadow-xl shadow-emerald-500/25 transition-all cursor-pointer"
                  >
                    {isSubmittingNewUser ? 'Guardando...' : 'Autorizar y Dar Acceso'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: RANKING DE TEMÁTICAS MÁS CREADAS */}
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

        </div>

        {/* Modal para Editar Cliente (Contraseña, Nombre, Saldo Exacto) */}
        {editingUser && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md rounded-3xl p-5 sm:p-6 bg-navy-900 border-2 border-cyan-400 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-cyan-400" />
                  <span>Modificar Datos de Cliente</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEditUser} className="space-y-3 text-left">
                <div>
                  <label className="text-xs text-slate-400 block mb-0.5">Correo Electrónico:</label>
                  <div className="font-mono text-sm text-cyan-300 font-bold px-3 py-2 rounded-xl bg-navy-950 border border-slate-800">
                    {editingUser.email}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-200 block mb-1">Nombre o Alias:</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-700 text-white text-xs sm:text-sm focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-200">Contraseña Asignada:</label>
                    <button
                      type="button"
                      onClick={() => setEditPassword(generateRandomPassword())}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-semibold cursor-pointer"
                    >
                      Generar aleatoria
                    </button>
                  </div>
                  <input
                    type="text"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-700 font-mono font-bold text-purple-300 text-xs sm:text-sm focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-200 block mb-1">
                    Balance de Fotos Disponibles:
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="9999"
                    value={editTokens}
                    onChange={(e) => setEditTokens(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-700 text-smartgold-400 font-mono font-bold text-base focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-200 block mb-1">Nota Interna:</label>
                  <input
                    type="text"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Detalles sobre el cliente"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
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
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-navy-950 font-black text-xs cursor-pointer shadow-md"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
