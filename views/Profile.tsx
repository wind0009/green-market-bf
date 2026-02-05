
import React, { useState } from 'react';
import { User, Order, CartItem } from '../types';

interface ProfileProps {
  user: User | null;
  onLogin: (phone: string, isAdmin?: boolean, profileData?: Partial<User>) => void;
  onLogout: () => void;
  onUpdateProfile: (userData: Partial<User>) => void;
  orders: Order[];
}

const Profile: React.FC<ProfileProps> = ({ user, onLogin, onLogout, onUpdateProfile, orders }) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Admin Secret Access
  const [logoTaps, setLogoTaps] = useState(0);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // UI State for Expanded Orders
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const handleLogoClick = () => {
    const newCount = logoTaps + 1;
    setLogoTaps(newCount);
    if (newCount >= 5) {
      setShowAdminLogin(true);
      setLogoTaps(0);
    }
  };

  const handleAuthSubmit = () => {
    if (phone.length < 8) return;
    
    setLoading(true);
    // Simulation d'une petite latence pour le feeling "authentification"
    setTimeout(() => {
      if (authMode === 'signup') {
        onLogin(phone, false, { name, email, isProfileComplete: true });
      } else {
        onLogin(phone);
      }
      setLoading(false);
    }, 600);
  };

  const handleAdminSecretLogin = () => {
    if (adminUsername === 'admin' && adminPassword === '1234') {
      onLogin('ADMIN_MASTER', true);
    } else {
      alert("Identifiants admin incorrects");
    }
  };

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // 1. ECRAN LOGIN ADMIN SECRET
  if (showAdminLogin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F5F5] p-6 animate-fadeIn">
        <div className="bg-white p-8 rounded-[40px] shadow-2xl w-full max-w-sm border border-gray-100">
          <div className="w-16 h-16 bg-[#2D5A27]/10 text-[#2D5A27] rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <i className="fa-solid fa-shield-halved text-2xl"></i>
          </div>
          <h2 className="text-xl font-black text-[#2D5A27] text-center mb-6 uppercase tracking-wider">Accès Administrateur</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Identifiant"
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#2D5A27] font-bold"
              value={adminUsername}
              onChange={(e) => setAdminUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Mot de passe"
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#2D5A27] font-bold"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
            />
            <button onClick={handleAdminSecretLogin} className="w-full bg-[#2D5A27] text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg">
              Connexion Maître
            </button>
            <button onClick={() => setShowAdminLogin(false)} className="w-full text-gray-400 text-xs font-bold uppercase pt-2">
              Annuler
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. ECRAN DE CONNEXION / INSCRIPTION INITIAL (Si aucun utilisateur du tout)
  if (!user) {
    return (
      <div className="flex flex-col items-center min-h-screen bg-[#F8FAF8] p-6 animate-fadeIn relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#2D5A27]/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#E2725B]/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>

        <div className="w-full max-sm z-10 pt-10 flex flex-col items-center">
          <div 
            onClick={handleLogoClick}
            className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center mb-8 shadow-xl shadow-green-100/50 border border-gray-50 cursor-pointer transition-transform active:scale-90"
          >
            <i className="fa-solid fa-leaf text-5xl text-[#2D5A27]"></i>
          </div>

          <h1 className="text-3xl font-black text-[#2D5A27] text-center mb-2 tracking-tight">Green Market BF</h1>
          <p className="text-gray-400 text-center mb-10 text-xs font-medium uppercase tracking-widest">Le jardin de vos rêves, à portée de main</p>

          <div className="w-full bg-white rounded-[40px] p-8 shadow-xl shadow-green-900/5 border border-gray-50">
            <div className="flex bg-gray-50 p-1.5 rounded-2xl mb-8">
              <button 
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${authMode === 'login' ? 'bg-white text-[#2D5A27] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Connexion
              </button>
              <button 
                onClick={() => setAuthMode('signup')}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${authMode === 'signup' ? 'bg-white text-[#2D5A27] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                S'inscrire
              </button>
            </div>

            <div className="space-y-5">
              {authMode === 'signup' && (
                <div className="animate-slideDown">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2 mb-1 block">Nom Complet</label>
                  <input
                    type="text"
                    placeholder="Ex: Jean Traoré"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#2D5A27] font-bold text-gray-700 transition-all"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2 mb-1 block">Numéro de téléphone</label>
                <div className="relative group">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-[#2D5A27]">+226</span>
                  <input
                    type="tel"
                    placeholder="00 00 00 00"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-16 pr-6 outline-none focus:ring-2 focus:ring-[#2D5A27] font-black text-lg text-gray-700 transition-all tracking-wider"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <button
                onClick={handleAuthSubmit}
                disabled={loading || phone.length < 8 || (authMode === 'signup' && !name)}
                className="w-full bg-[#2D5A27] text-white py-5 rounded-[24px] font-black text-sm uppercase tracking-widest shadow-xl shadow-green-100 disabled:opacity-50 active:scale-[0.98] transition-all mt-4 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <i className="fa-solid fa-spinner animate-spin"></i>
                ) : (
                  authMode === 'login' ? 'Se connecter' : 'Créer mon compte'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2.5 ECRAN FINALISATION (Si vraiment aucun nom n'a pu être récupéré nulle part)
  if (!user.name && !user.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAF8] p-6 animate-fadeIn">
        <div className="bg-white p-8 rounded-[40px] shadow-xl w-full max-w-sm border border-gray-50 text-center">
          <div className="w-20 h-20 bg-green-50 text-[#2D5A27] rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fa-solid fa-id-card text-3xl"></i>
          </div>
          <h2 className="text-xl font-black text-[#2D5A27] mb-2">Bienvenue !</h2>
          <p className="text-xs font-bold text-gray-400 mb-8 uppercase tracking-widest">Comment devons-nous vous appeler ?</p>
          
          <input
            type="text"
            placeholder="Votre nom complet"
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#2D5A27] font-bold text-center mb-6"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          
          <button
            onClick={() => onUpdateProfile({ name })}
            disabled={!name}
            className="w-full bg-[#2D5A27] text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg disabled:opacity-50"
          >
            Terminer
          </button>
          
          <button onClick={onLogout} className="mt-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">Annuler</button>
        </div>
      </div>
    );
  }

  // 3. ECRAN PROFIL FINAL
  const userOrders = orders.filter(o => 
    (o.userId && o.userId === user.id) || 
    (o.customer.phone === user.phone && user.phone !== 'Admin Principal')
  );

  return (
    <div className="p-4 space-y-8 animate-fadeIn pb-32 bg-[#F8FAF8] min-h-screen">
      <div className="bg-[#2D5A27] rounded-[48px] p-8 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full"></div>
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/5 rounded-full"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-[40px] flex items-center justify-center mb-5 border border-white/20 shadow-inner">
            <span className="text-4xl font-black uppercase">
              {(user.name && user.name.length > 0) ? user.name.charAt(0) : (user.isAdmin ? 'A' : 'C')}
            </span>
          </div>
          <h2 className="text-2xl font-black mb-1">
            {user.isAdmin ? 'Administrateur' : (user.name || 'Client')}
          </h2>
          <p className="text-white/60 text-sm font-medium tracking-wide">{user.phone}</p>
          
          <button 
            onClick={onLogout} 
            className="mt-8 px-8 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 transition-all active:scale-95"
          >
            Se déconnecter
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[36px] border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-xs font-black text-[#2D5A27] uppercase tracking-[0.2em] mb-2 px-2">Infos personnelles</h3>
        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
          <div className="w-10 h-10 bg-[#2D5A27]/10 text-[#2D5A27] rounded-xl flex items-center justify-center">
            <i className="fa-solid fa-user-tag text-sm"></i>
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase">Nom de profil</p>
            <p className="text-sm font-black text-gray-800">{user.name || 'Non défini'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
          <div className="w-10 h-10 bg-[#2D5A27]/10 text-[#2D5A27] rounded-xl flex items-center justify-center">
            <i className="fa-solid fa-phone text-sm"></i>
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase">Contact</p>
            <p className="text-sm font-black text-gray-800">{user.phone}</p>
          </div>
        </div>
      </div>

      {user.isAdmin && (
        <button 
          onClick={() => window.location.hash = '#/admin'}
          className="w-full bg-[#E2725B] text-white p-6 rounded-[36px] shadow-xl shadow-orange-100 flex items-center justify-between group active:scale-95 transition-all"
        >
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <i className="fa-solid fa-chart-line text-2xl"></i>
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/70">Gestion Boutique</p>
              <p className="text-xl font-black">Dashboard Admin</p>
            </div>
          </div>
          <i className="fa-solid fa-arrow-right-long text-xl opacity-50 group-hover:translate-x-2 transition-transform"></i>
        </button>
      )}

      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white p-6 rounded-[36px] border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Commandes</p>
          <p className="text-3xl font-black text-[#2D5A27]">{userOrders.length}</p>
        </div>
        <div className="bg-white p-6 rounded-[36px] border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Points Verts</p>
          <p className="text-3xl font-black text-[#E2725B]">{userOrders.length * 150} <span className="text-xs">pts</span></p>
        </div>
      </div>

      <section>
        <div className="flex justify-between items-center mb-6 px-2">
          <h3 className="text-xl font-black text-[#2D5A27]">Mes Achats</h3>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Historique</span>
        </div>
        
        {userOrders.length === 0 ? (
          <div className="bg-white rounded-[40px] p-12 text-center text-gray-400 border border-dashed border-gray-200">
             <i className="fa-solid fa-bag-shopping text-4xl mb-5 opacity-20 block"></i>
             <p className="text-sm font-bold">Vous n'avez pas encore passé de commande.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {userOrders.map(order => {
              const isExpanded = expandedOrderId === order.id;
              return (
                <div 
                  key={order.id} 
                  className={`bg-white rounded-[36px] border border-gray-100 shadow-sm overflow-hidden transition-all duration-500 ${isExpanded ? 'ring-4 ring-[#2D5A27]/5 shadow-xl' : ''}`}
                >
                  <div 
                    onClick={() => toggleOrderDetails(order.id)}
                    className="p-6 flex justify-between items-center cursor-pointer active:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                        order.status === 'Livrée' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                        <i className={`fa-solid ${order.status === 'Livrée' ? 'fa-circle-check' : 'fa-clock'} text-lg`}></i>
                      </div>
                      <div>
                        <p className="font-black text-sm text-gray-800 uppercase tracking-tight">#{order.id.slice(-4).toUpperCase()}</p>
                        <p className="text-[10px] text-gray-400 font-bold">
                          {new Date(order.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <p className="font-black text-[#2D5A27] text-lg">{order.total} F</p>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                          order.status === 'Livrée' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <i className={`fa-solid fa-chevron-down text-gray-300 text-xs transition-transform duration-500 ${isExpanded ? 'rotate-180 text-[#2D5A27]' : ''}`}></i>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-6 pb-6 animate-slideDown">
                      <div className="border-t border-gray-50 pt-5 mt-2">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-4">Contenu du panier</p>
                        <div className="space-y-4">
                          {order.items.map((item: CartItem) => (
                            <div key={item.id} className="flex items-center gap-4 bg-gray-50/50 p-3 rounded-2xl border border-gray-50">
                              <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-grow">
                                <h4 className="text-xs font-black text-gray-800 leading-tight">{item.name}</h4>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">{item.price} F x {item.quantity}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Profile;
