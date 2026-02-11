import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartItem, District, Order } from '../types';
import { DISTRICTS } from '../constants';

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onPlaceOrder: (order: Order) => void;
}

const Cart: React.FC<CartProps> = ({ items, onUpdateQuantity, onRemove, onPlaceOrder }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [method, setMethod] = useState<'Livraison' | 'Retrait'>('Livraison');
  const [selectedDistrict, setSelectedDistrict] = useState<District>(DISTRICTS[0]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    landmark: '',
    pickupTime: '',
    payment: 'Mobile Money' as 'Mobile Money' | 'Paiement à la livraison'
  });

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = method === 'Livraison' ? selectedDistrict.deliveryFee : 0;
  const total = subtotal + deliveryFee;

  const handleCheckout = () => {
    if (items.length === 0) return;
    setStep('checkout');
  };

  const submitOrder = () => {
    const order: Order = {
      id: Math.random().toString(36).substr(2, 9),
      items: [...items],
      total,
      customer: {
        name: formData.name,
        phone: formData.phone,
        city: selectedDistrict.city,
        district: selectedDistrict.name,
        landmark: formData.landmark,
        method,
        pickupTime: formData.pickupTime
      },
      paymentMethod: formData.payment,
      status: 'En attente',
      date: new Date().toISOString()
    };
    onPlaceOrder(order);
    setStep('success');
  };

  if (items.length === 0 && step === 'cart') {
    return (
      <div className="p-10 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <i className="fa-solid fa-cart-shopping text-4xl text-gray-300"></i>
        </div>
        <h2 className="text-xl font-bold mb-2">Votre panier est vide</h2>
        <p className="text-gray-500 mb-8">Découvrez nos magnifiques plantes et commencez votre jardin urbain.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-[#2D5A27] text-white px-8 py-3 rounded-xl font-bold"
        >
          Voir le catalogue
        </button>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="p-10 text-center flex flex-col items-center justify-center min-h-[60vh] animate-fadeIn">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 text-[#2D5A27]">
          <i className="fa-solid fa-check text-4xl"></i>
        </div>
        <h2 className="text-xl font-bold mb-2">Commande reçue !</h2>
        <p className="text-gray-500 mb-8">
          Bark-wende ! Votre commande a été enregistrée. Nous vous contacterons sur le {formData.phone} pour confirmer la livraison.
        </p>
        <div className="space-y-3 w-full max-w-xs">
          <button
            onClick={() => {
              const ussd = `*144*2*1*07659801*${total}#`;
              window.location.href = `tel:${ussd}`;
            }}
            className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold w-full flex items-center justify-center gap-2 shadow-lg shadow-orange-100"
          >
            <i className="fa-solid fa-mobile-screen-button"></i>
            Payer par Téléphone
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="bg-[#2D5A27] text-white px-8 py-3 rounded-xl font-bold w-full"
          >
            Suivre ma commande
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 animate-slideIn">
      <h1 className="text-2xl font-bold mb-6">
        {step === 'cart' ? 'Mon Panier' : 'Finaliser ma commande'}
      </h1>

      {step === 'cart' ? (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-3 flex gap-4 shadow-sm border border-gray-100">
              <img src={item.image} className="w-20 h-20 object-cover rounded-xl" />
              <div className="flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm">{item.name}</h3>
                  <p className="text-xs text-[#2D5A27] font-bold">{item.price} F</p>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-2 py-1">
                    <button onClick={() => onUpdateQuantity(item.id, -1)} className="text-[#2D5A27] w-6 h-6 flex items-center justify-center font-bold">-</button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <button onClick={() => onUpdateQuantity(item.id, 1)} className="text-[#2D5A27] w-6 h-6 flex items-center justify-center font-bold">+</button>
                  </div>
                  <button onClick={() => onRemove(item.id)} className="text-red-400 p-2">
                    <i className="fa-solid fa-trash-can text-sm"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="mt-10 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Sous-total</span>
              <span className="font-bold">{subtotal} F</span>
            </div>
            <div className="flex justify-between mb-4 pb-4 border-b border-gray-100">
              <span className="text-gray-500">Livraison</span>
              <span className="text-xs italic text-gray-400">Calculée à l'étape suivante</span>
            </div>
            <div className="flex justify-between mb-6">
              <span className="font-bold text-lg">Total</span>
              <span className="font-black text-lg text-[#2D5A27]">{subtotal} F</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-[#E2725B] text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-orange-100"
            >
              Commander
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 pb-20">
          {/* Toggle Method */}
          <div className="flex bg-gray-100 p-1 rounded-2xl">
            <button
              onClick={() => setMethod('Livraison')}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${method === 'Livraison' ? 'bg-[#2D5A27] text-white shadow-md' : 'text-gray-500'}`}
            >
              Livraison
            </button>
            <button
              onClick={() => setMethod('Retrait')}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${method === 'Retrait' ? 'bg-[#2D5A27] text-white shadow-md' : 'text-gray-500'}`}
            >
              Click & Collect
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-2 ml-1">Nom Complet</label>
              <input
                type="text"
                className="w-full bg-white border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#2D5A27]"
                placeholder="Ex: Alassane Sawadogo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-2 ml-1">Téléphone (WhatsApp)</label>
              <input
                type="tel"
                className="w-full bg-white border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#2D5A27]"
                placeholder="Ex: +226 70 00 00 00"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            {method === 'Livraison' ? (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-2 ml-1">Quartier</label>
                  <select
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#2D5A27]"
                    onChange={(e) => setSelectedDistrict(DISTRICTS.find(d => d.name === e.target.value) || DISTRICTS[0])}
                  >
                    {DISTRICTS.map(d => (
                      <option key={d.name} value={d.name}>{d.name} ({d.city})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-2 ml-1">Précisions (Monument, Pharmacie...)</label>
                  <textarea
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#2D5A27] h-20"
                    placeholder="Ex: Face à la pharmacie des Écoles, porte bleue."
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  ></textarea>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-2 ml-1">Heure de passage</label>
                <input
                  type="time"
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#2D5A27]"
                  value={formData.pickupTime}
                  onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-2 ml-1">Mode de Paiement</label>
              <div className="space-y-2">
                <button
                  onClick={() => setFormData({ ...formData, payment: 'Mobile Money' })}
                  className={`w-full p-4 rounded-xl border flex items-center gap-3 ${formData.payment === 'Mobile Money' ? 'border-[#2D5A27] bg-[#2D5A27]/5' : 'border-gray-200'}`}
                >
                  <i className="fa-solid fa-mobile-screen-button text-orange-500"></i>
                  <span className="font-bold text-sm">Orange / Moov Money</span>
                </button>
                <button
                  onClick={() => setFormData({ ...formData, payment: 'Paiement à la livraison' })}
                  className={`w-full p-4 rounded-xl border flex items-center gap-3 ${formData.payment === 'Paiement à la livraison' ? 'border-[#2D5A27] bg-[#2D5A27]/5' : 'border-gray-200'}`}
                >
                  <i className="fa-solid fa-hand-holding-dollar text-[#2D5A27]"></i>
                  <span className="font-bold text-sm">Paiement à la livraison</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Sous-total</span>
              <span className="font-bold">{subtotal} F</span>
            </div>
            {method === 'Livraison' && (
              <div className="flex justify-between mb-4 pb-4 border-b border-gray-100">
                <span className="text-gray-500">Frais de livraison ({selectedDistrict.name})</span>
                <span className="font-bold text-blue-500">{deliveryFee} F</span>
              </div>
            )}
            <div className="flex justify-between mb-6">
              <span className="font-bold text-lg">Total à payer</span>
              <span className="font-black text-lg text-[#2D5A27]">{total} F</span>
            </div>
            <button
              onClick={submitOrder}
              disabled={!formData.name || !formData.phone}
              className="w-full bg-[#E2725B] text-white py-4 rounded-2xl font-bold text-lg shadow-lg disabled:opacity-50"
            >
              {formData.payment === 'Mobile Money' ? 'Payer avec Mobile Money' : 'Confirmer la commande'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
