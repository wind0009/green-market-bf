import { collection, addDoc, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '../src/firebase';
import { Order } from '../types';

export class OrderService {
    private ordersCollection = 'orders';

    async createOrder(order: Order): Promise<string> {
        try {
            const docRef = await addDoc(collection(db, this.ordersCollection), order);
            return docRef.id;
        } catch (error) {
            console.error('Error creating order:', error);
            throw new Error('Failed to create order');
        }
    }

    async getOrdersByUserId(userId: string): Promise<Order[]> {
        try {
            const q = query(collection(db, this.ordersCollection), where('userId', '==', userId));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Order));
        } catch (error) {
            console.error('Error fetching orders:', error);
            return [];
        }
    }

    async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
        try {
            const orderRef = doc(db, this.ordersCollection, orderId);
            await updateDoc(orderRef, { status });
        } catch (error) {
            console.error('Error updating order status:', error);
            throw new Error('Failed to update order status');
        }
    }

    async getAllOrders(): Promise<Order[]> {
        try {
            const querySnapshot = await getDocs(collection(db, this.ordersCollection));
            return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Order));
        } catch (error) {
            console.error('Error fetching all orders:', error);
            return [];
        }
    }
}

export const orderService = new OrderService();
