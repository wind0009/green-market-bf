import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Catalog from './views/Catalog';
import ProductDetails from './views/ProductDetails';
import Cart from './views/Cart';
import Admin from './views/Admin';
import Profile from './views/Profile';
import OrderHistory from './views/OrderHistory';
import Login from './views/Login';
import { Plant, CartItem, Order, User } from './types';
import { PLANTS as INITIAL_PLANTS } from './constants';
import { cartService, orderService } from './services/firebaseService';
import { userService } from './services/userService';

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [plants, setPlants] = useState<Plant[]>(INITIAL_PLANTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);

  // Firebase Persistence
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          // Charger le panier depuis Firebase
          const userCart = await cartService.getCart(user.id);
          setCart(userCart);
          
          // Charger toutes les commandes
          const allOrders = await orderService.getOrders();
          setOrders(allOrders);
        } catch (error) {
          console.error('Erreur lors du chargement des données:', error);
        }
      }
    };
    
    loadData();
  }, [user]);

  // Sauvegarder le panier dans Firebase
  useEffect(() => {
    const saveCart = async () => {
      if (user && cart.length > 0) {
        try {
          // Vider d'abord le panier existant
          await cartService.clearCart(user.id);
          
          // Ajouter tous les articles du panier actuel
          const savePromises = cart.map(item => cartService.addToCart(user.id, item));
          await Promise.all(savePromises);
        } catch (error) {
          console.error('Erreur lors de la sauvegarde du panier:', error);
        }
      }
    };
    
    saveCart();
  }, [cart, user]);

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

  const handlePlaceOrder = async (order: Order) => {
    const finalOrder = { ...order, userId: user?.id };
    try {
      await orderService.addOrder(finalOrder);
      
      // Recharger les commandes depuis Firebase
      const allOrders = await orderService.getOrders();
      setOrders(allOrders);
      
      // Vider le panier dans Firebase et localement
      if (user) {
        await cartService.clearCart(user.id);
      }
      setCart([]);
    } catch (error) {
      console.error('Erreur lors de la commande:', error);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await orderService.updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  const toggleWishlist = (id: string) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(wid => wid !== id) : [...prev, id]);
  };

  const handleLogin = async (phone: string, isAdmin: boolean = false) => {
    try {
      // Check if user already exists in Firebase
      const savedUser = await userService.getUserByPhone(phone);
      
      const loggedUser: User = savedUser && savedUser.phone === phone ? savedUser : {
        id: Math.random().toString(36).substr(2, 9),
        phone,
        isAdmin,
        isProfileComplete: isAdmin, // Admins don't need profile completion step
        addresses: []
      };
      
      // Ensure admin flag is correctly set even for existing users
      if (isAdmin) loggedUser.isAdmin = true;

      // Save user to Firebase
      await userService.saveUser(loggedUser);
      setUser(loggedUser);
      
      if (isAdmin) {
        navigate('/admin');
      } else if (!loggedUser.isProfileComplete) {
        navigate('/profile');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
    }
  };

  const handleUpdateProfile = async (userData: Partial<User>) => {
    if (user) {
      try {
        const updatedUser = { ...user, ...userData };
        await userService.updateUser(user.id, updatedUser);
        setUser(updatedUser);
        navigate('/');
      } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedPlant(null);
    navigate('/');
  };

  // Admin handlers
  const addPlant = (plant: Plant) => {
    setPlants([plant, ...plants]);
  };
  
  const updatePlant = (plant: Plant) => setPlants(prev => prev.map(p => p.id === plant.id ? plant : p));
  const deletePlant = (id: string) => setPlants(prev => prev.filter(p => p.id !== id));

  const sortedPlants = [...plants].sort((a, b) => {
    const dateA = a.dateAdded ? new Date(a.dateAdded).getTime() : 0;
    const dateB = b.dateAdded ? new Date(b.dateAdded).getTime() : 0;
    return dateB - dateA;
  });

  // Entry point: If not logged in OR profile is not complete, focus on Profile/Login view
  if (!user || (!user.isAdmin && !user.isProfileComplete)) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-2xl overflow-hidden">
        <Profile 
          user={user} 
          onLogin={handleLogin} 
          onLogout={handleLogout} 
          onUpdateProfile={handleUpdateProfile}
          orders={[]} 
        />
      </div>
    );
  }

  return (
    <Layout cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)} isLoggedIn={true}>
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
            onUpdateQuantity={updateQuantity} 
            onRemove={removeFromCart}
            onPlaceOrder={handlePlaceOrder}
          />
        } />
        <Route path="/profile" element={
          user ? (
            <Profile user={user} onLogin={handleLogin} onLogout={handleLogout} onUpdateProfile={handleUpdateProfile} orders={orders} />
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        <Route path="/order-history" element={
          <OrderHistory orders={orders} />
        } />
        <Route path="/login" element={
          <div className="min-h-screen bg-[#F5F5F5]">
            <Login onLogin={(user) => { setUser(user); navigate('/'); }} />
          </div>
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
