import React, { useState, useEffect } from 'react';
import { VendorProduct, User, Plant } from '../types';
import { plantService } from '../services/plantService';
import { userService } from '../services/userService';
import { useNavigate } from 'react-router-dom';

// Helper to convert Plant to VendorProduct or similar display
// We can use Plant type directly since VendorProduct extends it
// or cast if we need specific vendor fields which should be present

interface VendorProductsProps {
  vendorId: string;
}

const VendorProducts: React.FC<VendorProductsProps> = ({ vendorId }) => {
  const navigate = useNavigate();
  const [vendorProducts, setVendorProducts] = useState<Plant[]>([]);
  const [vendorInfo, setVendorInfo] = useState<User | null>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Parallel data fetching
        const [products, vendor] = await Promise.all([
          plantService.getPlantsByVendor(vendorId),
          userService.getUserById(vendorId)
        ]);

        setVendorProducts(products);
        setVendorInfo(vendor);
      } catch (error) {
        console.error("Failed to load vendor data", error);
      } finally {
        setLoading(false);
      }
    };

    if (vendorId) {
      fetchData();
    }

    // Charger le panier
    const savedCart = localStorage.getItem('gm_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, [vendorId]);

  const addToCart = (product: VendorProduct) => {
    const existingItem = cart.find(item => item.id === product.id);
    let newCart;

    if (existingItem) {
      newCart = cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
    }

    setCart(newCart);
    localStorage.setItem('gm_cart', JSON.stringify(newCart));
    alert('✅ Produit ajouté au panier !');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAF8] flex items-center justify-center">
        <div className="text-center">
          <i className="fa-solid fa-spinner fa-spin text-4xl text-purple-600 mb-4"></i>
          <p className="text-gray-600">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 animate-fadeIn pb-32 bg-[#F8FAF8] min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-purple-600">Boutique {vendorInfo?.name}</h1>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Produits Exclusifs • Vendeur Premium</p>
        </div>
        <button onClick={() => window.location.hash = '#/'} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 shadow-sm border border-gray-100">
          <i className="fa-solid fa-house"></i>
        </button>
      </div>

      {vendorInfo && (
        <div className="bg-purple-50 rounded-[32px] p-6 border border-purple-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-purple-600">{vendorInfo.name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h3 className="font-bold text-purple-800">{vendorInfo.name}</h3>
              <p className="text-sm text-purple-600">Vendeur Premium • Code: {vendorInfo.vendorCode}</p>
              <p className="text-xs text-gray-500">Membre depuis {new Date(vendorInfo.vendorSubscription?.startDate || Date.now()).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}

      {vendorProducts.length === 0 ? (
        <div className="bg-white rounded-[32px] p-12 text-center border border-dashed border-gray-200">
          <i className="fa-solid fa-store text-4xl text-purple-100 mb-4 block"></i>
          <p className="text-gray-400 text-sm">Ce vendeur n'a pas encore de produits.</p>
          <p className="text-gray-400 text-xs mt-2">Revenez bientôt pour découvrir ses nouveautés !</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendorProducts.map(product => (
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
                    <p className="text-xs text-gray-400">par {product.vendorName}</p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

                <div className="flex items-center justify-between mb-3">
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

                <button
                  onClick={() => addToCart(product)}
                  disabled={product.stock === 0}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white py-3 rounded-2xl font-bold transition-all active:scale-95 disabled:cursor-not-allowed"
                >
                  {product.stock > 0 ? 'Ajouter au panier' : 'Rupture de stock'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-purple-50 rounded-[32px] p-6 border border-purple-100">
        <h3 className="font-bold text-purple-600 mb-3">🎯 Avantages de ce vendeur</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2 mx-auto">
              <i className="fa-solid fa-gem text-purple-600"></i>
            </div>
            <p className="text-sm font-bold text-gray-800">Produits Exclusifs</p>
            <p className="text-xs text-gray-600">Articles uniques et sélectionnés</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2 mx-auto">
              <i className="fa-solid fa-truck text-purple-600"></i>
            </div>
            <p className="text-sm font-bold text-gray-800">Livraison Rapide</p>
            <p className="text-xs text-gray-600">Expédition sous 24-48h</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2 mx-auto">
              <i className="fa-solid fa-shield-halved text-purple-600"></i>
            </div>
            <p className="text-sm font-bold text-gray-800">Garantie Vendeur</p>
            <p className="text-xs text-gray-600">Satisfaction ou remboursement</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProducts;
