
import React, { useState } from 'react';
import { PLANTS } from '../constants';
import { Category, Plant } from '../types';

interface CatalogProps {
  onAddToCart: (plant: Plant) => void;
  onSelectPlant: (plant: Plant) => void;
}

const Catalog: React.FC<CatalogProps> = ({ onAddToCart, onSelectPlant }) => {
  const [activeCategory, setActiveCategory] = useState<Category | 'Tous'>('Tous');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: (Category | 'Tous')[] = ['Tous', 'Intérieur', 'Jardin', 'Ombre', 'Soleil', 'Arbre', 'Potager'];

  const filteredPlants = PLANTS.filter(plant => {
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

      <div className="mb-4">
        <h2 className="text-lg font-bold">Nos meilleures trouvailles</h2>
        <p className="text-xs text-gray-500">Sélectionnées pour le climat du Faso</p>
      </div>

      {/* Plant Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredPlants.map((plant) => (
          <div
            key={plant.id}
            className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm flex flex-col"
          >
            <div 
              className="h-40 overflow-hidden relative group cursor-pointer"
              onClick={() => onSelectPlant(plant)}
            >
              <img
                src={plant.image}
                alt={plant.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg">
                <span className="text-xs font-bold text-[#2D5A27]">{plant.price} F</span>
              </div>
            </div>
            
            <div className="p-3 flex flex-col flex-grow">
              <div className="mb-2 cursor-pointer" onClick={() => onSelectPlant(plant)}>
                <h3 className="font-bold text-sm truncate">{plant.name}</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">{plant.category}</p>
              </div>
              
              <div className="mt-auto flex justify-between items-center pt-2 border-t border-gray-50">
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                  <i className="fa-solid fa-droplet text-blue-400"></i>
                  <span>{plant.care.water.split(' ')[0]}</span>
                </div>
                <button
                  onClick={() => onAddToCart(plant)}
                  className="bg-[#E2725B] hover:bg-[#c9634d] text-white w-8 h-8 rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-orange-100"
                >
                  <i className="fa-solid fa-plus"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPlants.length === 0 && (
        <div className="text-center py-20">
          <i className="fa-solid fa-seedling text-4xl text-gray-200 mb-4"></i>
          <p className="text-gray-500">Aucune plante ne correspond à votre recherche.</p>
        </div>
      )}
    </div>
  );
};

export default Catalog;
