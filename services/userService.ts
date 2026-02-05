import { 
  collection, 
  doc, 
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
  }
};
