import { 
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../src/firebase';
import { User } from '../types';

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  confirmationResult?: ConfirmationResult;
}

export class FirebaseAuthService {
  private recaptchaVerifier: RecaptchaVerifier | null = null;

  // Initialiser le reCAPTCHA
  initializeRecaptcha(containerId: string): void {
    try {
      this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        'size': 'invisible',
        'callback': (response: any) => {
          console.log('reCAPTCHA résolu');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expiré');
        }
      });
    } catch (error) {
      console.error('Erreur initialisation reCAPTCHA:', error);
    }
  }

  // Envoyer le code de vérification par SMS
  async sendOTP(phoneNumber: string): Promise<AuthResult> {
    try {
      if (!this.recaptchaVerifier) {
        // Réinitialiser reCAPTCHA si nécessaire
        this.initializeRecaptcha('recaptcha-container');
        // Attendre un peu que reCAPTCHA soit prêt
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Nettoyer et formater le numéro de téléphone
      const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
      if (cleanPhone.length < 8) {
        return { success: false, error: 'Numéro de téléphone invalide' };
      }

      const formattedPhone = `+226${cleanPhone}`;
      
      console.log('Tentative envoi SMS vers:', formattedPhone);
      
      const confirmationResult = await signInWithPhoneNumber(
        auth, 
        formattedPhone, 
        this.recaptchaVerifier
      );

      return {
        success: true,
        confirmationResult
      };
    } catch (error: any) {
      console.error('Erreur envoi SMS:', error);
      
      // Gérer les erreurs spécifiques de Firebase
      if (error.code === 'auth/too-many-requests') {
        return { success: false, error: 'Trop de tentatives. Veuillez attendre quelques minutes.' };
      } else if (error.code === 'auth/invalid-phone-number') {
        return { success: false, error: 'Numéro de téléphone invalide.' };
      } else if (error.code === 'auth/quota-exceeded') {
        return { success: false, error: 'Service temporairement indisponible. Réessayez plus tard.' };
      } else if (error.code === 'auth/operation-not-allowed') {
        return { success: false, error: 'L\'authentification par téléphone n\'est pas activée. Vérifiez la configuration Firebase.' };
      }
      
      return { success: false, error: error.message || 'Impossible d\'envoyer le code de vérification.' };
    }
  }

  // Vérifier le code OTP
  async verifyOTP(confirmationResult: ConfirmationResult, code: string, userData?: Partial<User>): Promise<AuthResult> {
    try {
      const result = await confirmationResult.confirm(code);
      const firebaseUser = result.user;

      if (!firebaseUser.phoneNumber) {
        return { success: false, error: 'Numéro de téléphone non vérifié' };
      }

      // Créer l'utilisateur pour notre application
      const appUser: User = {
        id: firebaseUser.uid,
        phone: firebaseUser.phoneNumber.replace('+226', ''),
        email: userData?.email || `${firebaseUser.phoneNumber.replace('+226', '')}@greenmarket.bf`,
        name: userData?.name || 'Utilisateur',
        isAdmin: false,
        isProfileComplete: !!userData?.name,
        addresses: userData?.addresses || []
      };

      return {
        success: true,
        user: appUser
      };
    } catch (error: any) {
      console.error('Erreur vérification OTP:', error);
      
      if (error.code === 'auth/invalid-verification-code') {
        return { success: false, error: 'Code de vérification incorrect.' };
      } else if (error.code === 'auth/code-expired') {
        return { success: false, error: 'Code expiré. Veuillez demander un nouveau code.' };
      }
      
      return { success: false, error: 'Erreur lors de la vérification du code.' };
    }
  }

  // Connexion avec email/mot de passe (admin)
  async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;

      const appUser: User = {
        id: firebaseUser.uid,
        phone: 'Admin',
        email: firebaseUser.email || email,
        name: 'Administrateur',
        isAdmin: true,
        isProfileComplete: true,
        addresses: []
      };

      return {
        success: true,
        user: appUser
      };
    } catch (error: any) {
      console.error('Erreur connexion email:', error);
      
      if (error.code === 'auth/user-not-found') {
        return { success: false, error: 'Utilisateur non trouvé.' };
      } else if (error.code === 'auth/wrong-password') {
        return { success: false, error: 'Mot de passe incorrect.' };
      }
      
      return { success: false, error: 'Erreur de connexion.' };
    }
  }

  // Déconnexion
  async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  }

  // Vérifier si l'utilisateur est connecté
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  // Observer les changements d'état d'authentification
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return auth.onAuthStateChanged(callback);
  }
}

export const firebaseAuthService = new FirebaseAuthService();
