
import React, { useState, useEffect } from 'react';
import { User, Order } from '../types';
import { userService } from '../services/userService';

interface ProfileProps {
  user: User | null;
  onLogin: (phone: string, isAdmin?: boolean) => void;
  onLogout: () => void;
  onUpdateProfile: (userData: Partial<User>) => void;
  orders: Order[];
}

const Profile: React.FC<ProfileProps> = ({ user, onLogin, onLogout, onUpdateProfile, orders }) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  
  // Admin Secret Access
  const [logoTaps, setLogoTaps] = useState(0);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Profile Completion State
  const [profileData, setProfileData] = useState({
    name: '',
    email: ''
  });

  const handleLogoClick = () => {
    const newCount = logoTaps + 1;
    setLogoTaps(newCount);
    if (newCount >= 5) {
      setShowAdminLogin(true);
      setLogoTaps(0);
    }
  };

  const handleSendOtp = async () => {
    if (phone.length >= 8) {
      setIsCheckingUser(true);
      try {
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await userService.getUserByPhone(phone);
        setIsExistingUser(!!existingUser);
        setIsOtpSent(true);
        console.log("OTP Sent to " + phone);
      } catch (error) {
        console.error('Erreur lors de la vérification:', error);
        setIsOtpSent(true); // Continue même si erreur
      } finally {
        setIsCheckingUser(false);
      }
    }
  };

  const handleVerifyOtp = () => {
    if (otp === '1234' || otp.length === 4) {
      onLogin(phone);
    } else {
      alert("Code incorrect (Essayez 1234)");
    }
  };

  const handleAdminSecretLogin = () => {
    if (adminUsername === 'admi' && adminPassword === '1234') {
      onLogin('ADMIN', true);
    } else {
      alert("Identifiants admin incorrects.");
    }
  };

  const handleCompleteProfile = () => {
    if (profileData.name.trim()) {
      onUpdateProfile({ 
        name: profileData.name, 
        email: profileData.email,
        isProfileComplete: true 
      });
    } else {
      alert("Veuillez entrer au moins votre nom.");
    }
  };

  // Case 1: Admin Secret Login Screen
  if (showAdminLogin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F5F5] p-6 animate-fadeIn">
        <div className="bg-white p-8 rounded-[40px] shadow-2xl w-full max-w-sm border border-gray-100">
          <div className="w-16 h-16 bg-[#E2725B]/10 text-[#E2725B] rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <i className="fa-solid fa-key text-2xl"></i>
          </div>
          <h2 className="text-xl font-black text-[#2D5A27] text-center mb-6 uppercase tracking-wider">Accès Maître</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2 mb-1 block">Nom d'utilisateur</label>
              <input
                type="text"
                placeholder=""
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#2D5A27] font-bold"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2 mb-1 block">Mot de passe</label>
              <input
                type="password"
                placeholder=""
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#2D5A27] font-bold"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminSecretLogin()}
              />
            </div>
            <button
              onClick={handleAdminSecretLogin}
              className="w-full bg-[#2D5A27] text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
            >
              Déverrouiller
            </button>
            <button 
              onClick={() => setShowAdminLogin(false)}
              className="w-full text-gray-400 text-xs font-bold uppercase tracking-widest pt-2"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: User logged in but profile NOT complete
  if (user && !user.isAdmin && !user.isProfileComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F5F5] p-6 animate-fadeIn">
        <div className="bg-white p-8 rounded-[40px] shadow-2xl w-full max-w-sm border border-gray-100">
          <div className="w-20 h-20 bg-[#2D5A27]/5 text-[#2D5A27] rounded-full flex items-center justify-center mb-6 mx-auto">
            <i className="fa-solid fa-user-pen text-3xl"></i>
          </div>
          <h2 className="text-2xl font-black text-[#2D5A27] text-center mb-2">Finalisons votre profil</h2>
          <p className="text-gray-400 text-center mb-8 text-sm font-medium">Parlez-nous un peu de vous pour une meilleure expérience.</p>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2 mb-1 block">Nom Complet</label>
              <input
                type="text"
                placeholder=""
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#2D5A27] font-bold"
                value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2 mb-1 block">Email (Optionnel)</label>
              <input
                type="email"
                placeholder=""
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#2D5A27] font-bold"
                value={profileData.email}
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
              />
            </div>
            <button
              onClick={handleCompleteProfile}
              className="w-full bg-[#E2725B] text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-orange-100 active:scale-95 transition-all"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Initial Login Screen
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F5F5] p-6 animate-fadeIn relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#2D5A27]/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#E2725B]/5 rounded-full blur-3xl"></div>

        <div className="w-full max-w-sm z-10 flex flex-col items-center">
          {/* Main Logo - 5 Taps for Admin Access */}
          <div 
            onClick={handleLogoClick}
            className="w-32 h-32 bg-white rounded-[40px] flex items-center justify-center mb-8 shadow-2xl shadow-green-200/50 rotate-3 border border-gray-50 cursor-pointer active:scale-90 transition-transform select-none"
          >
            <i className="fa-solid fa-leaf text-6xl text-[#2D5A27]"></i>
          </div>

          <h1 className="text-3xl font-black text-[#2D5A27] text-center mb-2 tracking-tight">Green Market BF</h1>
          <p className="text-gray-400 text-center mb-10 text-sm font-medium leading-relaxed px-4">
            Connectez-vous pour découvrir notre collection de plantes locales.
          </p>

          {!isOtpSent ? (
            <div className="w-full space-y-4">
              <div className="relative group">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-[#2D5A27]/30 transition-colors group-focus-within:text-[#2D5A27]">+226</span>
                <input
                  type="tel"
                  placeholder=""
                  className="w-full bg-white border border-gray-100 rounded-[32px] py-5 pl-16 pr-6 outline-none focus:ring-4 focus:ring-[#2D5A27]/5 focus:border-[#2D5A27] transition-all shadow-sm font-bold text-lg"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendOtp()}
                />
              </div>
              <button
                onClick={handleSendOtp}
                disabled={phone.length < 8 || isCheckingUser}
                className="w-full bg-[#2D5A27] text-white py-5 rounded-[32px] font-black text-sm uppercase tracking-widest shadow-xl shadow-green-100 disabled:opacity-50 active:scale-[0.98] transition-all"
              >
                {isCheckingUser ? 'Vérification...' : 'Suivant'}
              </button>
            </div>
          ) : (
            <div className="w-full space-y-6 animate-slideIn">
              <div className="text-center">
                <p className="text-sm font-bold text-gray-800 mb-2">
                  {isExistingUser ? 'Bienvenue de retour !' : 'Nouveau client ?'}
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  {isExistingUser 
                    ? 'Connectez-vous à votre compte existant'
                    : 'Créez votre compte en quelques instants'
                  }
                </p>
                <div className="flex justify-center gap-3 mb-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`w-3 h-3 rounded-full transition-all duration-300 ${otp.length >= i ? 'bg-[#2D5A27] scale-125' : 'bg-gray-200'}`}></div>
                  ))}
                </div>
              </div>
              <input
                type="text"
                placeholder=""
                className="w-full bg-white border border-gray-100 rounded-[28px] py-5 px-6 text-center text-3xl font-black tracking-[0.5em] outline-none focus:ring-4 focus:ring-[#2D5A27]/5 focus:border-[#2D5A27] shadow-sm"
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handleVerifyOtp()}
              />
              <button
                onClick={handleVerifyOtp}
                disabled={otp.length < 4}
                className="w-full bg-[#2D5A27] text-white py-5 rounded-[28px] font-black text-sm uppercase tracking-widest shadow-xl shadow-green-100 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isExistingUser ? 'Se connecter' : 'Créer mon compte'}
              </button>
              <button 
                onClick={() => { setIsOtpSent(false); setOtp(''); }}
                className="w-full text-gray-400 text-xs font-bold uppercase tracking-widest border-b border-gray-200 pb-1"
              >
                Changer de numéro
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Case 4: Normal User Profile (Full Complete)
  const userOrders = orders.filter(o => o.customer.phone === user.phone);

  return (
    <div className="p-4 space-y-8 animate-fadeIn pb-32">
      <div className="bg-[#2D5A27] rounded-[40px] p-8 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-white/10 backdrop-blur rounded-[32px] flex items-center justify-center mb-4 border border-white/20">
            <span className="text-3xl font-black uppercase">{user.name ? user.name.charAt(0) : 'U'}</span>
          </div>
          <h2 className="text-xl font-black mb-1">{user.isAdmin ? 'Administrateur' : (user.name || 'Client')}</h2>
          <p className="text-white/60 text-sm font-medium">{user.phone}</p>
          
          <button 
            onClick={onLogout} 
            className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-black uppercase tracking-widest border border-white/10 transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </div>

      {user.isAdmin && (
        <button 
          onClick={() => window.location.hash = '#/admin'}
          className="w-full bg-[#E2725B] text-white p-6 rounded-[32px] shadow-xl shadow-orange-100 flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <i className="fa-solid fa-gauge-high text-xl"></i>
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-wider text-white/70">Outil de Pilotage</p>
              <p className="text-lg font-black">Dashboard Créateur</p>
            </div>
          </div>
          <i className="fa-solid fa-arrow-right-long text-xl opacity-50 group-hover:translate-x-2 transition-transform"></i>
        </button>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Commandes</p>
          <p className="text-2xl font-black text-[#2D5A27]">{userOrders.length}</p>
        </div>
        <div className="bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Points</p>
          <p className="text-2xl font-black text-[#E2725B]">{userOrders.length * 50}</p>
        </div>
      </div>

      <section>
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="text-lg font-black text-[#2D5A27]">Historique</h3>
        </div>
        {userOrders.length === 0 ? (
          <div className="bg-white rounded-[32px] p-10 text-center text-gray-400 border border-dashed border-gray-200">
             <i className="fa-solid fa-history text-3xl mb-4 opacity-20 block"></i>
             <p className="text-sm font-medium">Aucune commande pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {userOrders.map(order => (
              <div key={order.id} className="bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm flex justify-between items-center group active:scale-[0.98] transition-transform">
                <div>
                  <p className="font-black text-sm text-gray-800 uppercase tracking-tight">CMD #{order.id}</p>
                  <p className="text-[10px] text-gray-400 font-bold">{new Date(order.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-[#2D5A27]">{order.total} F</p>
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg ${
                    order.status === 'Livrée' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Profile;
