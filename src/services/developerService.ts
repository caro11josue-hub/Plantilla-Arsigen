import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { PlanTier, RestaurantConfig, AuthorizedStaff, UserRole } from '../domain/models';

const CONFIG_DOC_PATH = 'config/general';

export const DEFAULT_RESTAURANT_CONFIG: RestaurantConfig = {
  restaurantName: 'Bistró & Leña · Fuego Sagrado',
  legalDocument: 'NIT: 901.482.119-3',
  address: 'Distrito Gastronómico · Calle de las Brasas',
  phone: '+57 314 464 0776',
  currency: 'COP',
  plan: 'business',
  hasThematicDesign: true,
  settings: {
    suggestedTipPercentage: 10,
    receiptLegalLegend: 'Comprobante de consumo interno / No válido como factura fiscal',
    orderConsecutiveDaily: 1,
    consecutiveDate: new Date().toISOString().slice(0, 10),
  },
  socialLinks: {
    whatsappUrl: 'https://wa.me/573144640776',
    googleMapsReviewUrl: 'https://maps.google.com',
    instagramUrl: 'https://instagram.com/bistroleña',
  },
  updatedAt: new Date().toISOString(),
};

/**
 * Obtiene la configuración general del restaurante en tiempo real.
 */
export async function getRestaurantConfig(): Promise<RestaurantConfig> {
  try {
    const configRef = doc(db, CONFIG_DOC_PATH);
    const snap = await getDoc(configRef);
    if (snap.exists()) {
      return snap.data() as RestaurantConfig;
    }
  } catch (err) {
    console.warn('[developerService] No se pudo leer config remota, usando valores por defecto:', err);
  }
  return DEFAULT_RESTAURANT_CONFIG;
}

/**
 * Actualiza el plan activo del restaurante en vivo desde el panel de desarrollador
 * sin requerir redespliegue de código.
 */
export async function updateRestaurantPlan(newPlan: PlanTier): Promise<void> {
  const configRef = doc(db, CONFIG_DOC_PATH);
  await updateDoc(configRef, {
    plan: newPlan,
    updatedAt: new Date().toISOString(),
  }).catch(async () => {
    // Si no existía, inicializarlo
    await setDoc(configRef, {
      ...DEFAULT_RESTAURANT_CONFIG,
      plan: newPlan,
      updatedAt: new Date().toISOString(),
    });
  });
}

/**
 * Aprovisionamiento inicial del restaurante por parte del Desarrollador.
 */
export async function provisionInitialRestaurant(customConfig?: Partial<RestaurantConfig>): Promise<void> {
  const configRef = doc(db, CONFIG_DOC_PATH);
  const data: RestaurantConfig = {
    ...DEFAULT_RESTAURANT_CONFIG,
    ...customConfig,
    updatedAt: new Date().toISOString(),
  };
  await setDoc(configRef, data, { merge: true });
}

/**
 * Lista todo el personal registrado en la colección /authorized_staff.
 */
export async function listAuthorizedStaff(): Promise<AuthorizedStaff[]> {
  try {
    const staffCol = collection(db, 'authorized_staff');
    const snap = await getDocs(staffCol);
    return snap.docs.map((d) => d.data() as AuthorizedStaff);
  } catch (err) {
    console.warn('[developerService] Error al listar personal:', err);
    return [];
  }
}

/**
 * Registra o actualiza un usuario en la whitelist /authorized_staff.
 */
export async function saveAuthorizedStaffUser(
  email: string,
  role: UserRole,
  name: string,
  active: boolean = true
): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  const staffRef = doc(db, 'authorized_staff', normalizedEmail);
  const data: AuthorizedStaff = {
    email: normalizedEmail,
    role,
    name,
    active,
    assignedAt: new Date().toISOString(),
    lastLoginAt: null,
  };
  await setDoc(staffRef, data, { merge: true });
}

/**
 * Activa o desactiva a un usuario del personal.
 */
export async function toggleAuthorizedStaffActive(
  email: string,
  active: boolean
): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  const staffRef = doc(db, 'authorized_staff', normalizedEmail);
  await updateDoc(staffRef, { active });
}

/**
 * Elimina permanentemente a un usuario de /authorized_staff.
 */
export async function deleteAuthorizedStaffUser(email: string): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  const staffRef = doc(db, 'authorized_staff', normalizedEmail);
  await deleteDoc(staffRef);
}
