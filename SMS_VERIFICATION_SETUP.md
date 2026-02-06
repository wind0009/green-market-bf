# Configuration de la Vérification SMS avec Firebase

## Étapes de Configuration

### 1. Configuration Firebase Console

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet `green-market-bf-ebdb2`
3. Dans le menu de gauche, allez dans **Authentication** → **Sign-in method**
4. Activez **Phone** authentication
5. Configurez les paramètres :
   - **Phone numbers for testing**: Ajoutez des numéros de test pour le développement
   - **SMS templates**: Personnalisez les messages SMS

### 2. Configuration des Numéros de Test (Développement)

Pour tester sans envoyer de vrais SMS :

1. Dans Firebase Console → Authentication → Sign-in method → Phone
2. Cliquez sur **Add phone number for testing**
3. Ajoutez des numéros avec les codes :
   - `+22612345678` → `123456`
   - `+22687654321` → `654321`

### 3. Configuration Production

Pour la production :

1. **Activez l'API Cloud Functions** si nécessaire
2. **Configurez les quotas SMS** dans les paramètres du projet
3. **Vérifiez la facturation** est activée pour l'envoi de SMS

### 4. Variables d'Environnement

Le projet utilise déjà la configuration Firebase. Aucune variable d'environnement supplémentaire n'est nécessaire pour l'authentification SMS.

## Fonctionnalités Implémentées

### ✅ Sécurité
- reCAPTCHA invisible intégré
- Codes OTP à 6 chiffres
- Expiration des codes (5 minutes)
- Limite de tentatives (3 essais max)
- Protection contre les abus

### ✅ Expérience Utilisateur
- Interface moderne avec indicateurs visuels
- Messages d'erreur clairs
- Support des numéros burkinabè (+226)
- Mode développement avec codes visibles dans console

### ✅ Gestion des Erreurs
- Gestion des erreurs Firebase spécifiques
- Messages en français adaptés
- Fallback en cas d'échec

## Utilisation

### Pour les Utilisateurs
1. Entrez le numéro de téléphone (format: XX XX XX XX XX)
2. Cliquez sur "Se connecter" ou "Créer mon compte"
3. Recevez le code SMS (ou utilisez le code de test en développement)
4. Entrez le code à 6 chiffres
5. Accédez à votre compte

### Pour les Développeurs
En mode développement, les codes OTP s'affich dans la console :
```
🔐 OTP pour +22612345678: 123456
```

## Dépannage

### Problèmes Courants

**"Trop de tentatives"**
- Attendre quelques minutes avant de réessayer
- Le compteur se réinitialise après 5 minutes

**"Numéro invalide"**
- Vérifiez le format du numéro (8 chiffres minimum)
- Assurez-vous que le préfixe +226 est géré automatiquement

**"Service indisponible"**
- Vérifiez la configuration Firebase
- Assurez-vous que la facturation est activée

### Débogage

1. Ouvrez la console du navigateur
2. Cherchez les messages avec 🔐 pour les codes de test
3. Vérifiez les erreurs dans l'onglet Network

## Sécurité

- Les codes OTP sont générés aléatoirement
- Les codes expirent après 5 minutes
- reCAPTCHA protège contre les robots
- Les tentatives sont limitées pour prévenir les attaques

## Coûts

Firebase facture l'envoi de SMS :
- ~0.07€ par SMS dans la plupart des pays
- 10 000 SMS gratuits par mois pour les tests
- Configurez des alertes de budget dans Firebase Console
