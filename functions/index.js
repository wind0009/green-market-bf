const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

/**
 * Cloud Function pour définir les Custom Claims (rôles) d'un utilisateur.
 * Cette fonction doit être sécurisée (ex: désactivée après usage ou restreinte).
 */
exports.setAdminRole = functions.https.onCall(async (data, context) => {
    // Seul un super-admin existant ou une vérification UID stricte peut appeler ceci
    // Pour le premier setup, vous pouvez vérifier l'UID manuellement ici
    const superAdminUid = "VOTRE_UID_SUPER_ADMIN_ICI";

    if (context.auth.uid !== superAdminUid) {
        throw new functions.https.HttpsError(
            'permission-denied',
            'Seul le Super Admin peut changer les rôles.'
        );
    }

    const { uid, role } = data;

    if (!['super-admin', 'manager', 'vendeur', 'client'].includes(role)) {
        throw new functions.https.HttpsError('invalid-argument', 'Rôle invalide.');
    }

    try {
        // 1. Définir le Custom Claim dans Firebase Auth (non falsifiable côté client)
        await admin.auth().setCustomUserClaims(uid, { role: role });

        // 2. Mettre à jour le document Firestore pour la visibilité UI
        await admin.firestore().collection('users').doc(uid).update({
            role: role,
            isAdmin: (role === 'super-admin' || role === 'manager')
        });

        return { message: `Succès : ${uid} est maintenant ${role}` };
    } catch (error) {
        throw new functions.https.HttpsError('internal', error.message);
    }
});
