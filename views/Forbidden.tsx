import React from 'react';
import { useNavigate } from 'react-router-dom';

const Forbidden: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAF8] p-4">
            <div className="bg-white rounded-[48px] p-12 shadow-xl border border-gray-100 max-w-sm w-full text-center">
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
                    <i className="fa-solid fa-shield-halved text-4xl text-red-500"></i>
                </div>
                <h1 className="text-4xl font-black text-gray-800 mb-4">403</h1>
                <p className="text-xs text-gray-400 font-black uppercase tracking-widest mb-8">Accès Interdit</p>
                <p className="text-gray-500 text-sm leading-relaxed mb-8">
                    Désolé, vous n'avez pas les permissions nécessaires pour accéder à cette zone sécurisée.
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="w-full py-4 bg-[#2D5A27] text-white rounded-[24px] font-black uppercase tracking-widest text-xs shadow-lg shadow-green-100 hover:scale-105 active:scale-95 transition-all"
                >
                    Retour à l'Accueil
                </button>
            </div>
        </div>
    );
};

export default Forbidden;
