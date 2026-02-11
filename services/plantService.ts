import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc, writeBatch, query, where } from 'firebase/firestore';
import { db } from '../src/firebase';
import { Plant } from '../types';

export class PlantService {
    private plantsCollection = 'plants';

    async createPlant(plant: Plant): Promise<string> {
        try {
            const dataToSave = {
                ...plant,
                status: plant.status || 'pending', // Par défaut en attente
                dateAdded: plant.dateAdded || new Date().toISOString()
            };
            const docRef = await addDoc(collection(db, this.plantsCollection), dataToSave);
            return docRef.id;
        } catch (error) {
            console.error('Error creating plant:', error);
            throw new Error('Failed to create plant');
        }
    }

    async getAllPlants(): Promise<Plant[]> {
        try {
            const querySnapshot = await getDocs(collection(db, this.plantsCollection));
            return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Plant));
        } catch (error) {
            console.error('Error fetching plants:', error);
            return [];
        }
    }

    async getActivePlants(): Promise<Plant[]> {
        try {
            const q = query(collection(db, this.plantsCollection), where('status', '==', 'active'));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Plant));
        } catch (error) {
            console.error('Error fetching active plants:', error);
            return [];
        }
    }

    async updatePlant(plantId: string, plant: Partial<Plant>): Promise<void> {
        try {
            const plantRef = doc(db, this.plantsCollection, plantId);
            await updateDoc(plantRef, plant as any);
        } catch (error) {
            console.error('Error updating plant:', error);
            throw new Error('Failed to update plant');
        }
    }

    async deletePlant(plantId: string): Promise<void> {
        try {
            const plantRef = doc(db, this.plantsCollection, plantId);
            await deleteDoc(plantRef);
        } catch (error) {
            console.error('Error deleting plant:', error);
            throw new Error('Failed to delete plant');
        }
    }

    async getPlantsByVendor(vendorId: string): Promise<Plant[]> {
        try {
            const q = query(collection(db, this.plantsCollection), where('vendorId', '==', vendorId));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Plant));
        } catch (error) {
            console.error('Error fetching vendor plants:', error);
            return [];
        }
    }

    async getPremiumPlants(): Promise<Plant[]> {
        try {
            const q = query(collection(db, this.plantsCollection), where('isPremium', '==', true));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Plant));
        } catch (error) {
            console.error('Error fetching premium plants:', error);
            return [];
        }
    }

    async seedPlants(plants: Plant[]): Promise<void> {
        try {
            const batch = writeBatch(db);
            const collectionRef = collection(db, this.plantsCollection);

            for (const plant of plants) {
                const docRef = doc(collectionRef);
                const { id, ...plantData } = plant;
                batch.set(docRef, plantData);
            }

            await batch.commit();
            console.log('Database seeded successfully');
        } catch (error) {
            console.error('Error seeding database:', error);
            throw new Error('Failed to seed database');
        }
    }
}

export const plantService = new PlantService();
