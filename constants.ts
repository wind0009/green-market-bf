
import { Plant, District } from './types';

export const PLANTS: Plant[] = [
  {
    id: '1',
    name: 'Aloe Vera',
    localName: 'Aloe',
    scientificName: 'Aloe barbadensis miller',
    price: 3500,
    category: 'Intérieur',
    image: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&q=80&w=400',
    description: 'Une plante grasse médicinale facile à entretenir, idéale pour l\'intérieur.',
    care: { water: '1 fois/semaine', sun: 'Lumière vive indirecte', difficulty: 'Facile' },
    stock: 25,
    // Fix: Added missing required dateAdded property
    dateAdded: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    name: 'Flamboyant',
    localName: 'Petit Flamboyant',
    scientificName: 'Delonix regia',
    price: 5000,
    category: 'Arbre',
    image: 'https://images.unsplash.com/photo-1544833055-175c02c91601?auto=format&fit=crop&q=80&w=400',
    description: 'Arbre ornemental magnifique avec des fleurs rouges éclatantes.',
    care: { water: 'Régulier au début', sun: 'Plein soleil', difficulty: 'Moyen' },
    stock: 10,
    // Fix: Added missing required dateAdded property
    dateAdded: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '3',
    name: 'Hibiscus Rouge',
    localName: 'Gombo Fleur',
    scientificName: 'Hibiscus rosa-sinensis',
    price: 2500,
    category: 'Soleil',
    image: 'https://images.unsplash.com/photo-1589311142503-4f9113d09a0f?auto=format&fit=crop&q=80&w=400',
    description: 'Arbuste tropical produisant de grandes fleurs colorées tout au long de l\'année.',
    care: { water: 'Tous les 2 jours', sun: 'Plein soleil', difficulty: 'Facile' },
    stock: 15,
    // Fix: Added missing required dateAdded property
    dateAdded: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '4',
    name: 'Sansevieria',
    localName: 'Langue de Belle-mère',
    scientificName: 'Dracaena trifasciata',
    price: 4500,
    category: 'Ombre',
    image: 'https://images.unsplash.com/photo-1597055181300-e3633a907519?auto=format&fit=crop&q=80&w=400',
    description: 'Plante increvable, parfaite pour dépolluer l\'air de votre salon.',
    care: { water: 'Toutes les 2 semaines', sun: 'Ombre à lumière vive', difficulty: 'Facile' },
    stock: 30,
    // Fix: Added missing required dateAdded property
    dateAdded: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '5',
    name: 'Bananier Nain',
    localName: 'Bananier',
    scientificName: 'Musa acuminata',
    price: 8000,
    category: 'Jardin',
    image: 'https://images.unsplash.com/photo-1598114853012-b9121d99e024?auto=format&fit=crop&q=80&w=400',
    description: 'Ajoutez une touche tropicale à votre jardin avec ce bananier compact.',
    care: { water: 'Abondant', sun: 'Plein soleil', difficulty: 'Moyen' },
    stock: 8,
    // Fix: Added missing required dateAdded property
    dateAdded: '2024-01-01T00:00:00.000Z'
  }
];

export const DISTRICTS: District[] = [
  { name: 'Ouaga 2000', city: 'Ouagadougou', deliveryFee: 1500 },
  { name: 'Patte d\'Oie', city: 'Ouagadougou', deliveryFee: 1000 },
  { name: 'Dassasgho', city: 'Ouagadougou', deliveryFee: 1000 },
  { name: 'Pissy', city: 'Ouagadougou', deliveryFee: 1500 },
  { name: 'Koulouba', city: 'Ouagadougou', deliveryFee: 500 },
  { name: 'Sya', city: 'Bobo-Dioulasso', deliveryFee: 1000 },
  { name: 'Sarala', city: 'Bobo-Dioulasso', deliveryFee: 1000 },
];

export const THEME = {
  primary: '#2D5A27',
  secondary: '#F5F5F5',
  accent: '#E2725B', // Terracotta
};
