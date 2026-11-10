import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  User as FirebaseUser,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { AuthorizedStaff, UserRole } from '../domain/models';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Semilla inicial segura para aprovisionamiento del primer inicio de sesión
const INITIAL_STAFF_SEEDS: Record<string, { role: UserRole; name: string }> = {
  'caro11josue@gmail.com': { role: 'developer', name: 'Josué Caro (ARSIGEN)' },
  'traducciones.os@gmail.com': { role: 'admin', name: 'Administrador General' },
  'vision.stream645@gmail.com': { role: 'waiter', name: 'Carlos (Mesero Salón)' },
};

/**
 * Verifica y asegura el aprovisionamiento de las credenciales maestras iniciales
 * si la colección `authorized_staff` aún no tiene documentos creados.
 */
async function ensureInitialStaffSeeded(email: string): Promise<AuthorizedStaff | null> {
  const normalizedEmail = email.toLowerCase().trim();
  const seedInfo = INITIAL_STAFF_SEEDS[normalizedEmail];

  if (!seedInfo) return null;

  try {
    const staffRef = doc(db, 'authorized_staff', normalizedEmail);
    const snap = await getDoc(staffRef);

    if (!snap.exists()) {
      const initialDoc: AuthorizedStaff = {
        email: normalizedEmail,
        role: seedInfo.role,
        name: seedInfo.name,
        active: true,
        assignedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      await setDoc(staffRef, initialDoc);
      return initialDoc;
    }
  } catch (err) {
    console.warn('[authService] Error al verificar semilla inicial:', err);
  }

  return null;
}

/**
 * Busca de forma flexible un documento en authorized_staff por su correo exacto
 * o por su variación de Gmail sin puntos, sin necesidad de duplicar registros en Firestore.
 */
async function fetchStaffDocFlexible(email: string) {
  const normalizedEmail = email.toLowerCase().trim();
  const staffRef = doc(db, 'authorized_staff', normalizedEmail);
  const snap = await getDoc(staffRef);

  if (snap.exists()) {
    return { ref: staffRef, snap };
  }

  if (normalizedEmail.endsWith('@gmail.com') || normalizedEmail.endsWith('@googlemail.com')) {
    const [userPart, domain] = normalizedEmail.split('@');
    const dotFree = `${userPart.replace(/\./g, '')}@${domain}`;
    if (dotFree !== normalizedEmail) {
      const aliasRef = doc(db, 'authorized_staff', dotFree);
      const aliasSnap = await getDoc(aliasRef);
      if (aliasSnap.exists()) {
        return { ref: aliasRef, snap: aliasSnap };
      }
    }
  }

  return { ref: staffRef, snap };
}

export interface AuthLoginResult {
  user: FirebaseUser;
  staff: AuthorizedStaff;
}

/**
 * Inicia sesión con Google OAuth y valida de forma estricta contra la colección `authorized_staff`.
 * Si el usuario no está en la lista blanca o está inactivo, se expulsa inmediatamente la sesión.
 */
export async function loginWithGoogle(): Promise<AuthLoginResult> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  if (!user.email) {
    await firebaseSignOut(auth);
    throw new Error('La cuenta de Google no posee un correo electrónico válido.');
  }

  const normalizedEmail = user.email.toLowerCase().trim();
  let { ref: staffRef, snap: staffSnap } = await fetchStaffDocFlexible(normalizedEmail);

  // Si no existe, verificar si es uno de los correos fundacionales para sembrar
  if (!staffSnap.exists()) {
    const seeded = await ensureInitialStaffSeeded(normalizedEmail);
    if (seeded) {
      const recheck = await fetchStaffDocFlexible(normalizedEmail);
      staffRef = recheck.ref;
      staffSnap = recheck.snap;
    }
  }

  if (!staffSnap.exists()) {
    await firebaseSignOut(auth);
    throw new Error(
      `Acceso no autorizado. El correo (${normalizedEmail}) no está registrado como personal de este establecimiento.`
    );
  }

  const staffData = staffSnap.data() as AuthorizedStaff;

  if (!staffData.active) {
    await firebaseSignOut(auth);
    throw new Error(
      'Tu cuenta de personal ha sido desactivada por el administrador. Contacta con soporte.'
    );
  }

  // Generar sessionId único para control de concurrencia
  const newSessionId = crypto.randomUUID();
  sessionStorage.setItem('arsigen_session_id', newSessionId);

  try {
    await updateDoc(staffRef, {
      currentSessionId: newSessionId,
      lastLoginAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[authService] No se pudo actualizar sessionId:', err);
  }

  return {
    user,
    staff: { ...staffData, currentSessionId: newSessionId },
  };
}

/**
 * Obtiene el registro de personal del usuario actualmente autenticado en Firebase.
 */
export async function getCurrentStaff(): Promise<AuthorizedStaff | null> {
  const currentUser = auth.currentUser;
  if (!currentUser?.email) return null;

  try {
    const { snap } = await fetchStaffDocFlexible(currentUser.email);
    if (snap.exists()) {
      const data = snap.data() as AuthorizedStaff;
      if (data.active) return data;
    }
  } catch (err) {
    console.warn('[authService] Error al obtener datos de staff actual:', err);
  }

  return null;
}

/**
 * Cierra la sesión activa en el dispositivo actual.
 */
export async function logout(): Promise<void> {
  sessionStorage.removeItem('arsigen_session_id');
  await firebaseSignOut(auth);
}

/**
 * Escucha en tiempo real cambios en el estado de autenticación de Firebase.
 */
export function subscribeToAuthState(
  callback: (staff: AuthorizedStaff | null) => void
): () => void {
  return onAuthStateChanged(auth, async (user) => {
    if (!user?.email) {
      callback(null);
      return;
    }

    try {
      let { snap } = await fetchStaffDocFlexible(user.email);

      // Si no existe, verificar si es uno de los correos fundacionales para sembrar
      if (!snap.exists()) {
        const seeded = await ensureInitialStaffSeeded(user.email);
        if (seeded) {
          const recheck = await fetchStaffDocFlexible(user.email);
          snap = recheck.snap;
        }
      }

      if (snap.exists()) {
        const staffData = snap.data() as AuthorizedStaff;
        if (staffData.active) {
          callback(staffData);
          return;
        }
      }
    } catch (err) {
      console.warn('[authService] Error al verificar estado de personal:', err);
    }

    callback(null);
  });
}
