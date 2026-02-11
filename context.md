# Contexte du Projet : Green Market BF

## 🌿 Description Générale
**Green Market BF** est une plateforme de commerce électronique dédiée à la promotion et à la vente de produits locaux (principalement des plantes, arbres et produits dérivés) au Burkina Faso. L'application connecte des vendeurs locaux avec des clients urbains, facilitant l'accès au "vert" pour tous.

## 🛠️ Stack Technique
- **Frontend** : Vite + React + TypeScript
- **Styling** : Tailwind CSS + FontAwesome
- **Backend/Base de données** : Firebase (Firestore, Authentication, Hosting)
- **Services tiers** : Gemini AI (pour l'aide/conseil), Services SMS (Orange/Moov pour USSD).

## 👥 Rôles Utilisateurs
1. **Client** : Parcourt le catalogue, ajoute au panier, passe des commandes.
2. **Vendeur** : Gère son propre catalogue, suit ses commandes, gère son abonnement premium.
3. **Admin / Manager** : Modère les produits, valide les vendeurs, gère les statistiques et les paramètres globaux.

## 🏗️ Architecture du Projet
- **/src** : Configuration de base (Firebase, main).
- **/views** : Pages complètes (Dashboard, Login, Catalog, Profile, etc.).
- **/services** : Logique métier et interactions API/Firestore (Auth, Orders, Plants, SMS).
- **/components** : Composants UI réutilisables.
- **types.ts** : Définition des interfaces TypeScript pour la consistance des données.
- **constants.ts** : Données statiques et configurations.

## 🔑 Fonctionnalités Clés
- **Authentification Hybride** : Connexion par Email/Mot de passe ou par SMS.
- **Catalogue Dynamique** : Filtrage par catégories (Intérieur, Arbres, Fruitier, etc.).
- **Dashboard Vendeur** : Upload de produits, suivi des statistiques.
- **Système de Paiement** : Intégration simplifiée des paiements mobiles (Orange Money, Moov Money) avec pré-remplissage du dialer USSD.
- **Modération** : Flux de validation des produits et des vendeurs par l'administration.

## 💡 Objectifs de l'Administration
- Centraliser la gestion des produits locaux.
- Garantir la qualité via un système de modération (Pending -> Active).
- Suivre les commissions et le chiffre d'affaires global.
