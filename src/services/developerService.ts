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
 * Deduplica en memoria cualquier alias con/sin puntos para garantizar una lista limpia.
 */
export async function listAuthorizedStaff(): Promise<AuthorizedStaff[]> {
  try {
    const staffCol = collection(db, 'authorized_staff');
    const snap = await getDocs(staffCol);
    const seen = new Set<string>();
    const uniqueStaff: AuthorizedStaff[] = [];

    for (const d of snap.docs) {
      const staff = d.data() as AuthorizedStaff;
      const normalized = (staff.email || d.id).toLowerCase().trim();
      const dotFree =
        normalized.endsWith('@gmail.com') || normalized.endsWith('@googlemail.com')
          ? `${normalized.split('@')[0].replace(/\./g, '')}@${normalized.split('@')[1]}`
          : normalized;

      if (!seen.has(dotFree)) {
        seen.add(dotFree);
        uniqueStaff.push(staff);
      }
    }
    return uniqueStaff;
  } catch (err) {
    console.warn('[developerService] Error al listar personal:', err);
    return [];
  }
}

/**
 * Lista exclusivamente a los meseros de salón (role === 'waiter') para el panel del Administrador.
 */
export async function listWaiters(): Promise<AuthorizedStaff[]> {
  const all = await listAuthorizedStaff();
  return all.filter((s) => s.role === 'waiter');
}

/**
 * Registra o actualiza un usuario en la whitelist /authorized_staff.
 * Si se especifica previousEmail y este es distinto del nuevo email,
 * elimina el documento del correo antiguo para que no quede huérfano ni duplicado.
 */
export async function saveAuthorizedStaffUser(
  email: string,
  role: UserRole,
  name: string,
  active: boolean = true,
  previousEmail?: string
): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();

  // Si se está corrigiendo un correo que estaba mal por uno bien, eliminar el antiguo
  if (previousEmail) {
    const normalizedPrev = previousEmail.toLowerCase().trim();
    if (normalizedPrev !== normalizedEmail) {
      await deleteAuthorizedStaffUser(normalizedPrev);
    }
  }

  const staffRef = doc(db, 'authorized_staff', normalizedEmail);
  const data: AuthorizedStaff = {
    email: normalizedEmail,
    role,
    name: name.trim(),
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

  if (normalizedEmail.endsWith('@gmail.com') || normalizedEmail.endsWith('@googlemail.com')) {
    const [userPart, domain] = normalizedEmail.split('@');
    const dotFreeUser = userPart.replace(/\./g, '');
    const dotFreeEmail = `${dotFreeUser}@${domain}`;
    if (dotFreeEmail !== normalizedEmail) {
      const aliasRef = doc(db, 'authorized_staff', dotFreeEmail);
      await updateDoc(aliasRef, { active }).catch(() => {});
    }
  }
}

/**
 * Elimina permanentemente a un usuario de /authorized_staff.
 */
export async function deleteAuthorizedStaffUser(email: string): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  const staffRef = doc(db, 'authorized_staff', normalizedEmail);
  await deleteDoc(staffRef);

  if (normalizedEmail.endsWith('@gmail.com') || normalizedEmail.endsWith('@googlemail.com')) {
    const [userPart, domain] = normalizedEmail.split('@');
    const dotFreeUser = userPart.replace(/\./g, '');
    const dotFreeEmail = `${dotFreeUser}@${domain}`;
    if (dotFreeEmail !== normalizedEmail) {
      const aliasRef = doc(db, 'authorized_staff', dotFreeEmail);
      await deleteDoc(aliasRef).catch(() => {});
    }
  }
}
