import React, { useState } from 'react';
import { User } from '../types';

interface VendorSubscriptionProps {
  user: User;
  onUpdateProfile: (userData: Partial<User>) => void;
  onClose: () => void;
}

const VendorSubscription: React.FC<VendorSubscriptionProps> = ({ user, onUpdateProfile, onClose }) => {
  const [loading, setLoading] = useState(false);

  const handleActivateVendor = () => {
    setLoading(true);

    // Générer un code vendeur unique
    const vendorCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Activer immédiatement le compte vendeur
    onUpdateProfile({
      isVendor: true,
      vendorStatus: 'active',
      vendorCode: vendorCode,
      vendorSubscription: {
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 5000,
        paymentMethod: 'Orange Money',
        paymentConfirmed: true,
        status: 'active'
      }
    });

    setTimeout(() => {
      setLoading(false);
      alert(`🎉 Félicitations ! Votre compte vendeur est activé !\n\nVotre code vendeur : ${vendorCode}\n\nVous pouvez maintenant accéder au Dashboard Vendeur.`);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-[32px] p-6 max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-[#2D5A27]">Devenir Vendeur</h2>
            <p className="text-xs text-gray-500 mt-1">Vendez vos plantes sur Green Market</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="fa-solid fa-times text-lg"></i>
          </button>
        </div>

        {/* Pricing Card */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 mb-4 border border-orange-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-orange-600 font-semibold uppercase tracking-wide">Abonnement Mensuel</p>
              <p className="text-3xl font-black text-orange-600 mt-1">5 000 <span className="text-sm">FCFA</span></p>
            </div>
            <div className="bg-white rounded-full p-3 shadow-sm">
              <i className="fa-solid fa-store text-2xl text-orange-500"></i>
            </div>
          </div>
          <p className="text-xs text-gray-600">Paiement via Orange Money</p>
        </div>

        {/* Benefits */}
        <div className="bg-blue-50 rounded-2xl p-4 mb-4 border border-blue-100">
          <h3 className="font-bold text-blue-600 text-sm mb-2 flex items-center gap-2">
            <i className="fa-solid fa-sparkles"></i>
            Avantages
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-check text-green-500"></i>
              <span>Dashboard vendeur</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-check text-green-500"></i>
              <span>Gérer inventaire</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-check text-green-500"></i>
              <span>Code unique</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-check text-green-500"></i>
              <span>Support prioritaire</span>
            </div>
          </div>
        </div>

        {/* Payment Info - Condensed */}
        <div className="bg-gray-50 rounded-2xl p-3 mb-4 border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs text-gray-600 font-semibold">💳 Code Orange Money :</p>
            <button
              onClick={() => window.location.href = 'tel:*144*2*1*07659801*5000#'}
              className="text-[10px] bg-orange-100 text-orange-600 px-2 py-1 rounded-lg font-bold flex items-center gap-1"
            >
              <i className="fa-solid fa-phone"></i>
              Lancer l'appel
            </button>
          </div>
          <div className="bg-white rounded-lg p-2 border border-gray-300">
            <p className="font-mono text-sm text-center text-orange-600 font-bold">*144*2*1*07659801*5000#</p>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleActivateVendor}
          disabled={loading}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <i className="fa-solid fa-spinner fa-spin"></i>
              Activation en cours...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <i className="fa-solid fa-rocket"></i>
              Activer mon compte vendeur
            </span>
          )}
        </button>

        {/* Demo Notice */}
        <p className="text-xs text-gray-400 text-center mt-3">
          <i className="fa-solid fa-info-circle mr-1"></i>
          Version démo : activation instantanée
        </p>
      </div>
    </div>
  );
};

export default VendorSubscription;
