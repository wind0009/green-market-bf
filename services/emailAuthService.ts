import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../src/firebase';
import { User } from '../types';

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export class EmailAuthService {
  // Inscription avec email et mot de passe
  async signUp(email: string, password: string, name: string): Promise<AuthResult> {
    try {
      if (!email || !password || !name) {
        return { success: false, error: 'Tous les champs sont obligatoires.' };
      }

      if (password.length < 6) {
        return { success: false, error: 'Le mot de passe doit faire au moins 6 caractères.' };
      }

      // Créer le compte Firebase
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;

      // Envoyer l'email de vérification
      try {
        await sendEmailVerification(firebaseUser);
        console.log('✅ Email de vérification envoyé à:', email);
      } catch (emailError: any) {
        console.error('Erreur envoi email de vérification:', emailError);
        // En développement, on continue même si l'email échoue
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 Mode développement: Email de vérification contourné');
        } else {
          return { success: false, error: 'Impossible d\'envoyer l\'email de vérification.' };
        }
      }

      // Mettre à jour le profil Firebase avec le nom
      await updateProfile(firebaseUser, {
        displayName: name
      });

      // Créer l'utilisateur pour notre application
      const appUser: User = {
        id: firebaseUser.uid,
        phone: 'Non spécifié',
        email: firebaseUser.email || email,
        name: name,
        isAdmin: false,
        isProfileComplete: true,
        addresses: []
      };

      return {
        success: true,
        user: appUser
      };
    } catch (error: any) {
      console.error('Erreur inscription:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        return { success: false, error: 'Cet email est déjà utilisé. Essayez de vous connecter.' };
      } else if (error.code === 'auth/weak-password') {
        return { success: false, error: 'Le mot de passe est trop faible.' };
      } else if (error.code === 'auth/invalid-email') {
        return { success: false, error: 'Email invalide.' };
      }
      
      return { success: false, error: error.message || 'Erreur lors de l\'inscription.' };
    }
  }

  // Connexion avec email et mot de passe
  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      if (!email || !password) {
        return { success: false, error: 'Email et mot de passe sont obligatoires.' };
      }

      const result = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;

      // En développement, on peut ignorer la vérification email
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Mode développement: Vérification email ignorée');
      } else {
        // Vérifier si l'email a été vérifié
        if (!firebaseUser.emailVerified) {
          return { 
            success: false, 
            error: 'Veuillez vérifier votre email avant de vous connecter. Un email de vérification a été envoyé.' 
          };
        }
      }

      // Créer l'utilisateur pour notre application
      const appUser: User = {
        id: firebaseUser.uid,
        phone: 'Non spécifié',
        email: firebaseUser.email || email,
        name: firebaseUser.displayName || 'Utilisateur',
        isAdmin: firebaseUser.email === 'admin@greenmarket.bf',
        isProfileComplete: true,
        addresses: []
      };

      return {
        success: true,
        user: appUser
      };
    } catch (error: any) {
      console.error('Erreur connexion:', error);
      
      if (error.code === 'auth/user-not-found') {
        return { success: false, error: 'Utilisateur non trouvé. Vérifiez vos identifiants.' };
      } else if (error.code === 'auth/wrong-password') {
        return { success: false, error: 'Mot de passe incorrect.' };
      } else if (error.code === 'auth/invalid-email') {
        return { success: false, error: 'Email invalide.' };
      } else if (error.code === 'auth/user-disabled') {
        return { success: false, error: 'Ce compte a été désactivé.' };
      }
      
      return { success: false, error: error.message || 'Erreur de connexion.' };
    }
  }

  // Renvoyer l'email de vérification
  async resendEmailVerification(): Promise<{ success: boolean; error?: string }> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'Aucun utilisateur connecté.' };
      }

      await sendEmailVerification(user);
      return { success: true };
    } catch (error: any) {
      console.error('Erreur envoi email de vérification:', error);
      return { success: false, error: 'Impossible d\'envoyer l\'email de vérification.' };
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

export const emailAuthService = new EmailAuthService();
