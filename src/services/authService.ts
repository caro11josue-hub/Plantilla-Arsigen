import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { RestaurantUser, UserRole } from '../domain/models';

const googleProvider = new GoogleAuthProvider();

/**
 * Inicia sesión de Administrador / Desarrollador mediante Google OAuth.
 */
export async function loginWithGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  // Registrar sessionId único
  const newSessionId = crypto.randomUUID();
  sessionStorage.setItem('arsigen_session_id', newSessionId);

  try {
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      currentSessionId: newSessionId,
      lastLoginAt: new Date().toISOString(),
    });
  } catch {
    // Si es primer login o falta doc, se gestiona en aprovisionamiento
  }

  return user;
}

/**
 * Cierra la sesión activa en el dispositivo actual.
 */
export async function logout(): Promise<void> {
  sessionStorage.removeItem('arsigen_session_id');
  await firebaseSignOut(auth);
}

/**
 * Escucha en tiempo real si la sesión actual ha sido invalidada por otro dispositivo (Sesión Única).
 */
export function subscribeToSessionSecurity(
  uid: string,
  onSessionInvalidated: () => void
): () => void {
  const userRef = doc(db, 'users', uid);
  const currentLocalSessionId = sessionStorage.getItem('arsigen_session_id');

  const unsubscribe = onSnapshot(userRef, (snapshot) => {
    if (!snapshot.exists()) return;
    const userData = snapshot.data() as RestaurantUser;
    if (userData.currentSessionId && userData.currentSessionId !== currentLocalSessionId) {
      onSessionInvalidated();
      logout();
    }
  });

  return unsubscribe;
}
