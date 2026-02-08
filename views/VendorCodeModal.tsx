import React, { useState } from 'react';
import { User } from '../types';
import { userService } from '../services/userService';
import { useNavigate } from 'react-router-dom';

interface VendorCodeModalProps {
  onClose: () => void;
  // onAccessVendor remains for types, but logic is handled internally or via callback
}

const VendorCodeModal: React.FC<VendorCodeModalProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const [vendorCode, setVendorCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccessVendor = async () => {
    if (vendorCode.length !== 6) {
      setError('Le code vendeur doit contenir 6 caractères');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const foundVendor = await userService.findVendorByCode(vendorCode.toUpperCase());

      if (foundVendor) {
        // Rediriger directement vers la page du vendeur
        navigate(`/vendor-products/${foundVendor.id}`);
        onClose();
        alert(`🎉 Accès autorisé ! Bienvenue chez ${foundVendor.name}`);
      } else {
        setError('Code vendeur invalide ou expiré');
      }
    } catch (err: any) {
      console.error(err);
      setError('Une erreur est survenue lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[40px] p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-purple-600">Accès Vendeur</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
            <h3 className="font-bold text-purple-600 mb-2">🔐 Entrez le Code Vendeur</h3>
            <p className="text-sm text-gray-600">
              Demandez le code à votre vendeur pour accéder à ses produits exclusifs
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Code Vendeur</label>
            <input
              type="text"
              value={vendorCode}
              onChange={(e) => setVendorCode(e.target.value.toUpperCase())}
              placeholder="Entrez le code à 6 caractères"
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-2xl focus:border-purple-500 focus:outline-none font-mono text-lg text-center"
              maxLength={6}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleAccessVendor}
            disabled={loading || vendorCode.length !== 6}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white py-4 rounded-2xl font-bold transition-all active:scale-95 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <i className="fa-solid fa-spinner fa-spin"></i>
                <span>Vérification...</span>
              </div>
            ) : (
              'Accéder au Vendeur'
            )}
          </button>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Vous n'avez pas de code ?
              <button
                onClick={() => {
                  onClose();
                  // Ouvrir la modal d'abonnement vendeur
                  const event = new CustomEvent('openVendorSubscription');
                  window.dispatchEvent(event);
                }}
                className="text-purple-600 font-bold hover:underline ml-1"
              >
                Devenez vendeur
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorCodeModal;
