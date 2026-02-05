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
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // États pour l'inscription
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    city: 'Ouagadougou',
    district: ''
  });

  const validatePhone = (phone: string) => {
    if (!phone || phone.length < 8) {
      setErrors({ phone: 'Veuillez entrer un numéro de téléphone valide' });
      return false;
    }
    setErrors({});
    return true;
  };

  const validateRegister = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!profileData.name.trim()) {
      newErrors.name = 'Le nom est obligatoire';
    }
    
    if (!validatePhone(phone)) {
      return false;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async (isLogin: boolean) => {
    if (isLogin) {
      if (!validatePhone(phone)) return;
    } else {
      if (!validateRegister()) return;
    }
    
    setIsCheckingUser(true);
    try {
      if (isLogin) {
        // Pour la connexion, vérifier si l'utilisateur existe
        const existingUser = await userService.getUserByPhone(phone);
        if (!existingUser) {
          setErrors({ phone: 'Ce numéro n\'est pas enregistré. Veuillez créer un compte.' });
          setIsCheckingUser(false);
          return;
        }
        setIsExistingUser(true);
      } else {
        // Pour l'inscription, vérifier si l'utilisateur existe déjà
        const existingUser = await userService.getUserByPhone(phone);
        if (existingUser) {
          setErrors({ phone: 'Ce numéro est déjà enregistré. Veuillez vous connecter.' });
          setIsCheckingUser(false);
          return;
        }
        setIsExistingUser(false);
      }
      
      setIsOtpSent(true);
      console.log("OTP Sent to " + phone);
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      setErrors({ general: 'Une erreur est survenue. Veuillez réessayer.' });
    } finally {
      setIsCheckingUser(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 4) {
      setErrors({ otp: 'Veuillez entrer le code à 4 chiffres' });
      return;
    }
    
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
            addresses: profileData.district ? [{
              district: profileData.district,
              city: profileData.city,
              landmark: ''
            }] : []
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
        setErrors({ otp: 'Code incorrect (Essayez 1234)' });
      }
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      setErrors({ general: 'Une erreur est survenue. Veuillez réessayer.' });
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
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Section gauche - Branding */}
        <div className="hidden lg:flex flex-col justify-center items-center text-center p-8">
          <div className="w-32 h-32 bg-gradient-to-br from-[#2D5A27] to-emerald-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl">
            <i className="fa-solid fa-leaf text-5xl text-white"></i>
          </div>
          <h1 className="text-5xl font-black text-[#2D5A27] mb-4">Green Market BF</h1>
          <p className="text-xl text-gray-600 mb-8">Votre marché de plantes local au Burkina Faso</p>
          <div className="flex gap-8 text-gray-500">
            <div className="text-center">
              <i className="fa-solid fa-truck text-3xl text-[#2D5A27] mb-2"></i>
              <p className="text-sm">Livraison rapide</p>
            </div>
            <div className="text-center">
              <i className="fa-solid fa-leaf text-3xl text-[#2D5A27] mb-2"></i>
              <p className="text-sm">Plantes locales</p>
            </div>
            <div className="text-center">
              <i className="fa-solid fa-shield-alt text-3xl text-[#2D5A27] mb-2"></i>
              <p className="text-sm">Paiement sécurisé</p>
            </div>
          </div>
        </div>

        {/* Section droite - Formulaire */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 border border-gray-100">
          
          {/* Header mobile */}
          <div className="flex lg:hidden items-center justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#2D5A27] to-emerald-600 rounded-2xl flex items-center justify-center">
              <i className="fa-solid fa-leaf text-2xl text-white"></i>
            </div>
          </div>

          {/* Onglets */}
          <div className="flex mb-8 bg-gray-50 rounded-2xl p-1">
            <button
              onClick={() => { setActiveTab('login'); resetForm(); }}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
                activeTab === 'login' 
                  ? 'bg-white text-[#2D5A27] shadow-md' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Se connecter
            </button>
            <button
              onClick={() => { setActiveTab('register'); resetForm(); }}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
                activeTab === 'register' 
                  ? 'bg-white text-[#2D5A27] shadow-md' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Créer un compte
            </button>
          </div>

          {/* Messages d'erreur */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {errors.general}
            </div>
          )}

          {!isOtpSent ? (
            <div className="space-y-6">
              {/* Titre */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {activeTab === 'login' ? 'Bonjour !' : 'Bienvenue !'}
                </h2>
                <p className="text-gray-600">
                  {activeTab === 'login' 
                    ? 'Connectez-vous à votre compte pour accéder à vos commandes'
                    : 'Créez votre compte et découvrez nos plantes locales'
                  }
                </p>
              </div>

              {/* Formulaire */}
              <div className="space-y-5">
                {activeTab === 'register' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        placeholder="Votre nom complet"
                        className={`w-full px-4 py-4 rounded-xl border ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'} bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D5A27] focus:border-transparent outline-none transition-all font-medium`}
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      />
                      {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email (optionnel)
                      </label>
                      <input
                        type="email"
                        placeholder="votre@email.com"
                        className="w-full px-4 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D5A27] focus:border-transparent outline-none transition-all font-medium"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Ville
                        </label>
                        <select
                          className="w-full px-4 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D5A27] focus:border-transparent outline-none transition-all font-medium"
                          value={profileData.city}
                          onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                        >
                          <option value="Ouagadougou">Ouagadougou</option>
                          <option value="Bobo-Dioulasso">Bobo-Dioulasso</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Quartier (optionnel)
                        </label>
                        <input
                          type="text"
                          placeholder="Votre quartier"
                          className="w-full px-4 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D5A27] focus:border-transparent outline-none transition-all font-medium"
                          value={profileData.district}
                          onChange={(e) => setProfileData(prev => ({ ...prev, district: e.target.value }))}
                        />
                      </div>
                    </div>
                  </>
                )}
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Numéro de téléphone *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">+226</span>
                    <input
                      type="tel"
                      placeholder="XX XX XX XX XX"
                      className={`w-full pl-16 pr-4 py-4 rounded-xl border ${errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200'} bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D5A27] focus:border-transparent outline-none transition-all font-medium text-lg`}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendOtp(activeTab === 'login')}
                    />
                  </div>
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>

                <button
                  onClick={() => handleSendOtp(activeTab === 'login')}
                  disabled={isCheckingUser || isProcessing || (activeTab === 'register' && !profileData.name.trim()) || phone.length < 8}
                  className="w-full bg-gradient-to-r from-[#2D5A27] to-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
                >
                  {isCheckingUser ? 'Vérification...' : activeTab === 'login' ? 'Se connecter' : 'Créer mon compte'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* En-tête OTP */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#2D5A27]/10 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="fa-solid fa-mobile-alt text-3xl text-[#2D5A27]"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Code de vérification
                </h3>
                <p className="text-gray-600">
                  Entrez le code à 4 chiffres envoyé au {phone}
                </p>
              </div>

              {/* Input OTP */}
              <div className="flex justify-center gap-3 mb-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`w-4 h-4 rounded-full transition-all duration-300 ${otp.length >= i ? 'bg-gradient-to-r from-[#2D5A27] to-emerald-600 scale-125' : 'bg-gray-200'}`}></div>
                ))}
              </div>

              <input
                type="text"
                placeholder="0000"
                className={`w-full px-4 py-4 rounded-xl border ${errors.otp ? 'border-red-300 bg-red-50' : 'border-gray-200'} bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D5A27] focus:border-transparent outline-none transition-all text-center text-2xl font-bold tracking-[0.5em]`}
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handleVerifyOtp()}
              />
              {errors.otp && <p className="mt-1 text-sm text-red-600 text-center">{errors.otp}</p>}

              <button
                onClick={handleVerifyOtp}
                disabled={otp.length < 4 || isProcessing}
                className="w-full bg-gradient-to-r from-[#2D5A27] to-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
              >
                {isProcessing ? 'Traitement...' : 'Valider'}
              </button>

              <button 
                onClick={resetForm}
                className="w-full text-gray-500 font-medium hover:text-gray-700 transition-colors"
              >
                ← Changer de numéro
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              En continuant, vous acceptez nos{' '}
              <span className="text-[#2D5A27] font-medium">conditions d'utilisation</span> et notre{' '}
              <span className="text-[#2D5A27] font-medium">politique de confidentialité</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
