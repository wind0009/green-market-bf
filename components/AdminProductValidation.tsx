import React from 'react';
import { Plant, ProductStatus } from '../types';
import { plantService } from '../services/plantService';
import { userService } from '../services/userService';

interface AdminProductValidationProps {
    plant: Plant;
    onStatusUpdate: (plantId: string, newStatus: ProductStatus) => void;
}

const AdminProductValidation: React.FC<AdminProductValidationProps> = ({ plant, onStatusUpdate }) => {
    const handleStatusChange = async (status: ProductStatus) => {
        try {
            await plantService.updatePlant(plant.id, { status });

            // Notification au vendeur via adminMessage
            if (plant.vendorId) {
                const message = status === 'active'
                    ? `Félicitations ! Votre produit "${plant.name}" a été approuvé et est maintenant en ligne.`
                    : `Désolé, votre produit "${plant.name}" a été rejeté par l'administration. Veuillez vérifier les critères de qualité.`;

                await userService.updateUser(plant.vendorId, { adminMessage: message });
            }

            onStatusUpdate(plant.id, status);
            alert(`Produit ${status === 'active' ? 'approuvé' : 'rejeté'} avec succès.`);
        } catch (error) {
            console.error("Erreur lors de la validation du produit", error);
            alert("Une erreur est survenue lors de la mise à jour du statut.");
        }
    };

    return (
        <div className="flex gap-2 mt-2">
            {plant.status !== 'active' && (
                <button
                    onClick={() => handleStatusChange('active')}
                    className="flex-1 py-2 px-3 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-[10px] uppercase hover:bg-emerald-100 transition-colors"
                >
                    <i className="fa-solid fa-check mr-1"></i>
                    Approuver
                </button>
            )}
            {plant.status !== 'rejected' && (
                <button
                    onClick={() => handleStatusChange('rejected')}
                    className="flex-1 py-2 px-3 bg-red-50 text-red-600 rounded-xl font-bold text-[10px] uppercase hover:bg-red-100 transition-colors"
                >
                    <i className="fa-solid fa-xmark mr-1"></i>
                    Rejeter
                </button>
            )}
        </div>
    );
};

export default AdminProductValidation;
