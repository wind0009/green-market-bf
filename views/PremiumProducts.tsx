import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { VendorProduct, User, Plant } from '../types';
import { plantService } from '../services/plantService';
import { userService } from '../services/userService';

// Helper to check/cast if needed, though we will just use Plant for now
// assuming premium plants have vendor info

interface PremiumProductsProps {
  vendorCode?: string;
}

const PremiumProducts: React.FC<PremiumProductsProps> = ({ vendorCode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [allVendorProducts, setAllVendorProducts] = useState<Plant[]>([]);
  const [accessCode, setAccessCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vendorName, setVendorName] = useState<string>('');
  const [vendorId, setVendorId] = useState<string>('');

  // Charger tous les produits vendeurs (premium)
  useEffect(() => {
    const loadAllVendorProducts = async () => {
      const products = await plantService.getPremiumPlants();
      setAllVendorProducts(products);
    };

    loadAllVendorProducts();
  }, []);

  // Vérifier si un code est fourni dans l'URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const code = urlParams.get('code') || vendorCode;
    if (code) {
      setAccessCode(code.toUpperCase());
      verifyCode(code.toUpperCase());
    }
  }, [vendorCode]);

  const verifyCode = async (code: string) => {
    setLoading(true);

    try {
      // Chercher directement le vendeur correspondant au code
      const foundVendor = await userService.findVendorByCode(code.toUpperCase());

      if (foundVendor && foundVendor.vendorStatus === 'active') { // Ensure active
        setIsAuthenticated(true);
        setVendorName(foundVendor.name);
        setVendorId(foundVendor.id);

        // Sauvegarder l'accès pour cet utilisateur (Optional: migrate to Firestore user profile later)
        // For now, local storage for "unlocked" vendors is okay for client-side state
        const currentUserId = localStorage.getItem('gm_current_user_id'); // We should use auth context really, but keeping legacy structure for now
        if (currentUserId) {
          const userVendors = JSON.parse(localStorage.getItem(`user_vendors_${currentUserId}`) || '[]');
          if (!userVendors.some((v: any) => v.vendorId === foundVendor.id)) {
            userVendors.push({
              vendorId: foundVendor.id,
              vendorName: foundVendor.name,
              vendorCode: code.toUpperCase(),
              accessDate: new Date().toISOString()
            });
            localStorage.setItem(`user_vendors_${currentUserId}`, JSON.stringify(userVendors));
          }
        }

        // Filter displayed products to ONLY this vendor's products if authenticated via code
        // Or should we show ALL premium products?
        // Original code:
        // const vendorProducts = JSON.parse(localStorage.getItem(`vendor_products_${foundVendor.id}`) || '[]');
        // setAllVendorProducts(vendorProducts);
        // It showed ONLY the specific vendor's products after code entry.

        const vendorProducts = await plantService.getPlantsByVendor(foundVendor.id);
        setAllVendorProducts(vendorProducts);

        alert(`🎉 Accès autorisé ! Bienvenue chez ${foundVendor.name}`);
      } else {
        setError('Code vendeur invalide ou expiré');
      }
    } catch (err: any) {
      console.error(err);
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyCode(accessCode);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8FAF8] flex items-center justify-center p-4">
        <div className="bg-white rounded-[40px] p-8 max-w-md w-full shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <i className="fa-solid fa-crown text-3xl text-purple-600"></i>
            </div>
            <h1 className="text-2xl font-bold text-[#2D5A27] mb-2">Accès Premium</h1>
            <p className="text-gray-400 text-sm">Entrez le code de votre vendeur pour accéder aux produits exclusifs</p>
          </div>

          <form onSubmit={handleAccessSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Code Vendeur</label>
              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                placeholder="Entrez le code à 6 caractères"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:outline-none font-mono text-lg text-center"
                maxLength={6}
                required
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || accessCode.length !== 6}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white py-4 rounded-2xl font-bold transition-all active:scale-95 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  <span>Vérification...</span>
                </div>
              ) : (
                'Accéder aux Produits Premium'
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-purple-50 rounded-2xl">
            <h3 className="font-bold text-purple-600 mb-2">🌟 Comment obtenir un code ?</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Contactez un vendeur partenaire</p>
              <p>• Devenez vendeur vous-même (5 000 FCFA/mois)</p>
              <p>• Le code vous donne accès à des produits exclusifs</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 animate-fadeIn pb-32 bg-[#F8FAF8] min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-purple-600">Produits Premium</h1>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Collection Exclusives • Vendeurs Partenaires</p>
        </div>
        <button onClick={() => window.location.hash = '#/'} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 shadow-sm border border-gray-100">
          <i className="fa-solid fa-house"></i>
        </button>
      </div>

      {allVendorProducts.length === 0 ? (
        <div className="bg-white rounded-[32px] p-12 text-center border border-dashed border-gray-200">
          <i className="fa-solid fa-gem text-4xl text-purple-100 mb-4 block"></i>
          <p className="text-gray-400 text-sm">Aucun produit premium disponible actuellement.</p>
          <p className="text-gray-400 text-xs mt-2">Revenez plus tard pour découvrir de nouvelles exclusivités !</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allVendorProducts.map(product => (
            <div key={product.id} className="bg-white rounded-[32px] overflow-hidden shadow-lg border border-purple-100 group hover:shadow-xl transition-all">
              <div className="relative">
                <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                  EXCLUSIF
                </div>
                <div className="h-48 overflow-hidden">
                  <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
              </div>

              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-800">{product.name}</h3>
                    <p className="text-xs text-gray-500">{product.localName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-purple-600">{product.price} F</p>
                    {/* Assuming vendorName is present in typical vendor product data */}
                    <p className="text-xs text-gray-400">par {(product as any).vendorName || 'Vendeur Partenaire'}</p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${product.stock < 5 ? 'text-red-500' : 'text-green-500'}`}>
                      {product.stock > 0 ? `${product.stock} en stock` : 'Rupture'}
                    </span>
                    <span className="text-xs text-gray-400">• {product.category}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <i className="fa-solid fa-star text-yellow-400 text-xs"></i>
                    <span className="text-xs font-bold text-purple-600">Premium</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-purple-50 rounded-[32px] p-6 border border-purple-100">
        <h3 className="font-bold text-purple-600 mb-3">🎯 Avantages Premium</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2 mx-auto">
              <i className="fa-solid fa-gem text-purple-600"></i>
            </div>
            <p className="text-sm font-bold text-gray-800">Produits Exclusifs</p>
            <p className="text-xs text-gray-600">Accès à des plantes uniques</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2 mx-auto">
              <i className="fa-solid fa-truck text-purple-600"></i>
            </div>
            <p className="text-sm font-bold text-gray-800">Livraison Prioritaire</p>
            <p className="text-xs text-gray-600">Expédition rapide garantie</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2 mx-auto">
              <i className="fa-solid fa-headset text-purple-600"></i>
            </div>
            <p className="text-sm font-bold text-gray-800">Support VIP</p>
            <p className="text-xs text-gray-600">Assistance dédiée 24/7</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumProducts;
