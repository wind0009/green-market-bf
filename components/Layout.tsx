
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  cartCount: number;
  isLoggedIn: boolean;
  userName?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, cartCount, isLoggedIn, userName }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', icon: 'fa-house', label: 'Boutique' },
    { path: '/wishlist', icon: 'fa-heart', label: 'Favoris' },
    { path: '/cart', icon: 'fa-shopping-cart', label: 'Panier', count: cartCount },
    { path: '/profile', icon: 'fa-user', label: 'Profil' },
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
          <div>
            <h1 className="text-lg font-black tracking-tight leading-none">Green Market</h1>
            {isLoggedIn && userName && (
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-0.5 animate-fadeIn">
                Salut, {userName.split(' ')[0]}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           {location.pathname !== '/cart' && (
             <button 
              onClick={() => navigate('/cart')}
              className="relative p-2 w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"
             >
              <i className="fa-solid fa-cart-shopping text-lg"></i>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E2725B] text-white text-[10px] font-black px-1.5 py-0.5 rounded-lg border-2 border-[#2D5A27] shadow-lg">
                  {cartCount}
                </span>
              )}
             </button>
           )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pb-24 overflow-y-auto bg-[#F8FAF8]">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 backdrop-blur-lg border-t border-gray-100 flex justify-around p-3 pb-6 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-50">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${
                isActive ? 'text-[#2D5A27] scale-110' : 'text-gray-300'
              }`}
            >
              <div className="relative">
                <i className={`fa-solid ${item.icon} text-lg`}></i>
                {item.count !== undefined && item.count > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#E2725B] text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                    {item.count}
                  </span>
                )}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
