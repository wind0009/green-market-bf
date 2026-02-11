import React, { useState, useEffect } from 'react';
import { Order, User } from '../types';
import VendorSubscription from './VendorSubscription';
import VendorCodeModal from './VendorCodeModal';
import { firebaseAuthService } from '../services/firebaseAuthService';

import { userService } from '../services/userService';
import { useNavigate } from 'react-router-dom';

interface ProfileProps {
  user: User | null;
  onLogin: (identifier: string, password?: string, isAdmin?: boolean) => void;
  onSignup: (userData: User) => void;
  onLogout: () => void;
  onUpdateProfile: (userData: Partial<User>) => void;
  orders: Order[];
}

const Profile: React.FC<ProfileProps> = ({ user, onLogin, onSignup, onLogout, onUpdateProfile, orders }) => {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  // Admin states
  const [logoTaps, setLogoTaps] = useState(0);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Vendor states
  const [showVendorSubscription, setShowVendorSubscription] = useState(false);
  const [showVendorCodeModal, setShowVendorCodeModal] = useState(false);
  const [vendorCode, setVendorCode] = useState('');
  const [activationCode, setActivationCode] = useState('');
  const [activating, setActivating] = useState(false);

  const handleAccessVendor = (vendorId: string, vendorName: string) => {
    // Rediriger vers la page produits premium du vendeur
    navigate(`/vendor-products/${vendorId}`);
  };

  useEffect(() => {
    const handleOpenVendorSubscription = () => {
      setShowVendorSubscription(true);
    };

    window.addEventListener('openVendorSubscription', handleOpenVendorSubscription);
    return () => window.removeEventListener('openVendorSubscription', handleOpenVendorSubscription);
  }, []);

  const handleLogoClick = () => {
    const newCount = logoTaps + 1;
    setLogoTaps(newCount);
    if (newCount >= 5) {
      setShowAdminLogin(true);
      setLogoTaps(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (authMode === 'signup') {
        if (!formData.name || !formData.phone || !formData.password) {
          throw new Error("Nom, téléphone et mot de passe sont obligatoires.");
        }
        if (formData.phone.length < 8) {
          throw new Error("Numéro de téléphone invalide.");
        }
        if (formData.password.length < 6) {
          throw new Error("Le mot de passe doit faire au moins 6 caractères.");
        }

        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          name: formData.name,
          email: formData.email || `${formData.phone}@greenmarket.bf`,
          phone: formData.phone,
          role: 'client',
          isAdmin: false,
          isProfileComplete: true,
          addresses: []
        };
        onSignup(newUser);
      } else {
        if (!formData.phone || !formData.password) {
          throw new Error("Veuillez entrer votre numéro et mot de passe.");
        }
        onLogin(formData.phone, formData.password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateWithCode = async () => {
    if (!user || !activationCode) return;
    setActivating(true);
    setError(null);
    try {
      const isValid = await userService.verifyVendorActivationCode(user.id, activationCode.toUpperCase());
      if (isValid) {
        onUpdateProfile({
          isVendor: true,
          role: 'vendeur' as any,
          vendorStatus: 'active'
        });
        alert("🎉 Code valide ! Votre accès vendeur est maintenant activé.");
        setActivationCode('');
      } else {
        setError("Code d'activation invalide.");
      }
    } catch (err) {
      setError("Erreur lors de la vérification du code.");
    } finally {
      setActivating(false);
    }
  };

  const handleAdminSecretLogin = async () => {
    try {
      const result = await firebaseAuthService.signInWithEmail('admin@greenmarket.bf', 'admin1234');
      if (result.success && result.user) {
        onLogin(result.user.id, undefined, true);
      } else {
        alert("Identifiants admin incorrects");
      }
    } catch (error) {
      alert("Erreur de connexion admin");
    }
  };

  // 1. ECRAN LOGIN ADMIN SECRET
  if (showAdminLogin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F5F5] p-6 animate-fadeIn">
        <div className="bg-white p-8 rounded-[40px] shadow-2xl w-full max-w-sm border border-gray-100">
          <div className="w-16 h-16 bg-[#2D5A27]/10 text-[#2D5A27] rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <i className="fa-solid fa-shield-halved text-2xl"></i>
          </div>
          <h2 className="text-xl font-black text-[#2D5A27] text-center mb-6 uppercase tracking-wider">Accès Maître</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Identifiant"
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#2D5A27] font-bold"
              value={adminUsername}
              onChange={(e) => setAdminUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Mot de passe"
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#2D5A27] font-bold"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
            />
            <button onClick={handleAdminSecretLogin} className="w-full bg-[#2D5A27] text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg">
              Entrer
            </button>
            <button onClick={() => setShowAdminLogin(false)} className="w-full text-gray-400 text-xs font-bold uppercase pt-2">
              Annuler
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. AUTHENTIFICATION UTILISATEUR
  if (!user) {
    return (
      <div className="flex flex-col items-center min-h-screen bg-[#F8FAF8] p-6 animate-fadeIn relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#2D5A27]/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#E2725B]/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>

        <div className="w-full max-sm z-10 pt-10 flex flex-col items-center">
          <div
            onClick={handleLogoClick}
            className="w-20 h-20 bg-white rounded-[28px] flex items-center justify-center mb-8 shadow-xl shadow-green-100/50 border border-gray-50 cursor-pointer transition-transform active:scale-90"
          >
            <i className="fa-solid fa-leaf text-4xl text-[#2D5A27]"></i>
          </div>

          <h1 className="text-2xl font-black text-[#2D5A27] text-center mb-2 tracking-tight">Green Market BF</h1>
          <p className="text-gray-400 text-center mb-8 text-[10px] font-black uppercase tracking-[0.2em]">Votre compte sécurisé</p>

          <div className="w-full bg-white rounded-[40px] p-8 shadow-xl shadow-green-900/5 border border-gray-100">
            <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-8">
              <button
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${authMode === 'login' ? 'bg-white text-[#2D5A27] shadow-sm' : 'text-gray-400'}`}
              >
                Connexion
              </button>
              <button
                onClick={() => setAuthMode('signup')}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${authMode === 'signup' ? 'bg-white text-[#2D5A27] shadow-sm' : 'text-gray-400'}`}
              >
                Inscription
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {authMode === 'signup' && (
                <div className="animate-slideDown">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2 mb-1 block">Nom Complet</label>
                  <input
                    type="text"
                    placeholder="Ex: Jean Traoré"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#2D5A27] font-bold text-sm"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              )}

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2 mb-1 block">Numéro de téléphone</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400">+226</span>
                  <input
                    type="tel"
                    placeholder="00 00 00 00"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-16 pr-6 outline-none focus:ring-2 focus:ring-[#2D5A27] font-bold text-sm tracking-widest"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              {authMode === 'signup' && (
                <div className="animate-slideDown">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2 mb-1 block">Email (Optionnel)</label>
                  <input
                    type="email"
                    placeholder="jean@gmail.com"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#2D5A27] font-bold text-sm"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              )}

              <div className="relative">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2 mb-1 block">Mot de passe</label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#2D5A27] font-bold text-sm"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-[34px] text-gray-300"
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>

              {error && (
                <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-[10px] font-bold flex items-center gap-3 animate-fadeIn border border-red-100">
                  <i className="fa-solid fa-circle-exclamation text-sm"></i>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2D5A27] text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-green-100 active:scale-95 transition-all mt-4 flex items-center justify-center gap-3"
              >
                {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : (authMode === 'login' ? 'Se connecter' : 'Créer mon compte')}
              </button>
            </form>
          </div>

          <p className="mt-8 text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center px-10 leading-relaxed">
            En continuant, vous acceptez nos <span className="text-[#2D5A27] underline">Conditions d'Utilisation</span>
          </p>
        </div>
      </div>
    );
  }

  // 3. ECRAN PROFIL FINAL
  const userOrders = orders.filter(o => o.userId === user.id || o.customer.phone === user.phone);

  return (
    <div className="p-4 space-y-8 animate-fadeIn pb-32 bg-[#F8FAF8] min-h-screen">
      <div className="bg-[#2D5A27] rounded-[48px] p-8 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full"></div>
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/5 rounded-full"></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-[40px] flex items-center justify-center mb-5 border border-white/20 shadow-inner">
            <span className="text-4xl font-black uppercase">{user.name.charAt(0)}</span>
          </div>
          <h2 className="text-2xl font-black mb-1">{user.name}</h2>
          <p className="text-white/60 text-xs font-black uppercase tracking-widest">{user.isAdmin ? 'Administrateur' : 'Membre Privilège'}</p>

          <button
            onClick={onLogout}
            className="mt-8 px-8 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 transition-all active:scale-95"
          >
            Déconnexion
          </button>

          {!user.isVendor && !user.isAdmin && (
            <div className="mt-6 w-full max-w-xs mx-auto">
              <button
                onClick={async () => {
                  try {
                    setActivating(true);
                    await userService.requestVendorAccess(user.id);
                    onUpdateProfile({ isVendor: true, vendorStatus: 'pending' });
                    alert("Votre demande d'accès vendeur a été envoyée ! Elle est en attente de validation par l'admin.");
                  } catch (err) {
                    setError("Erreur lors de l'envoi de la demande.");
                  } finally {
                    setActivating(false);
                  }
                }}
                disabled={activating}
                className="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-orange-900/20 disabled:opacity-50"
              >
                {activating ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Demander l\'accès Vendeur'}
              </button>
            </div>
          )}

          {user.isVendor && user.vendorStatus === 'pending' && !user.isAdmin && (
            <div className="mt-6 w-full max-w-xs mx-auto space-y-4">
              <div className="bg-orange-100/20 border border-orange-500/30 p-4 rounded-2xl backdrop-blur-sm">
                <p className="text-[10px] font-black text-orange-500 uppercase mb-1">Demande en attente</p>
                <p className="text-xs text-orange-200/80 leading-tight">L'administrateur examine votre demande. Une fois approuvé, vous recevrez un code ici.</p>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Saisir le code reçu"
                  className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 px-4 text-xs text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-white/20"
                  value={activationCode}
                  onChange={(e) => setActivationCode(e.target.value)}
                />
                <button
                  onClick={handleActivateWithCode}
                  disabled={activating || !activationCode}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-[#2D5A27] px-3 py-1.5 rounded-xl text-[9px] font-black uppercase disabled:opacity-50"
                >
                  {activating ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Activer'}
                </button>
              </div>
            </div>
          )}

          {!user.isAdmin && (
            <button
              onClick={() => setShowVendorCodeModal(true)}
              className="mt-4 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl text-[9px] font-medium uppercase tracking-wider transition-all"
            >
              <i className="fa-solid fa-key mr-2"></i>
              Accéder à un Vendeur
            </button>
          )}

          {user.isVendor && user.vendorStatus === 'active' && (
            <button
              onClick={() => navigate('/vendor-dashboard')}
              className="mt-4 px-8 py-3 bg-green-600 hover:bg-green-700 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-green-500 transition-all active:scale-95"
            >
              Compte Vendeur
            </button>
          )}

          {user.isAdmin && (
            <button
              onClick={() => navigate('/admin-control-tower')}
              className="mt-4 px-8 py-3 bg-[#2D5A27] hover:bg-green-700 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-green-500 transition-all active:scale-95 text-white"
            >
              Tour de Contrôle Admin
            </button>
          )}
        </div>
      </div>

      {/* Pop-up Message Admin */}
      {user.adminMessage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-white rounded-[40px] p-8 w-full max-w-sm shadow-2xl border border-blue-100 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-blue-500"></div>
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
              <i className="fa-solid fa-bell text-2xl"></i>
            </div>
            <h3 className="text-xl font-black text-gray-800 mb-2 uppercase tracking-tight">Notification Admin</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-8 font-medium italic">
              « {user.adminMessage} »
            </p>
            <button
              onClick={async () => {
                const msg = user.adminMessage; // Sauvegarder pour le feedback si besoin
                onUpdateProfile({ adminMessage: "" }); // Clear local state
                try {
                  await userService.updateUser(user.id, { adminMessage: "" }); // Clear in DB
                } catch (e) {
                  console.error("Failed to clear message", e);
                }
              }}
              className="w-full py-4 bg-[#2D5A27] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-all"
            >
              J'ai compris
            </button>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-[36px] border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-xs font-black text-[#2D5A27] uppercase tracking-[0.2em] mb-2 px-2">Identification</h3>
        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
          <div className="w-10 h-10 bg-[#2D5A27]/10 text-[#2D5A27] rounded-xl flex items-center justify-center">
            <i className="fa-solid fa-phone text-sm"></i>
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase">Téléphone principal</p>
            <p className="text-sm font-black text-gray-800">+226 {user.phone}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
          <div className="w-10 h-10 bg-[#2D5A27]/10 text-[#2D5A27] rounded-xl flex items-center justify-center">
            <i className="fa-solid fa-envelope text-sm"></i>
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase">Email</p>
            <p className="text-sm font-black text-gray-800">{user.email}</p>
          </div>
        </div>

        {user.isVendor && user.vendorStatus === 'pending' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-clock text-yellow-600 text-xl"></i>
              <div>
                <h3 className="font-bold text-yellow-800">Demande en cours de validation</h3>
                <p className="text-sm text-yellow-600">Votre demande de vendeur est en cours de traitement par l'administrateur.</p>
                {user.adminMessage && (
                  <p className="text-xs text-yellow-700 mt-1">Message: {user.adminMessage}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {user.isVendor && user.vendorStatus === 'rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-times-circle text-red-600 text-xl"></i>
              <div>
                <h3 className="font-bold text-red-800">Demande refusée</h3>
                <p className="text-sm text-red-600">Votre demande de vendeur a été refusée.</p>
                {user.adminMessage && (
                  <p className="text-xs text-red-700 mt-1">Raison: {user.adminMessage}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {user.isVendor && user.vendorStatus === 'active' && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-check-circle text-green-600 text-xl"></i>
              <div>
                <h3 className="font-bold text-green-800">Compte Vendeur Actif</h3>
                <p className="text-sm text-green-600">Votre compte vendeur est approuvé et fonctionnel.</p>
                {user.vendorCode && (
                  <p className="text-xs font-mono text-green-700 mt-1">Code: {user.vendorCode}</p>
                )}
                {user.adminMessage && (
                  <p className="text-xs text-green-700 mt-1">Message de l'admin: {user.adminMessage}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-5">
          <div className="bg-white p-6 rounded-[36px] border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Commandes</p>
            <p className="text-3xl font-black text-[#2D5A27]">{userOrders.length}</p>
          </div>
          <div className="bg-white p-6 rounded-[36px] border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Points</p>
            <p className="text-3xl font-black text-[#E2725B]">{userOrders.length * 50} <span className="text-xs">pts</span></p>
          </div>
        </div>

        <section>
          <div className="flex justify-between items-center mb-6 px-2">
            <h3 className="text-xl font-black text-[#2D5A27]">Historique</h3>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Derniers achats</span>
          </div>

          {userOrders.length === 0 ? (
            <div className="bg-white rounded-[40px] p-12 text-center text-gray-400 border border-dashed border-gray-200">
              <i className="fa-solid fa-bag-shopping text-4xl mb-5 opacity-20 block"></i>
              <p className="text-sm font-bold">Vous n'avez pas encore de commandes.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {userOrders.map(order => (
                <div key={order.id} className="bg-white rounded-[36px] border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-6 flex justify-between items-center">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                        <i className="fa-solid fa-circle-check text-lg"></i>
                      </div>
                      <div>
                        <p className="font-black text-sm text-gray-800 uppercase tracking-tight">#{order.id.slice(-4).toUpperCase()}</p>
                        <p className="text-[10px] text-gray-400 font-bold">{new Date(order.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-[#2D5A27] text-lg">{order.total} F</p>
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-orange-100 text-orange-700 rounded-lg">{order.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Vendor Code Modal */}
        {showVendorCodeModal && (
          <VendorCodeModal
            user={user}
            onClose={() => setShowVendorCodeModal(false)}
            onAccessVendor={handleAccessVendor}
          />
        )}

        {/* Vendor Subscription Modal */}
        {showVendorSubscription && (
          <VendorSubscription
            user={user}
            onUpdateProfile={onUpdateProfile}
            onClose={() => setShowVendorSubscription(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Profile;
