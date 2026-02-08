import React, { useState } from 'react';
import { User } from '../types';

interface VendorSubscriptionProps {
  user: User;
  onUpdateProfile: (userData: Partial<User>) => void;
  onClose: () => void;
}

const VendorSubscription: React.FC<VendorSubscriptionProps> = ({ user, onUpdateProfile, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!paymentConfirmed) {
      setError('Veuillez confirmer avoir effectué le paiement');
      return;
    }

    // Créer la demande de vendeur avec statut "pending"
    const vendorApplication = {
      isVendor: true,
      vendorStatus: 'pending' as const,
      vendorSubscription: {
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 jours
        paymentConfirmed: true,
        paymentMethod: 'Orange Money',
        amount: 5000
      },
      vendorApplicationDate: new Date().toISOString(),
      vendorCode: null, // Sera généré par l'admin après approbation
      adminMessage: null
    };

    onUpdateProfile(vendorApplication);
    setSuccess('📝 Demande de vendeur soumise ! L\'administrateur va valider votre demande dans les plus brefs délais.');

    // Rediriger après 3 secondes
    setTimeout(() => {
      onClose();
    }, 3000);
  };

  const handlePaymentConfirmation = () => {
    setPaymentConfirmed(true);
    setShowVerification(true);

    // Générer un code de validation aléatoire
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Simuler l'envoi du code
    alert(`📨 MESSAGE SIMULÉ DE GREEN MARKET:\n\nVotre code de validation vendeur est : ${code}`);

    onUpdateProfile({
      isVendor: true, // Mark as vendor immediately for data consistency, though status is pending
      vendorStatus: 'pending',
      vendorCode: code,
      vendorSubscription: {
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 jours
        amount: 5000,
        paymentMethod: 'Orange Money',
        paymentConfirmed: true,
        status: 'pending'
      }
    });
  };

  const handleCodeVerification = () => {
    if (verificationCode === user.vendorCode) {
      onUpdateProfile({
        vendorStatus: 'active',
        vendorSubscription: {
          ...user.vendorSubscription!,
          status: 'active'
        }
      });
      alert('🎉 Félicitations ! Votre compte vendeur est maintenant activé !');
      onClose();
    } else {
      alert('❌ Code incorrect. Veuillez réessayer.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[40px] p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#2D5A27]">Devenir Vendeur Premium</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </div>

        {!showVerification ? (
          <div className="space-y-6">
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
              <h3 className="font-bold text-orange-600 mb-2">📱 Instructions de Paiement</h3>
              <div className="space-y-3 text-sm">
                <p className="font-medium">Pour devenir vendeur premium, effectuez le paiement suivant :</p>

                <div className="bg-white rounded-xl p-3 border border-orange-200">
                  <p className="font-bold text-orange-600">Montant : 5 000 FCFA/mois</p>
                  <p className="font-mono text-xs mt-2">*144*2*1*07659801*5000#</p>
                </div>

                <div className="text-xs text-gray-600 space-y-1">
                  <p>1. Allez dans votre application Orange Money</p>
                  <p>2. Choisissez "Paiement" ou "Transfert"</p>
                  <p>3. Entrez le code ci-dessus</p>
                  <p>4. Confirmez la transaction</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <h3 className="font-bold text-blue-600 mb-2">✨ Avantages Vendeur</h3>
              <ul className="text-sm space-y-1">
                <li>• Vendre vos propres plantes</li>
                <li>• Accès au dashboard vendeur</li>
                <li>• Gestion complète de votre inventaire</li>
                <li>• Visibilité auprès des clients premium</li>
                <li>• Support prioritaire</li>
              </ul>
            </div>

            <button
              onClick={handlePaymentConfirmation}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-bold transition-all active:scale-95"
            >
              J'ai effectué le paiement
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
              <h3 className="font-bold text-green-600 mb-2">✅ Paiement Reçu !</h3>
              <p className="text-sm">Un code de validation a été envoyé à votre compte client.</p>
              <p className="text-xs text-gray-600 mt-2">Vérifiez vos messages pour trouver le code.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Code de Validation</label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                placeholder="Entrez le code à 6 caractères"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:outline-none font-mono text-lg text-center"
                maxLength={6}
              />
            </div>

            <button
              onClick={handleCodeVerification}
              disabled={verificationCode.length !== 6}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white py-4 rounded-2xl font-bold transition-all active:scale-95 disabled:cursor-not-allowed"
            >
              Valider mon compte vendeur
            </button>

            <button
              onClick={() => setShowVerification(false)}
              className="w-full text-gray-500 py-2 text-sm"
            >
              Retour aux instructions
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorSubscription;
