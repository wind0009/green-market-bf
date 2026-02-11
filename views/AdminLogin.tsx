import React, { useState } from 'react';
import { User } from '../types';

interface AdminLoginProps {
  onLogin: (user: User) => void;
  onBack: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onBack }) => {
  const [credentials, setCredentials] = useState({
    secret: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (credentials.secret === 'admin' && credentials.password === '1234') {
      const adminUser: User = {
        id: 'admin-secret',
        phone: 'Admin',
        email: 'admin@greenmarket.bf',
        name: 'Administrateur',
        role: 'super-admin',
        isAdmin: true,
        isProfileComplete: true,
        addresses: []
      };
      onLogin(adminUser);
    } else {
      setError('Identifiants administrateur incorrects');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <i className="fa-solid fa-shield-halved text-4xl text-white"></i>
          </div>
          <h1 className="text-3xl font-black text-orange-800 mb-2">Accès Administrateur</h1>
          <p className="text-orange-600">Green Market BF</p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-orange-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Message d'erreur */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-exclamation-triangle"></i>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Code secret */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Code secret
              </label>
              <input
                type="text"
                placeholder="Entrez le code secret"
                className="w-full px-4 py-4 rounded-xl border border-orange-200 bg-orange-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all font-medium"
                value={credentials.secret}
                onChange={(e) => setCredentials({ ...credentials, secret: e.target.value })}
                disabled={loading}
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                placeholder="Entrez le mot de passe"
                className="w-full px-4 py-4 rounded-xl border border-orange-200 bg-orange-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all font-medium"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                disabled={loading}
              />
            </div>

            {/* Boutons */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <i className="fa-solid fa-spinner animate-spin"></i>
                    <span>Connexion...</span>
                  </div>
                ) : (
                  'Se connecter'
                )}
              </button>

              <button
                type="button"
                onClick={onBack}
                disabled={loading}
                className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                Retour
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
