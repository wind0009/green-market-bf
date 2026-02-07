
import React, { useState, useRef, useEffect } from 'react';
import { Order, Plant, Category, User } from '../types';
import { userService } from '../services/userService';

interface AdminProps {
  orders: Order[];
  plants: Plant[];
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onAddPlant: (plant: Plant) => void;
  onUpdatePlant: (plant: Plant) => void;
  onDeletePlant: (id: string) => void;
}

const Admin: React.FC<AdminProps> = ({ orders, plants, onUpdateOrderStatus, onAddPlant, onUpdatePlant, onDeletePlant }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'stats' | 'users'>('orders');
  const [isAdding, setIsAdding] = useState(false);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Plant>>({
    name: '',
    scientificName: '',
    price: 0,
    category: 'Intérieur',
    description: '',
    stock: 0,
    care: { water: '1 fois/semaine', sun: 'Ombre', difficulty: 'Facile' }
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [capturedImage, setCapturedImage] = useState<string>('');

  // Charger les utilisateurs
  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const allUsers = await userService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const savePlant = () => {
    const plant: Plant = {
      id: editingPlant?.id || Math.random().toString(36).substr(2, 9),
      name: formData.name || '',
      scientificName: formData.scientificName || '',
      price: formData.price || 0,
      category: formData.category || 'Intérieur',
      description: formData.description || '',
      stock: formData.stock || 0,
      care: formData.care || { water: '1 fois/semaine', sun: 'Ombre', difficulty: 'Facile' },
      image: capturedImage || editingPlant?.image || 'https://images.unsplash.com/photo-1545239351-ef35f43d514b?auto=format&fit=crop&q=80&w=400',
      dateAdded: editingPlant?.dateAdded || new Date().toISOString()
    };

    if (editingPlant) {
      onUpdatePlant(plant);
    } else {
      onAddPlant(plant);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingPlant(null);
    setFormData({
      name: '',
      scientificName: '',
      price: 0,
      category: 'Intérieur',
      description: '',
      stock: 0,
      care: { water: '1 fois/semaine', sun: 'Ombre', difficulty: 'Facile' }
    });
    setCapturedImage('');
  };

  const editPlant = (plant: Plant) => {
    setEditingPlant(plant);
    setFormData(plant);
    setIsAdding(true);
  };

  return (
    <div className="p-4 space-y-6 animate-fadeIn pb-32">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#2D5A27]">Dashboard Créateur</h1>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Gestion Privée • Green Market BF</p>
        </div>
        <button onClick={() => window.location.hash = '#/'} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 shadow-sm border border-gray-100">
           <i className="fa-solid fa-house"></i>
        </button>
      </div>

      <div className="flex bg-gray-100 p-1 rounded-2xl">
        {['orders', 'inventory', 'users'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${activeTab === tab ? 'bg-[#2D5A27] text-white shadow-lg' : 'text-gray-400'}`}
          >
            {tab === 'orders' ? 'Commandes' : tab === 'inventory' ? 'Inventaire' : 'Utilisateurs'}
          </button>
        ))}
      </div>

      {activeTab === 'orders' ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="font-bold text-[#2D5A27]">Flux des commandes</h2>
            <span className="text-[10px] font-bold bg-white px-2 py-1 rounded-lg border border-gray-100">{orders.length} au total</span>
          </div>
          {orders.length === 0 ? (
            <div className="bg-white rounded-[32px] p-12 text-center border border-dashed border-gray-200">
               <i className="fa-solid fa-box-open text-4xl text-gray-100 mb-4 block"></i>
               <p className="text-gray-400 text-sm">Aucune commande reçue.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-white rounded-[32px] p-5 shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#E2725B]/10 rounded-2xl flex items-center justify-center text-[#E2725B]">
                      <i className="fa-solid fa-user text-sm"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm leading-tight">{order.customer.name}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{order.customer.city} • {order.customer.district}</p>
                    </div>
                  </div>
                  <select 
                    value={order.status}
                    onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as any)}
                    className={`text-[9px] font-black px-3 py-1.5 rounded-xl border-none outline-none appearance-none cursor-pointer transition-colors ${
                      order.status === 'Livrée' ? 'bg-green-100 text-green-700' : 
                      order.status === 'En attente' ? 'bg-orange-100 text-orange-700' : 
                      order.status === 'Validée' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <option value="En attente">En attente</option>
                    <option value="Validée">Validée</option>
                    <option value="Livrée">Livrée</option>
                    <option value="Annulée">Annulée</option>
                  </select>
                </div>
                
                <div className="bg-gray-50 rounded-2xl p-3 mb-4 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-gray-400">
                    <span>PANIER</span>
                    <span className="text-[#2D5A27]">{order.items.length} plantes</span>
                  </div>
                  <div className="text-xs text-gray-600 font-medium leading-relaxed">
                    {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <a href={`tel:${order.customer.phone}`} className="flex items-center gap-2 bg-[#2D5A27]/5 px-3 py-2 rounded-xl">
                    <i className="fa-solid fa-phone text-[#2D5A27] text-xs"></i>
                    <span className="text-xs font-black text-[#2D5A27]">{order.customer.phone}</span>
                  </a>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Total Payé</p>
                    <p className="font-black text-lg text-[#2D5A27]">{order.total} F</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : activeTab === 'users' ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="font-bold text-[#2D5A27]">Base de données utilisateurs</h2>
            <span className="text-[10px] font-bold bg-white px-2 py-1 rounded-lg border border-gray-100">{users.length} inscrits</span>
          </div>
          
          {loadingUsers ? (
            <div className="bg-white rounded-[32px] p-12 text-center border border-dashed border-gray-200">
              <i className="fa-solid fa-spinner fa-spin text-4xl text-gray-300 mb-4 block"></i>
              <p className="text-gray-400 text-sm">Chargement des utilisateurs...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="bg-white rounded-[32px] p-12 text-center border border-dashed border-gray-200">
              <i className="fa-solid fa-users text-4xl text-gray-100 mb-4 block"></i>
              <p className="text-gray-400 text-sm">Aucun utilisateur inscrit.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="bg-white rounded-[32px] p-5 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#2D5A27]/10 rounded-2xl flex items-center justify-center">
                        <span className="text-lg font-bold text-[#2D5A27]">{user.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{user.name}</h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-400">+226 {user.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {user.isAdmin && (
                        <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-full">ADMIN</span>
                      )}
                      <span className="bg-green-100 text-green-600 text-xs font-bold px-2 py-1 rounded-full">
                        {user.isProfileComplete ? 'Complet' : 'Incomplet'}
                      </span>
                    </div>
                  </div>
                  
                  {user.addresses && user.addresses.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-400 font-bold mb-2">ADRESSES ({user.addresses.length})</p>
                      <div className="space-y-1">
                        {user.addresses.map((address, index) => (
                          <div key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                            <span className="font-bold">{address.district}</span>, {address.city} - {address.landmark}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="font-bold text-[#2D5A27]">Gestion des plantes</h2>
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-[#E2725B] text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-100 active:scale-95 transition-all"
            >
              + Ajouter Express
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {plants.map(p => (
              <div key={p.id} className="bg-white rounded-[28px] p-3 flex items-center gap-4 shadow-sm border border-gray-100 group">
                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-inner">
                  <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex-grow">
                  <h4 className="font-bold text-sm text-gray-800">{p.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black text-[#2D5A27]">{p.price} F</span>
                    <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                    <span className={`text-[10px] font-bold ${p.stock < 5 ? 'text-red-500' : 'text-gray-400'}`}>Stock: {p.stock}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => editPlant(p)} className="w-9 h-9 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center hover:bg-blue-100 transition-colors">
                    <i className="fa-solid fa-pen text-xs"></i>
                  </button>
                  <button onClick={() => onDeletePlant(p.id)} className="w-9 h-9 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-100 transition-colors">
                    <i className="fa-solid fa-trash-can text-xs"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Modal (Full Screen Slide Up) */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end">
          <div className="bg-[#F5F5F5] w-full max-w-md mx-auto rounded-t-[40px] shadow-2xl overflow-hidden h-[95vh] flex flex-col animate-slideIn">
            {/* Modal Header */}
            <div className="bg-white p-6 flex justify-between items-center border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#E2725B]/10 text-[#E2725B] rounded-2xl flex items-center justify-center">
                  <i className="fa-solid fa-leaf"></i>
                </div>
                <h2 className="text-xl font-bold text-[#2D5A27]">{editingPlant ? 'Modifier la fiche' : 'Mise en ligne express'}</h2>
              </div>
              <button onClick={resetForm} className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-gray-500">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {/* Photo Area */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-64 bg-white rounded-[32px] overflow-hidden flex flex-col items-center justify-center border-2 border-dashed border-[#2D5A27]/20 cursor-pointer relative group transition-all hover:border-[#2D5A27]/40 shadow-sm"
              >
                {capturedImage || (editingPlant && editingPlant.image) ? (
                  <>
                    <img src={capturedImage || editingPlant?.image} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <i className="fa-solid fa-camera text-3xl text-white"></i>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-[#2D5A27]/5 rounded-full flex items-center justify-center mb-3">
                      <i className="fa-solid fa-camera text-3xl text-[#2D5A27]/20"></i>
                    </div>
                    <p className="text-xs text-[#2D5A27]/40 font-black uppercase tracking-widest">Prendre une photo</p>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  capture="environment" 
                  className="hidden" 
                  onChange={handleImageCapture}
                />
              </div>

              {/* Input Fields */}
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                  <label className="text-[10px] uppercase font-black text-[#2D5A27]/40 mb-2 block">Nom de la plante</label>
                  <input 
                    placeholder="Ex: Monstera Deliciosa"
                    className="w-full bg-transparent text-lg font-bold outline-none placeholder:text-gray-200" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                    onChange={e => setFormData({...formData, category: e.target.value as Category})}
                  >
                    {['Intérieur', 'Jardin', 'Ombre', 'Soleil', 'Arbre', 'Potager', 'Médicinale', 'Fruitier'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                  <label className="text-[10px] uppercase font-black text-[#2D5A27]/40 mb-2 block">Description & Conseils</label>
                  <textarea 
                    placeholder="Ajoutez vos conseils d'entretien ici..."
                    className="w-full bg-transparent font-medium text-sm outline-none h-32 resize-none leading-relaxed"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-white p-6 border-t border-gray-100 pb-10">
              <button 
                onClick={savePlant}
                disabled={!formData.name || !formData.price}
                className="w-full bg-[#E2725B] text-white py-4 rounded-[24px] font-black text-sm uppercase tracking-widest shadow-xl shadow-orange-100 active:scale-95 disabled:opacity-50 transition-all"
              >
                {editingPlant ? 'Mettre à jour' : 'Mettre en ligne'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
