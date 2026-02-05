
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  cartCount: number;
  isLoggedIn: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, cartCount, isLoggedIn }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', icon: 'fa-house', label: 'Boutique' },
    { path: '/wishlist', icon: 'fa-heart', label: 'Favoris' },
    { path: '/cart', icon: 'fa-shopping-cart', label: 'Panier', count: cartCount },
    { path: '/order-history', icon: 'fa-receipt', label: 'Historique' },
    ...(isLoggedIn ? [{ path: '/profile', icon: 'fa-user', label: 'Profil' }] : [{ path: '/login', icon: 'fa-sign-in-alt', label: 'Connexion' }])
  ];

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-white shadow-xl relative overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#2D5A27] text-white p-4 flex justify-between items-center shadow-md">
        <div 
          className="flex items-center gap-2 cursor-pointer select-none active:scale-95 transition-transform"
          onClick={() => navigate('/')}
        >
          <i className="fa-solid fa-leaf text-2xl"></i>
          <h1 className="text-xl font-bold tracking-tight">Green Market BF</h1>
        </div>
        
        <div className="flex items-center gap-3">
           {location.pathname !== '/cart' && (
             <button 
              onClick={() => navigate('/cart')}
              className="relative p-2"
             >
              <i className="fa-solid fa-cart-shopping text-xl"></i>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E2725B] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-[#2D5A27]">
                  {cartCount}
                </span>
              )}
             </button>
           )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pb-24 overflow-y-auto bg-[#F5F5F5]">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 flex justify-around p-3 pb-5 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
                isActive ? 'text-[#2D5A27]' : 'text-gray-400'
              }`}
            >
              <div className="relative">
                <i className={`fa-solid ${item.icon} text-xl`}></i>
                {item.count !== undefined && item.count > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#E2725B] text-white text-[10px] rounded-full px-1">
                    {item.count}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
