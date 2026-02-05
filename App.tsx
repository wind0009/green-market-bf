
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Catalog from './views/Catalog';
import ProductDetails from './views/ProductDetails';
import Cart from './views/Cart';
import Admin from './views/Admin';
import Profile from './views/Profile';
import { Plant, CartItem, Order, User } from './types';
import { PLANTS as INITIAL_PLANTS } from './constants';

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [plants, setPlants] = useState<Plant[]>(INITIAL_PLANTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [userRegistry, setUserRegistry] = useState<Record<string, Partial<User>>>({});
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);

  // Persistence
  useEffect(() => {
    const savedCart = localStorage.getItem('gm_cart');
    const savedOrders = localStorage.getItem('gm_orders');
    const savedPlants = localStorage.getItem('gm_plants');
    const savedWishlist = localStorage.getItem('gm_wishlist');
    const savedUser = localStorage.getItem('gm_user');
    const savedRegistry = localStorage.getItem('gm_user_registry');

    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedOrders) setOrders(JSON.parse(savedOrders));
    if (savedPlants) setPlants(JSON.parse(savedPlants));
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedRegistry) setUserRegistry(JSON.parse(savedRegistry));
  }, []);

  useEffect(() => {
    localStorage.setItem('gm_cart', JSON.stringify(cart));
    localStorage.setItem('gm_orders', JSON.stringify(orders));
    localStorage.setItem('gm_plants', JSON.stringify(plants));
    localStorage.setItem('gm_wishlist', JSON.stringify(wishlist));
    localStorage.setItem('gm_user_registry', JSON.stringify(userRegistry));
    if (user) {
      localStorage.setItem('gm_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('gm_user');
    }
  }, [cart, orders, plants, wishlist, user, userRegistry]);

  const addToCart = (plant: Plant) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === plant.id);
      if (existing) {
        return prev.map(item => item.id === plant.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...plant, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handlePlaceOrder = (order: Order) => {
    const finalOrder = { ...order, userId: user?.id };
    setOrders([finalOrder, ...orders]);
    
    // Mettre à jour le registre avec les infos de la commande
    if (order.customer.phone && order.customer.name) {
      setUserRegistry(prev => ({
        ...prev,
        [order.customer.phone]: { 
          name: order.customer.name, 
          phone: order.customer.phone 
        }
      }));
    }
    
    setCart([]);
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const toggleWishlist = (id: string) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(wid => wid !== id) : [...prev, id]);
  };

  const handleLogin = (phone: string, isAdmin: boolean = false, profileData?: Partial<User>) => {
    const isSpecialAdmin = phone === 'ADMIN_MASTER';
    const phoneToUse = isSpecialAdmin ? 'Admin Principal' : phone;

    // 1. Chercher dans le registre (Données persistantes)
    const registeredInfo = userRegistry[phoneToUse];
    
    // 2. Chercher dans l'historique des commandes (Fallback)
    const historicalOrder = orders.find(o => o.customer.phone === phoneToUse);
    const recoveredName = historicalOrder?.customer.name;

    const loggedUser: User = {
      id: registeredInfo?.id || user?.id || Math.random().toString(36).substr(2, 9),
      phone: phoneToUse,
      name: profileData?.name || registeredInfo?.name || recoveredName || '',
      email: profileData?.email || registeredInfo?.email || '',
      isAdmin: isAdmin || isSpecialAdmin,
      isProfileComplete: !!(profileData?.name || registeredInfo?.name || recoveredName || isAdmin || isSpecialAdmin),
      addresses: registeredInfo?.addresses || []
    };
    
    // Sauvegarder dans le registre pour la prochaine fois
    if (loggedUser.name) {
      setUserRegistry(prev => ({
        ...prev,
        [phoneToUse]: loggedUser
      }));
    }

    setUser(loggedUser);
    
    if (loggedUser.isAdmin) {
      navigate('/admin');
    } else {
      if (location.pathname === '/profile' || !user) {
        navigate('/');
      }
    }
  };

  const handleUpdateProfile = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { 
        ...user, 
        ...userData, 
        isProfileComplete: !!(userData.name || user.name) 
      };
      
      // Update global user
      setUser(updatedUser);
      
      // Update persistent registry
      setUserRegistry(prev => ({
        ...prev,
        [user.phone]: updatedUser
      }));
    }
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedPlant(null);
    localStorage.removeItem('gm_user');
    navigate('/');
  };

  const addPlant = (plant: Plant) => setPlants([plant, ...plants]);
  const updatePlant = (plant: Plant) => setPlants(prev => prev.map(p => p.id === plant.id ? plant : p));
  const deletePlant = (id: string) => setPlants(prev => prev.filter(p => p.id !== id));

  const sortedPlants = [...plants].sort((a, b) => {
    const dateA = a.dateAdded ? new Date(a.dateAdded).getTime() : 0;
    const dateB = b.dateAdded ? new Date(b.dateAdded).getTime() : 0;
    return dateB - dateA;
  });

  if (!user) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-2xl overflow-hidden">
        <Profile 
          user={user} 
          onLogin={handleLogin} 
          onLogout={handleLogout} 
          onUpdateProfile={handleUpdateProfile}
          orders={orders} 
        />
      </div>
    );
  }

  return (
    <Layout cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)} isLoggedIn={true} userName={user.name}>
      <Routes>
        <Route path="/" element={
          selectedPlant ? (
            <ProductDetails 
              plant={selectedPlant} 
              onBack={() => setSelectedPlant(null)} 
              onAddToCart={(p) => {
                addToCart(p);
                setSelectedPlant(null);
                navigate('/cart');
              }}
            />
          ) : (
            <Catalog 
              plants={sortedPlants}
              wishlist={wishlist}
              onToggleWishlist={toggleWishlist}
              onAddToCart={addToCart} 
              onSelectPlant={setSelectedPlant} 
            />
          )
        } />
        <Route path="/wishlist" element={
          <div className="p-6 space-y-4 animate-fadeIn">
             <div className="mb-6">
                <h1 className="text-2xl font-black text-[#2D5A27]">Mes Coups de Cœur</h1>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Votre jardin idéal commence ici</p>
             </div>
             {wishlist.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-[40px] shadow-sm border border-gray-100 px-8">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="fa-solid fa-heart-crack text-3xl text-gray-200"></i>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">Aucune plante favorite ?</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">Parcourez notre catalogue et cliquez sur le cœur pour sauvegarder vos plantes préférées.</p>
                </div>
             ) : (
                <div className="grid grid-cols-2 gap-4">
                   {plants.filter(p => wishlist.includes(p.id)).map(p => (
                      <div 
                        key={p.id} 
                        className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm active:scale-95 transition-transform" 
                        onClick={() => setSelectedPlant(p)}
                      >
                         <img src={p.image} className="w-full h-32 object-cover" />
                         <div className="p-4">
                           <h4 className="font-bold text-xs truncate text-gray-800 mb-1">{p.name}</h4>
                           <p className="text-[#2D5A27] font-black text-xs">{p.price} F</p>
                         </div>
                      </div>
                   ))}
                </div>
             )}
          </div>
        } />
        <Route path="/cart" element={
          <Cart 
            items={cart} 
            user={user}
            onUpdateQuantity={updateQuantity} 
            onRemove={removeFromCart}
            onPlaceOrder={handlePlaceOrder}
          />
        } />
        <Route path="/profile" element={
          <Profile user={user} onLogin={handleLogin} onLogout={handleLogout} onUpdateProfile={handleUpdateProfile} orders={orders} />
        } />
        <Route path="/admin" element={
          user.isAdmin ? (
            <Admin 
              orders={orders} 
              plants={plants} 
              onUpdateOrderStatus={handleUpdateOrderStatus} 
              onAddPlant={addPlant}
              onUpdatePlant={updatePlant}
              onDeletePlant={deletePlant}
            />
          ) : <Navigate to="/" />
        } />
      </Routes>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;
