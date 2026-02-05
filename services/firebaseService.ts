import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where 
} from 'firebase/firestore';
import { db } from '../src/firebase';
import { CartItem, Order } from '../types';

// Collections
const CART_COLLECTION = 'cart';
const ORDERS_COLLECTION = 'orders';

// Service pour le panier
export const cartService = {
  // Récupérer le panier d'un utilisateur
  getCart: async (userId: string): Promise<CartItem[]> => {
    const cartRef = collection(db, CART_COLLECTION);
    const q = query(cartRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as CartItem[];
  },

  // Ajouter un article au panier
  addToCart: async (userId: string, item: CartItem): Promise<void> => {
    const cartRef = collection(db, CART_COLLECTION);
    const itemRef = doc(cartRef, item.id);
    await setDoc(itemRef, { ...item, userId });
  },

  // Mettre à jour la quantité d'un article
  updateQuantity: async (itemId: string, quantity: number): Promise<void> => {
    const itemRef = doc(db, CART_COLLECTION, itemId);
    await updateDoc(itemRef, { quantity });
  },

  // Supprimer un article du panier
  removeFromCart: async (itemId: string): Promise<void> => {
    const itemRef = doc(db, CART_COLLECTION, itemId);
    await deleteDoc(itemRef);
  },

  // Vider le panier
  clearCart: async (userId: string): Promise<void> => {
    const cartRef = collection(db, CART_COLLECTION);
    const q = query(cartRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  }
};

// Service pour les commandes
export const orderService = {
  // Récupérer toutes les commandes
  getOrders: async (): Promise<Order[]> => {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const q = query(ordersRef, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];
  },

  // Ajouter une commande
  addOrder: async (order: Order): Promise<void> => {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const orderRef = doc(ordersRef, order.id);
    await setDoc(orderRef, order);
  },

  // Mettre à jour le statut d'une commande
  updateOrderStatus: async (orderId: string, status: Order['status']): Promise<void> => {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, { status });
  }
};
