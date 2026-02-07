import React, { useState, useEffect } from 'react';
import { User, VendorProduct } from '../types';

interface VendorDashboardProps {
  user: User;
  onUpdateProfile: (userData: Partial<User>) => void;
}

const VendorDashboard: React.FC<VendorDashboardProps> = ({ user, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'stats'>('inventory');
  const [vendorProducts, setVendorProducts] = useState<VendorProduct[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<VendorProduct | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    localName: '',
    scientificName: '',
    price: 0,
    category: 'Intérieur' as const,
    description: '',
    stock: 0,
    care: { water: '1 fois/semaine', sun: 'Lumière indirecte', difficulty: 'Facile' as const },
    image: ''
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData({...formData, image: result});
      };
      reader.readAsDataURL(file);
    }
  };

  // Charger les produits du vendeur depuis localStorage
  useEffect(() => {
    const savedProducts = localStorage.getItem(`vendor_products_${user.id}`);
    if (savedProducts) {
      setVendorProducts(JSON.parse(savedProducts));
    }
  }, [user.id]);

  // Sauvegarder les produits du vendeur
  useEffect(() => {
    if (vendorProducts.length > 0) {
      localStorage.setItem(`vendor_products_${user.id}`, JSON.stringify(vendorProducts));
    }
  }, [vendorProducts, user.id]);

  const saveProduct = () => {
    const product: VendorProduct = {
      id: editingProduct?.id || Math.random().toString(36).substr(2, 9),
      name: formData.name,
      localName: formData.localName,
      scientificName: formData.scientificName,
      price: formData.price,
      category: formData.category,
      image: formData.image || imagePreview || `https://images.unsplash.com/photo-${Math.random().toString(36).substr(2, 10)}?auto=format&fit=crop&q=80&w=400`,
      description: formData.description,
      care: formData.care,
      stock: formData.stock,
      dateAdded: new Date().toISOString(),
      vendorId: user.id,
      vendorName: user.name,
      isPremium: true
    };

    if (editingProduct) {
      setVendorProducts(vendorProducts.map(p => p.id === editingProduct.id ? product : p));
    } else {
      setVendorProducts([...vendorProducts, product]);
    }

    // Reset form
    setFormData({
      name: '',
      localName: '',
      scientificName: '',
      price: 0,
      category: 'Intérieur',
      description: '',
      stock: 0,
      care: { water: '1 fois/semaine', sun: 'Lumière indirecte', difficulty: 'Facile' },
      image: ''
    });
    setImagePreview('');
    setIsAdding(false);
    setEditingProduct(null);
  };

  const deleteProduct = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      setVendorProducts(vendorProducts.filter(p => p.id !== id));
    }
  };

  const editProduct = (product: VendorProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      localName: product.localName || '',
      scientificName: product.scientificName,
      price: product.price,
      category: product.category,
      description: product.description,
      stock: product.stock,
      care: product.care,
      image: product.image
    });
    setImagePreview(product.image);
    setIsAdding(true);
  };

  const generateVendorCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    onUpdateProfile({ vendorCode: code });
    alert(`Code vendeur généré : ${code}\n\nPartagez ce code à vos clients premium !`);
  };

  return (
    <div className="p-4 space-y-6 animate-fadeIn pb-32 bg-[#F8FAF8] min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#2D5A27]">Dashboard Vendeur</h1>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Espace Vendeur • {user.name}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={generateVendorCode}
            className="bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-600 transition-all"
          >
            Générer Code
          </button>
          <button onClick={() => window.location.hash = '#/'} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 shadow-sm border border-gray-100">
            <i className="fa-solid fa-house"></i>
          </button>
        </div>
      </div>

      <div className="flex bg-gray-100 p-1 rounded-2xl">
        {['inventory', 'stats'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${activeTab === tab ? 'bg-[#2D5A27] text-white shadow-lg' : 'text-gray-400'}`}
          >
            {tab === 'inventory' ? 'Inventaire' : 'Statistiques'}
          </button>
        ))}
      </div>

      {activeTab === 'inventory' ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="font-bold text-[#2D5A27]">Mes Plantes</h2>
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-[#E2725B] text-white px-5 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-orange-100 active:scale-95 transition-all"
            >
              + Ajouter une plante
            </button>
          </div>

          {vendorProducts.length === 0 ? (
            <div className="bg-white rounded-[32px] p-12 text-center border border-dashed border-gray-200">
              <i className="fa-solid fa-seedling text-4xl text-gray-100 mb-4 block"></i>
              <p className="text-gray-400 text-sm">Aucune plante dans votre inventaire.</p>
              <p className="text-gray-400 text-xs mt-2">Ajoutez vos premières plantes pour commencer à vendre !</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {vendorProducts.map(product => (
                <div key={product.id} className="bg-white rounded-[28px] p-3 flex items-center gap-4 shadow-sm border border-gray-100 group">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-inner">
                    <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-bold text-sm text-gray-800">{product.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-black text-[#2D5A27]">{product.price} F</span>
                      <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                      <span className={`text-[10px] font-bold ${product.stock < 5 ? 'text-red-500' : 'text-gray-400'}`}>Stock: {product.stock}</span>
                      <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                      <span className="text-[10px] font-bold text-purple-600">Premium</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => editProduct(product)} className="w-9 h-9 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center hover:bg-blue-100 transition-colors">
                      <i className="fa-solid fa-pen text-xs"></i>
                    </button>
                    <button onClick={() => deleteProduct(product.id)} className="w-9 h-9 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-100 transition-colors">
                      <i className="fa-solid fa-trash-can text-xs"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-[32px] p-6 border border-gray-100">
            <h3 className="font-bold text-[#2D5A27] mb-4">Statistiques de Vente</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Total Plantes</p>
                <p className="text-2xl font-bold text-[#2D5A27]">{vendorProducts.length}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Valeur Stock</p>
                <p className="text-2xl font-bold text-[#2D5A27]">
                  {vendorProducts.reduce((sum, p) => sum + (p.price * p.stock), 0)} F
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-6 border border-gray-100">
            <h3 className="font-bold text-[#2D5A27] mb-4">Code Vendeur Actuel</h3>
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 text-center">
              <p className="text-3xl font-mono font-bold text-green-600">{user.vendorCode || 'Non généré'}</p>
            </div>
            <button 
              onClick={generateVendorCode}
              className="w-full mt-4 bg-green-500 text-white py-3 rounded-2xl font-bold hover:bg-green-600 transition-all"
            >
              Générer Nouveau Code
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[40px] p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#2D5A27]">
                {editingProduct ? 'Modifier la Plante' : 'Ajouter une Plante'}
              </h2>
              <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600">
                <i className="fa-solid fa-times text-xl"></i>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                  <label className="text-[10px] uppercase font-black text-[#2D5A27]/40 mb-2 block">Nom de la plante</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Monstera Deliciosa"
                    className="w-full bg-transparent font-bold outline-none" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                  <label className="text-[10px] uppercase font-black text-[#2D5A27]/40 mb-2 block">Nom local</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Monstera"
                    className="w-full bg-transparent font-bold outline-none" 
                    value={formData.localName} 
                    onChange={e => setFormData({...formData, localName: e.target.value})}
                  />
                </div>

                <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                  <label className="text-[10px] uppercase font-black text-[#2D5A27]/40 mb-2 block">Nom scientifique</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Monstera deliciosa"
                    className="w-full bg-transparent font-bold outline-none" 
                    value={formData.scientificName} 
                    onChange={e => setFormData({...formData, scientificName: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                    <label className="text-[10px] uppercase font-black text-[#2D5A27]/40 mb-2 block">Prix (FCFA)</label>
                    <input 
                      type="number"
                      placeholder="5000"
                      className="w-full bg-transparent font-bold outline-none" 
                      value={formData.price || ''} 
                      onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                    />
                  </div>
                  <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                    <label className="text-[10px] uppercase font-black text-[#2D5A27]/40 mb-2 block">Stock initial</label>
                    <input 
                      type="number"
                      placeholder="10"
                      className="w-full bg-transparent font-bold outline-none" 
                      value={formData.stock || ''} 
                      onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                  <label className="text-[10px] uppercase font-black text-[#2D5A27]/40 mb-2 block">Catégorie</label>
                  <select 
                    className="w-full bg-transparent font-bold outline-none appearance-none cursor-pointer"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value as any})}
                  >
                    {['Intérieur', 'Jardin', 'Ombre', 'Soleil', 'Arbre', 'Potager', 'Médicinale', 'Fruitier', 'Cactus', 'Palmier', 'Arbuste'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                  <label className="text-[10px] uppercase font-black text-[#2D5A27]/40 mb-2 block">Description & Conseils</label>
                  <textarea 
                    placeholder="Ajoutez vos conseils d'entretien ici..."
                    className="w-full bg-transparent font-medium text-sm outline-none h-32 resize-none leading-relaxed"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  ></textarea>
                </div>

                <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                  <label className="text-[10px] uppercase font-black text-[#2D5A27]/40 mb-2 block">Photo du Produit</label>
                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center">
                      {imagePreview ? (
                        <div className="relative">
                          <img src={imagePreview} className="w-full h-32 object-cover rounded-xl" />
                          <button
                            onClick={() => {
                              setImagePreview('');
                              setFormData({...formData, image: ''});
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs"
                          >
                            <i className="fa-solid fa-times"></i>
                          </button>
                        </div>
                      ) : (
                        <div>
                          <i className="fa-solid fa-camera text-3xl text-gray-300 mb-2 block"></i>
                          <p className="text-sm text-gray-400">Cliquez pour ajouter une photo</p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Formats acceptés : JPG, PNG, GIF (max 5MB)</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                  <label className="text-[10px] uppercase font-black text-[#2D5A27]/40 mb-2 block">URL Image (optionnel)</label>
                  <input 
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    className="w-full bg-transparent font-bold outline-none text-sm" 
                    value={formData.image}
                    onChange={e => setFormData({...formData, image: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 border-t border-gray-100 pb-10 mt-6">
              <button 
                onClick={saveProduct}
                disabled={!formData.name || !formData.price}
                className="w-full bg-[#E2725B] text-white py-4 rounded-[24px] font-black text-sm uppercase tracking-widest shadow-xl shadow-orange-100 active:scale-95 disabled:opacity-50 transition-all"
              >
                {editingProduct ? 'Mettre à jour' : 'Ajouter à mon inventaire'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
