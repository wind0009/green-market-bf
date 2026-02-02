
import React, { useState } from 'react';
import { Plant } from '../types';
import { getBotanicalAdvice } from '../services/geminiService';

interface ProductDetailsProps {
  plant: Plant;
  onAddToCart: (plant: Plant) => void;
  onBack: () => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ plant, onAddToCart, onBack }) => {
  const [question, setQuestion] = useState('');
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAskExpert = async () => {
    if (!question.trim()) return;
    setLoading(true);
    const result = await getBotanicalAdvice(plant.name, question);
    setAdvice(result);
    setLoading(false);
    setQuestion('');
  };

  return (
    <div className="animate-slideIn">
      {/* Hero Header */}
      <div className="relative h-80">
        <img
          src={plant.image}
          alt={plant.name}
          className="w-full h-full object-cover"
        />
        <button
          onClick={onBack}
          className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-[#2D5A27] shadow-lg"
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>
      </div>

      {/* Content */}
      <div className="bg-[#F5F5F5] -mt-8 relative z-10 rounded-t-[40px] p-6 min-h-screen">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold">{plant.name}</h1>
            {plant.localName && (
              <p className="text-[#2D5A27]/60 font-medium">Alias : {plant.localName}</p>
            )}
            <p className="italic text-xs text-gray-400">{plant.scientificName}</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
            <span className="text-xl font-black text-[#2D5A27]">{plant.price} F</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex justify-between gap-2 mb-8">
          <div className="flex-1 bg-white p-3 rounded-2xl flex flex-col items-center gap-1 shadow-sm">
            <i className="fa-solid fa-droplet text-blue-400"></i>
            <span className="text-[10px] text-gray-400 uppercase font-bold">Eau</span>
            <span className="text-xs font-semibold">{plant.care.water}</span>
          </div>
          <div className="flex-1 bg-white p-3 rounded-2xl flex flex-col items-center gap-1 shadow-sm">
            <i className="fa-solid fa-sun text-yellow-400"></i>
            <span className="text-[10px] text-gray-400 uppercase font-bold">Soleil</span>
            <span className="text-xs font-semibold text-center leading-tight">{plant.care.sun}</span>
          </div>
          <div className="flex-1 bg-white p-3 rounded-2xl flex flex-col items-center gap-1 shadow-sm">
            <i className="fa-solid fa-medal text-orange-400"></i>
            <span className="text-[10px] text-gray-400 uppercase font-bold">Niveau</span>
            <span className="text-xs font-semibold">{plant.care.difficulty}</span>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold mb-2">Description</h2>
          <p className="text-gray-600 leading-relaxed text-sm">
            {plant.description}
          </p>
        </div>

        {/* AI Advisor Section */}
        <div className="bg-[#2D5A27] text-white rounded-3xl p-5 mb-8 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-robot"></i>
            </div>
            <div>
              <h3 className="font-bold">Conseiller Botanique IA</h3>
              <p className="text-[10px] text-white/70">Posez vos questions sur l'entretien</p>
            </div>
          </div>

          {advice && (
            <div className="bg-white/10 rounded-2xl p-3 mb-4 text-sm italic">
              "{advice}"
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Comment la rempoter ?"
              className="flex-grow bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm outline-none placeholder:text-white/40 focus:bg-white/20"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAskExpert()}
            />
            <button
              onClick={handleAskExpert}
              disabled={loading || !question}
              className="bg-white text-[#2D5A27] px-4 rounded-xl font-bold disabled:opacity-50"
            >
              {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
            </button>
          </div>
        </div>

        {/* CTA */}
        <div className="sticky bottom-4 left-0 right-0">
          <button
            onClick={() => onAddToCart(plant)}
            className="w-full bg-[#E2725B] text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-orange-200 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <i className="fa-solid fa-cart-plus"></i>
            Ajouter au panier
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
