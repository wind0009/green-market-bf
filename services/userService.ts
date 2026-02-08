import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { db } from '../src/firebase';
import { User } from '../types';

const USERS_COLLECTION = 'users';

export const userService = {
  // Récupérer un utilisateur par téléphone
  getUserByPhone: async (phone: string): Promise<User | null> => {
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where('phone', '==', phone));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const userDoc = snapshot.docs[0];
    return {
      id: userDoc.id,
      ...userDoc.data()
    } as User;
  },

  // Récupérer un utilisateur par ID
  getUserById: async (userId: string): Promise<User | null> => {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() } as User;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return null;
    }
  },

  // Trouver un vendeur par son code
  findVendorByCode: async (code: string): Promise<User | null> => {
    try {
      const usersRef = collection(db, USERS_COLLECTION);
      const q = query(usersRef, where('vendorCode', '==', code));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const userDoc = snapshot.docs[0];
      return {
        id: userDoc.id,
        ...userDoc.data()
      } as User;
    } catch (error) {
      console.error('Error finding vendor by code:', error);
      return null;
    }
  },

  // Récupérer tous les utilisateurs
  getAllUsers: async (): Promise<User[]> => {
    const usersRef = collection(db, USERS_COLLECTION);
    const snapshot = await getDocs(usersRef);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as User));
  },

  // Créer ou mettre à jour un utilisateur
  saveUser: async (user: User): Promise<void> => {
    const usersRef = collection(db, USERS_COLLECTION);
    const userRef = doc(usersRef, user.id);
    await setDoc(userRef, user);
  },

  // Mettre à jour un utilisateur
  updateUser: async (userId: string, userData: Partial<User>): Promise<void> => {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, userData);
  },

  // Supprimer tous les utilisateurs
  deleteAllUsers: async (): Promise<void> => {
    const usersRef = collection(db, USERS_COLLECTION);
    const snapshot = await getDocs(usersRef);

    console.log(`🗑️ SUPPRESSION BASE DE DONNÉES - ${snapshot.docs.length} utilisateurs vont être supprimés`);

    // Supprimer chaque document utilisateur
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    console.log('✅ Base de données utilisateurs supprimée avec succès dans Firebase');
  }
};
