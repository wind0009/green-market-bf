import React from 'react';
import { Order } from '../types';

interface OrderHistoryProps {
  orders: Order[];
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ orders }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Livrée': return 'bg-green-100 text-green-700';
      case 'En attente': return 'bg-orange-100 text-orange-700';
      case 'Validée': return 'bg-blue-100 text-blue-700';
      case 'Annulée': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#2D5A27] mb-2">Historique des Commandes</h1>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
          Tous vos paniers précédents
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[40px] shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fa-solid fa-receipt text-3xl text-gray-200"></i>
          </div>
          <h3 className="font-bold text-gray-800 mb-2">Aucune commande passée</h3>
          <p className="text-gray-400 text-sm">Votre historique de commandes apparaîtra ici</p>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
            {/* En-tête de la commande */}
            <div className="p-4 border-b border-gray-50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-[10px] font-bold text-gray-400">CMD #{order.id}</span>
                  <p className="text-sm font-bold text-gray-800 mt-1">
                    {order.customer.name} • {order.customer.phone}
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span><i className="fa-solid fa-calendar mr-1"></i>{formatDate(order.date)}</span>
                <span><i className="fa-solid fa-map-marker-alt mr-1"></i>{order.customer.city}</span>
                <span><i className="fa-solid fa-truck mr-1"></i>{order.customer.method}</span>
              </div>
            </div>

            {/* Détails du panier */}
            <div className="p-4">
              <h4 className="text-sm font-bold text-gray-700 mb-3">
                <i className="fa-solid fa-shopping-basket mr-2 text-[#2D5A27]"></i>
                Panier ({order.items.length} article{order.items.length > 1 ? 's' : ''})
              </h4>
              
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <img src={item.image} className="w-12 h-12 rounded-lg object-cover" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.scientificName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#2D5A27]">{item.price} F</p>
                      <p className="text-xs text-gray-400">x{item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-600">Total de la commande</span>
                  <span className="text-lg font-black text-[#2D5A27]">{order.total} F</span>
                </div>
              </div>

              {/* Informations de livraison */}
              <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                <p className="text-xs font-semibold text-blue-700 mb-1">
                  <i className="fa-solid fa-info-circle mr-1"></i>
                  Détails de livraison
                </p>
                <div className="text-xs text-blue-600 space-y-1">
                  <p><span className="font-medium">Ville:</span> {order.customer.city}</p>
                  <p><span className="font-medium">Quartier:</span> {order.customer.district}</p>
                  <p><span className="font-medium">Point de repère:</span> {order.customer.landmark}</p>
                  <p><span className="font-medium">Méthode:</span> {order.customer.method}</p>
                  {order.customer.pickupTime && (
                    <p><span className="font-medium">Heure:</span> {order.customer.pickupTime}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default OrderHistory;
