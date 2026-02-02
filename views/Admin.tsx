
import React from 'react';
import { Order, Plant } from '../types';

interface AdminProps {
  orders: Order[];
  plants: Plant[];
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
}

const Admin: React.FC<AdminProps> = ({ orders, plants, onUpdateOrderStatus }) => {
  return (
    <div className="p-4 space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold mb-2">Tableau de bord</h1>
        <p className="text-sm text-gray-500">Gestion de Green Market BF</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#2D5A27] text-white p-4 rounded-3xl shadow-lg">
          <p className="text-[10px] uppercase font-bold text-white/70">Commandes</p>
          <h3 className="text-2xl font-black">{orders.length}</h3>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-3xl">
          <p className="text-[10px] uppercase font-bold text-gray-400">Total Ventes</p>
          <h3 className="text-2xl font-black text-[#2D5A27]">
            {orders.reduce((sum, o) => sum + o.total, 0)} F
          </h3>
        </div>
      </div>

      {/* Orders List */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Dernières Commandes</h2>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{orders.length} Total</span>
        </div>

        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-gray-300">
              <p className="text-gray-400 text-sm">Aucune commande pour le moment.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-sm">{order.customer.name}</h4>
                    <p className="text-xs text-gray-400">{new Date(order.date).toLocaleDateString()} à {new Date(order.date).toLocaleTimeString()}</p>
                  </div>
                  <select 
                    value={order.status}
                    onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as any)}
                    className={`text-[10px] font-bold px-2 py-1 rounded-full border-none outline-none ${
                      order.status === 'Livrée' ? 'bg-green-100 text-green-700' : 
                      order.status === 'En attente' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    <option value="En attente">En attente</option>
                    <option value="Validée">Validée</option>
                    <option value="Livrée">Livrée</option>
                    <option value="Annulée">Annulée</option>
                  </select>
                </div>
                
                <div className="text-xs text-gray-600 mb-3 bg-gray-50 p-2 rounded-lg">
                  {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <div className="flex gap-2 items-center">
                    <i className="fa-solid fa-phone text-[#2D5A27] text-xs"></i>
                    <span className="text-xs font-bold">{order.customer.phone}</span>
                  </div>
                  <span className="font-black text-[#2D5A27]">{order.total} F</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Stock Management */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Gestion du Stock</h2>
          <button className="text-[#2D5A27] text-sm font-bold">+ Ajouter</button>
        </div>
        <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-400 font-bold uppercase">
              <tr>
                <th className="p-3">Plante</th>
                <th className="p-3 text-center">Stock</th>
                <th className="p-3 text-right">Prix</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {plants.map(p => (
                <tr key={p.id}>
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded-md ${p.stock < 10 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="p-3 text-right font-bold">{p.price} F</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Admin;
