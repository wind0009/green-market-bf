
import React, { useState } from 'react';
import { Category, Plant } from '../types';

interface CatalogProps {
  plants: Plant[];
  onAddToCart: (plant: Plant) => void;
  onSelectPlant: (plant: Plant) => void;
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
}

const Catalog: React.FC<CatalogProps> = ({ plants, onAddToCart, onSelectPlant, wishlist, onToggleWishlist }) => {
  const [activeCategory, setActiveCategory] = useState<Category | 'Tous'>('Tous');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: (Category | 'Tous')[] = ['Tous', 'Intérieur', 'Jardin', 'Ombre', 'Soleil', 'Arbre', 'Potager'];

  const filteredPlants = plants.filter(plant => {
    const matchesCategory = activeCategory === 'Tous' || plant.category === activeCategory;
    const matchesSearch = plant.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (plant.localName?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-4 animate-fadeIn">
      {/* Search Bar */}
      <div className="relative mb-6">
        <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
        <input
          type="text"
          placeholder="Rechercher une plante..."
          className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-[#2D5A27] focus:border-transparent outline-none transition-all shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat
                ? 'bg-[#2D5A27] text-white shadow-md'
                : 'bg-white text-gray-500 border border-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mb-4 flex justify-between items-end">
        <div>
          <h2 className="text-lg font-bold">Nos pépites</h2>
          <p className="text-xs text-gray-500">Pour votre oasis personnelle</p>
        </div>
        <span className="text-[10px] font-bold text-[#2D5A27] uppercase tracking-widest">{filteredPlants.length} plantes</span>
      </div>

      {/* Plant Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredPlants.map((plant) => (
          <div
            key={plant.id}
            className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm flex flex-col group"
          >
            <div className="h-44 overflow-hidden relative">
              <img
                src={plant.image}
                alt={plant.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 cursor-pointer"
                onClick={() => onSelectPlant(plant)}
              />
              <button 
                onClick={() => onToggleWishlist(plant.id)}
                className={`absolute top-3 left-3 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${
                  wishlist.includes(plant.id) ? 'bg-[#E2725B] text-white' : 'bg-white/80 text-gray-400'
                }`}
              >
                <i className={`fa-solid fa-heart ${wishlist.includes(plant.id) ? 'scale-110' : ''}`}></i>
              </button>
              <div className="absolute bottom-3 right-3 bg-white/95 px-2 py-1 rounded-xl shadow-sm">
                <span className="text-[10px] font-black text-[#2D5A27]">{plant.price} F</span>
              </div>
            </div>
            
            <div className="p-3 flex flex-col flex-grow">
              <div className="mb-2 cursor-pointer" onClick={() => onSelectPlant(plant)}>
                <h3 className="font-bold text-sm truncate leading-tight">{plant.name}</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{plant.category}</p>
              </div>
              
              <div className="mt-auto flex justify-between items-center pt-2 border-t border-gray-50">
                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                  <i className="fa-solid fa-seedling text-[#2D5A27]/40"></i>
                  <span>Stock: {plant.stock}</span>
                </div>
                <button
                  onClick={() => onAddToCart(plant)}
                  className="bg-[#2D5A27] text-white w-9 h-9 rounded-2xl flex items-center justify-center transition-all hover:bg-[#1e3d1a] shadow-lg shadow-green-50"
                >
                  <i className="fa-solid fa-cart-plus text-xs"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPlants.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl mt-4 border border-gray-100">
          <i className="fa-solid fa-seedling text-4xl text-gray-200 mb-4 block"></i>
          <p className="text-gray-400 text-sm font-medium">Bientôt de retour en stock !</p>
        </div>
      )}
    </div>
  );
};

export default Catalog;
