
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Catalog from './views/Catalog';
import ProductDetails from './views/ProductDetails';
import Cart from './views/Cart';
import Admin from './views/Admin';
import { Plant, CartItem, Order } from './types';
import { PLANTS } from './constants';

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);

  // Persistence (Mocking Firebase with LocalStorage)
  useEffect(() => {
    const savedCart = localStorage.getItem('gm_cart');
    const savedOrders = localStorage.getItem('gm_orders');
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedOrders) setOrders(JSON.parse(savedOrders));
  }, []);

  useEffect(() => {
    localStorage.setItem('gm_cart', JSON.stringify(cart));
    localStorage.setItem('gm_orders', JSON.stringify(orders));
  }, [cart, orders]);

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
    setOrders([order, ...orders]);
    setCart([]);
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  return (
    <Layout cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)}>
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
              onAddToCart={addToCart} 
              onSelectPlant={setSelectedPlant} 
            />
          )
        } />
        <Route path="/cart" element={
          <Cart 
            items={cart} 
            onUpdateQuantity={updateQuantity} 
            onRemove={removeFromCart}
            onPlaceOrder={handlePlaceOrder}
          />
        } />
        <Route path="/orders" element={
          <div className="p-4 space-y-4">
            <h1 className="text-2xl font-bold mb-6">Mes Commandes</h1>
            {orders.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <i className="fa-solid fa-box-open text-4xl mb-4"></i>
                <p>Aucune commande passée.</p>
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-gray-400">CMD #{order.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      order.status === 'Livrée' ? 'bg-green-100 text-green-700' : 
                      order.status === 'En attente' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm font-bold">{order.items.length} plante(s)</p>
                      <p className="text-xs text-gray-500">{new Date(order.date).toLocaleDateString()}</p>
                    </div>
                    <span className="font-black text-[#2D5A27]">{order.total} F</span>
                  </div>
                </div>
              ))
            )}
          </div>
        } />
        <Route path="/admin" element={
          <Admin 
            orders={orders} 
            plants={PLANTS} 
            onUpdateOrderStatus={handleUpdateOrderStatus} 
          />
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
