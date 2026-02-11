import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Plant, Order } from '../types';
import { userService } from '../services/userService';
import { plantService } from '../services/plantService';
import { orderService } from '../services/orderService';
import AdminProductValidation from '../components/AdminProductValidation';

const AdminDashboard: React.FC<{ user: User }> = ({ user }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'inventory' | 'orders'>('overview');
    const [users, setUsers] = useState<User[]>([]);
    const [products, setProducts] = useState<Plant[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [messageModal, setMessageModal] = useState<{ isOpen: boolean; targetUser: User | null }>({ isOpen: false, targetUser: null });
    const [editProductModal, setEditProductModal] = useState<{ isOpen: boolean; product: Plant | null }>({ isOpen: false, product: null });
    const [adminMsg, setAdminMsg] = useState('');
    const [editFormData, setEditFormData] = useState<Partial<Plant>>({});
    const [vendorFilter, setVendorFilter] = useState<string>('all');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [allUsers, allProducts, allOrders] = await Promise.all([
                    userService.getAllUsers(),
                    plantService.getAllPlants(),
                    orderService.getAllOrders()
                ]);
                setUsers(allUsers);
                setProducts(allProducts);
                setOrders(allOrders);
            } catch (error) {
                console.error("Admin data fetch error", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleDeleteProduct = async (id: string) => {
        if (window.confirm("Supprimer définitivement ce produit de l'application ?")) {
            await plantService.deletePlant(id);
            setProducts(prev => prev.filter(p => p.id !== id));
        }
    };

    const handleSendMessage = async () => {
        if (messageModal.targetUser && adminMsg) {
            await userService.updateUser(messageModal.targetUser.id, { adminMessage: adminMsg });
            alert(`Message envoyé à ${messageModal.targetUser.name}`);
            setMessageModal({ isOpen: false, targetUser: null });
            setAdminMsg('');
        }
    };

    const toggleVendorStatus = async (targetUser: User) => {
        const newStatus = !targetUser.isVendor;
        const newRole = newStatus ? 'vendeur' : 'client';
        await userService.updateUser(targetUser.id, {
            isVendor: newStatus,
            role: newRole as any
        });
        setUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, isVendor: newStatus, role: newRole as any } : u));
    };

    const handleGrantVendorWithCode = async (targetUser: User) => {
        const code = 'GM-' + Math.random().toString(36).substring(2, 7).toUpperCase();
        const message = `Félicitations ! Vous avez été promu au rang de Vendeur. Votre code d'accès est : ${code}. Vous pouvez maintenant accéder à votre Dashboard Vendeur.`;

        await userService.updateUser(targetUser.id, {
            isVendor: true,
            role: 'vendeur',
            vendorCode: code,
            vendorStatus: 'active', // Directement actif une fois approuvé par l'admin (+ code envoyé)
            adminMessage: message
        });

        setUsers(prev => prev.map(u => u.id === targetUser.id ? {
            ...u,
            isVendor: true,
            role: 'vendeur',
            vendorCode: code,
            vendorStatus: 'active',
            adminMessage: message
        } : u));

        alert(`Accès vendeur accordé à ${targetUser.name}. Code envoyé : ${code}`);
    };

    const openEditModal = (p: Plant) => {
        setEditProductModal({ isOpen: true, product: p });
        setEditFormData({ ...p });
    };

    const handleUpdateProduct = async () => {
        if (editProductModal.product && editFormData) {
            await plantService.updatePlant(editProductModal.product.id, editFormData);
            setProducts(prev => prev.map(p => p.id === editProductModal.product?.id ? { ...p, ...editFormData } as Plant : p));
            setEditProductModal({ isOpen: false, product: null });
            alert("Produit mis à jour avec succès !");
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><i className="fa-solid fa-spinner fa-spin text-3xl text-green-600"></i></div>;

    return (
        <div className="p-4 bg-[#F8FAF8] min-h-screen pb-20">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-black text-[#2D5A27]">Tour de Contrôle</h1>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Mode Super-Admin • Accès Total</p>
                </div>
                <button onClick={() => navigate('/')} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm"><i className="fa-solid fa-house text-gray-400"></i></button>
            </div>

            <div className="flex bg-white p-1 rounded-2xl shadow-sm mb-6 border border-gray-100 overflow-x-auto">
                {[
                    { id: 'overview', label: 'Dashboard', icon: 'chart-line' },
                    { id: 'users', label: 'Utilisateurs', icon: 'users' },
                    { id: 'inventory', label: 'Inventaire', icon: 'boxes-stacked' },
                    { id: 'orders', label: 'Commandes', icon: 'receipt' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold text-[10px] uppercase flex items-center justify-center gap-2 transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-[#2D5A27] text-white shadow-md' : 'text-gray-400'}`}
                    >
                        <i className={`fa-solid fa-${tab.icon}`}></i>
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                        <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Total Utilisateurs</p>
                        <p className="text-3xl font-black text-[#2D5A27]">{users.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                        <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Total Plantes</p>
                        <p className="text-3xl font-black text-[#2D5A27]">{products.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm col-span-2">
                        <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Chiffre d'Affaires Total</p>
                        <p className="text-3xl font-black text-blue-600">
                            {orders.reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString()} F
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm col-span-2">
                        <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Produits en Attente</p>
                        <p className="text-3xl font-black text-red-500">{products.filter(p => p.status === 'pending').length}</p>
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="space-y-3">
                    <div className="bg-blue-50 p-4 rounded-3xl border border-blue-100 mb-4">
                        <p className="text-[10px] text-blue-600 font-black uppercase mb-1">Supervision des Vendeurs</p>
                        <p className="text-xs text-blue-800/60 leading-tight">Accédez aux boutiques et gérez les comptes vendeurs en toute autorité.</p>
                    </div>

                    {/* Demandes en attente */}
                    {users.filter(u => u.vendorStatus === 'pending').length > 0 && (
                        <div className="mb-6 space-y-3">
                            <p className="text-[10px] font-black text-orange-500 uppercase px-2">Demandes d'accès à valider</p>
                            {users.filter(u => u.vendorStatus === 'pending').map(u => (
                                <div key={u.id} className="bg-orange-50 p-4 rounded-[24px] border border-orange-100 shadow-sm flex items-center justify-between animate-pulse">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center font-bold text-orange-600">{u.name.charAt(0)}</div>
                                        <div>
                                            <h4 className="font-bold text-sm">{u.name}</h4>
                                            <p className="text-[10px] text-orange-400">{u.phone}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleGrantVendorWithCode(u)}
                                        className="bg-orange-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-900/20"
                                    >
                                        Approuver
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    {users.map(u => (
                        <div key={u.id} className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-[#2D5A27]">{u.name.charAt(0)}</div>
                                <div>
                                    <h4 className="font-bold text-sm">{u.name}</h4>
                                    <p className="text-[10px] text-gray-400">{u.phone}</p>
                                    <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase ${u.role === 'super-admin' ? 'bg-purple-100 text-purple-600' : u.isVendor ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>
                                        {u.role || 'client'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {u.isVendor && (
                                    <button
                                        onClick={() => navigate(`/vendor-products/${u.id}`)}
                                        className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center"
                                        title="Voir Boutique"
                                    >
                                        <i className="fa-solid fa-eye text-xs"></i>
                                    </button>
                                )}
                                <button
                                    onClick={() => setMessageModal({ isOpen: true, targetUser: u })}
                                    className="w-8 h-8 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center"
                                    title="Envoyer un message"
                                >
                                    <i className="fa-solid fa-paper-plane text-xs"></i>
                                </button>
                                {!u.isAdmin && (
                                    <>
                                        <button
                                            onClick={() => handleGrantVendorWithCode(u)}
                                            className="w-8 h-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center"
                                            title="Donner accès vendeur + Code"
                                        >
                                            <i className="fa-solid fa-key text-xs"></i>
                                        </button>
                                        <button
                                            onClick={() => toggleVendorStatus(u)}
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${u.isVendor ? 'bg-orange-50 text-orange-500' : 'bg-gray-50 text-gray-400'}`}
                                            title={u.isVendor ? "Révoquer accès vendeur" : "Activer vendeur direct"}
                                        >
                                            <i className="fa-solid fa-store text-xs"></i>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'inventory' && (
                <div className="space-y-4">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        <button
                            onClick={() => setVendorFilter('all')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${vendorFilter === 'all' ? 'bg-[#2D5A27] text-white shadow-md' : 'bg-white text-gray-400 border border-gray-100'}`}
                        >
                            Tous les produits
                        </button>
                        {Array.from(new Set(products.filter(p => p.vendorName).map(p => p.vendorName))).map(vendor => (
                            <button
                                key={vendor}
                                onClick={() => setVendorFilter(vendor || 'all')}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${vendorFilter === vendor ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-gray-400 border border-gray-100'}`}
                            >
                                {vendor}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-3">
                        {products
                            .filter(p => vendorFilter === 'all' || p.vendorName === vendorFilter)
                            .sort((a, b) => (a.status === 'pending' ? -1 : 1))
                            .map(p => (
                                <div key={p.id} className="bg-white p-4 rounded-[32px] border border-gray-100 shadow-sm flex flex-col gap-4">
                                    <div className="flex items-center gap-4">
                                        <img src={p.image} className="w-16 h-16 rounded-2xl object-cover shadow-sm" alt="" />
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-sm truncate max-w-[150px]">{p.name}</h4>
                                                <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase ${p.status === 'active' ? 'bg-emerald-50 text-emerald-500' :
                                                    p.status === 'rejected' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'
                                                    }`}>
                                                    {p.status || 'pending'}
                                                </span>
                                            </div>
                                            <p className="text-xs font-black text-[#2D5A27]">{p.price} F</p>
                                            {p.vendorName && <p className="text-[9px] text-gray-400 uppercase font-black">Par: {p.vendorName}</p>}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openEditModal(p)}
                                                className="w-10 h-10 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center hover:bg-blue-100 transition-colors"
                                            >
                                                <i className="fa-solid fa-pen text-sm"></i>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProduct(p.id)}
                                                className="w-10 h-10 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-100 transition-colors"
                                            >
                                                <i className="fa-solid fa-trash-can text-sm"></i>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Validation component */}
                                    <AdminProductValidation
                                        plant={p}
                                        onStatusUpdate={(id, status) => {
                                            setProducts(prev => prev.map(prod => prod.id === id ? { ...prod, status } : prod));
                                        }}
                                    />
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {activeTab === 'orders' && (
                <div className="text-center py-20 bg-white rounded-[32px] border border-dashed border-gray-200">
                    <i className="fa-solid fa-receipt text-3xl text-gray-100 mb-2"></i>
                    <p className="text-xs text-gray-400">Module de commandes centralisées en cours...</p>
                </div>
            )}

            {messageModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] p-6 w-full max-w-sm">
                        <h3 className="font-bold text-gray-800 mb-2">Message à {messageModal.targetUser?.name}</h3>
                        <textarea
                            className="w-full bg-gray-50 rounded-2xl p-4 text-sm h-32 mb-4 focus:ring-2 focus:ring-[#2D5A27] outline-none"
                            placeholder="Écrivez votre message..."
                            value={adminMsg}
                            onChange={(e) => setAdminMsg(e.target.value)}
                        ></textarea>
                        <div className="flex gap-2">
                            <button onClick={() => setMessageModal({ isOpen: false, targetUser: null })} className="flex-1 py-3 rounded-xl bg-gray-100 font-bold text-xs text-gray-500">Annuler</button>
                            <button onClick={handleSendMessage} className="flex-1 py-3 rounded-xl bg-[#2D5A27] text-white font-bold text-xs">Envoyer</button>
                        </div>
                    </div>
                </div>
            )}

            {editProductModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-gray-800">Éditer le produit</h3>
                            <button onClick={() => setEditProductModal({ isOpen: false, product: null })} className="text-gray-400"><i className="fa-solid fa-times"></i></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Nom du produit</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 p-4 rounded-2xl font-bold border-none"
                                    value={editFormData.name}
                                    onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Prix (FCFA)</label>
                                <input
                                    type="number"
                                    className="w-full bg-gray-50 p-4 rounded-2xl font-bold border-none"
                                    value={editFormData.price}
                                    onChange={e => setEditFormData({ ...editFormData, price: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Stock disponible</label>
                                <input
                                    type="number"
                                    className="w-full bg-gray-50 p-4 rounded-2xl font-bold border-none"
                                    value={editFormData.stock}
                                    onChange={e => setEditFormData({ ...editFormData, stock: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Description</label>
                                <textarea
                                    className="w-full bg-gray-50 p-4 rounded-2xl font-medium border-none h-24"
                                    value={editFormData.description}
                                    onChange={e => setEditFormData({ ...editFormData, description: e.target.value })}
                                ></textarea>
                            </div>
                            <button
                                onClick={handleUpdateProduct}
                                className="w-full py-4 bg-[#2D5A27] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg"
                            >
                                Enregistrer les modifications
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
