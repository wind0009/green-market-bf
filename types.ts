
export type Category = 'Intérieur' | 'Jardin' | 'Ombre' | 'Soleil' | 'Arbre' | 'Potager' | 'Médicinale' | 'Fruitier' | 'Cactus' | 'Palmier' | 'Arbuste';

export interface Plant {
  id: string;
  name: string;
  localName?: string;
  scientificName: string;
  price: number;
  category: Category;
  image: string;
  description: string;
  care: {
    water: string;
    sun: string;
    difficulty: 'Très facile' | 'Facile' | 'Moyen' | 'Expert';
  };
  stock: number;
  dateAdded: string;
}

export interface CartItem extends Plant {
  quantity: number;
}

export type OrderStatus = 'En attente' | 'Validée' | 'Livrée' | 'Annulée';

export interface Order {
  id: string;
  userId?: string;
  items: CartItem[];
  total: number;
  customer: {
    name: string;
    phone: string;
    city: string;
    district: string;
    landmark: string;
    method: 'Livraison' | 'Retrait';
    pickupTime?: string;
  };
  paymentMethod: 'Mobile Money' | 'Paiement à la livraison';
  status: OrderStatus;
  date: string;
}

export interface User {
  id: string;
  phone: string;
  email: string;
  name: string;
  isAdmin: boolean;
  isProfileComplete: boolean;
  isVendor?: boolean;
  vendorStatus?: 'pending' | 'active' | 'expired';
  vendorSubscription?: {
    startDate: string;
    endDate: string;
    amount: number;
    status: 'active' | 'expired' | 'pending';
  };
  vendorCode?: string;
  addresses: {
    district: string;
    city: string;
    landmark: string;
  }[];
}

export interface VendorProduct extends Plant {
  vendorId: string;
  vendorName: string;
  isPremium: true;
}

export interface District {
  name: string;
  city: string;
  landmark: string;
}
