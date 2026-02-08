import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { userService } from '../services/userService';

interface AdminVendorManagementProps {
  onClose: () => void;
}

const AdminVendorManagement: React.FC<AdminVendorManagementProps> = ({ onClose }) => {
  const [pendingVendors, setPendingVendors] = useState<User[]>([]);
  const [activeVendors, setActiveVendors] = useState<User[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<User | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      // Charger tous les utilisateurs
      const allUsers = await userService.getAllUsers();

      const vendors = allUsers.filter(u => u.isVendor);

      // Séparer les vendeurs en attente et actifs
      const pending = vendors.filter(v => v.vendorStatus === 'pending');
      const active = vendors.filter(v => v.vendorStatus === 'active' || v.vendorStatus === 'approved');

      setPendingVendors(pending);
      setActiveVendors(active);
    } catch (error) {
      console.error("Failed to load vendors", error);
    }
  };

  const approveVendor = async (vendor: User) => {
    if (!message.trim()) {
      alert('Veuillez ajouter un message pour le vendeur');
      return;
    }

    setLoading(true);

    // Générer un code vendeur
    const vendorCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Mettre à jour le vendeur
    const updates: Partial<User> = {
      vendorStatus: 'active' as const,
      vendorCode: vendorCode,
      vendorApprovalDate: new Date().toISOString(),
      adminMessage: message
    };

    try {
      await userService.updateUser(vendor.id, updates);

      // Envoyer un message de notification (simulé)
      alert(`✅ Vendeur approuvé !\n\nCode vendeur: ${vendorCode}\nMessage envoyé: ${message}`);

      // Réinitialiser
      setSelectedVendor(null);
      setMessage('');
      loadVendors();
    } catch (error) {
      console.error("Failed to approve vendor", error);
      alert("Erreur lors de l'approbation.");
    } finally {
      setLoading(false);
    }
  };

  const rejectVendor = async (vendor: User) => {
    if (!message.trim()) {
      alert('Veuillez ajouter un message expliquant le refus');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir refuser cette demande ?')) {
      return;
    }

    setLoading(true);

    // Mettre à jour le vendeur
    const updates: Partial<User> = {
      vendorStatus: 'rejected' as const,
      adminMessage: message
    };

    try {
      await userService.updateUser(vendor.id, updates);

      alert(`❌ Demande refusée. Message envoyé: ${message}`);

      // Réinitialiser
      setSelectedVendor(null);
      setMessage('');
      loadVendors();
    } catch (error) {
      console.error("Failed to reject vendor", error);
      alert("Erreur lors du refus.");
    } finally {
      setLoading(false);
    }
  };

  const deactivateVendor = async (vendor: User) => {
    if (!confirm(`Êtes-vous sûr de vouloir désactiver ${vendor.name} ?`)) {
      return;
    }

    const updates: Partial<User> = {
      vendorStatus: 'rejected' as const,
      adminMessage: 'Compte désactivé par l\'administrateur'
    };

    try {
      await userService.updateUser(vendor.id, updates);
      loadVendors();
    } catch (error) {
      console.error("Failed to deactivate vendor", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[40px] p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-orange-600">Gestion des Vendeurs</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <i className="fa-solid fa-times text-2xl"></i>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Demandes en attente */}
          <div>
            <h3 className="text-xl font-bold text-red-600 mb-4">
              📋 Demandes en Attente ({pendingVendors.length})
            </h3>
            <div className="space-y-4">
              {pendingVendors.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucune demande en attente</p>
              ) : (
                pendingVendors.map(vendor => (
                  <div key={vendor.id} className="bg-red-50 border border-red-200 rounded-2xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-red-800">{vendor.name}</h4>
                        <p className="text-sm text-red-600">{vendor.email || vendor.phone}</p>
                        <p className="text-xs text-gray-500">
                          Demande: {new Date(vendor.vendorApplicationDate || '').toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedVendor(vendor)}
                        className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700"
                      >
                        Traiter
                      </button>
                    </div>
                    {vendor.vendorSubscription && (
                      <div className="text-xs text-gray-600">
                        💰 {vendor.vendorSubscription.amount} FCFA • {vendor.vendorSubscription.paymentMethod}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Vendeurs actifs */}
          <div>
            <h3 className="text-xl font-bold text-green-600 mb-4">
              ✅ Vendeurs Actifs ({activeVendors.length})
            </h3>
            <div className="space-y-4">
              {activeVendors.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucun vendeur actif</p>
              ) : (
                activeVendors.map(vendor => (
                  <div key={vendor.id} className="bg-green-50 border border-green-200 rounded-2xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-green-800">{vendor.name}</h4>
                        <p className="text-sm text-green-600">{vendor.email || vendor.phone}</p>
                        <p className="text-xs font-mono text-green-700">Code: {vendor.vendorCode}</p>
                        <p className="text-xs text-gray-500">
                          Actif depuis: {new Date(vendor.vendorApprovalDate || '').toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => deactivateVendor(vendor)}
                        className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700"
                      >
                        Désactiver
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal de traitement */}
        {selectedVendor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-[40px] p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">
                Traitement: {selectedVendor.name}
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Message pour le vendeur
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Entrez votre message..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-orange-500 focus:outline-none h-32 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => approveVendor(selectedVendor)}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-3 rounded-2xl font-bold hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Traitement...' : '✅ Approuver'}
                </button>
                <button
                  onClick={() => rejectVendor(selectedVendor)}
                  disabled={loading}
                  className="flex-1 bg-red-600 text-white py-3 rounded-2xl font-bold hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Traitement...' : '❌ Refuser'}
                </button>
                <button
                  onClick={() => {
                    setSelectedVendor(null);
                    setMessage('');
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-2xl font-bold hover:bg-gray-400"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVendorManagement;
