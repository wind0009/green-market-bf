import { collection, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../src/firebase';

interface OTPData {
  phone: string;
  code: string;
  createdAt: number;
  attempts: number;
}

const OTP_COLLECTION = 'otp_codes';
const OTP_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 3;

// Service d'envoi SMS (utilise Twilio)
export const smsService = {
  // Générer un code OTP à 6 chiffres
  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  // Envoyer le code OTP par SMS
  async sendOTP(phone: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Nettoyer le numéro de téléphone
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      if (cleanPhone.length < 8) {
        return { success: false, error: 'Numéro de téléphone invalide' };
      }

      // Vérifier si un OTP a déjà été envoyé récemment
      const existingOTP = await this.getOTPData(phone);
      if (existingOTP && (Date.now() - existingOTP.createdAt) < 60000) {
        return { success: false, error: 'Veuillez attendre 1 minute avant de renvoyer un code' };
      }

      // Générer le nouveau code
      const otpCode = this.generateOTP();
      const otpData: OTPData = {
        phone: cleanPhone,
        code: otpCode,
        createdAt: Date.now(),
        attempts: 0
      };

      // Sauvegarder le code dans Firestore
      await this.saveOTPData(phone, otpData);

      // Envoyer le SMS via Twilio
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: `+226${cleanPhone}`,
          message: `Green Market BF: Votre code de vérification est ${otpCode}. Valide 5 minutes.`
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du SMS');
      }

      // Pour le développement, afficher le code dans la console
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔐 OTP pour +226${cleanPhone}: ${otpCode}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur envoi OTP:', error);
      return { 
        success: false, 
        error: 'Impossible d\'envoyer le code de vérification. Réessayez plus tard.' 
      };
    }
  },

  // Vérifier le code OTP
  async verifyOTP(phone: string, code: string): Promise<{ success: boolean; error?: string }> {
    try {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const otpData = await this.getOTPData(cleanPhone);

      if (!otpData) {
        return { success: false, error: 'Aucun code envoyé pour ce numéro' };
      }

      // Vérifier l'expiration
      if (Date.now() - otpData.createdAt > OTP_EXPIRY_TIME) {
        await this.deleteOTPData(cleanPhone);
        return { success: false, error: 'Code expiré. Veuillez demander un nouveau code.' };
      }

      // Vérifier le nombre de tentatives
      if (otpData.attempts >= MAX_ATTEMPTS) {
        await this.deleteOTPData(cleanPhone);
        return { success: false, error: 'Trop de tentatives. Veuillez demander un nouveau code.' };
      }

      // Incrémenter le nombre de tentatives
      await this.incrementAttempts(cleanPhone);

      // Vérifier le code
      if (otpData.code !== code) {
        const remainingAttempts = MAX_ATTEMPTS - (otpData.attempts + 1);
        return { 
          success: false, 
          error: `Code incorrect. ${remainingAttempts} tentative(s) restante(s).` 
        };
      }

      // Code correct - supprimer les données OTP
      await this.deleteOTPData(cleanPhone);
      return { success: true };
    } catch (error) {
      console.error('Erreur vérification OTP:', error);
      return { 
        success: false, 
        error: 'Erreur lors de la vérification du code.' 
      };
    }
  },

  // Sauvegarder les données OTP
  async saveOTPData(phone: string, data: OTPData): Promise<void> {
    const otpRef = doc(db, OTP_COLLECTION, phone);
    await setDoc(otpRef, data);
  },

  // Récupérer les données OTP
  async getOTPData(phone: string): Promise<OTPData | null> {
    const otpRef = doc(db, OTP_COLLECTION, phone);
    const otpDoc = await getDoc(otpRef);
    
    if (otpDoc.exists()) {
      return otpDoc.data() as OTPData;
    }
    return null;
  },

  // Supprimer les données OTP
  async deleteOTPData(phone: string): Promise<void> {
    const otpRef = doc(db, OTP_COLLECTION, phone);
    await deleteDoc(otpRef);
  },

  // Incrémenter le nombre de tentatives
  async incrementAttempts(phone: string): Promise<void> {
    const otpRef = doc(db, OTP_COLLECTION, phone);
    const otpDoc = await getDoc(otpRef);
    
    if (otpDoc.exists()) {
      const data = otpDoc.data() as OTPData;
      await setDoc(otpRef, {
        ...data,
        attempts: data.attempts + 1
      });
    }
  }
};
