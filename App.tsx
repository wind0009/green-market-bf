import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import EmailLogin from './views/EmailLogin';
import Login from './views/Login';
import Profile from './views/Profile';
import Cart from './views/Cart';
import VendorDashboard from './views/VendorDashboard';
import VendorProducts from './views/VendorProducts';
import PremiumProducts from './views/PremiumProducts';
import VendorCodeModal from './views/VendorCodeModal';
import Layout from './components/Layout';
import Catalog from './views/Catalog';
import ProductDetails from './views/ProductDetails';
import AdminDashboard from './views/AdminDashboard';
import Forbidden from './views/Forbidden';
import { User, Order, Plant, CartItem } from './types';
import { PLANTS } from './constants';
import { emailAuthService } from './services/emailAuthService';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/firebase';
import { orderService } from './services/orderService';
import { plantService } from './services/plantService';
import { userService } from './services/userService';

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);

  // authDatabase removed - using Firestore
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [authMethod, setAuthMethod] = useState<'sms' | 'email'>('email');

  // Persistence
  useEffect(() => {
    const savedCart = localStorage.getItem('gm_cart');
    const savedOrders = localStorage.getItem('gm_orders');
    const savedWishlist = localStorage.getItem('gm_wishlist');
    const savedUser = localStorage.getItem('gm_user');

    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedOrders) setOrders(JSON.parse(savedOrders));

    // Charger les plantes depuis Firebase
    const loadPlants = async () => {
      try {
        const dbPlants = await plantService.getActivePlants();
        if (dbPlants.length === 0) {
          console.log('Seeding database or no active plants...');
          // Fallback static plants for new install - but filter them by status if we were to seed
          setPlants(PLANTS.filter(p => p.status === 'active' || !p.status));
        } else {
          setPlants(dbPlants);
        }
      } catch (error) {
        console.error("Failed to load plants", error);
        // Fallback to static data if offline or error
        setPlants(PLANTS);
      }
    };
    loadPlants();

    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    if (savedUser) setUser(JSON.parse(savedUser));

    // Listen to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // 1. Fetch token and custom claims
        const tokenResult = await firebaseUser.getIdTokenResult();
        const roleFromClaim = tokenResult.claims.role as string;

        // 2. Fetch full user profile from Firestore
        const userProfile = await userService.getUserById(firebaseUser.uid);

        // Même si le profil Firestore n'existe pas encore, on crée un utilisateur minimal
        const baseUser: User = userProfile || {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Utilisateur',
          email: firebaseUser.email || '',
          phone: firebaseUser.phoneNumber || '',
          role: 'client',
          isAdmin: false,
          isProfileComplete: false,
          addresses: []
        };

        // Merge claims and profile
        const mergedUser = {
          ...baseUser,
          role: (roleFromClaim || baseUser.role || 'client') as User['role'],
          // Fallback de sécurité si le claim est absent mais l'attribut Firestore est présent
          isAdmin: roleFromClaim === 'super-admin' || roleFromClaim === 'manager' || baseUser.role === 'super-admin' || baseUser.role === 'manager' || baseUser.isAdmin
        };

        setUser(mergedUser);
        localStorage.setItem('gm_user', JSON.stringify(mergedUser));

        // 3. Redirection automatique si tentative d'accès admin sans les droits
        const isAtAdminRoute = window.location.pathname.startsWith('/admin-control-tower');
        if (isAtAdminRoute && !mergedUser.isAdmin) {
          console.warn("Accès refusé : Droits insuffisants.");
          navigate('/403');
        }
      } else {
        // Ne pas déconnecter si c'est un login "hardcodé" (id spécial)
        setUser(prev => {
          if (prev?.id === 'admin-secret') return prev;
          localStorage.removeItem('gm_user');
          return null;
        });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem('gm_cart', JSON.stringify(cart));
    localStorage.setItem('gm_orders', JSON.stringify(orders));
    localStorage.setItem('gm_plants', JSON.stringify(plants));
    localStorage.setItem('gm_wishlist', JSON.stringify(wishlist));
    if (user) {
      localStorage.setItem('gm_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('gm_user');
    }
  }, [cart, orders, plants, wishlist, user]);

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

  // Legacy handles kept empty or redirecting to new auth flow if needed
  const handleSignup = async (userData: User) => {
    try {
      await userService.saveUser(userData);
      setUser(userData);
      localStorage.setItem('gm_user', JSON.stringify(userData));
      navigate('/');
    } catch (error) {
      console.error("Signup error:", error);
      alert("Erreur lors de la création du compte.");
    }
  };

  const handleLogin = async (identifier: string, password?: string, isSpecialAdmin: boolean = false) => {
    try {
      // 1. Essayer de trouver par téléphone
      const userData = await userService.getUserByPhone(identifier);
      if (userData) {
        // En version démo simplifiée, on connecte directement si trouvé
        // (Idéalement on vérifierait le mot de passe ici si non géré par Firebase Auth)
        setUser(userData);
        localStorage.setItem('gm_user', JSON.stringify(userData));
        navigate(userData.isAdmin ? '/admin-control-tower' : '/');
      } else {
        alert("Utilisateur non trouvé.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Erreur lors de la connexion.");
    }
  };

  const handleLogout = async () => {
    await emailAuthService.signOut();
    setUser(null);
    setSelectedPlant(null);
    localStorage.removeItem('gm_user');
    navigate('/');
  };

  const handleUpdateProfile = async (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      // Persist to Firestore
      try {
        await userService.updateUser(user.id, userData);
      } catch (error) {
        console.error("Failed to update profile remote", error);
      }
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
              className={`px-4 py-2 rounded-xl font-medium transition-all ${authMethod === 'email'
                ? 'bg-[#2D5A27] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              <i className="fa-solid fa-envelope mr-2"></i>
              Email
            </button>
            <button
              onClick={() => setAuthMethod('sms')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${authMethod === 'sms'
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

  const isAdmin = user.role === 'super-admin' || user.role === 'manager' || user.isAdmin;

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
        <Route path="/vendor-dashboard" element={
          (user.isVendor && user.vendorStatus === 'active') ? (
            <VendorDashboard
              user={user}
              onUpdateProfile={handleUpdateProfile}
            />
          ) : <Navigate to="/" />
        } />
        <Route path="/premium-products" element={
          <PremiumProducts onAddToCart={addToCart} />
        } />
        <Route path="/vendor-products/:vendorId" element={<VendorProductsWrapper onAddToCart={addToCart} />} />
        <Route path="/admin-control-tower" element={
          isAdmin ? <AdminDashboard user={user} /> : <Navigate to="/403" />
        } />
        <Route path="/403" element={<Forbidden />} />
      </Routes>
    </Layout>
  );
};

// Wrapper component pour VendorProducts route
const VendorProductsWrapper: React.FC<{ onAddToCart: (plant: Plant) => void }> = ({ onAddToCart }) => {
  const { vendorId } = useParams<{ vendorId: string }>();
  return <VendorProducts vendorId={vendorId || ''} onAddToCart={onAddToCart} />;
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
