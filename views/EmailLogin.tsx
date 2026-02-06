import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { emailAuthService, AuthResult } from '../services/emailAuthService';

interface EmailLoginProps {
  onLogin: (user: User) => void;
}

const EmailLogin: React.FC<EmailLoginProps> = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showSecretLogin, setShowSecretLogin] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [secretData, setSecretData] = useState({
    secret: '',
    adminPassword: ''
  });

  const validateForm = (): boolean => {
    const newErrors: string[] = [];
    
    if (authMode === 'signup') {
      if (!formData.name.trim()) newErrors.push('Le nom est obligatoire');
      if (formData.password !== formData.confirmPassword) {
        newErrors.push('Les mots de passe ne correspondent pas');
      }
    }
    
    if (!formData.email.trim()) newErrors.push('L\'email est obligatoire');
    if (!formData.password) newErrors.push('Le mot de passe est obligatoire');
    if (formData.password.length < 6) newErrors.push('Le mot de passe doit faire au moins 6 caractères');
    
    if (newErrors.length > 0) {
      setError(newErrors.join('. '));
      return false;
    }
    
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      let result: AuthResult;
      
      if (authMode === 'signup') {
        result = await emailAuthService.signUp(
          formData.email,
          formData.password,
          formData.name
        );
        
        if (result.success) {
          setSuccess('Compte créé avec succès ! Un email de vérification a été envoyé. Veuillez vérifier votre email avant de vous connecter.');
          // Réinitialiser le formulaire
          setFormData({
            name: '',
            email: '',
            password: '',
            confirmPassword: ''
          });
          // Passer en mode connexion
          setAuthMode('login');
        } else {
          setError(result.error || 'Erreur lors de l\'inscription');
        }
      } else {
        result = await emailAuthService.signIn(
          formData.email,
          formData.password
        );
        
        if (result.success && result.user) {
          onLogin(result.user);
        } else {
          setError(result.error || 'Erreur lors de l\'authentification');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!formData.email) {
      setError('Veuillez entrer votre email d\'abord');
      return;
    }
    
    setLoading(true);
    try {
      const result = await emailAuthService.resendEmailVerification();
      if (result.success) {
        setSuccess('Email de vérification renvoyé !');
      } else {
        setError(result.error || 'Impossible de renvoyer l\'email');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleSecretLogin = async () => {
    if (secretData.secret === 'admin' && secretData.adminPassword === '1234') {
      const adminUser: User = {
        id: 'admin-secret',
        phone: 'Admin',
        email: 'admin@greenmarket.bf',
        name: 'Administrateur',
        isAdmin: true,
        isProfileComplete: true,
        addresses: []
      };
      onLogin(adminUser);
    } else {
      setError('Identifiants admin incorrects');
    }
  };

  // Détecter le maintien du logo (adaptée pour mobile)
  useEffect(() => {
    let holdTimer: NodeJS.Timeout;
    let isHolding = false;
    
    const handleMouseDown = () => {
      isHolding = true;
      holdTimer = setTimeout(() => {
        if (isHolding) {
          setShowSecretLogin(true);
        }
      }, 5000); // 5 secondes de maintien
    };
    
    const handleMouseUp = () => {
      isHolding = false;
      clearTimeout(holdTimer);
    };
    
    const handleTouchStart = () => {
      isHolding = true;
      holdTimer = setTimeout(() => {
        if (isHolding) {
          setShowSecretLogin(true);
        }
      }, 5000); // 5 secondes de maintien
    };
    
    const handleTouchEnd = () => {
      isHolding = false;
      clearTimeout(holdTimer);
    };
    
    // Ajouter des écouteurs sur le logo
    const logoElement = document.querySelector('.admin-secret-trigger');
    if (logoElement) {
      logoElement.addEventListener('mousedown', handleMouseDown);
      logoElement.addEventListener('mouseup', handleMouseUp);
      logoElement.addEventListener('mouseleave', handleMouseUp);
      logoElement.addEventListener('touchstart', handleTouchStart);
      logoElement.addEventListener('touchend', handleTouchEnd);
      logoElement.addEventListener('touchcancel', handleTouchEnd);
    }
    
    return () => {
      if (logoElement) {
        logoElement.removeEventListener('mousedown', handleMouseDown);
        logoElement.removeEventListener('mouseup', handleMouseUp);
        logoElement.removeEventListener('mouseleave', handleMouseUp);
        logoElement.removeEventListener('touchstart', handleTouchStart);
        logoElement.removeEventListener('touchend', handleTouchEnd);
        logoElement.removeEventListener('touchcancel', handleTouchEnd);
      }
      clearTimeout(holdTimer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Section gauche - Branding */}
        <div className="hidden lg:flex flex-col justify-center items-center text-center p-8">
          <div className="w-32 h-32 bg-gradient-to-br from-[#2D5A27] to-emerald-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl admin-secret-trigger cursor-pointer hover:scale-110 transition-transform active:scale-95">
            <i className="fa-solid fa-seedling text-5xl text-white"></i>
          </div>
          <h1 className="text-5xl font-black text-[#2D5A27] mb-4">Green Market BF</h1>
          <p className="text-xl text-gray-600 mb-8">Authentification 100% gratuite et sécurisée</p>
          <div className="flex gap-8 text-gray-500">
            <div className="text-center">
              <i className="fa-solid fa-shield-halved text-3xl text-[#2D5A27] mb-2"></i>
              <p className="text-sm">Sécurisé</p>
            </div>
            <div className="text-center">
              <i className="fa-solid fa-bolt text-3xl text-[#2D5A27] mb-2"></i>
              <p className="text-sm">Rapide</p>
            </div>
            <div className="text-center">
              <i className="fa-solid fa-gift text-3xl text-[#2D5A27] mb-2"></i>
              <p className="text-sm">Gratuit</p>
            </div>
          </div>
        </div>

        {/* Section droite - Formulaire */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 border border-gray-100">
          
          {/* Header mobile */}
          <div className="flex lg:hidden items-center justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#2D5A27] to-emerald-600 rounded-2xl flex items-center justify-center admin-secret-trigger cursor-pointer hover:scale-110 transition-transform active:scale-95">
              <i className="fa-solid fa-seedling text-2xl text-white"></i>
            </div>
          </div>

          {/* Onglets */}
          <div className="flex mb-8 bg-gray-50 rounded-2xl p-1">
            <button
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
                authMode === 'login' 
                  ? 'bg-white text-[#2D5A27] shadow-md' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Se connecter
            </button>
            <button
              onClick={() => setAuthMode('signup')}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
                authMode === 'signup' 
                  ? 'bg-white text-[#2D5A27] shadow-md' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Créer un compte
            </button>
          </div>

          {/* Message de succès */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-check-circle"></i>
                <span>{success}</span>
              </div>
            </div>
          )}

          {/* Message d'erreur */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-exclamation-circle"></i>
                  <span>{error}</span>
                </div>
                {error.includes('vérifier votre email') && (
                  <button
                    onClick={handleResendVerification}
                    disabled={loading}
                    className="ml-4 text-xs bg-red-100 hover:bg-red-200 px-3 py-1 rounded-lg transition-colors"
                  >
                    Renvoyer
                  </button>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {authMode === 'signup' && (
              <div className="animate-slideDown">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  placeholder="Votre nom complet"
                  className="w-full px-4 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D5A27] focus:border-transparent outline-none transition-all font-medium"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  disabled={loading}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                placeholder="votre@email.com"
                className="w-full px-4 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D5A27] focus:border-transparent outline-none transition-all font-medium"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                disabled={loading}
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mot de passe *
              </label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#2D5A27] focus:border-transparent transition-all font-medium pr-12"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                disabled={loading}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-[34px] text-gray-300"
              >
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>

            {authMode === 'signup' && (
              <div className="animate-slideDown">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmer le mot de passe *
                </label>
                <input
                  type="password"
                  placeholder="••••••••••"
                  className="w-full px-4 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D5A27] focus:border-transparent outline-none transition-all font-medium"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  disabled={loading}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#2D5A27] to-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <i className="fa-solid fa-spinner animate-spin"></i>
                  <span>Traitement...</span>
                </div>
              ) : (
                authMode === 'login' ? 'Se connecter' : 'Créer mon compte'
              )}
            </button>
          </form>

          {/* Formulaire secret admin */}
          {showSecretLogin && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <h3 className="text-sm font-semibold text-yellow-800 mb-3">Accès Administrateur</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Code secret"
                  className="w-full px-3 py-2 text-sm border border-yellow-300 rounded-lg bg-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none"
                  value={secretData.secret}
                  onChange={(e) => setSecretData({...secretData, secret: e.target.value})}
                />
                <input
                  type="password"
                  placeholder="Mot de passe admin"
                  className="w-full px-3 py-2 text-sm border border-yellow-300 rounded-lg bg-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none"
                  value={secretData.adminPassword}
                  onChange={(e) => setSecretData({...secretData, adminPassword: e.target.value})}
                />
                <button
                  onClick={handleSecretLogin}
                  disabled={loading}
                  className="w-full bg-yellow-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 disabled:opacity-50 transition-colors"
                >
                  Connexion Admin
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              {authMode === 'login' ? (
                <>
                  Pas encore de compte ?{' '}
                  <button 
                    onClick={() => setAuthMode('signup')}
                    className="text-[#2D5A27] font-medium hover:underline"
                  >
                    Créez-en un
                  </button>
                </>
              ) : (
                <>
                  Déjà un compte ?{' '}
                  <button 
                    onClick={() => setAuthMode('login')}
                    className="text-[#2D5A27] font-medium hover:underline"
                  >
                    Connectez-vous
                  </button>
                </>
              )}
            </p>
            
            {/* Indicateur secret */}
            <p className="text-xs text-gray-400 mt-4">
              •
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailLogin;
