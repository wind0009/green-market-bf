import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, VendorProduct, Plant } from '../types';
import { plantService } from '../services/plantService';
import { userService } from '../services/userService';

interface VendorDashboardProps {
  user: User;
  onUpdateProfile: (userData: Partial<User>) => void;
}

const VendorDashboard: React.FC<VendorDashboardProps> = ({ user, onUpdateProfile }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'inventory' | 'stats'>('inventory');
  const [vendorProducts, setVendorProducts] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Plant | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [saving, setSaving] = useState(false);

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

  const compressImage = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // Qualité 0.7
      };
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        const compressed = await compressImage(result);
        setImagePreview(compressed);
        setFormData({ ...formData, image: compressed });
      };
      reader.readAsDataURL(file);
    }
  };

  // Charger les produits du vendeur depuis Firestore
  useEffect(() => {
    const loadVendorProducts = async () => {
      setLoading(true);
      try {
        const products = await plantService.getPlantsByVendor(user.id);
        setVendorProducts(products);
      } catch (error) {
        console.error("Failed to load vendor products", error);
      } finally {
        setLoading(false);
      }
    };

    if (user.id) {
      loadVendorProducts();
    }
  }, [user.id]);

  const saveProduct = async () => {
    setSaving(true);
    try {
      const productData: Partial<Plant> = {
        name: formData.name,
        localName: formData.localName,
        scientificName: formData.scientificName,
        price: Number(formData.price),
        category: formData.category,
        image: formData.image || imagePreview || `https://images.unsplash.com/photo-${Math.random().toString(36).substr(2, 10)}?auto=format&fit=crop&q=80&w=400`,
        description: formData.description,
        care: formData.care,
        stock: Number(formData.stock),
        vendorId: user.id,
        vendorName: user.name,
      };

      (productData as any).isPremium = true;

      if (!editingProduct) {
        productData.dateAdded = new Date().toISOString();
      }

      if (editingProduct) {
        await plantService.updatePlant(editingProduct.id, productData);
        setVendorProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...productData } as Plant : p));
      } else {
        const newId = await plantService.createPlant(productData as Plant);
        const newProduct = { ...productData, id: newId } as Plant;
        setVendorProducts([newProduct, ...vendorProducts]);
      }

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
    } catch (error) {
      console.error("Failed to save product", error);
      alert("Erreur lors de la sauvegarde du produit.");
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await plantService.deletePlant(id);
        setVendorProducts(vendorProducts.filter(p => p.id !== id));
      } catch (error) {
        console.error("Failed to delete product", error);
        alert("Impossible de supprimer le produit.");
      }
    }
  };

  const editProduct = (product: Plant) => {
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

  const generateVendorCode = async () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    try {
      await userService.updateUser(user.id, { vendorCode: code });
      onUpdateProfile({ vendorCode: code });
      navigator.clipboard.writeText(code).then(() => {
        alert(`🎉 Code vendeur : ${code} (copié)`);
      }).catch(() => {
        alert(`🎉 Code vendeur : ${code}`);
      });
    } catch (error) {
      console.error("Failed to generate code", error);
    }
  };

  if (loading && vendorProducts.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D5A27]"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 animate-fadeIn pb-32 bg-[#F8FAF8] min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#2D5A27]">Dashboard Vendeur</h1>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Espace Vendeur • {user.name}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={generateVendorCode} className="bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-600 transition-all">Générer Code</button>
          <button onClick={() => navigate('/')} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 shadow-sm border border-gray-100"><i className="fa-solid fa-house"></i></button>
        </div>
      </div>

      <div className="flex bg-gray-100 p-1 rounded-2xl">
        {['inventory', 'stats'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${activeTab === tab ? 'bg-[#2D5A27] text-white shadow-lg' : 'text-gray-400'}`}>{tab === 'inventory' ? 'Inventaire' : 'Statistiques'}</button>
        ))}
      </div>

      {activeTab === 'inventory' ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="font-bold text-[#2D5A27]">Mes Plantes</h2>
            <button onClick={() => setIsAdding(true)} className="bg-[#E2725B] text-white px-5 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-orange-100 active:scale-95 transition-all">+ Ajouter une plante</button>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {vendorProducts.map(product => (
              <div key={product.id} className="bg-white rounded-[28px] p-3 flex items-center gap-4 shadow-sm border border-gray-100 group">
                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-inner">
                  <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={product.name} />
                </div>
                <div className="flex-grow">
                  <h4 className="font-bold text-sm text-gray-800">{product.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black text-[#2D5A27]">{product.price} F</span>
                    <span className={`text-[10px] font-bold ${product.stock < 5 ? 'text-red-500' : 'text-gray-400'}`}>Stock: {product.stock}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => editProduct(product)} className="w-9 h-9 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center hover:bg-blue-100 transition-colors"><i className="fa-solid fa-pen text-xs"></i></button>
                  <button onClick={() => deleteProduct(product.id)} className="w-9 h-9 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-100 transition-colors"><i className="fa-solid fa-trash-can text-xs"></i></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-[32px] p-6 border border-gray-100">
            <h3 className="font-bold text-[#2D5A27] mb-4">Statistiques</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-2xl"><p className="text-[10px] text-gray-400 font-bold uppercase">Total</p><p className="text-2xl font-bold text-[#2D5A27]">{vendorProducts.length}</p></div>
              <div className="bg-gray-50 p-4 rounded-2xl"><p className="text-[10px] text-gray-400 font-bold uppercase">Valeur</p><p className="text-2xl font-bold text-[#2D5A27]">{vendorProducts.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString()} F</p></div>
            </div>
          </div>
        </div>
      )}

      {isAdding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[40px] p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#2D5A27]">{editingProduct ? 'Modifier' : 'Ajouter'}</h2>
              <button onClick={() => setIsAdding(false)} className="text-gray-400"><i className="fa-solid fa-times text-xl"></i></button>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200 group hover:border-[#2D5A27] transition-all cursor-pointer relative" onClick={() => document.getElementById('image-upload')?.click()}>
                {imagePreview ? (
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg">
                    <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <p className="text-white font-bold text-sm">Changer la photo</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 mx-auto shadow-sm">
                      <i className="fa-solid fa-camera text-2xl text-gray-400"></i>
                    </div>
                    <p className="text-sm font-bold text-gray-500">Ajouter une photo</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">PNG, JPG ou WEBP</p>
                  </div>
                )}
                <input
                  id="image-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>

              <input type="text" placeholder="Nom" className="w-full bg-gray-50 p-4 rounded-2xl font-bold" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              <input type="number" placeholder="Prix" className="w-full bg-gray-50 p-4 rounded-2xl font-bold" value={formData.price || ''} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} />
              <input type="number" placeholder="Stock" className="w-full bg-gray-50 p-4 rounded-2xl font-bold" value={formData.stock || ''} onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })} />
              <textarea placeholder="Description" className="w-full bg-gray-50 p-4 rounded-2xl font-medium h-32" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
              <button onClick={saveProduct} disabled={saving} className="w-full bg-[#E2725B] text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-orange-100 active:scale-95 transition-all">
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    Enregistrement...
                  </span>
                ) : (
                  'Enregistrer le produit'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
