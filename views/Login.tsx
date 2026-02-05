import React, { useState } from 'react';
import { User } from '../types';
import { userService } from '../services/userService';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // États pour l'inscription
  const [profileData, setProfileData] = useState({
    name: '',
    email: ''
  });

  const handleSendOtp = async (isLogin: boolean) => {
    if (phone.length < 8) return;
    
    setIsCheckingUser(true);
    try {
      if (isLogin) {
        // Pour la connexion, vérifier si l'utilisateur existe
        const existingUser = await userService.getUserByPhone(phone);
        if (!existingUser) {
          alert('Ce numéro n\'est pas enregistré. Veuillez créer un compte.');
          setIsCheckingUser(false);
          return;
        }
        setIsExistingUser(true);
      } else {
        // Pour l'inscription, vérifier si l'utilisateur existe déjà
        const existingUser = await userService.getUserByPhone(phone);
        if (existingUser) {
          alert('Ce numéro est déjà enregistré. Veuillez vous connecter.');
          setIsCheckingUser(false);
          return;
        }
        setIsExistingUser(false);
      }
      
      setIsOtpSent(true);
      console.log("OTP Sent to " + phone);
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      setIsOtpSent(true);
    } finally {
      setIsCheckingUser(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 4) return;
    
    setIsProcessing(true);
    try {
      if (otp === '1234' || otp.length === 4) {
        if (activeTab === 'register') {
          // Créer un nouvel utilisateur
          const newUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            phone,
            name: profileData.name,
            email: profileData.email,
            isAdmin: false,
            isProfileComplete: true,
            addresses: []
          };
          
          await userService.saveUser(newUser);
          onLogin(newUser);
        } else {
          // Connexion d'un utilisateur existant
          const existingUser = await userService.getUserByPhone(phone);
          if (existingUser) {
            onLogin(existingUser);
          }
        }
      } else {
        alert("Code incorrect (Essayez 1234)");
      }
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setIsOtpSent(false);
    setOtp('');
    setIsExistingUser(false);
    setIsCheckingUser(false);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5F5] to-[#E8F5E8] flex items-center justify-center p-6">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2D5A27] to-[#3A6F35] p-6 text-white">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
              <i className="fa-solid fa-leaf text-2xl"></i>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center mb-2">Green Market BF</h1>
          <p className="text-white/80 text-sm text-center">Votre marché de plantes local</p>
        </div>

        {/* Onglets */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => { setActiveTab('login'); resetForm(); }}
            className={`flex-1 py-4 font-semibold text-sm transition-all ${
              activeTab === 'login' 
                ? 'text-[#2D5A27] border-b-2 border-[#2D5A27]' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Se connecter
          </button>
          <button
            onClick={() => { setActiveTab('register'); resetForm(); }}
            className={`flex-1 py-4 font-semibold text-sm transition-all ${
              activeTab === 'register' 
                ? 'text-[#2D5A27] border-b-2 border-[#2D5A27]' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Créer un compte
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6">
          {!isOtpSent ? (
            <div className="space-y-6">
              {/* Titre */}
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {activeTab === 'login' ? 'Bienvenue de retour !' : 'Rejoignez-nous !'}
                </h2>
                <p className="text-sm text-gray-500">
                  {activeTab === 'login' 
                    ? 'Connectez-vous à votre compte pour accéder à vos commandes'
                    : 'Créez votre compte et découvrez nos plantes locales'
                  }
                </p>
              </div>

              {/* Formulaire */}
              <div className="space-y-4">
                {activeTab === 'register' && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-gray-700 mb-2 block">Nom complet *</label>
                      <input
                        type="text"
                        placeholder="Votre nom"
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-4 outline-none focus:ring-2 focus:ring-[#2D5A27] font-medium transition-all"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 mb-2 block">Email (optionnel)</label>
                      <input
                        type="email"
                        placeholder="votre@email.com"
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-4 outline-none focus:ring-2 focus:ring-[#2D5A27] font-medium transition-all"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                  </>
                )}
                
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-2 block">
                    Numéro de téléphone *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">+226</span>
                    <input
                      type="tel"
                      placeholder="XX XX XX XX XX"
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-16 pr-4 outline-none focus:ring-2 focus:ring-[#2D5A27] font-medium transition-all"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendOtp(activeTab === 'login')}
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleSendOtp(activeTab === 'login')}
                  disabled={phone.length < 8 || isCheckingUser || (activeTab === 'register' && !profileData.name.trim())}
                  className="w-full bg-gradient-to-r from-[#2D5A27] to-[#3A6F35] text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg disabled:opacity-50 active:scale-[0.98] transition-all"
                >
                  {isCheckingUser ? 'Vérification...' : activeTab === 'login' ? 'Se connecter' : 'Créer mon compte'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-slideIn">
              {/* En-tête OTP */}
              <div className="text-center">
                <div className="w-20 h-20 bg-[#2D5A27]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fa-solid fa-mobile-alt text-2xl text-[#2D5A27]"></i>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  Code de vérification
                </h3>
                <p className="text-sm text-gray-500">
                  Entrez le code envoyé au {phone}
                </p>
              </div>

              {/* Input OTP */}
              <div className="flex justify-center gap-3 mb-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`w-3 h-3 rounded-full transition-all duration-300 ${otp.length >= i ? 'bg-[#2D5A27] scale-125' : 'bg-gray-200'}`}></div>
                ))}
              </div>

              <input
                type="text"
                placeholder="0000"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-4 text-center text-2xl font-bold tracking-[0.5em] outline-none focus:ring-2 focus:ring-[#2D5A27] transition-all"
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handleVerifyOtp()}
              />

              <button
                onClick={handleVerifyOtp}
                disabled={otp.length < 4 || isProcessing}
                className="w-full bg-gradient-to-r from-[#2D5A27] to-[#3A6F35] text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg disabled:opacity-50 active:scale-[0.98] transition-all"
              >
                {isProcessing ? 'Traitement...' : 'Valider'}
              </button>

              <button 
                onClick={resetForm}
                className="w-full text-gray-400 text-xs font-bold uppercase tracking-widest border-b border-gray-200 pb-1"
              >
                Changer de numéro
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 text-center">
          <p className="text-xs text-gray-400">
            En continuant, vous acceptez nos conditions d'utilisation
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
