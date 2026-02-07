
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Catalog from './views/Catalog';
import ProductDetails from './views/ProductDetails';
import Cart from './views/Cart';
import Admin from './views/Admin';
import Profile from './views/Profile';
import Login from './views/Login';
import EmailLogin from './views/EmailLogin';
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
  
  // Base de données simulée des utilisateurs enregistrés
  const [authDatabase, setAuthDatabase] = useState<User[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [authMethod, setAuthMethod] = useState<'sms' | 'email'>('email');

  // Persistence
  useEffect(() => {
    const savedCart = localStorage.getItem('gm_cart');
    const savedOrders = localStorage.getItem('gm_orders');
    const savedWishlist = localStorage.getItem('gm_wishlist');
    const savedUser = localStorage.getItem('gm_user');
    const savedDatabase = localStorage.getItem('gm_auth_database');

    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedOrders) setOrders(JSON.parse(savedOrders));
    // Toujours charger les plantes depuis les constantes pour avoir les dernières mises à jour
    setPlants(INITIAL_PLANTS);
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedDatabase) setAuthDatabase(JSON.parse(savedDatabase));
  }, []);

  useEffect(() => {
    localStorage.setItem('gm_cart', JSON.stringify(cart));
    localStorage.setItem('gm_orders', JSON.stringify(orders));
    localStorage.setItem('gm_plants', JSON.stringify(plants));
    localStorage.setItem('gm_wishlist', JSON.stringify(wishlist));
    localStorage.setItem('gm_auth_database', JSON.stringify(authDatabase));
    if (user) {
      localStorage.setItem('gm_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('gm_user');
    }
  }, [cart, orders, plants, wishlist, user, authDatabase]);

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
    setCart([]);
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const toggleWishlist = (id: string) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(wid => wid !== id) : [...prev, id]);
  };

  const handleSignup = (userData: User) => {
    // Vérifier si l'utilisateur existe déjà
    const exists = authDatabase.find(u => u.email === userData.email || u.phone === userData.phone);
    if (exists) {
      throw new Error("Un compte existe déjà avec cet email ou ce numéro.");
    }
    setAuthDatabase([...authDatabase, userData]);
    setUser(userData);
    navigate('/');
  };

  const handleLogin = (identifier: string, password?: string, isSpecialAdmin: boolean = false) => {
    if (isSpecialAdmin) {
      const adminUser: User = {
        id: 'admin_master',
        name: 'Administrateur',
        email: 'admin@greenmarket.bf',
        phone: 'Admin',
        isAdmin: true,
        addresses: []
      };
      setUser(adminUser);
      navigate('/admin');
      return;
    }

    const foundUser = authDatabase.find(u => 
      (u.email === identifier || u.phone === identifier) && u.password === password
    );

    if (foundUser) {
      setUser(foundUser);
      navigate('/');
    } else {
      throw new Error("Identifiants incorrects.");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedPlant(null);
    localStorage.removeItem('gm_user');
    navigate('/');
  };

  const handleUpdateProfile = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      setAuthDatabase(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    }
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
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
        {authMethod === 'email' ? (
          <EmailLogin onLogin={(userData) => {
            setUser(userData);
            navigate('/');
          }} />
        ) : (
          <Login onLogin={(userData) => {
            setUser(userData);
            navigate('/');
          }} />
        )}
        
        {/* Sélecteur de méthode d'authentification */}
        <div className="fixed bottom-4 right-4 bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
          <div className="flex gap-2 text-sm">
            <button
              onClick={() => setAuthMethod('email')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                authMethod === 'email' 
                  ? 'bg-[#2D5A27] text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <i className="fa-solid fa-envelope mr-2"></i>
              Email
            </button>
            <button
              onClick={() => setAuthMethod('sms')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                authMethod === 'sms' 
                  ? 'bg-[#2D5A27] text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <i className="fa-solid fa-mobile-alt mr-2"></i>
              SMS
            </button>
          </div>
        </div>
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
          <Profile user={user} onLogin={handleLogin} onSignup={handleSignup} onLogout={handleLogout} onUpdateProfile={handleUpdateProfile} orders={orders} />
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
